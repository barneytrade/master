import assert from 'node:assert/strict';
const base='https://rambgrzqcmbkjetcytfy.supabase.co/functions/v1/traderelay';
async function call(path,method='GET',body,token=process.env.TEST_API_TOKEN){const r=await fetch(base+path,{method,headers:{authorization:'Bearer '+(token||''),'content-type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};}
assert.equal((await call('/state','GET',undefined,'')).status,401);
assert.equal((await call('/state','GET',undefined,'0'.repeat(64))).status,401);
assert.equal((await call('/leads','POST',{})).status,400);
const created=await call('/leads','POST',{name:'PoC verification (test)',phone:'07700900123',postcode:'SW19 1AA',summary:'Synthetic verification enquiry. Leaking tap.',urgency:'routine'});
assert.equal(created.status,201);assert.equal(created.data.source,'test');
assert.equal((await call('/leads/'+created.data.id,'PATCH',{status:'deleted'})).status,400);
assert.equal((await call('/leads/'+created.data.id,'PATCH',{status:'contacted'})).status,200);
const state=await call('/state');assert.equal(state.status,200);assert.equal(state.data.leads.find(x=>x.id===created.data.id).status,'contacted');
const hook='/webhook/'+process.env.TEST_WEBHOOK_TOKEN;
const event={call_id:'verification-'+Date.now(),caller_name:'Webhook verification (synthetic)',caller_phone:'07700900124',postcode:'SW19 1AA',summary:'Synthetic webhook transport test; not a real call.'};
const first=await call(hook,'POST',event);assert.equal(first.status,200);assert.equal(first.data.duplicate,false);
const second=await call(hook,'POST',event);assert.equal(second.data.duplicate,true);
assert.equal((await call('/webhook/'+'0'.repeat(64),'POST',event)).status,401);
console.log(JSON.stringify({passed:10,testLeadId:created.data.id,syntheticCallId:event.call_id}));
