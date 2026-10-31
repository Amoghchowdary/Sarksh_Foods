import {handleCommerce} from './commerce-api-v23.mjs';
import {handleGasCommerce,handleGasContact} from './backend/commerce-gas.mjs';
import {gasCall} from './backend/gas-client.mjs';
import {existsSync,readFileSync} from 'node:fs';
// Local .env loader: configuration stays outside Git, no runtime npm dependencies.
const envFile=new URL('./.env',import.meta.url);if(existsSync(envFile))for(const line of readFileSync(envFile,'utf8').split(/\r?\n/)){const match=line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);if(match&&!process.env[match[1]])process.env[match[1]]=match[2].trim().replace(/^['"]|['"]$/g,'');}
const gasMode=process.env.SARKSH_BACKEND==='apps_script';
/* Dependency-free website server. Local prototype: use a hardened, backed-up service before commercial deployment. */
import http from 'node:http';
import {readFile, appendFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||5242),host=process.env.HOST||'127.0.0.1';
const mimes={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
const rate=new Map();
function respond(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))}
const valid=(s,min,max)=>typeof s==='string'&&s.trim().length>=min&&s.trim().length<=max;
async function enquiry(req,res){let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>12000)return respond(res,413,{error:'Request too large'});chunks.push(chunk)}let b;try{b=JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{return respond(res,400,{error:'Invalid JSON'})}if(!b||typeof b!=='object'||Array.isArray(b)||!valid(b.name,2,100)||!valid(b.email,5,160)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)||!valid(b.phone,8,20)||!/^[+0-9() .-]+$/.test(b.phone)||!valid(b.type,2,80)||!valid(b.message,10,3000))return respond(res,400,{error:'Please enter valid name, phone, email, type and message'});
 const ip=req.socket.remoteAddress||'unknown',now=Date.now(),past=(rate.get(ip)||[]).filter(t=>t>now-60000);if(past.length>5)return respond(res,429,{error:'Please try again in a minute'});past.push(now);rate.set(ip,past);if(rate.size>500)rate.clear();const id='SF-ENQ-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+crypto.randomBytes(3).toString('hex').toUpperCase();await mkdir(path.join(root,'data'),{recursive:true});await appendFile(path.join(root,'data','contact.jsonl'),JSON.stringify({id,date:new Date().toISOString(),name:b.name.trim(),phone:b.phone.trim(),email:b.email.trim(),type:b.type.trim(),message:b.message.trim()})+'\n',{mode:0o600});respond(res,201,{ok:true,id})}
async function serve(req,res,pathname){let p;try{p=decodeURIComponent(pathname)}catch{return respond(res,400,{error:'Invalid path'})}if(p==='/')p='/index.html';if(/^\/(?:story|products|quality|recipes|blog|contact|cart|account)$/.test(p))p+='.html';if(!(/^\/(?:index|story|products|quality|recipes|blog|contact|cart|account)\.html$/.test(p)||/^\/(?:assets|css|js)\/[a-z0-9-]+\.(?:webp|svg|css|js|png|jpg)$/.test(p)))return respond(res,404,{error:'Not found'});try{const bytes=await readFile(path.join(root,p));res.writeHead(200,{'Content-Type':mimes[path.extname(p)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':p.startsWith('/assets/')?'public, max-age=86400':'no-cache'});res.end(req.method==='HEAD'?undefined:bytes)}catch{return respond(res,404,{error:'Not found'})}}
// Exporting the server factory allows automated HTTP integration tests to run
// without spawning a second Node executable (which may be blocked on Windows).
export function createAppServer(){
 return http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(gasMode?await handleGasCommerce(req,res,url):await handleCommerce(req,res,url,root))return;if(req.method==='GET'&&url.pathname==='/api/health'){if(!gasMode)return respond(res,200,{ok:true,site:'SARKSH FOODS V28',backend:'local-preview'});try{await gasCall('ping');return respond(res,200,{ok:true,site:'SARKSH FOODS V28',backend:'apps_script',connected:true})}catch(e){return respond(res,503,{ok:false,site:'SARKSH FOODS V28',backend:'apps_script',connected:false,error:e.message})}}if(req.method==='POST'&&url.pathname==='/api/contact')return gasMode?await handleGasContact(req,res):await enquiry(req,res);if(req.method==='GET'||req.method==='HEAD')return await serve(req,res,url.pathname);respond(res,405,{error:'Method not allowed'})}catch(e){console.error(e);respond(res,500,{error:'Internal server error'})}});
}

// Start automatically only when launched using `node server.mjs` or `npm run dev`.
// Tests import createAppServer() and listen on an OS-assigned free port instead.
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const app=createAppServer();
 app.on('error',e=>{
  if(e?.code==='EADDRINUSE')console.error(`SARKSH FOODS V28: port ${port} is already in use. Close the older website server or change PORT.`);
  else console.error('SARKSH FOODS V28 startup failed:',e);
  process.exitCode=1;
 });
 app.listen(port,host,()=>console.log(`SARKSH FOODS V28 ready at http://${host}:${port}`));
}

