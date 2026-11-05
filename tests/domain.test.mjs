import test from 'node:test';
import assert from 'node:assert/strict';
import {validateLead,validateStatus,normalizeCall} from '../domain.mjs';
test('missing or unsafe lead data is rejected',()=>{assert.throws(()=>validateLead({}));assert.throws(()=>validateLead({name:'A',phone:'xx',postcode:'SW19',summary:'Leak'}));});
test('test enquiry is distinctly labelled and bounded',()=>{const x=validateLead({name:' Sam ',phone:'07700900123',postcode:'sw19 1aa',summary:'Leaking tap',urgency:'routine'});assert.equal(x.name,'Sam');assert.equal(x.postcode,'SW19 1AA');assert.equal(x.source,'test');assert.throws(()=>validateLead({...x,summary:'x'.repeat(4001)}));});
test('only supported lead statuses accepted',()=>{assert.equal(validateStatus('contacted'),'contacted');assert.throws(()=>validateStatus('deleted'));});
test('unmapped provider call retained without invented caller details',()=>{const x=normalizeCall({id:'call-1',unknown:'payload'});assert.equal(x.name,'Caller details awaiting review');assert.equal(x.source,'voice');assert.equal(x.external_id,'call-1');});
test('Frontdesk intake fields take precedence over the platform caller number',()=>{
 const x=normalizeCall({caller:'+18005550100',summary:'Kitchen tap leak; callback requested.',transcript:"user@ I'd like a callback this afternoon.\n",'Intake Form: What is your name?':'Example Caller','Intake Form: What callback number should we use? Read it back to confirm.':'07700900123','Intake Form: What is the property postcode?':'SW19-1AAA','Intake Form: How urgent is the callback, and when would you prefer us to call?':'Yes'});
 assert.equal(x.name,'Example Caller');assert.equal(x.phone,'07700900123');assert.equal(x.postcode,'SW19-1AAA');assert.match(x.summary,/Postcode needs confirmation/);assert.equal(x.callback_time,'this afternoon');
});
test('ambiguous callback answers are not presented as a callback time',()=>{
 const x=normalizeCall({'Intake Form: How urgent is the callback, and when would you prefer us to call?':'Yes'});assert.equal(x.callback_time,'');assert.equal(x.phone,'');
});
