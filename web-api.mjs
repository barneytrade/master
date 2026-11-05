import {scanWebsite} from './extract.mjs';

const headers={'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
const unavailable=()=>Response.json({error:'Connection unavailable. Please try again.'},{status:502,headers});

// Visitor authentication is enforced by Vercel Deployment Protection on every route.
// Keep the entire deployment protected, including production domains and API paths.
export async function handleWebApi(req,env,fetcher=fetch){
 const url=new URL(req.url);
 if(!env.TRADERELAY_API_TOKEN)return Response.json({error:'The backend is not configured.'},{status:503,headers});
 if(!['GET','POST','PATCH'].includes(req.method))return new Response('Method not allowed',{status:405,headers});
 if(req.method!=='GET'&&req.headers.get('origin')!==url.origin)return new Response('Origin rejected',{status:403,headers});
 if(url.pathname==='/api/extract'&&req.method==='POST'){
  try{
   const raw=await req.text();if(raw.length>3000)return Response.json({error:'URL too long.'},{status:413,headers});
   return Response.json(await scanWebsite(JSON.parse(raw).url),{headers});
  }catch(e){return Response.json({error:e.message||'Unable to read this website.'},{status:400,headers});}
 }
 if(!/^\/api\/(state|company|leads(?:\/[a-f0-9-]{36})?)$/.test(url.pathname))return new Response('Not found',{status:404,headers});
 const body=req.method==='GET'?undefined:await req.text();
 if(body&&body.length>10000)return new Response('Too large',{status:413,headers});
 try{
  const upstream=await fetcher('https://rambgrzqcmbkjetcytfy.supabase.co/functions/v1/traderelay'+url.pathname.slice(4),{
   method:req.method,headers:{authorization:'Bearer '+env.TRADERELAY_API_TOKEN,'content-type':'application/json'},body,signal:AbortSignal.timeout(30000)
  });
  if(!(upstream.headers.get('content-type')||'').includes('application/json'))return unavailable();
  return Response.json(await upstream.json(),{status:upstream.status,headers});
 }catch{return unavailable();}
}
