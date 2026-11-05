import test from 'node:test';
import assert from 'node:assert/strict';
import {extractPage,validateUrl,scanWebsite} from '../extract.mjs';
test('extracts business facts with source URLs and leaves missing hours blank',()=>{
 const x=extractPage('<script type="application/ld+json">{"@type":"Plumber","name":"Example Plumbing","areaServed":[{"name":"Putney"}],"hasOfferCatalog":{"itemListElement":[{"itemOffered":{"name":"Tap repairs"}}]}}</script>','https://example.com/');
 assert.equal(x.fields.name.value,'Example Plumbing');assert.equal(x.fields.coverage.value,'Putney');assert.equal(x.fields.services.value,'Tap repairs');assert.equal(x.fields.hours.value,'');assert.equal(x.fields.name.source,'https://example.com/');
});
test('visible text supplies quoted candidates without inventing facts',()=>{
 const x=extractPage('<title>Example Plumbing</title><p>We provide boiler repairs and servicing.</p><p>We cover Putney and Wandsworth.</p><script>We cover Mars</script>','https://example.com');
 assert.match(x.fields.services.value,/boiler repairs/);assert.match(x.fields.coverage.value,/Putney/);assert.equal(x.fields.hours.value,'');
});
test('blocks local, IP, credential and non-web URLs',()=>{for(const s of ['http://localhost','http://127.1','http://[::1]','https://user:pass@example.com','file:///etc/passwd','https://x.local','https://example.com:8443'])assert.throws(()=>validateUrl(s));assert.equal(validateUrl('example.com').hostname,'example.com');});
test('redirect to private address is rejected before fetching it',async()=>{let count=0;await assert.rejects(scanWebsite('https://example.com',{resolve:async()=>true,fetcher:async()=>{count++;return new Response(null,{status:302,headers:{location:'http://127.0.0.1'}});}}));assert.equal(count,1);});
test('rejects a hostname resolving to a private address',async()=>{await assert.rejects(scanWebsite('https://example.com',{resolve:async()=>false,fetcher:async()=>{throw Error('must not fetch');}}),/public/);});
