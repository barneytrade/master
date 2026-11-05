const names=['name','services','coverage','hours'];
const decode=s=>String(s||'').replace(/&#(x[\da-f]+|\d+);/gi,(_,n)=>{const c=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):+n;return c>0&&c<=0x10ffff?String.fromCodePoint(c):'';}).replace(/&(amp|quot|apos|lt|gt|nbsp);/g,(_,n)=>({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' '})[n]);
const text=s=>decode(String(s||'').replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
const list=v=>Array.isArray(v)?v:v==null?[]:[v];
const label=v=>typeof v==='string'?v:v?.name||'';
export function validateUrl(input){
 if(typeof input!=='string'||input.length>2000)throw Error('Enter a public business website URL.');
 let u;try{u=new URL(/^[a-z][a-z\d+.-]*:/i.test(input.trim())?input.trim():'https://'+input.trim());}catch{throw Error('Enter a valid website URL.');}
 const h=u.hostname.toLowerCase();
 if(!['https:','http:'].includes(u.protocol)||u.username||u.password||u.port||!h.includes('.')||/^[\d.]+$/.test(h)||h.includes(':')||/(^|\.)(localhost|local|internal|lan|home|test|invalid|example)$/.test(h)||! /^[a-z\d](?:[a-z\d.-]*[a-z\d])?$/.test(h))throw Error('Use a public website domain without a login or custom port.');
 u.hash='';return u;
}
export function extractPage(html,url){
 const fields=Object.fromEntries(names.map(k=>[k,{value:'',source:'',method:''}]));
 function add(k,v,method){v=text(v);if(v&&!fields[k].value)fields[k]={value:v.slice(0,500),source:url,method};}
 const nodes=[];function walk(x,depth=0){if(depth>15||!x||typeof x!=='object')return;if(Array.isArray(x)){x.forEach(v=>walk(v,depth+1));return;}nodes.push(x);Object.values(x).forEach(v=>walk(v,depth+1));}
 for(const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi)){try{walk(JSON.parse(m[1]));}catch{}}
 const business=nodes.find(x=>list(x['@type']).some(t=>/^(LocalBusiness|Plumber|Electrician|HVACBusiness|HomeAndConstructionBusiness|GeneralContractor|ProfessionalService|Organization|Corporation|RoofingContractor|Locksmith|Store)$/.test(t)));
 if(business){
 add('name',business.name,'Business metadata');add('coverage',list(business.areaServed||business.serviceArea).map(label).filter(Boolean).join(', '),'Business metadata');
 const offers=list(business.hasOfferCatalog?.itemListElement||business.makesOffer).flatMap(x=>list(x.itemOffered||x.itemListElement||x)).map(x=>label(x.itemOffered||x)).filter(Boolean);add('services',offers.join(', '),'Business metadata');
 const hours=list(business.openingHours).join('; ')||list(business.openingHoursSpecification).map(x=>{const days=list(x.dayOfWeek).map(d=>String(d).split('/').pop()).join(', ');return days&&x.opens&&x.closes?`${days}: ${x.opens}–${x.closes}`:'';}).filter(Boolean).join('; ');add('hours',hours,'Business metadata');
 }
 const safe=html.replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
 const title=text(safe.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);add('name',title,'Page title — check the business name');
 const lines=safe.replace(/<(?:br\b[^>]*|\/(?:p|div|li|h[1-6]|section|tr))>/gi,'\n').split('\n').map(text).filter(x=>x.length>12&&x.length<=500);
 add('services',lines.filter(x=>/\b(we (?:offer|provide|specialise)|our services|(?:boiler|tap|drain|roof|heating|electrical|plumbing) (?:repair|installation|servic))\b/i.test(x)).slice(0,2).join(' '),'Website excerpt — review');
 add('coverage',lines.find(x=>/\b(we (?:cover|serve)|areas? (?:we cover|served)|covering|serving (?:the|all|across))\b/i.test(x)),'Website excerpt — review');
 add('hours',lines.find(x=>/\b(opening hours|business hours|monday\s*(?:to|[-–])\s*friday|mon\s*[-–]\s*fri)\b/i.test(x)&&/\d/.test(x)),'Website excerpt — review');
 const links=[];for(const m of safe.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){try{const u=new URL(decode(m[1]),url);if(u.hostname===new URL(url).hostname&&/contact|about|services|areas|opening/i.test(m[1]+' '+text(m[2]))&&!u.search){u.hash='';links.push(u.href);}}catch{}}
 return {fields,links:[...new Set(links)],excerpt:lines.slice(0,25).join('\n').slice(0,4000)};
}
function publicIP(ip){
 if(ip.includes(':'))return /^[23][0-9a-f]{3}:/i.test(ip)&&!/^2001:(?:0*0:|db8:)/i.test(ip);
 if(!/^\d+\.\d+\.\d+\.\d+$/.test(ip))return false;const [a,b]=ip.split('.').map(Number);return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&[0,168].includes(b)||a===100&&b>=64&&b<=127||a===198&&[18,19,51].includes(b)||a===203&&b===0);
}
async function resolvePublic(host){
 const results=await Promise.all(['A','AAAA'].map(async type=>{const r=await fetch('https://cloudflare-dns.com/dns-query?name='+encodeURIComponent(host)+'&type='+type,{headers:{accept:'application/dns-json'},signal:AbortSignal.timeout(4000)});if(!r.ok)throw Error('Could not verify the website address.');return r.json();}));
 const addresses=results.flatMap(x=>(x.Answer||[]).filter(a=>[1,28].includes(a.type)).map(a=>a.data));return addresses.length>0&&addresses.every(publicIP);
}
export async function scanWebsite(input,{fetcher=fetch,resolve=resolvePublic}={}){
 const start=validateUrl(input),pages=[],warnings=[];const began=Date.now();
 async function read(address){let u=validateUrl(address);for(let i=0;i<4;i++){
 if(Date.now()-began>23000)throw Error('The website took too long to respond. Try a specific Services or Contact page.');
 if(!await resolve(u.hostname))throw Error('Only websites with public internet addresses can be read.');
 const r=await fetcher(u.href,{redirect:'manual',headers:{accept:'text/html','user-agent':'TradeRelayPoC/1.0 (business website preview)'},signal:AbortSignal.timeout(7000)});
 if([301,302,303,307,308].includes(r.status)){const target=r.headers.get('location');if(!target)throw Error('Invalid website redirect.');u=validateUrl(new URL(target,u).href);continue;}
 if(!r.ok)throw Error('The website could not be read (HTTP '+r.status+'). You can enter details manually.');
 if(!/text\/html|application\/xhtml\+xml/i.test(r.headers.get('content-type')||''))throw Error('This URL is not an HTML webpage.');
 const reader=r.body.getReader();let size=0,html='',decoder=new TextDecoder();try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1000000)throw Error('This page is too large to read. Try its Contact page.');html+=decoder.decode(value,{stream:true});}html+=decoder.decode();}finally{await reader.cancel().catch(()=>{});}
 return {url:u.href,...extractPage(html,u.href)};
 }throw Error('The website redirects too many times.');}
 const first=await read(start.href);pages.push(first);
 for(const link of first.links.filter(x=>x!==first.url).slice(0,2)){try{pages.push(await read(link));}catch(e){warnings.push(e.message);}}
 const fields=Object.fromEntries(names.map(k=>[k,pages.map(p=>p.fields[k]).find(x=>x.value)||first.fields[k]]));
 return {url:first.url,fields,pages:pages.map(p=>({url:p.url,excerpt:p.excerpt})),warnings,scanned_at:new Date().toISOString()};
}
