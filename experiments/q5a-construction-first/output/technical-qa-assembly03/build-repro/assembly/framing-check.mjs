import assert from 'node:assert/strict';import fs from 'node:fs';
import {Motion} from './motion.js';import {framing} from './framing.js';
export const framingReport={checks:0,minMargins:{one:Infinity,two:Infinity},minRawScale:Infinity,maxRawScale:0,minCssScaleRatio:Infinity,witnesses:[],jumps:[]};
export function checkFraming(pose,motion){
 const one=framing(pose,motion.worldX,1),two=framing(pose,motion.worldX,2);
 assert.deepEqual(one.origin,[480,560]);assert.equal(one.scale,1);assert.equal(one.width,960);assert.equal(one.height,640);
 const minOne=Math.min(...Object.values(one.margins)),minTwo=Math.min(...Object.values(two.margins)),ratio=two.scale*one.width/two.width;
 assert(minOne>=-1e-7,`1x outside ${motion.tick} ${minOne}`);
 assert(minTwo>=24-1e-7,`2x outside margin ${motion.tick} ${minTwo}`);
 assert(ratio>1.1,`large view no longer larger ${ratio}`);
 framingReport.checks++;framingReport.minMargins.one=Math.min(framingReport.minMargins.one,minOne);framingReport.minMargins.two=Math.min(framingReport.minMargins.two,minTwo);framingReport.minRawScale=Math.min(framingReport.minRawScale,two.scale);framingReport.maxRawScale=Math.max(framingReport.maxRawScale,two.scale);framingReport.minCssScaleRatio=Math.min(framingReport.minCssScaleRatio,ratio);
 return two;
}
export function targetedFraming(rig){
 const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
 const record=(name,m,expected=null)=>{let pose=rig.solve(m.spec()),f=checkFraming(pose,m),error=0;if(expected)for(let [n,p] of Object.entries(expected))for(let i=0;i<2;i++)error=Math.max(error,Math.abs(p[i]-pose.landmarks[n][i]));if(expected)assert(error<1e-9,`${name} exact witness differs ${error}`);let legacyTop=Math.min(900,920+Math.max(0,f.bounds.maxY*2-880))-f.bounds.maxY*2;assert(legacyTop<0,'witness would not detect old clipping');framingReport.witnesses.push({name,tick:m.tick,phase:m.phase,elapsed:m.elapsed,landmarkError:expected?error:null,legacyTop,newMargins:f.margins,scale:f.scale,cssScaleRatio:f.scale*.75});};
 const step=(m,n)=>{for(let i=0;i<n;i++){m.step();checkFraming(rig.solve(m.spec()),m);}};
 for(let [start,label] of [[9,'desktop'],[10,'mobile']]){let m=new Motion();step(m,start);m.command('jump');step(m,117);let review=read(`../output/artist-motion-concept/repro-${label}.json`);for(let j=0;j<7;j++){if(j)step(m,1);if(m.tick===start+120)record(`CM1-${label}`,m,review.state.pose);}}
 const rows=read('../output/artist-motion-asset/step.json').rows;
 for(let origin of ['idle','low','walk']){let m=new Motion();m.command(origin);step(m,240);m.command('jump');step(m,12);m.command('walk');step(m,12);while(m.phase!=='push')step(m,2);m.command('low');step(m,12);while(m.phase!=='flight')step(m,2);m.command('idle');m.command('jump');step(m,45);for(let j=0;j<7;j++){if(j)step(m,1);if(j===3){let review=rows.find(r=>r.label===`J-${origin}-apex-x2-light`);assert.equal(m.tick,review.tick);record(`AM-A1-${origin}`,m,review.landmarks);}}}
 // The mobile evidence records tick/phase, not the complete prior realtime
 // motor history. Replay its exact paused command recipe and elapsed witness.
 {let m=new Motion();step(m,2714);m.command('jump');step(m,12);m.command('jump');while(m.phase!=='push')step(m,2);m.command('walk');m.command('jump');step(m,12);while(m.phase!=='flight')step(m,2);m.command('low');step(m,45);for(let j=0;j<7;j++){if(j)step(m,1);if(j===3){assert.equal(m.tick,2824);assert(Math.abs(m.elapsed-.40833333333333377)<1e-10);record('AM-A1-mobile-recipe',m);}}}
 for(let origin of ['idle','low','walk']){let m=new Motion();m.command(origin);step(m,240);m.command('jump');let phases=new Set(),count=0;do{step(m,1);phases.add(m.phase);count++;assert(count<600);}while(m.phase!=='ground');framingReport.jumps.push({origin,steps:count,phases:[...phases]});}
 return framingReport;
}
