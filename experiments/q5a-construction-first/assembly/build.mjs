import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'dist'),pins=JSON.parse(fs.readFileSync(path.join(root,'assembly/assets/inputs.json')));
for(let [p,h] of Object.entries(pins.inputs)){if(createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')!==h)throw Error('Input hash mismatch '+p);}
const verify=(file,sha)=>{if(createHash('sha256').update(fs.readFileSync(path.join(root,'assembly/assets',file))).digest('hex')!==sha)throw Error('Derived asset hash mismatch '+file);};
verify('rig-data.json',pins.rig_sha256);for(let texture of pins.textures){verify(texture.rgb,texture.derived_sha256);if(texture.alpha)verify(texture.alpha,texture.alpha_sha256);}
fs.mkdirSync(path.join(out,'assembly'),{recursive:true});fs.copyFileSync(path.join(root,'index.html'),path.join(out,'index.html'));
for(let p of ['app.js','rig.js','motion.js','renderer.js','framing.js','style.css'])fs.copyFileSync(path.join(root,'assembly',p),path.join(out,'assembly',p));
fs.cpSync(path.join(root,'assembly/assets'),path.join(out,'assembly/assets'),{recursive:true});
console.log('BUILD PASS: self-contained dist/, relative assets, route /review/r4d/q5a-construction-first/');
