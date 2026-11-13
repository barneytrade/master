export function publicVoiceConfig(env){
 const key=env.RETELL_PUBLIC_KEY,agent=env.RETELL_AGENT_ID;
 if(typeof key!=='string'||! /^(key_|public_key_)[A-Za-z0-9_-]+$/.test(key)||typeof agent!=='string'||! /^agent_[A-Za-z0-9_-]+$/.test(agent))return {ready:false};
 return {ready:true,public_key:key,agent_id:agent};
}

export function voiceCallOptions(company,input,agentId){
 if(input?.consent!==true)throw Error('Please give consent to the browser voice demo.');
 const name=typeof input.name==='string'?input.name.trim():'';
 if(!name||name.length>120)throw Error('Enter your name (up to 120 characters).');
 if(!company||typeof company.name!=='string'||!company.name.trim())throw Error('Save a business profile before starting the voice demo.');
 const facts={};for(const key of ['name','services','coverage','hours'])facts[key]=typeof company[key]==='string'&&company[key].trim()?company[key].trim().slice(0,500):'Not confirmed';
 return {
  agent_id:agentId,
  retell_llm_dynamic_variables:{business_name:facts.name,business_facts:JSON.stringify(facts),tester_name:name},
  metadata:{source:'traderelay-browser-demo',company_id:String(company.id||'demo')},
  agent_override:{agent:{max_call_duration_ms:180000,end_call_after_silence_ms:30000}}
 };
}
