import {RetellClient} from 'retell-client-js-sdk';
import {voiceCallOptions} from '../voice-demo.mjs';

const form=document.querySelector('#voice-form'),start=document.querySelector('#voice-start'),end=document.querySelector('#voice-end'),status=document.querySelector('#voice-status'),audio=document.querySelector('#voice-audio');
let session=null,starting=false,config=null,cancelled=false,attempt=0;
const say=text=>{status.textContent=text;};
const reset=()=>{session=null;starting=false;start.disabled=!config?.ready;end.disabled=true;audio.hidden=true;form.elements.name.disabled=false;form.elements.voice.disabled=false;};
async function read(path){const r=await fetch('/api/'+path);const x=await r.json();if(!r.ok)throw Error(x.error||'Unable to load the voice demo.');return x;}
read('voice-config').then(x=>{config=x;start.disabled=!x.ready;say(x.ready?'Ready. Use headphones if you can.':'Browser voice is being connected. You can still try saving an enquiry below.');}).catch(()=>say('Voice setup could not be loaded. Refresh the page to try again.'));

form.addEventListener('submit',async event=>{
 event.preventDefault();if(starting||session||!config?.ready)return;
 const turn=++attempt;let failure=null;starting=true;cancelled=false;start.disabled=true;end.disabled=false;form.elements.name.disabled=true;form.elements.voice.disabled=true;say('Loading your saved business profile…');
 try{
  const state=await read('state');
  const options=voiceCallOptions(state.company,{name:form.elements.name.value,consent:form.elements.consent.checked,voice:form.elements.voice.value},config.agent_id);
  if(cancelled||turn!==attempt)return;
  say('Connecting… Allow microphone access when asked.');
  const client=new RetellClient({key:config.public_key});
  session=client.createWebCall({...options,hooks:{
   onStatus:value=>{if(turn!==attempt)return;if(value==='live'){audio.hidden=false;say('You’re connected. Speak to the receptionist. If you cannot hear it, click Enable audio.');}},
   onEnd:()=>{if(turn!==attempt)return;say(failure||(cancelled?'Test call ended.':'Test call ended. You can start another when you’re ready.'));reset();},
   onError:error=>{
    if(turn!==attempt)return;const text=String(error?.message||'');
    failure=/permission|denied|microphone/i.test(text)?'Microphone access was denied. Allow it in your browser, then try again.':/domain|origin|unauthorized|forbidden|401|403/i.test(text)?'Voice access is not authorized for this website yet. Please check the Retell browser key and allowed domain.':'The voice call could not connect. Please try again.';say(failure);
    session?.end().catch(()=>{});reset();
   }
  }});
 }catch(error){if(turn===attempt){say(error.message||'Unable to start the test call.');reset();}}
 finally{if(turn===attempt&&cancelled&&!session)reset();}
});
end.addEventListener('click',async()=>{++attempt;cancelled=true;starting=true;start.disabled=true;end.disabled=true;say('Ending the test call…');try{await session?.end();}finally{reset();say('Test call ended.');}});
window.addEventListener('pagehide',()=>{cancelled=true;session?.end().catch(()=>{});});

audio.addEventListener('click',async()=>{try{await session?.startAudioPlayback();say('Audio enabled. Speak to the receptionist.');}catch{say('Audio could not start. Check your speakers and try Enable audio again.');}});
