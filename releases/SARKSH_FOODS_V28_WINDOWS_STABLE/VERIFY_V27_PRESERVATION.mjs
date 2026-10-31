import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import crypto from 'node:crypto';
const list=JSON.parse(await readFile(new URL('./V26_PRESERVED_FRONTEND_HASHES.json',import.meta.url),'utf8'));
for(const [file,expected] of Object.entries(list)){
 const actual=crypto.createHash('sha256').update(await readFile(new URL('./'+file,import.meta.url))).digest('hex');
 assert.equal(actual,expected,'Original V26 website file was changed: '+file);
}
console.log(`V27 preservation QA passed: ${Object.keys(list).length} original V26 frontend files byte-for-byte unchanged.`);
