import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';import{createRequire}from'node:module';
const h=path.dirname(fileURLToPath(import.meta.url)),read=n=>JSON.parse(fs.readFileSync(path.join(h,n),'utf8'));
const r=read('CAGE_REST.json'),s=read('CAGE_SOLVE.json'),f=read('CAGE_FAILURE.json'),last=s.frames.at(-1),ids=f.triangleIndices;
const colors={pelvis:'#286ea8',nearThigh:'#b43b38',farThigh:'#a16b12'};
const a=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="810"><rect width="1200" height="810" fill="#f6f5f1"/><g font-family="Arial" fill="#27313b"><text x="20" y="30" font-size="22">V04 R1: stable actual trace44, constrained ARAP solver STOP</text>'];
const sets=[['Source rest',r.vertices,`rest area ${f.sourceSignedArea.toFixed(7)}`],[`Last positive ${last.label}`,last.vertices,`low=${last.low.toFixed(6)}; min ratio=${last.minAreaRatio.toFixed(7)}`],[`Failed harmonic ${f.frame}`,f.failedInitialVertices,`low=${f.low.toFixed(6)}; ratio=${f.minAreaRatio.toFixed(8)}`]];
sets.forEach(([title,Y,label],col)=>{
 const ox=20+col*400,P=p=>[ox+p[0]-330,100+p[1]-580];
 a.push(`<text x="${ox}" y="70" font-size="18">${title}</text>`);
 const b=Y.slice(0,r.semanticTrace.boundary.length).map(P);a.push(`<polygon points="${b.map(p=>p.join(',')).join(' ')}" fill="#d7ccd8" stroke="#5b5360"/>`);
 for(const[k,o]of Object.entries(r.constraints)){const[x,y]=P(Y[k]);a.push(`<circle cx="${x}" cy="${y}" r="3" fill="${colors[o]}"/>`);}
 a.push(`<polygon points="${ids.map(i=>P(Y[i]).join(',')).join(' ')}" fill="#e52b39" stroke="#a00000" stroke-width="2"/>`);
 a.push(`<text x="${ox}" y="480" font-size="14">${label}</text>`);
 const points=ids.map(i=>Y[i]),center=[0,1].map(k=>points.reduce((v,p)=>v+p[k],0)/3);
 const zoom=points.map(p=>[ox+175+(p[0]-center[0])*14,610+(p[1]-center[1])*48]);
 a.push(`<polygon points="${zoom.map(p=>p.join(',')).join(' ')}" fill="#f0a0a0" stroke="#a00000" stroke-width="2"/>`);
 zoom.forEach(([x,y],i)=>a.push(`<text x="${x+4}" y="${y-5}" font-size="12">${ids[i]} free</text>`));
});
a.push(`<text x="20" y="750" font-size="16">Full drop230 NOT reached; stop at drop${f.pelvisDropAtFailure.toFixed(5)}. Witness has 3 dense alpha253 source pixels.</text><text x="20" y="780" font-size="14">Blue pelvis / red near cuff / ochre far cuff. Bottom triangle plot magnification x14 / y48, geometry only.</text></g></svg>`);
const svg=a.join('');fs.writeFileSync(path.join(h,'CAGE_FAILURE.svg'),svg);
const require=createRequire(import.meta.url),sharp=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
await sharp(Buffer.from(svg)).png().toFile(path.join(h,'CAGE_FAILURE.png'));
