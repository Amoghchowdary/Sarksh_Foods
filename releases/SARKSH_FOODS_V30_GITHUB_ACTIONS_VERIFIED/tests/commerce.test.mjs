import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {mkdtemp,rm} from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('V23 account, cart preservation, checkout & access control',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'sarksh-v23-'));
 const port=5269;
 const server=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',SARKSH_DATA_DIR:dir},stdio:'pipe'});
 let cookie='',csrf='';const base=`http://127.0.0.1:${port}`;
 async function call(uri,method='GET',data,withCsrf=true){const r=await fetch(base+uri,{method,headers:{...(data?{'content-type':'application/json'}:{}),...(cookie?{cookie}:{}),...(csrf&&method!=='GET'&&withCsrf?{'x-csrf-token':csrf}:{})},...(data?{body:JSON.stringify(data)}:{})});return {status:r.status,data:await r.json(),headers:r.headers}}
 try{
  let online=false;for(let t=0;t<50;t++){try{const r=await fetch(base+'/api/health');online=r.status===200;if(online)break}catch{}await new Promise(r=>setTimeout(r,60))}assert.ok(online,'Server should start');
  for(const p of ['/','/story','/products','/recipes','/blog','/quality','/cart','/account']){const r=await fetch(base+p);assert.equal(r.status,200,`route ${p}`)}
  assert.equal((await call('/api/cart')).status,401,'Cart requires session');
  const register=await call('/api/auth/register','POST',{name:'QA Customer',email:'qa@example.com',password:'ProductionPass987'});
  assert.equal(register.status,201);csrf=register.data.csrf;cookie=(register.headers.get('set-cookie')||'').split(';')[0];assert.match(cookie,/sf_session/);
  let me=await call('/api/auth/me');assert.equal(me.data.authenticated,true);
  const wrong=await call('/api/cart','PUT',{items:[{id:'chilli-powder',qty:2}]},false);assert.equal(wrong.status,403,'CSRF prevents writes');
  const cart=await call('/api/cart/merge','POST',{items:[{id:'chilli-powder',qty:2},{id:'pulses-powder',qty:1}]});assert.equal(cart.status,200);assert.equal(cart.data.items.length,2);
  const mergeAgain=await call('/api/cart/merge','POST',{items:[{id:'turmeric-powder',qty:1}]});assert.equal(mergeAgain.status,200);assert.equal(mergeAgain.data.items.length,3);
  const fail=await call('/api/cart','PUT',{items:[{id:'fake-product',qty:1}]});assert.equal(fail.status,400);
  const profile=await call('/api/account/profile','PUT',{name:'QA Customer',phone:'9876543210',address:'Building 12, Main Street',city:'Hyderabad',state:'Telangana',pincode:'502307'});assert.equal(profile.status,200);
  const orders=await call('/api/orders','POST',{recipient:'QA Customer',phone:'9876543210',address:'Building 12, Main Street',city:'Hyderabad',state:'Telangana',pincode:'502307'});assert.equal(orders.status,201);assert.equal(orders.data.paymentStatus,'not_started');
  assert.equal((await call('/api/orders')).data.orders[0].items.length,3);
  assert.equal((await call('/api/cart')).data.items.length,0);
  await call('/api/cart','PUT',{items:[{id:'curry-leaf-powder',qty:2}]});
  assert.equal((await call('/api/auth/logout','POST',{})).status,200);
  cookie='';csrf='';const login=await call('/api/auth/login','POST',{email:'qa@example.com',password:'ProductionPass987'});assert.equal(login.status,200);csrf=login.data.csrf;cookie=(login.headers.get('set-cookie')||'').split(';')[0];
  assert.equal((await call('/api/cart')).data.items[0].qty,2,'account cart persisted after relogin');
  assert.equal((await call('/api/catalog')).data.paymentEnabled,false);
 }finally{server.kill('SIGTERM');await rm(dir,{recursive:true,force:true})}
});
