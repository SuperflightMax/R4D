// Post-run static evidence only. Reads saved arrays; no solver, motion or art edits.
import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';import{createRequire}from'node:module';
const h=path.dirname(fileURLToPath(import.meta.url)),read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const result=read(path.join(h,'R2_RESULT.json')),w=result.failure.witness;
const rest=read(path.join(h,'../early-v04-r1/CAGE_REST.json')),summary=read(path.join(h,'R2_WITNESS_SUMMARY.json'));
const ids=w.indices,colors={pelvis:'#286ea8',nearThigh:'#b43b38',farThigh:'#a16b12'};
const a=['<svg xmlns="http://www.w3.org/2000/svg" width="1240" height="850"><rect width="1240" height="850" fill="#f6f5f1"/><g font-family="Arial" fill="#27313b"><text x="20" y="30" font-size="22">R2 exact saved states: positive orientation, distortion gate FAIL</text>'];
const states=[['Frozen source rest',rest.vertices,'min singular = 1'],['Last accepted homotopy',w.lastAcceptedVertices,`min singular = ${summary.lastAcceptedMetrics.minSingularValue.toPrecision(15)}`],['Rejected candidate',w.vertices,`min singular = ${w.metrics.minSingularValue.toPrecision(15)} &lt; 0.30`]];
states.forEach(([title,Y,label],col)=>{
 const ox=20+col*410,P=p=>[ox+p[0]-330,100+p[1]-580];
 a.push(`<text x="${ox}" y="70" font-size="18">${title}</text>`);
 const b=Y.slice(0,rest.semanticTrace.boundary.length).map(P);
 a.push(`<polygon points="${b.map(p=>p.join(',')).join(' ')}" fill="#d7ccd8" stroke="#5b5360"/>`);
 for(const[k,o]of Object.entries(rest.constraints)){const[x,y]=P(Y[k]);a.push(`<circle cx="${x}" cy="${y}" r="3" fill="${colors[o]}"/>`);}
 const points=ids.map(i=>P(Y[i]));a.push(`<polygon points="${points.map(p=>p.join(',')).join(' ')}" fill="#e52b39" stroke="#a00000" stroke-width="2"/>`);
 a.push(`<text x="${ox}" y="455" font-size="14">${label}</text>`);
});
a.push('<text x="20" y="490" font-size="16">Witness triangle923: vertices221/611/344 all free; three source alpha253 pixels. No inversion claimed.</text>');
const L=75,R=1190,top=540,bottom=745,maxDrop=25.0,
 P=(drop,sigma)=>[L+(R-L)*drop/maxDrop,bottom-(bottom-top)*(sigma-.25)/.8];
const thresholdY=P(0,.3)[1];
a.push(`<line x1="${L}" y1="${bottom}" x2="${R}" y2="${bottom}" stroke="#59636e"/><line x1="${L}" y1="${top}" x2="${L}" y2="${bottom}" stroke="#59636e"/><line x1="${L}" y1="${thresholdY}" x2="${R}" y2="${thresholdY}" stroke="#b00020" stroke-dasharray="5 5"/>`);
for(const sigma of[.3,.5,.75,1]){const y=P(0,sigma)[1];a.push(`<text x="20" y="${y+5}" font-size="13">${sigma}</text>`);}
const pts=result.outputs.map(o=>P(o.low*230,o.minSingularValue));
a.push(`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#216e9d" stroke-width="3"/>`);
for(const [drop,sigma,color]of[[summary.lastAcceptedEquivalentDrop,summary.lastAcceptedMetrics.minSingularValue,'#20814c'],[summary.rejectedEquivalentDrop,w.metrics.minSingularValue,'#b00020']]){
 const[x,y]=P(drop,sigma);a.push(`<circle cx="${x}" cy="${y}" r="5" fill="${color}"/>`);
}
a.push(`<text x="${L}" y="${top-15}" font-size="16">Minimum singular value vs drop: 26 completed outputs low0..25 + partial numerical homotopy</text><text x="${R-220}" y="${thresholdY-12}" font-size="14" fill="#b00020">Frozen threshold 0.30</text><text x="${L}" y="${bottom+25}" font-size="14">0 raw px</text><text x="${R-80}" y="${bottom+25}" font-size="14">25 raw px</text>`);
a.push(`<text x="20" y="805" font-size="16">STOP at output26: lambda ${w.lastAcceptedHomotopyFraction} to ${w.meta.homotopyTo}; MINIMUM_HOMOTOPY_STEP.</text><text x="20" y="832" font-size="15">Full drop230 NOT reached. Static numerical witness, not an artistic after or a global infeasibility proof.</text></g></svg>`);
const svg=a.join('');fs.writeFileSync(path.join(h,'R2_WITNESS.svg'),svg);
const require=createRequire(import.meta.url),sharp=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
await sharp(Buffer.from(svg)).png().toFile(path.join(h,'R2_WITNESS.png'));
