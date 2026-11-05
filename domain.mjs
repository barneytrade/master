const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
export function validateLead(x){
 if(!x||typeof x!=='object')throw Error('Enter the enquiry details.');
 if(typeof x.summary!=='string'||x.summary.length>4000)throw Error('Keep the enquiry under 4,000 characters.');
 const name=clean(x.name,120),phone=clean(x.phone,30),postcode=clean(x.postcode,16).toUpperCase(),summary=clean(x.summary,4000);
 if(!name||!summary||!postcode||!/^\+?[\d ()-]{7,30}$/.test(phone))throw Error('Enter a name, valid callback number, postcode and problem.');
 const urgency=['routine','urgent'].includes(x.urgency)?x.urgency:'routine';
 return {name,phone,postcode,summary,urgency,callback_time:clean(x.callback_time,120),source:'test',status:'new'};
}
export function validateStatus(s){if(!['new','contacted','closed'].includes(s))throw Error('Invalid enquiry status.');return s;}
export function normalizeCall(p){
 const d=p.call&&typeof p.call==='object'?p.call:p;
 const intake=q=>clean(d['Intake Form: '+q],500);
 const name=intake('What is your name?')||clean(d.caller_name||d.name||d.fromName,120);
 const phone=intake('What callback number should we use? Read it back to confirm.')||clean(d.caller_phone||d.from_number||d.phone,30);
 const postcode=intake('What is the property postcode?')||clean(d.postcode,16);
 let summary=clean(d.summary||d.call_summary||d.transcript,3700)||'Call received. Review the original call details in Frontdesk.';
 if(postcode&&!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(postcode))summary+=' Postcode needs confirmation: '+postcode+'.';
 let callback=intake('How urgent is the callback, and when would you prefer us to call?');
 if(/^(yes|no|okay|ok)$/i.test(callback))callback='';
 if(!callback){const userLines=clean(d.transcript,20000).split('\n').filter(x=>x.startsWith('user@')).join(' ');callback=userLines.match(/callback\s+(this afternoon|this morning|this evening|tomorrow|today)\b/i)?.[1]||'';}
 return {name:clean(name,120)||'Caller details awaiting review',phone:clean(phone,30),postcode:clean(postcode,16),summary,urgency:/\burgent\b/i.test(callback)&&! /not urgent/i.test(callback)?'urgent':'routine',callback_time:clean(callback,120),source:'voice',status:'new',external_id:clean(d.call_id||d.id||p.call_id,200)||null};
}
