/** V30: export the approved frontend as a non-transactional, unindexed GitHub Pages preview.
 * No Node code, Apps Script credentials, customer data or deployment secrets are shipped.
 * Existing customer-facing Vite production root remains unchanged.
 */
import {cp, mkdir, rm, stat, writeFile, readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join, dirname, resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=join(root,'dist-pages');
const pages=['index','story','products','quality','recipes','blog','contact','cart','account'];
const descriptions={
 index:'Explore SARKSH FOODS and our heritage-inspired Indian powders.',
 story:'Discover the heritage and food traditions behind SARKSH FOODS.',
 products:'Explore chilli, turmeric, pulses, garam masala, curry leaf and bitter gourd powders.',
 quality:'Discover the sourcing, ingredient care and quality aspirations of SARKSH FOODS.',
 recipes:'Cook traditional recipes with SARKSH FOODS powders and spices.',
 blog:'Food heritage, ingredients and culinary inspiration from SARKSH FOODS.',
 contact:'Reach SARKSH FOODS for product and business enquiries.',
 cart:'SARKSH FOODS cart preview. Shopping is available on the main website.',
 account:'SARKSH FOODS account preview. Visit the main website to sign in.'
};
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
for(const page of pages){
 const fn=join(root,page+'.html');
 if(!(await stat(fn).catch(()=>null))?.isFile())throw Error(`Missing approved page: ${page}.html`);
 let html=await readFile(fn,'utf8');
 const needle='<script src="js/commerce-v23.js" defer></script>';
 if(!html.includes(needle))throw Error(`Preview adapter anchor missing in ${page}.html`);
 html=html.replace(needle,'<script src="js/preview-commerce-v30.js" defer></script>');
 if(!/<head\b[^>]*>/i.test(html))throw Error(`Missing head in ${page}.html`);
 // Remove inherited metadata before adding a single explicit preview-specific record.
 html=html.replace(/<meta\s+(?:name=["'](?:description|robots)["']|property=["']og:site_name["'])[^>]*>/gi,'');
 const tags=`<meta name="robots" content="noindex, nofollow, noarchive"><meta name="description" content="${descriptions[page]}"><meta property="og:site_name" content="SARKSH FOODS">`;
 // Metadata-only: do not touch the approved visual DOM, CSS, assets or copy.
 html=html.replace(/<head\b[^>]*>/i,m=>m+tags);
 html=html.replace(/<\/head>/i,'<link rel="stylesheet" href="css/mobile-v30.css"></head>');
 await writeFile(join(out,page+'.html'),html,'utf8');
}
for(const dir of ['assets','css','js'])await cp(join(root,dir),join(out,dir),{recursive:true});
// Do not ship the unused Node-only commerce frontend implementation in a static preview.
await rm(join(out,'js','commerce-v23.js'),{force:true});
await cp(join(root,'scripts','preview-commerce-v30.js'),join(out,'js','preview-commerce-v30.js'));
await writeFile(join(out,'V30_PREVIEW_ONLY.txt'),
 'SARKSH FOODS V30: static, noindex design preview. Not a transactional storefront.\n'+
 'Live customer accounts, orders and payments remain on the existing production store.\n'+
 'GitHub Pages does not execute the bundled Node backend.\n');
console.log('V30 static Pages artifact generated:',out);
