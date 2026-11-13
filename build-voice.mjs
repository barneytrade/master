import {build} from 'esbuild';
await build({entryPoints:['browser/voice.js'],outfile:'public/voice.js',bundle:true,minify:true,format:'iife',platform:'browser',target:['es2022'],legalComments:'linked'});
console.log('Built the browser voice demo.');
