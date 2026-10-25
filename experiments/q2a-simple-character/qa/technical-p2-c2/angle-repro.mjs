import fs from 'node:fs';
import {Motion} from '../../snapshots/p2_candidate_c2/runtime/motion.js';
import {bind,setMeasuredBind} from '../../snapshots/p2_candidate_c2/runtime/pose.js';
setMeasuredBind(JSON.parse(fs.readFileSync(new URL('../../snapshots/p2_candidate_c2/runtime/art-binding.json',import.meta.url))).rig);
let best={angle:0};
for(let frames=12;frames<=600;frames+=7){const m=new Motion();m.command('walk');for(let j=0;j<frames;j++)m.tick(1/120);m.command('low');for(let j=0;j<300;j++){m.tick(1/120);const p=m.pose();for(const side of ['near','far']){const c=p[side],b=bind[side];let a=Math.atan2(c.knee[1]-c.ankle[1],c.knee[0]-c.ankle[0])-Math.atan2(b.knee[1]-b.ankle[1],b.knee[0]-b.ankle[0])-c.footAngle;a=Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))*180/Math.PI;if(a>best.angle)best={angle:a,walkFrames:frames,afterLowFrames:j+1,side,support:m.s.feet[side].support,q:m.s.q,state:m.save()}}}}
best.dorsiflexFromVertical=best.angle+Math.atan2(bind[best.side].knee[0]-bind[best.side].ankle[0],bind[best.side].ankle[1]-bind[best.side].knee[1])*180/Math.PI;
fs.writeFileSync(new URL('angle-repro.json',import.meta.url),JSON.stringify(best,null,2));console.log(JSON.stringify(best,null,2));
let contactBest={angle:0};
for(let frames=12;frames<=600;frames+=7){const m=new Motion();m.command('walk');for(let j=0;j<frames;j++)m.tick(1/120);m.command('jump');for(let j=0;j<210;j++){m.tick(1/120);const p=m.pose();for(const side of ['near','far'])if(m.s.contacts[side]){const c=p[side];const angle=Math.atan2(c.knee[0]-c.ankle[0],c.ankle[1]-c.knee[1])*180/Math.PI-c.footAngle*180/Math.PI;if(angle>contactBest.angle)contactBest={angle,walkFrames:frames,afterJumpFrames:j+1,side,support:m.s.feet[side].support,stage:m.s.stage,state:m.save()}}}}
fs.writeFileSync(new URL('contact-angle-repro.json',import.meta.url),JSON.stringify(contactBest,null,2));console.log('CONTACT',JSON.stringify(contactBest,null,2));
