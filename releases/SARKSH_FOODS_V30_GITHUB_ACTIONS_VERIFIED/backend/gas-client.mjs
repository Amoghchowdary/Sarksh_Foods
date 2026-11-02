/** The private Node-to-Apps-Script transport. Do not import from browser JavaScript. */
export function backendConfigured(){return Boolean(process.env.SARKSH_GAS_URL && process.env.SARKSH_GAS_SECRET);}
export async function gasCall(operation,payload={}){
  const endpoint=process.env.SARKSH_GAS_URL||'';
  const secret=process.env.SARKSH_GAS_SECRET||'';
  const official=/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec(?:\?.*)?$/;
  const localForTest=process.env.SARKSH_ALLOW_LOCAL_GAS==='1'&&/^http:\/\/127\.0\.0\.1:\d+\//.test(endpoint);
  if(!backendConfigured()||secret.length<32||(!official.test(endpoint)&&!localForTest))throw Error('Google Apps Script backend configuration missing or invalid');
  const reply=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({secret,operation,payload}),redirect:'follow',signal:AbortSignal.timeout(30000)});
  if(!reply.ok)throw Error('Apps Script unavailable (HTTP '+reply.status+')');
  let response;try{response=await reply.json()}catch{throw Error('Apps Script returned non-JSON. Check web app permissions and deployment URL.');}
  if(!response||response.ok!==true)throw Error(response?.error||'Apps Script request rejected');
  return response.data;
}
