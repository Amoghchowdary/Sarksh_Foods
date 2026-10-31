/* V23 local customer portal backend. Dependency-free, file-backed prototype.
 * Passwords are scrypt-hashed. Orders are QUOTATION REQUESTS only, not paid orders.
 * For public production use add managed DB, TLS, email verification and formal security review.
 */
import crypto from 'node:crypto';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import path from 'node:path';
const productIds=['chilli-powder','pulses-powder','bitter-gourd-powder','turmeric-powder','garam-masala','curry-leaf-powder'];
const products=Object.freeze([
 {id:'chilli-powder',name:'Chilli Powder'},
 {id:'pulses-powder',name:'Pulses Powder (Paruppu Podi)'},
 {id:'bitter-gourd-powder',name:'Bitter Gourd Powder'},
 {id:'turmeric-powder',name:'Turmeric Powder'},
 {id:'garam-masala',name:'Garam Masala Powder'},
 {id:'curry-leaf-powder',name:'Curry Leaf Powder'}
]);
const sessions=new Map(),rate=new Map();
const TTL=1000*60*60*24*7;
let serial=Promise.resolve();
export const PRODUCTS=products;
const cookie=(s)=>Object.fromEntries((s||'').split(';').map(x=>x.trim().split('=')).filter(x=>x[0]));
const matchEmail=s=>typeof s==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)&&s.length<=160;
const text=(v,max=250)=>typeof v==='string'?v.trim().slice(0,max):'';
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const fail=(res,status,msg)=>json(res,status,{error:msg});
function json(res,status,obj,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin',...headers});res.end(JSON.stringify(obj))}
async function body(req,res){const chunks=[];let len=0;for await(const c of req){len+=c.length;if(len>16000){fail(res,413,'Request too large');return null}chunks.push(c)}try{const j=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!j||typeof j!=='object'||Array.isArray(j))throw 0;return j}catch{fail(res,400,'Invalid JSON payload');return null}}
async function load(file,fallback){try{return JSON.parse(await readFile(file,'utf8'))}catch(e){if(e.code==='ENOENT')return structuredClone(fallback);throw e}}
async function save(file,content){await mkdir(path.dirname(file),{recursive:true});const tmp=`${file}.${crypto.randomBytes(6).toString('hex')}.tmp`;await writeFile(tmp,JSON.stringify(content,null,2),{mode:0o600});await rename(tmp,file)}
function transaction(fn){const output=serial.then(fn);serial=output.catch(()=>{});return output}
function throttle(req,key,limit=8,window=15*60*1000){const id=`${req.socket.remoteAddress||'anon'}-${key}`,t=Date.now();const entries=(rate.get(id)||[]).filter(n=>t-n<window);if(entries.length>=limit)return false;entries.push(t);rate.set(id,entries);if(rate.size>10000)rate.clear();return true}
function makeSession(user,res,req){const token=crypto.randomBytes(32).toString('hex');const csrf=crypto.randomBytes(24).toString('base64url');sessions.set(hash(token),{uid:user.id,csrf,expires:Date.now()+TTL});const secure=Boolean(req.socket.encrypted)||(process.env.COOKIE_SECURE==='true');res.setHeader('Set-Cookie',`sf_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${TTL/1000}${secure?'; Secure':''}`);return csrf}
function getSession(req){const raw=cookie(req.headers.cookie).sf_session;if(!raw||!/^[a-f0-9]{64}$/.test(raw))return null;const entry=sessions.get(hash(raw));if(!entry)return null;if(entry.expires<Date.now()){sessions.delete(hash(raw));return null}return entry}
function requireLogin(req,res){const session=getSession(req);if(!session){fail(res,401,'Please sign in to continue');return null}return session}
function requireCsrf(req,res,session){if(!session||req.headers['x-csrf-token']!==session.csrf){fail(res,403,'Security token missing. Refresh and retry.');return false}return true}
function cleanCart(b){if(!Array.isArray(b))return null;const m=new Map();for(const it of b){if(!it||typeof it!=='object'||!productIds.includes(it.id)||!Number.isInteger(it.qty)||it.qty<0||it.qty>99)return null;m.set(it.id,Math.min(99,(m.get(it.id)||0)+it.qty))}return products.filter(p=>(m.get(p.id)||0)>0).map(p=>({id:p.id,qty:m.get(p.id)}))}
function cartDetails(user){return (user.cart||[]).map(it=>({...it,...products.find(p=>p.id===it.id)}))}
function userView(u){return {id:u.id,name:u.name,email:u.email,phone:u.phone||'',address:u.address||'',city:u.city||'',state:u.state||'',pincode:u.pincode||''}}
const validPhone=s=>!s||/^[+\d() .-]{8,20}$/.test(s);
async function passwordHash(p,salt){return new Promise((resolve,reject)=>crypto.scrypt(p,salt,64,{N:16384,r:8,p:1},(e,d)=>e?reject(e):resolve(d.toString('hex'))))}
export async function handleCommerce(req,res,url,root){
 const p=url.pathname;if(!p.startsWith('/api/auth/')&&!p.startsWith('/api/account/')&&!p.startsWith('/api/cart')&&!p.startsWith('/api/orders')&&!p.startsWith('/api/catalog'))return false;
 const db=path.join(process.env.SARKSH_DATA_DIR||path.join(root,'data'),'customers-v23.json');
 const method=req.method;
 if(method==='GET'&&p==='/api/catalog'){json(res,200,{products,pricesPublished:false,paymentEnabled:false});return true}
 if(method==='GET'&&p==='/api/auth/me'){
  const session=getSession(req);if(!session)return json(res,200,{authenticated:false,user:null,csrf:null}),true;
  const store=await load(db,{users:[],orders:[]});const u=store.users.find(x=>x.id===session.uid);if(!u)return json(res,200,{authenticated:false,user:null,csrf:null}),true;
  json(res,200,{authenticated:true,user:userView(u),csrf:session.csrf});return true;
 }
 if(!['GET','POST','PUT'].includes(method)){fail(res,405,'Method not allowed');return true}
 // Same-origin protection for state changes alongside session CSRF token.
 if(method!=='GET'){const origin=req.headers.origin;if(origin&&origin!==`http://${req.headers.host}`&&origin!==`https://${req.headers.host}`){fail(res,403,'Cross-origin requests not allowed');return true}}
 if(p==='/api/auth/register'&&method==='POST'){
  if(!throttle(req,'register',6))return fail(res,429,'Too many attempts. Try later.'),true;
  const b=await body(req,res);if(!b)return true;
  const email=text(b.email,160).toLowerCase(),name=text(b.name,90),password=b.password;
  if(!matchEmail(email)||name.length<2||name.length>90||typeof password!=='string'||password.length<10||password.length>128)return fail(res,400,'Provide a name, valid email and password of at least 10 characters.'),true;
  const salt=crypto.randomBytes(20).toString('hex'),secret=await passwordHash(password,salt);
  const result=await transaction(async()=>{const store=await load(db,{users:[],orders:[]});if(store.users.some(u=>u.email===email))return null;const u={id:crypto.randomUUID(),email,name,phone:'',address:'',city:'',state:'',pincode:'',salt,secret,cart:[],createdAt:new Date().toISOString()};store.users.push(u);await save(db,store);return u});
  if(!result)return fail(res,409,'An account with this email already exists.'),true;
  const csrf=makeSession(result,res,req);json(res,201,{authenticated:true,user:userView(result),csrf});return true;
 }
 if(p==='/api/auth/login'&&method==='POST'){
  if(!throttle(req,'login',9))return fail(res,429,'Too many attempts. Try again later.'),true;
  const b=await body(req,res);if(!b)return true;
  const email=text(b.email,160).toLowerCase();if(!matchEmail(email)||typeof b.password!=='string')return fail(res,401,'Invalid email or password'),true;
  const store=await load(db,{users:[],orders:[]});const u=store.users.find(x=>x.email===email);
  const salt=u?.salt||'d9bd74cfb0e9e343ee3298c455917c87a1a1ca28';const expected=u?.secret||'0'.repeat(128);const candidate=await passwordHash(b.password,salt);
  if(!u||!crypto.timingSafeEqual(Buffer.from(expected,'hex'),Buffer.from(candidate,'hex')))return fail(res,401,'Invalid email or password'),true;
  const csrf=makeSession(u,res,req);json(res,200,{authenticated:true,user:userView(u),csrf});return true;
 }
 if(p==='/api/auth/logout'&&method==='POST'){
  const session=getSession(req);if(session&&!requireCsrf(req,res,session))return true;
  const raw=cookie(req.headers.cookie).sf_session;if(raw)sessions.delete(hash(raw));res.setHeader('Set-Cookie','sf_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');json(res,200,{ok:true});return true;
 }
 const session=requireLogin(req,res);if(!session)return true;
 if(method!=='GET'&&!requireCsrf(req,res,session))return true;
 if(p==='/api/account/profile'&&method==='PUT'){
  const b=await body(req,res);if(!b)return true;
  const name=text(b.name,90),phone=text(b.phone,20),address=text(b.address,220),city=text(b.city,80),state=text(b.state,80),pincode=text(b.pincode,12);
  if(name.length<2||!validPhone(phone)||pincode&&!/^\d{6}$/.test(pincode))return fail(res,400,'Check your name, mobile number and six-digit PIN code'),true;
  const updated=await transaction(async()=>{const s=await load(db,{users:[],orders:[]});const u=s.users.find(x=>x.id===session.uid);if(!u)return null;Object.assign(u,{name,phone,address,city,state,pincode});await save(db,s);return userView(u)});
  if(!updated)return fail(res,401,'Session account not found'),true;json(res,200,{user:updated});return true;
 }
 if(p==='/api/cart'&&method==='GET'){const s=await load(db,{users:[],orders:[]});const u=s.users.find(x=>x.id===session.uid);json(res,200,{items:u?cartDetails(u):[],pricesPublished:false});return true}
 if(p==='/api/cart'&&method==='PUT'||p==='/api/cart/merge'&&method==='POST'){
  const b=await body(req,res);if(!b)return true;
  const clean=cleanCart(b.items);if(!clean)return fail(res,400,'Invalid cart items'),true;
  const items=await transaction(async()=>{const s=await load(db,{users:[],orders:[]});const u=s.users.find(x=>x.id===session.uid);if(!u)return null;if(p.endsWith('/merge')){const merged=cleanCart([...(u.cart||[]),...clean]);u.cart=merged;}else u.cart=clean;await save(db,s);return cartDetails(u)});
  if(!items)return fail(res,401,'Session account not found'),true;json(res,200,{items});return true;
 }
 if(p==='/api/orders'&&method==='GET'){
  const s=await load(db,{users:[],orders:[]});const orders=s.orders.filter(x=>x.userId===session.uid).map(({userId,...rest})=>rest);json(res,200,{orders});return true;
 }
 if(p==='/api/orders'&&method==='POST'){
  const b=await body(req,res);if(!b)return true;
  const recipient=text(b.recipient,90),phone=text(b.phone,20),address=text(b.address,220),city=text(b.city,80),state=text(b.state,80),pincode=text(b.pincode,12);
  if(recipient.length<2||!validPhone(phone)||!phone||address.length<8||city.length<2||state.length<2||!/^\d{6}$/.test(pincode))return fail(res,400,'Complete the delivery name, phone, address, city, state and PIN.'),true;
  const order=await transaction(async()=>{const s=await load(db,{users:[],orders:[]});const u=s.users.find(x=>x.id===session.uid);if(!u||!u.cart?.length)return null;
   const o={id:'SF-REQ-'+Date.now().toString(36).toUpperCase()+'-'+crypto.randomBytes(3).toString('hex').toUpperCase(),userId:u.id,createdAt:new Date().toISOString(),items:cartDetails(u),delivery:{recipient,phone,address,city,state,pincode},status:'awaiting_pricing_and_availability',paymentStatus:'not_started',total:null,currency:'INR'};
   s.orders.unshift(o);u.cart=[];Object.assign(u,{phone,address,city,state,pincode});await save(db,s);return o});
  if(!order)return fail(res,400,'Your cart is empty; add products first.'),true;
  json(res,201,{ok:true,orderId:order.id,status:order.status,paymentStatus:order.paymentStatus,message:'Order request saved. No payment has been made.'});return true;
 }
 fail(res,404,'Unknown API route');return true;
}
