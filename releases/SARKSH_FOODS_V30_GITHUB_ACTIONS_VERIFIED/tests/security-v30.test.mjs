import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {once} from 'node:events';

const SECRET='Z'.repeat(48);

async function start(server){server.listen(0,'127.0.0.1');await once(server,'listening');return `http://127.0.0.1:${server.address().port}`;}
async function close(server){await new Promise(resolve=>server.close(resolve));}

test('V30 security regression: foreign origins, oversized login, private source, and response headers',async t=>{
 let gasCalls=0;
 const fakeGas=http.createServer(async(req,res)=>{
  gasCalls++;
  for await(const _ of req){};
  res.writeHead(200,{'Content-Type':'application/json'});
  res.end(JSON.stringify({ok:true,data:{ready:true}}));
 });
 const fakeGasURL=await start(fakeGas);t.after(()=>close(fakeGas));
 const original={};
 for(const name of ['SARKSH_BACKEND','SARKSH_GAS_URL','SARKSH_GAS_SECRET','SARKSH_ALLOW_LOCAL_GAS'])original[name]=process.env[name];
 Object.assign(process.env,{SARKSH_BACKEND:'apps_script',SARKSH_GAS_URL:fakeGasURL+'/exec',SARKSH_GAS_SECRET:SECRET,SARKSH_ALLOW_LOCAL_GAS:'1'});
 t.after(()=>{for(const [k,v] of Object.entries(original)){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
 const {createAppServer}=await import('../server.mjs');
 const server=createAppServer();const url=await start(server);t.after(()=>close(server));
 const badContact=await fetch(url+'/api/contact',{method:'POST',headers:{Origin:'https://attacker.example','Content-Type':'application/json'},body:JSON.stringify({name:'A Customer',email:'one@example.test',phone:'9999999999',type:'General Enquiry',message:'Contact about spices please'})});
 assert.equal(badContact.status,403);
 assert.equal(gasCalls,0,'A rejected cross-origin request must not reach Apps Script');
 const badLogin=await fetch(url+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'buyer@example.test',password:'x'.repeat(400)})});
 assert.equal(badLogin.status,401);
 assert.equal(gasCalls,0,'Excessive password must not consume hashing resources or call GAS');
 const hugeContact=await fetch(url+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Buyer',email:'buyer@example.test',phone:'9999999999',type:'General Enquiry',message:'a'.repeat(18000)})});
 assert.equal(hugeContact.status,413);
 assert.equal(gasCalls,0);
 const blocked=await fetch(url+'/.env');assert.equal(blocked.status,404);
 const backend=await fetch(url+'/backend/gas-client.mjs');assert.equal(backend.status,404);
 const publicPage=await fetch(url+'/products.html');assert.equal(publicPage.status,200);
 assert.equal(publicPage.headers.get('x-content-type-options'),'nosniff');
 assert.equal(publicPage.headers.get('x-frame-options'),'DENY');
 assert.match(publicPage.headers.get('permissions-policy')||'',/camera=\(\)/);
 assert.match(await publicPage.text(),/href="css\/mobile-v30.css"/,'Local HTTP preview must use the V30 mobile correction');
 const ping=await fetch(url+'/api/health');assert.equal(ping.status,200);
 const state=await ping.json();assert.equal(state.backend,'apps_script');assert.equal(state.site,'SARKSH FOODS V30');
 assert.equal(gasCalls,1);
});
