import {defineConfig} from 'vite';
import {cpSync} from 'node:fs';
export default defineConfig(({command})=>({
 base:'./',publicDir:command==='serve'?'assets':false,
 server:{port:4181,strictPort:true},preview:{port:4181,strictPort:true},
 plugins:[{name:'poc-assets',closeBundle(){
  cpSync('assets/manifest.json','dist/manifest.json');
  cpSync('assets/parts','dist/parts',{recursive:true});
  cpSync('public/baseline','dist/baseline',{recursive:true});
 }}]
}));
