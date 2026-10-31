import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const expected=JSON.parse(readFileSync(join(root,'scripts/v28-frontend-hashes.json'),'utf8'));
for(const [p,sum] of Object.entries(expected)){
 const full=join(root,p);
 if(!existsSync(full))throw Error('Missing preserved frontend file: '+p);
 const actual=createHash('sha256').update(readFileSync(full)).digest('hex');
 if(actual!==sum)throw Error('Frontend modified unexpectedly: '+p);
}
console.log('V28 frontend preservation verified:',Object.keys(expected).length,'original files unchanged.');
