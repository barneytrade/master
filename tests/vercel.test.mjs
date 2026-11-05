import test from 'node:test';
import assert from 'node:assert/strict';
import {handleWebApi} from '../web-api.mjs';
const env={TRADERELAY_API_TOKEN:'a'.repeat(64)};
const request=(path,method='GET',body,origin='https://example.com')=>new Request('https://example.com'+path,{method,headers:{origin,'content-type':'application/json'},body});
test('server proxy forwards the backend credential without returning it to the browser',async()=>{
 let forwarded;
 const r=await handleWebApi(request('/api/state'),env,async(url,options)=>{forwarded={url,options};return Response.json({company:{name:'Demo'},leads:[]});});
 assert.equal(r.status,200); assert.equal(forwarded.url,'https://rambgrzqcmbkjetcytfy.supabase.co/functions/v1/traderelay/state');
 assert.equal(forwarded.options.headers.authorization,'Bearer '+env.TRADERELAY_API_TOKEN);
 assert.ok(!(await r.text()).includes(env.TRADERELAY_API_TOKEN));assert.equal(r.headers.get('cache-control'),'no-store');
});
test('unconfigured, cross-origin, unsupported and oversized requests never reach the backend',async()=>{
 const fail=()=>{throw Error('must not reach backend');};
 assert.equal((await handleWebApi(request('/api/state'),{},fail)).status,503);
 assert.equal((await handleWebApi(request('/api/company','PATCH','{}','https://attacker.example'),env,fail)).status,403);
 assert.equal((await handleWebApi(request('/api/webhook/secret','POST','{}'),env,fail)).status,404);
 assert.equal((await handleWebApi(request('/api/leads','DELETE'),env,fail)).status,405);
 assert.equal((await handleWebApi(request('/api/leads','POST','x'.repeat(10001)),env,fail)).status,413);
});
test('proxy preserves valid JSON errors and replaces non-JSON or failed upstream responses',async()=>{
 const json=await handleWebApi(request('/api/state'),env,async()=>Response.json({error:'Unauthorized'}, {status:401}));assert.equal(json.status,401);
 for(const fetcher of [async()=>new Response('<html>upstream error</html>',{status:503}),async()=>{throw Error('network');}]){
  const r=await handleWebApi(request('/api/state'),env,fetcher);assert.equal(r.status,502);assert.match((await r.json()).error,/Connection unavailable/);
 }
});
