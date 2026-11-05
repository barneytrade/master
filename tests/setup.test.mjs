import test from 'node:test';
import assert from 'node:assert/strict';
import {handle} from '../gateway.mjs';
const token='a'.repeat(64);
test('saving approved company data queues a fresh revision and removes earlier verification',async()=>{
 let saved;
 const fetcher=async(url,options)=>{if(url.includes('tr_access'))return Response.json([{kind:'app'}]);saved=JSON.parse(options.body);return Response.json([saved]);};
 const request=()=>new Request('https://example.com/traderelay/company',{method:'PATCH',headers:{authorization:'Bearer '+token},body:JSON.stringify({name:'Example Company',services:'Taps',coverage:'London',hours:'',setup_status:'ready'})});
 const env={SUPABASE_URL:'https://example.com',SUPABASE_SERVICE_ROLE_KEY:'test'};
 assert.equal((await handle(request(),env,fetcher)).status,200);
 assert.equal(saved.setup_status,'pending');assert.equal(saved.setup_verified_at,null);const first=saved.setup_revision;
 await handle(request(),env,fetcher);assert.notEqual(saved.setup_revision,first);
});
test('unauthenticated saves cannot queue a job',async()=>{const r=await handle(new Request('https://example.com/traderelay/company',{method:'PATCH'}),{SUPABASE_URL:'https://example.com',SUPABASE_SERVICE_ROLE_KEY:'test'},()=>{throw Error('should not reach DB');});assert.equal(r.status,401);});
