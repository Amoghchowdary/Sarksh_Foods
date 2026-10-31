import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

class Range {
 constructor(sh,row,col,rows,cols){Object.assign(this,{sh,row,col,rows,cols});}
 getValues(){return Array.from({length:this.rows},(_,ri)=>Array.from({length:this.cols},(_,ci)=>this.sh.rows[this.row+ri-1]?.[this.col+ci-1]??''));}
 getDisplayValues(){return this.getValues();}
 setValues(values){values.forEach((v,i)=>{const index=this.row+i-1;while(this.sh.rows.length<=index)this.sh.rows.push([]);v.forEach((cell,j)=>{this.sh.rows[index][this.col+j-1]=cell;});});return this;}
}
class Sheet{
 constructor(name){this.name=name;this.rows=[];}
 getLastRow(){return this.rows.length;}
 getRange(r,c,rs,cs){return new Range(this,r,c,rs,cs);}
 appendRow(row){this.rows.push(row.slice());}
 setFrozenRows(){}
}
class Book{
 constructor(){this.sheets=new Map([['Sheet1',new Sheet('Sheet1')]]);}
 getSheetByName(s){return this.sheets.get(s);}
 insertSheet(s){const t=new Sheet(s);this.sheets.set(s,t);return t;}
 deleteSheet(sh){this.sheets.delete(sh.name);}
 getSheets(){return [...this.sheets.values()];}
 getId(){return 'fake-book-id';}
 getUrl(){return 'https://example.test/private';}
}

test('Actual Apps Script datastore operations: setup, auth, carts, order request, enquiry, protection',async()=>{
 const code=await readFile(new URL('../apps-script/Code.gs',import.meta.url),'utf8');
 const props=new Map([['SERVICE_SECRET','X'.repeat(48)]]),book=new Book();
 const ctx={console,Logger:{log(){}},Date,JSON,PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k),setProperty:(k,v)=>props.set(k,v)})},SpreadsheetApp:{create:()=>book,openById:()=>book},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},ContentService:{MimeType:{JSON:'JSON'},createTextOutput:s=>({text:s,setMimeType(){return this;}})}};
 vm.createContext(ctx);vm.runInContext(code,ctx);
 const setup=ctx.setupSarkshFoods();assert.equal(setup.ok,true);assert.equal(book.getSheetByName('Customers').rows.length,1);
 const post=(operation,payload={},secret='X'.repeat(48))=>JSON.parse(ctx.doPost({postData:{contents:JSON.stringify({secret,operation,payload})}}).text);
 assert.equal(post('ping',{},'wrong').ok,false);
 const id='u123',email='person@example.test';
 let result=post('user.create',{id,email,name:'Customer',salt:'a'.repeat(40),secret:'b'.repeat(128)});assert.equal(result.ok,true);assert.equal(result.data.created,true);
 assert.equal(post('user.create',{id:'another',email,name:'Duplicate',salt:'a'.repeat(40),secret:'b'.repeat(128)}).data.created,false);
 assert.equal(post('user.byEmail',{email}).data.id,id);
 const profile=post('user.profile',{id,name:'Customer',phone:'+919999988888',address:'Main Road, Patancheru',city:'Hyderabad',state:'Telangana',pincode:'502307'});assert.equal(profile.data.city,'Hyderabad');
 const cart=post('cart.replace',{userId:id,items:[{id:'chilli-powder',qty:1}]});assert.equal(cart.data.length,1);
 assert.equal(post('cart.merge',{userId:id,items:[{id:'chilli-powder',qty:2},{id:'pulses-powder',qty:1}]}).data[0].qty,3);
 assert.equal(post('cart.read',{userId:id}).data.length,2);
 const orderId='SF-REQ-2026ABCD';const order=post('orders.create',{userId:id,orderId,delivery:{recipient:'Customer',city:'Hyderabad'}});assert.equal(order.data.status,'awaiting_pricing_and_availability');
 assert.equal(post('cart.read',{userId:id}).data.length,0);assert.equal(post('orders.list',{userId:id}).data[0].id,orderId);
 const enquiry=post('contact.create',{id:'SF-ENQ-2026ABCD',name:'=DangerousFormula',phone:'9999999999',email, type:'General Enquiry',message:'Please send us wholesale product details.'});assert.equal(enquiry.ok,true);
 assert.match(book.getSheetByName('Enquiries').rows[1][2],/^'/); // prevents sheet-formula injection
});
