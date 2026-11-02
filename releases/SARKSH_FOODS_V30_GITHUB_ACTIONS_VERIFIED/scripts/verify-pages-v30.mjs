/** V30 production export gate: do not report success for a broken or indexable preview. */
import {readFile, stat, readdir} from 'node:fs/promises';
import {join,resolve,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=resolve(process.argv.find(x=>x.startsWith('--dir='))?.slice(6)||join(root,'dist-pages'));
const pages=['index','story','products','quality','recipes','blog','contact','cart','account'];
const exists=async p=>(await stat(p).catch(()=>null))?.isFile()||false;
for(const page of pages){
 const html=await readFile(join(out,page+'.html'),'utf8');
 assert.match(html,/<html\b[^>]*\blang=["']en["']/i,`${page}: language missing`);
 assert.match(html,/<meta\s+name=["']viewport["']/i,`${page}: responsive viewport missing`);
 assert.match(html,/<title>[^<]+<\/title>/i,`${page}: page title missing`);
 assert.match(html,/<meta\s+name=["']description["']/i,`${page}: description missing`);
 assert.equal((html.match(/<meta\s+name=["']description["']/gi)||[]).length,1,`${page}: duplicate SEO descriptions`);
 assert.equal((html.match(/<meta\s+name=["']robots["']/gi)||[]).length,1,`${page}: duplicate robots directives`);
 assert.match(html,/<meta\s+name=["']robots["']\s+content=["']noindex, nofollow, noarchive["']/i,`${page}: noindex missing`);
 assert(html.includes('js/preview-commerce-v30.js'),`${page}: preview-safe commerce adapter missing`);
 assert(!html.includes('src="js/commerce-v23.js"'),`${page}: Node-only commerce script referenced`);
 for(const [,attr,value] of html.matchAll(/\b(href|src)=["']([^"']+)["']/g)){
  if(/^(#|https?:|mailto:|tel:|data:)/i.test(value))continue;
  const rel=value.split(/[?#]/)[0];if(!rel||rel==='/')continue;
  assert(!rel.startsWith('/'),`${page}: root-absolute ${attr} breaks nested preview: ${value}`);
  const target=resolve(out,rel);
  assert(target.startsWith(out+sep),`${page}: path traversal ${value}`);
  assert(await exists(target),`${page}: missing ${attr} referenced asset: ${value}`);
 }
}
const productAssets=['product-chilli-powder-v25.png','product-turmeric-powder-v25.png','product-curry-leaf-powder-v25.png','product-bitter-gourd-v25.png','product-pulses-powder-v25.png','product-garam-masala-v25.png'];
for(const f of productAssets)assert((await stat(join(out,'assets',f))).size>10000,`Product image missing: ${f}`);
for(const f of ['ed-tomato-curry-v26.webp','ed-raw-turmeric-v26.webp','ed-raw-curry-leaves-v26.webp','ed-raw-chillies-v26.webp'])assert((await stat(join(out,'assets',f))).size>10000,`Editorial image missing: ${f}`);
for(const secret of ['server.mjs','commerce-api-v23.mjs','package.json','.env','backend','apps-script','tests','data','scripts','node_modules','PUSH_V29_MAIN.ps1']){
 assert(!(await stat(join(out,secret)).catch(()=>null)),`Non-static/server content leaked: ${secret}`);
}
assert(!(await exists(join(out,'js','commerce-v23.js'))),'Node-only commerce JS should not be published');
const code=await readFile(join(out,'js','app.js'),'utf8');
for(const p of productAssets)assert(code.includes(p),`Product mapping missing: ${p}`);
const editorial=await readFile(join(out,'js','editorial-v26.js'),'utf8');
for(const image of ['ed-tomato-curry-v26.webp','ed-raw-turmeric-v26.webp','ed-raw-curry-leaves-v26.webp'])assert(editorial.includes(image));
const adapter=await readFile(join(out,'js','preview-commerce-v30.js'),'utf8');
assert(!adapter.includes('fetch('),'Static adapter must not call Node APIs');
assert(adapter.includes("'/account/'")&&adapter.includes("'/products/'"),'Live store handoff missing');
assert((await readdir(out)).includes('V30_PREVIEW_ONLY.txt'),'Explicit non-transactional disclosure missing');
console.log('V30 export verified: 9 pages, noindex metadata, six product mappings, matching editorial imagery, no secrets/backend');
