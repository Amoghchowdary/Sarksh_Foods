/** SARKSH FOODS V27 — Same-origin Node session/API bridge to Google Apps Script. */
import crypto from 'node:crypto';
import {gasCall} from './gas-client.mjs';

const PRODUCTS=Object.freeze([
 {id:'chilli-powder',name:'Chilli Powder'},
 {id:'pulses-powder',name:'Pulses Powder (Paruppu Podi)'},
 {id:'bitter-gourd-powder',name:'Bitter Gourd Powder'},
 {id:'turmeric-powder',name:'Turmeric Powder'},
 {id:'garam-masala',name:'Garam Masala Powder'},
 {id:'curry-leaf-powder',name:'Curry Leaf Powder'}
]);
const sessions=new Map(),rate=new Map(),TTL=7*24*3600*1000;
const ids=new Set(PRODUCTS.map(x=>x.id));
const norm=(s,max=250)=>typeof s==='string'?s.trim().slice(0,max):'';
const emailOk=x=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)&&x.length<=160;
const phoneOk=x=>!x||/^[+\d() .-]{8,20}$/.test(x);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const passwordHash=(p,salt)=>new Promise((yes,no)=>crypto.scrypt(p,salt,64,{N:16384,r:8,p:1},(e,d)=>e?no(e):yes(d.toString('hex'))));
const json=(res,code,result,extra={})=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin',...extra});res.end(JSON.stringify(result));};
const fail=(res,code,message)=>json(res,code,{error:message});
async function body(req,res){let count=0,parts=[];for await(const part of req){count+=part.length;if(count>16000){fail(res,413,'Request too large');return null;}parts.push(part);}try{let x=JSON.parse(Buffer.concat(parts).toString('utf8'));if(!x||typeof x!=='object'||Array.isArray(x))throw 0;return x;}catch{fail(res,400,'Invalid JSON');return null;}}
function rateLimit(req,what,max=9){let key=(req.socket.remoteAddress||'unknown')+':'+what,now=Date.now();let hits=(rate.get(key)||[]).filter(t=>t>now-900000);if(hits.length>=max)return false;hits.push(now);rate.set(key,hits);return true;}
function cookieRead(s){const m=String(s||'').match(/(?:^|;\s*)sf_session=([^;]+)/);return m?m[1]:'';}
function getSession(req){const token=cookieRead(req.headers.cookie);if(!/^[a-f0-9]{64}$/.test(token))return null;const entry=sessions.get(hash(token));if(!entry)return null;if(entry.expires<Date.now()){sessions.delete(hash(token));return null;}return entry;}
function newSession(user,req,res){const token=crypto.randomBytes(32).toString('hex'),csrf=crypto.randomBytes(24).toString('base64url');sessions.set(hash(token),{id:user.id,csrf,expires:Date.now()+TTL});const secure=process.env.COOKIE_SECURE==='true'||Boolean(req.socket.encrypted);res.setHeader('Set-Cookie',`sf_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TTL/1000}${secure?'; Secure':''}`);return csrf;}
function requireSession(req,res){const sess=getSession(req);if(!sess)fail(res,401,'Sign in required');return sess;}
function csrfOk(req,res,s){if(req.headers['x-csrf-token']!==s.csrf){fail(res,403,'Security token missing. Refresh and retry.');return false;}return true;}
function normalizeCart(items){if(!Array.isArray(items)||items.length>60)return null;const m=new Map();for(const x of items){if(!x||!ids.has(x.id)||!Number.isInteger(x.qty)||x.qty<0||x.qty>99)return null;m.set(x.id,Math.min(99,(m.get(x.id)||0)+x.qty));}return PRODUCTS.filter(p=>m.get(p.id)>0).map(p=>({id:p.id,qty:m.get(p.id)}));}
function detail(items){return items.map(x=>({...x,...PRODUCTS.find(p=>p.id===x.id)}));}
function checkOrigin(req,res){if(req.method==='GET')return true;const origin=req.headers.origin;if(origin&&origin!==`http://${req.headers.host}`&&origin!==`https://${req.headers.host}`){fail(res,403,'Cross-origin requests not allowed');return false;}return true;}

export async function handleGasCommerce(req,res,url){
 const p=url.pathname,method=req.method;
 if(!(/^\/api\/(auth\/|cart|account\/|orders|catalog)/).test(p))return false;
 if(!checkOrigin(req,res))return true;
 if(method==='GET'&&p==='/api/catalog'){json(res,200,{products:PRODUCTS,pricesPublished:false,paymentEnabled:false});return true;}
 if(method==='GET'&&p==='/api/auth/me'){
   const session=getSession(req);if(!session){json(res,200,{authenticated:false,user:null,csrf:null});return true;}
   const user=await gasCall('user.byId',{id:session.id});json(res,200,user?{authenticated:true,user,csrf:session.csrf}:{authenticated:false,user:null,csrf:null});return true;
 }
 if(p==='/api/auth/register'&&method==='POST'){
   if(!rateLimit(req,'register',6)){fail(res,429,'Too many requests');return true;}
   const b=await body(req,res);if(!b)return true;
   const email=norm(b.email,160).toLowerCase(),name=norm(b.name,90),password=b.password;
   if(!emailOk(email)||name.length<2||typeof password!=='string'||password.length<10||password.length>128){fail(res,400,'Enter a valid name, email and password (at least 10 characters)');return true;}
   const id=crypto.randomUUID(),salt=crypto.randomBytes(20).toString('hex'),secret=await passwordHash(password,salt);
   const result=await gasCall('user.create',{id,name,email,salt,secret});if(!result.created){fail(res,409,'Email already registered');return true;}
   const csrf=newSession(result.user,req,res);json(res,201,{authenticated:true,user:result.user,csrf});return true;
 }
 if(p==='/api/auth/login'&&method==='POST'){
   if(!rateLimit(req,'login',9)){fail(res,429,'Too many attempts');return true;}
   const b=await body(req,res);if(!b)return true;
   const email=norm(b.email,160).toLowerCase();if(!emailOk(email)||typeof b.password!=='string'){fail(res,401,'Invalid email or password');return true;}
   const found=await gasCall('user.byEmail',{email});const salt=found?.salt||'d9bd74cfb0e9e343ee3298c455917c87a1a1ca28',reference=found?.secret||'0'.repeat(128),candidate=await passwordHash(b.password,salt);
   if(!found||!crypto.timingSafeEqual(Buffer.from(reference,'hex'),Buffer.from(candidate,'hex'))){fail(res,401,'Invalid email or password');return true;}
   const user={id:found.id,email:found.email,name:found.name,phone:found.phone,address:found.address,city:found.city,state:found.state,pincode:found.pincode};
   const csrf=newSession(user,req,res);json(res,200,{authenticated:true,user,csrf});return true;
 }
 if(p==='/api/auth/logout'&&method==='POST'){
   const s=getSession(req);if(s&&!csrfOk(req,res,s))return true;
   const token=cookieRead(req.headers.cookie);if(token)sessions.delete(hash(token));
   res.setHeader('Set-Cookie','sf_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');json(res,200,{ok:true});return true;
 }
 const s=requireSession(req,res);if(!s)return true;
 if(method!=='GET'&&!csrfOk(req,res,s))return true;
 if(p==='/api/account/profile'&&method==='PUT'){
   const b=await body(req,res);if(!b)return true;
   const profile={id:s.id,name:norm(b.name,90),phone:norm(b.phone,20),address:norm(b.address,220),city:norm(b.city,80),state:norm(b.state,80),pincode:norm(b.pincode,12)};
   if(profile.name.length<2||!phoneOk(profile.phone)||(profile.pincode&&!/^\d{6}$/.test(profile.pincode))){fail(res,400,'Check name, phone and PIN code');return true;}
   const user=await gasCall('user.profile',profile);json(res,200,{user});return true;
 }
 if(p==='/api/cart'&&method==='GET'){
   const cart=await gasCall('cart.read',{userId:s.id});json(res,200,{items:detail(cart),pricesPublished:false});return true;
 }
 if((p==='/api/cart'&&method==='PUT')||(p==='/api/cart/merge'&&method==='POST')){
   const b=await body(req,res);if(!b)return true;
   const items=normalizeCart(b.items);if(!items){fail(res,400,'Invalid cart items');return true;}
   const updated=await gasCall(p.endsWith('/merge')?'cart.merge':'cart.replace',{userId:s.id,items});json(res,200,{items:detail(updated)});return true;
 }
 if(p==='/api/orders'&&method==='GET'){
   const orders=await gasCall('orders.list',{userId:s.id});json(res,200,{orders:orders.map(o=>({...o,items:detail(o.items)}))});return true;
 }
 if(p==='/api/orders'&&method==='POST'){
   const b=await body(req,res);if(!b)return true;
   const d={recipient:norm(b.recipient,90),phone:norm(b.phone,20),address:norm(b.address,220),city:norm(b.city,80),state:norm(b.state,80),pincode:norm(b.pincode,12)};
   if(d.recipient.length<2||!d.phone||!phoneOk(d.phone)||d.address.length<8||d.city.length<2||d.state.length<2||!/^\d{6}$/.test(d.pincode)){fail(res,400,'Complete all delivery details');return true;}
   const orderId='SF-REQ-'+Date.now().toString(36).toUpperCase()+'-'+crypto.randomBytes(4).toString('hex').toUpperCase();
   const o=await gasCall('orders.create',{userId:s.id,orderId,delivery:d});json(res,201,{ok:true,orderId:o.id,status:o.status,paymentStatus:o.paymentStatus,message:'Order request saved. No payment has been made.'});return true;
 }
 fail(res,404,'Unknown API route');return true;
}

export async function handleGasContact(req,res){
 if(!rateLimit(req,'enquiry',6)){fail(res,429,'Please try again later');return;}
 const b=await body(req,res);if(!b)return;
 const clean={id:'SF-ENQ-'+Date.now().toString(36).toUpperCase()+'-'+crypto.randomBytes(4).toString('hex').toUpperCase(),name:norm(b.name,100),phone:norm(b.phone,20),email:norm(b.email,160),type:norm(b.type,80),message:norm(b.message,3000)};
 if(clean.name.length<2||!emailOk(clean.email)||!phoneOk(clean.phone)||!clean.phone||clean.type.length<2||clean.message.length<10){fail(res,400,'Complete all required enquiry fields');return;}
 const result=await gasCall('contact.create',clean);json(res,201,{ok:true,id:result.id});
}
