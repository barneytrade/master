import test from 'node:test';
import assert from 'node:assert/strict';
import {handle} from '../gateway.mjs';
const env={SUPABASE_URL:'https://example.com',SUPABASE_SERVICE_ROLE_KEY:'test'};
const token='a'.repeat(64);
test('app routes accept Sites and Vercel client credentials but never webhook credentials',async()=>{
 for(const kind of ['app','vercel','webhook']){
  const fetcher=async(url)=>{
   if(url.includes('tr_access')){const filter=new URL(url).searchParams.get('kind');return Response.json(filter==='in.(app,vercel)'&&kind!=='webhook'?[{kind}]:[]);}
   return Response.json([]);
  };
  const r=await handle(new Request('https://example.com/traderelay/state',{headers:{authorization:'Bearer '+token}}),env,fetcher);
  assert.equal(r.status,kind==='webhook'?401:200,kind);
 }
});
test('an app credential cannot ingest a voice webhook',async()=>{
 const r=await handle(new Request('https://example.com/traderelay/webhook/'+token,{method:'POST',body:'{}'}),env,async url=>{assert.equal(new URL(url).searchParams.get('kind'),'eq.webhook');return Response.json([]);});
 assert.equal(r.status,401);
});
