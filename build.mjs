import fs from 'node:fs';
fs.mkdirSync('dist/server',{recursive:true});
const assets={};
for(const name of ['index.html','app.js','style.css','marketing.html']){assets['/'+name]={body:fs.readFileSync('public/'+name,'utf8'),type:name.endsWith('.html')?'text/html; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8'};}
fs.writeFileSync('dist/server/assets.mjs','export const assets='+JSON.stringify(assets)+';');
fs.copyFileSync('worker.mjs','dist/server/index.js');
console.log('Built TradeRelay website and server.');

fs.copyFileSync('extract.mjs','dist/server/extract.mjs');
