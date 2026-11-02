import {fileURLToPath} from 'node:url';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import net from 'node:net';
const root=fileURLToPath(new URL('../',import.meta.url));
// Resolve the same local .env settings as server.mjs, even before startup.
const envFile=join(root,'.env');
const configured={};
if(existsSync(envFile))for(const line of readFileSync(envFile,'utf8').split(/\r?\n/)){
 const match=line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
 if(match)configured[match[1]]=match[2].trim().replace(/^[\"']|[\"']$/g,'');
}
const setting=name=>process.env[name]||configured[name];
const major=Number(process.versions.node.split('.')[0]);
const required=['server.mjs','package.json','backend/commerce-gas.mjs','backend/gas-client.mjs','apps-script/Code.gs','apps-script/appsscript.json','index.html','products.html','recipes.html','quality.html','blog.html'];
let failures=[];
console.log('SARKSH FOODS V30 | Windows-safe preflight');
console.log('Node:',process.version,'| Runtime:',process.execPath,'| OS:',process.platform);
console.log('Project:',root);
if(major<20)failures.push('Node.js 20 or newer required');
for(const f of required){if(!existsSync(join(root,f)))failures.push('Missing file: '+f)}
const port=Number(setting('PORT')||5242);
console.log('Backend mode:',setting('SARKSH_BACKEND')||'local-preview');
console.log('Configured port:',port);
if(!Number.isInteger(port)||port<1||port>65535)failures.push('Invalid port');
const probe=net.createServer();
try{
 await new Promise((resolve,reject)=>{probe.once('error',reject);probe.listen(port,'127.0.0.1',resolve)});
 console.log('Port:',port,'available');
}catch(e){if(e.code==='EADDRINUSE')failures.push('Port '+port+' occupied: close the old SARKSH server');else failures.push('Port probe: '+e.message)}
finally{if(probe.listening)await new Promise(r=>probe.close(r));}
if(failures.length){for(const m of failures)console.error('ERROR:',m);process.exitCode=1;}
else console.log('Preflight passed');
