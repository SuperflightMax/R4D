import fs from'node:fs';
import path from'node:path';
import{fileURLToPath}from'node:url';
import{createRequire}from'node:module';
import{poseAt,length,sub,rigidPoint}from'../../app/early-v04-r1/kinematics.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const g=JSON.parse(fs.readFileSync(path.join(here,'SOURCE_GEOMETRY.json'),'utf8'));
const rows=[];
for(let i=0;i<=120;i++){
 const s=poseAt(g,i/120,0),row={low:i/120,pelvis:s.pose.pelvis,sides:{}};
 for(const side of['near','far']){
  const H=s.pose[side+'Hip'],K=s.pose[side+'Knee'],A=s.pose[side+'Ankle'];
  const a=length(sub(H,K)),b=length(sub(A,K)),d=length(sub(A,H));
  const internal=Math.acos(Math.max(-1,Math.min(1,(a*a+b*b-d*d)/(2*a*b))))*180/Math.PI;
  const shoe=s.transforms[side+'Shoe'];
  const support=g.soles[side].denseLowerContour.map(q=>rigidPoint(q,shoe.sourceAnchor,shoe.targetAnchor,shoe.angle)[1]);
  row.sides[side]={hip:H,knee:K,ankle:A,thigh:a,shin:b,kneeInternalDegrees:internal,
   thighAngleDegrees:Math.atan2(K[1]-H[1],K[0]-H[0])*180/Math.PI,
   maxLengthError:Math.max(Math.abs(a-g.lengths[side].thigh),Math.abs(b-g.lengths[side].shin)),
   denseSupportError:Math.abs(Math.max(...support)-g.floor),belowFloorPx:Math.max(0,Math.max(...support)-g.floor),
   rotationsOnly:true,allRigidDeterminants:1};
 }
 rows.push(row);
}
const out={scope:'v04 R1 skeleton/full-chain feasibility only; not art or cage PASS',
 geometryFrozenBeforeCheck:true,frames:rows.length,neutral:rows[0],deepLow:rows.at(-1),
 maxLengthError:Math.max(...rows.flatMap(r=>Object.values(r.sides).map(v=>v.maxLengthError))),
 maxSupportError:Math.max(...rows.flatMap(r=>Object.values(r.sides).map(v=>v.denseSupportError))),
 pelvisDrop:rows.at(-1).pelvis[1]-rows[0].pelvis[1],rows};
fs.writeFileSync(path.join(here,'GEOMETRY_FEASIBILITY.json'),JSON.stringify(out,null,2)+'\n');
const colors={near:'#166a91',far:'#b14e32'};
function diagram(row,x){
 const scale=.48,offX=x,offY=42,P=p=>[offX+p[0]*scale,offY+p[1]*scale];
 let s=`<line x1="${x+50}" y1="${offY+g.floor*scale}" x2="${x+465}" y2="${offY+g.floor*scale}" stroke="#777"/>`;
 for(const side of['near','far']){
  const v=row.sides[side],pts=[v.hip,v.knee,v.ankle].map(P);
  s+=`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${colors[side]}" stroke-width="7"/>`;
  for(const p of pts)s+=`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${colors[side]}"/>`;
  const t=poseAt(g,row.low,0).transforms[side+'Shoe'];
  const c=g.soles[side].denseLowerContour.map(p=>P(rigidPoint(p,t.sourceAnchor,t.targetAnchor,0)));
  s+=`<polyline points="${c.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${colors[side]}" stroke-width="2"/>`;
 }
 const h=P(row.pelvis);s+=`<text x="${h[0]+12}" y="${h[1]}" font-size="14">pelvis ${row.pelvis.map(v=>v.toFixed(0)).join(',')}</text>`;
 return s;
}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="820"><rect width="1080" height="820" fill="#f5f5f2"/><g font-family="Arial" fill="#25313c"><text x="30" y="28" font-size="20">V04 R1: full-chain feasibility; art / cage not tested</text><text x="140" y="65" font-size="18">Level neutral</text><text x="650" y="65" font-size="18">Deep low: drop230 / back110</text>${diagram(rows[0],0)}${diagram(rows.at(-1),530)}<text x="40" y="790" font-size="16">Blue near / orange far; source dense alpha lower contours. Constant thigh/shin lengths. No shoe offset.</text></g></svg>`;
fs.writeFileSync(path.join(here,'GEOMETRY_FEASIBILITY.svg'),svg);
const require=createRequire(import.meta.url);
const sharp=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
await sharp(Buffer.from(svg)).png().toFile(path.join(here,'GEOMETRY_FEASIBILITY.png'));
console.log(JSON.stringify({...out,rows:undefined},null,2));
