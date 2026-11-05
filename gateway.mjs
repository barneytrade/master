import {validateLead,validateStatus,normalizeCall} from './domain.mjs';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
export async function handle(req,env,fetcher=fetch){
 const base=env.SUPABASE_URL,secret=env.SUPABASE_SERVICE_ROLE_KEY;
 if(!base||!secret)return json({error:'Backend configuration missing'},503);
 async function db(path,options={}){
  const r=await fetcher(base+'/rest/v1/'+path,{...options,headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json',Prefer:'return=representation',...options.headers}});
  if(!r.ok)throw Object.assign(Error('Database request failed'),{status:r.status});
  return r.status===204?null:r.json();
 }
 try{
  const url=new URL(req.url),hook=url.pathname.includes('/webhook/'),kind=hook?'webhook':'app';
  const token=hook?url.pathname.split('/webhook/')[1]:(req.headers.get('authorization')||'').replace(/^Bearer /,'');
  if(!token||! /^[a-f0-9]{64}$/.test(token))return json({error:'Unauthorized'},401);
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(x=>x.toString(16).padStart(2,'0')).join('');
  const keys=await db('tr_access?kind='+(hook?'eq.webhook':'in.(app,vercel)')+'&token_hash=eq.'+hash+'&select=kind');
  if(keys.length!==1)return json({error:'Unauthorized'},401);
  const route=hook?'/webhook':url.pathname.split('/traderelay')[1]||'/';
  if(req.method==='GET'&&route==='/state'){
   const [companies,leads]=await Promise.all([db('tr_company?select=*'),db('tr_leads?select=id,created_at,name,phone,postcode,summary,urgency,callback_time,source,status&order=created_at.desc&limit=200')]);
   return json({company:companies[0],leads,voice_connected:false});
  }
  if(!['POST','PATCH'].includes(req.method))return json({error:'Method not allowed'},405);
  const raw=await req.text();if(raw.length>100000)return json({error:'Payload too large'},413);
  let data;try{data=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
  if(!data||Array.isArray(data)||typeof data!=='object')return json({error:'Invalid payload'},400);
  if(hook){
   const lead=normalizeCall(data);
   if(!lead.external_id){lead.external_id='body-'+Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
   const rows=await db('tr_leads?on_conflict=source,external_id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify({...lead,raw_event:data})});
   return json({received:true,duplicate:!rows.length});
  }
  if(req.method==='POST'&&route==='/leads'){let lead;try{lead=validateLead(data);}catch(e){return json({error:e.message},400);}return json((await db('tr_leads',{method:'POST',body:JSON.stringify(lead)}))[0],201);}
  if(req.method==='PATCH'&&/^\/leads\/[a-f0-9-]{36}$/.test(route)){
   let status;try{status=validateStatus(data.status);}catch(e){return json({error:e.message},400);}
   const rows=await db('tr_leads?id=eq.'+route.split('/')[2],{method:'PATCH',body:JSON.stringify({status})});
   return rows.length?json(rows[0]):json({error:'Enquiry not found'},404);
  }
  if(req.method==='PATCH'&&route==='/company'){
   const values={};for(const field of ['name','services','coverage','hours']){if(typeof data[field]!=='string'||(field==='name'&&!data[field].trim())||data[field].length>500)return json({error:'Enter a business name and keep each field under 500 characters.'},400);values[field]=data[field].trim();}
   values.updated_at=new Date().toISOString();values.setup_revision=crypto.randomUUID();values.setup_status="pending";values.setup_note="Waiting for the setup agent.";values.setup_verified_at=null;return json((await db('tr_company?id=eq.smith-plumbing',{method:'PATCH',body:JSON.stringify(values)}))[0]);
  }
  return json({error:'Not found'},404);
 }catch{return json({error:'The database could not complete this request. Please try again.'},502);}
}
