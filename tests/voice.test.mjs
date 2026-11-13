import test from 'node:test';
import assert from 'node:assert/strict';
import {publicVoiceConfig,voiceCallOptions} from '../voice-demo.mjs';
test('voice configuration returns only public browser settings',()=>{
 const config=publicVoiceConfig({RETELL_PUBLIC_KEY:'key_browser',RETELL_AGENT_ID:'agent_demo',RETELL_API_KEY:'private-secret',TRADERELAY_API_TOKEN:'backend-secret'});
 assert.deepEqual(config,{ready:true,public_key:'key_browser',agent_id:'agent_demo'});
 assert.deepEqual(publicVoiceConfig({}),{ready:false});
 assert.deepEqual(publicVoiceConfig({RETELL_PUBLIC_KEY:'private-key',RETELL_AGENT_ID:'agent_demo'}),{ready:false});
});
test('a voice trial requires explicit consent, and a saved business',()=>{
 const company={id:'demo',name:'West London Plumbers',services:'Leaks',coverage:'London',hours:''};
 assert.throws(()=>voiceCallOptions(company,{name:'Sam',consent:false},'agent_demo'),/consent/i);
 assert.throws(()=>voiceCallOptions(null,{name:'Sam',consent:true},'agent_demo'),/business/i);
 const x=voiceCallOptions(company,{consent:true,phone:'ignored',name:'ignored'},'agent_demo');
 assert.equal(x.agent_id,'agent_demo');assert.equal(x.retell_llm_dynamic_variables.business_name,company.name);
 assert.equal(Object.hasOwn(x.retell_llm_dynamic_variables,'tester_name'),false);
 assert.deepEqual(JSON.parse(x.retell_llm_dynamic_variables.business_facts),{name:company.name,services:'Leaks',coverage:'London',hours:'Not confirmed'});
 assert.equal(x.agent_override.agent.max_call_duration_ms,180000);
 assert.equal(x.metadata.source,'traderelay-browser-demo');assert.ok(!JSON.stringify(x).includes('ignored'));
});

test('voice selection applies only a supported voice to the next call',()=>{
 const company={id:'demo',name:'Example Plumbers'};
 const input={consent:true};
 assert.equal(voiceCallOptions(company,input,'agent_demo').agent_override.agent.voice_id,'retell-Willa');
 assert.equal(voiceCallOptions(company,{...input,voice:'british'},'agent_demo').agent_override.agent.voice_id,'retell-Willa');
 assert.equal(voiceCallOptions(company,{...input,voice:'american'},'agent_demo').agent_override.agent.voice_id,'retell-Chloe');
 for(const [voice,id] of Object.entries({maren:'retell-Maren',grace:'retell-Grace',cimo:'retell-Cimo'}))assert.equal(voiceCallOptions(company,{...input,voice},'agent_demo').agent_override.agent.voice_id,id);
 assert.throws(()=>voiceCallOptions(company,{...input,voice:'untrusted-provider-id'},'agent_demo'),/voice/i);
});
