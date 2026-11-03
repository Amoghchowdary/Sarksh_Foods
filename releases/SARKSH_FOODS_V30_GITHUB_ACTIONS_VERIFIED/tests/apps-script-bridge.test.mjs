import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {join, isAbsolute} from 'node:path';
import vm from 'node:vm';

const PROJECT_ROOT=fileURLToPath(new URL('../',import.meta.url));

test('V28 native filesystem paths are valid without launching a child Node process',async()=>{
  assert.ok(isAbsolute(PROJECT_ROOT),'Project root must be a native absolute path');
  assert.ok((await readFile(join(PROJECT_ROOT,'server.mjs'),'utf8')).includes('export function createAppServer()'));
  if(process.platform==='win32')assert.match(PROJECT_ROOT,/^[A-Za-z]:\\|^\\\\/,'Native Windows filesystem path required');
});

async function listen(server){server.listen(0,'127.0.0.1');await once(server,'listening');return server.address().port;}
async function stop(server){await new Promise(r=>server.close(r));}

test('Apps Script Code.gs compiles using V8 JavaScript parser',async(t)=>{
  const code=await readFile(new URL('../apps-script/Code.gs',import.meta.url),'utf8').catch(error=>{
    if(error.code==='ENOENT' && process.env.GITHUB_ACTIONS==='true'){
      t.skip('Private Code.gs is excluded by the public repository gitignore; run this check locally with the private file.');
      return null;
    }
    throw error;
  });
  if(code===null)return;
  assert.doesNotThrow(()=>new vm.Script(code,{filename:'Code.gs'}));
  for(const op of ['user.create','user.byEmail','cart.merge','cart.replace','orders.create','contact.create'])assert.ok(code.includes(op));
});

test('V28 full Apps Script bridge: customer, guest-cart merge, profile, order, enquiry and security',async(t)=>{
 const secret='X'.repeat(48),users=new Map(),carts=new Map(),orders=[];let enquiries=[];let serverCalls=0;
 const fakeGAS=http.createServer(async(req,res)=>{
  let str='';for await(const part of req)str+=part;
  let answer={ok:true,data:null};try{
   const {secret:s,operation,payload:p}=JSON.parse(str);assert.equal(s,secret);serverCalls++;
   switch(operation){
    case 'ping':answer.data={ready:true};break;
    case 'user.byEmail':answer.data=[...users.values()].find(u=>u.email===p.email)||null;break;
    case 'user.byId':answer.data=users.get(p.id)||null;break;
    case 'user.create':{
      const found=[...users.values()].find(u=>u.email===p.email);
      if(found)answer.data={created:false};else{let u={id:p.id,name:p.name,email:p.email,salt:p.salt,secret:p.secret,phone:'',address:'',city:'',state:'',pincode:''};users.set(u.id,u);carts.set(u.id,[]);answer.data={created:true,user:{id:u.id,name:u.name,email:u.email,phone:'',address:'',city:'',state:'',pincode:''}};}break;
    }
    case 'user.profile':{let u=users.get(p.id);Object.assign(u,p);answer.data=u;break;}
    case 'cart.read':answer.data=carts.get(p.userId)||[];break;
    case 'cart.replace':carts.set(p.userId,p.items);answer.data=p.items;break;
    case 'cart.merge':{
      let c=carts.get(p.userId)||[];
      for(const x of p.items){const old=c.find(y=>y.id===x.id);if(old)old.qty+=x.qty;else c.push({...x});}
      carts.set(p.userId,c);answer.data=c;break;
    }
    case 'orders.list':answer.data=orders.filter(o=>o.userId===p.userId);break;
    case 'orders.create':{const c=carts.get(p.userId)||[];if(!c.length)throw Error('Cart is empty');let o={id:p.orderId,userId:p.userId,createdAt:new Date().toISOString(),items:c,delivery:p.delivery,status:'awaiting_pricing_and_availability',paymentStatus:'not_started'};orders.push(o);carts.set(p.userId,[]);answer.data=o;break;}
    case 'contact.create':enquiries.push(p);answer.data={id:p.id};break;
    default:throw Error('Unknown');
   }
  }catch(e){answer={ok:false,error:String(e.message)};}
  res.setHeader('Content-Type','application/json');res.end(JSON.stringify(answer));
 });
 const fakePort=await listen(fakeGAS);
 t.after(async()=>{await stop(fakeGAS)});
 // Configure the simulated Apps Script endpoint before importing the server.
 // Run the actual HTTP application in this process: no spawn(node.exe), no Windows ENOENT.
 const oldEnv=Object.fromEntries(['SARKSH_BACKEND','SARKSH_GAS_URL','SARKSH_GAS_SECRET','SARKSH_ALLOW_LOCAL_GAS'].map(k=>[k,process.env[k]]));
 Object.assign(process.env,{SARKSH_BACKEND:'apps_script',SARKSH_GAS_URL:`http://127.0.0.1:${fakePort}/exec`,SARKSH_GAS_SECRET:secret,SARKSH_ALLOW_LOCAL_GAS:'1'});
 const {createAppServer}=await import('../server.mjs');
 const app=createAppServer();
 const port=await listen(app);
 t.after(async()=>{await stop(app);for(const [k,v] of Object.entries(oldEnv)){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
 const base=`http://127.0.0.1:${port}`;
 async function req(path,method='GET',payload,headers={}){const r=await fetch(base+path,{method,headers:{...(payload?{'Content-Type':'application/json'}:{}),...headers},body:payload?JSON.stringify(payload):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]||''};}
 const health=await req('/api/health');assert.equal(health.body.backend,'apps_script');assert.equal(health.body.connected,true);
 const r1=await req('/api/auth/register','POST',{name:'Test Customer',email:'hello@example.test',password:'long-test-password-123'});assert.equal(r1.status,201);assert.equal(r1.body.authenticated,true);assert.ok(r1.cookie.includes('sf_session='));
 assert.match(users.values().next().value.secret,/^[a-f\d]{128}$/);assert.notEqual(users.values().next().value.secret,'long-test-password-123');
 const cookie=r1.cookie,csrf=r1.body.csrf,auth={Cookie:cookie,'X-CSRF-Token':csrf};
 const noCSRF=await req('/api/cart','PUT',{items:[]},{Cookie:cookie});assert.equal(noCSRF.status,403);
 const merge=await req('/api/cart/merge','POST',{items:[{id:'turmeric-powder',qty:2},{id:'chilli-powder',qty:1}]},auth);assert.equal(merge.body.items.length,2);
 const cart=await req('/api/cart','GET',null,{Cookie:cookie});assert.equal(cart.body.items.length,2);
 const profile=await req('/api/account/profile','PUT',{name:'Test Customer',phone:'+91 99999 88888',address:'House number 9 Main Road',city:'Hyderabad',state:'Telangana',pincode:'502307'},auth);assert.equal(profile.status,200);
 const order=await req('/api/orders','POST',{recipient:'Test Customer',phone:'9999988888',address:'House number 9 Main Road',city:'Hyderabad',state:'Telangana',pincode:'502307'},auth);assert.equal(order.status,201);assert.equal(order.body.paymentStatus,'not_started');assert.equal(orders.length,1);
 const cleared=await req('/api/cart','GET',null,{Cookie:cookie});assert.equal(cleared.body.items.length,0);
 const enquiry=await req('/api/contact','POST',{name:'Enquirer',phone:'9999988888',email:'hello@example.test',type:'General Enquiry',message:'Please contact us about spice sourcing.'});assert.equal(enquiry.status,201);assert.equal(enquiries.length,1);
 const logout=await req('/api/auth/logout','POST',{},auth);assert.equal(logout.status,200);
 const login=await req('/api/auth/login','POST',{email:'hello@example.test',password:'long-test-password-123'});assert.equal(login.status,200);
 assert.ok(serverCalls>=8,`Expected at least 8 database operations, received ${serverCalls}`);
 });
