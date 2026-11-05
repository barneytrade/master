import {scanWebsite} from './extract.mjs';
import {assets} from './assets.mjs';
export default {async fetch(req,env){
 const url=new URL(req.url);
 const headers={'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
 if(url.pathname.startsWith('/api/')){
  if(!env.TRADERELAY_API_TOKEN)return Response.json({error:'The backend is not configured.'},{status:503,headers});
  if(!['GET','POST','PATCH'].includes(req.method))return new Response('Method not allowed',{status:405,headers});
  if(req.method!=='GET'&&req.headers.get('origin')!==url.origin)return new Response('Origin rejected',{status:403,headers});
  if(url.pathname==='/api/extract'&&req.method==='POST'){try{const raw=await req.text();if(raw.length>3000)return Response.json({error:'URL too long.'},{status:413,headers});const data=JSON.parse(raw);return Response.json(await scanWebsite(data.url),{headers});}catch(e){return Response.json({error:e.message||'Unable to read this website.'},{status:400,headers});}}
  if(!/^\/api\/(state|company|leads(?:\/[a-f0-9-]{36})?)$/.test(url.pathname))return new Response('Not found',{status:404,headers});
  const body=req.method==='GET'?undefined:await req.text();if(body&&body.length>10000)return new Response('Too large',{status:413,headers});
  try{
   const upstream=await fetch('https://rambgrzqcmbkjetcytfy.supabase.co/functions/v1/traderelay'+url.pathname.slice(4),{method:req.method,headers:{'authorization':'Bearer '+env.TRADERELAY_API_TOKEN,'content-type':'application/json'},body});
   return new Response(await upstream.text(),{status:upstream.status,headers:{...headers,'content-type':'application/json'}});
  }catch{return Response.json({error:'Connection unavailable. Please try again.'},{status:502,headers});}
 }
 const path=url.pathname==='/'?'/index.html':url.pathname;
 const asset=assets[path];if(!asset)return new Response('Not found',{status:404,headers});
 return new Response(asset.body,{headers:{...headers,'content-type':asset.type,'content-security-policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'self'"}});
}};
