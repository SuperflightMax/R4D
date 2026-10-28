import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PlaybackClock, PLAYBACK_RATES, mergeObservation } from '../src/playback-clock.mjs';
import { Controller } from '../src/controller.mjs';
import { root, pins, canonicalLF, sha256 } from './pins.mjs';
import { scanBrowserText } from './scan-browser-text.mjs';

const arg = key => { const i=process.argv.indexOf(key); assert.ok(i>=0&&process.argv[i+1],`Required ${key}`); return path.resolve(process.argv[i+1]); };
const output=arg('--output'), coreBundle=arg('--core-bundle');
assert.ok(output.replaceAll('\\','/').toLowerCase().startsWith('e:/r4d/perspective/p2-runtime/'));
assert.ok(!existsSync(output),'Evidence directory must be new');
const compiledCoreSha256=sha256(readFileSync(coreBundle));
assert.equal(compiledCoreSha256,'dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7');
const configBytes=readFileSync(path.join(root,'inputs/config.json'));
assert.equal(sha256(canonicalLF(configBytes)),pins.configSha256);
const config=JSON.parse(configBytes);
assert.equal(config.defaults.tickMs,5);
const core=await import(pathToFileURL(coreBundle).href);
const checks=[], runs=[];
const check=(name,fn)=>{ fn(); checks.push(name); };
const prime=clock=>assert.equal(clock.consume(100,10000),0,'First delta must be discarded');

// No source clock operation may consult ambient randomness. The explicit-seed real
// core runs below are checked under the same traps, as well as by frame/event equality.
const mathDescriptor=Object.getOwnPropertyDescriptor(Math,'random');
const cryptoDescriptor=Object.getOwnPropertyDescriptor(globalThis,'crypto');
let ambientRandomAccesses=0;
const forbiddenRandom=()=>{ ambientRandomAccesses++; throw new Error('Unexpected ambient RNG access'); };
Object.defineProperty(Math,'random',{...mathDescriptor,value:forbiddenRandom});
const cryptoTrapInstalled=!!cryptoDescriptor?.configurable;
if(cryptoTrapInstalled) Object.defineProperty(globalThis,'crypto',{configurable:true,get:forbiddenRandom});
try {
  check('Fractional carry produces one tick from two sub-tick frames',()=>{
    const c=new PlaybackClock(5);prime(c);
    assert.equal(c.consume(10,100),0);assert.equal(c.snapshot().remainderSimMs,2.5);
    assert.equal(c.consume(10,100),1);assert.equal(c.snapshot().remainderSimMs,0);
  });
  check('Rate change preserves prior fractional credit without advancing',()=>{
    const c=new PlaybackClock(5);prime(c);c.consume(10,100);
    c.setRate(0.5);assert.equal(c.snapshot().remainderSimMs,2.5);
    assert.equal(c.consume(5,100),1);assert.equal(c.snapshot().remainderSimMs,0);
  });
  check('Closed-form rational time agrees across frame partitions at all rates',()=>{
    const parts=[1,7,2,13,3,29,11,17,13]; // Sum96ms, independent of frame partition.
    for(const rate of PLAYBACK_RATES){
      const a=new PlaybackClock(5,rate), b=new PlaybackClock(5,rate);prime(a);prime(b);
      const ticks=parts.reduce((n,dt)=>n+a.consume(dt,10000),0);
      const expected=Math.floor(96*(rate*4)/20);
      assert.equal(ticks,expected);assert.equal(b.consume(96,10000),expected);
      assert.equal(a.snapshot().remainderSimMs,(96*(rate*4)%20)/4);
      assert.equal(a.snapshot().remainderSimMs,b.snapshot().remainderSimMs);
    }
  });
  check('Pause/reset and hidden/visible discard debt and the first resumed delta',()=>{
    const c=new PlaybackClock(5);prime(c);c.consume(10,100);c.reset();
    assert.equal(c.snapshot().remainderSimMs,0);assert.equal(c.consume(100,100),0);
    assert.equal(c.consume(20,100),1);
    c.consume(10,100);c.setSuspended(true);
    assert.equal(c.consume(1000,100),0);assert.equal(c.snapshot().remainderSimMs,0);
    c.setRate(0.5);c.setSuspended(false);
    assert.equal(c.consume(100,100),0);assert.equal(c.consume(10,100),1);
  });
  check('Remaining-tick/end clamp discards unused terminal budget',()=>{
    const c=new PlaybackClock(5,1);prime(c);
    assert.equal(c.consume(100,3),3);assert.equal(c.snapshot().remainderSimMs,0);
    assert.equal(c.consume(100,0),0);assert.equal(c.consume(100,100),0);
    assert.equal(c.consume(5,100),1);
  });
  check('Invalid rates/deltas/counts cannot corrupt presentation state',()=>{
    const c=new PlaybackClock(5);const before=c.snapshot();
    for(const rate of [0,0.3,2,NaN,Infinity,'0.25']) assert.throws(()=>c.setRate(rate),RangeError);
    for(const dt of [-1,NaN,Infinity]) assert.throws(()=>c.consume(dt,100),RangeError);
    for(const n of [-1,0.5,Infinity,Number.MAX_SAFE_INTEGER+1]) assert.throws(()=>c.consume(5,n),RangeError);
    for(const ms of [0,-1,NaN,Infinity]) assert.throws(()=>new PlaybackClock(ms),RangeError);
    assert.deepEqual(c.snapshot(),before);
  });
  check('Rewind keeps the later physical checkpoint and latest full rate history',()=>{
    const previous={id:'run1',tick:200,state:{tick:200},config:{fixed:5},inspectedTicks:[0,200],presentation:{atTick:200,history:[{sequence:1,rate:0.25}]}};
    const item={id:'run1',tick:94,state:{tick:94},config:{fixed:5},presentation:{atTick:94,history:[{sequence:1,rate:0.25},{sequence:2,rate:1,reason:'rate-change'}]}};
    const original=structuredClone(previous), merged=mergeObservation(previous,item);
    assert.equal(merged.tick,200);assert.deepEqual(merged.state,{tick:200});
    assert.equal(merged.presentation.atTick,94);assert.deepEqual(merged.presentation.history.map(x=>x.rate),[0.25,1]);
    assert.deepEqual(merged.inspectedTicks,[0,200,94]);assert.deepEqual(previous,original);
  });

  // One256-tick reference and four128-tick clock-driven prefixes. This targets
  // presentation scheduling across the first real collision, not the old full-run matrix.
  const seed=1, targetTick=128;
  const reference=new Controller(core,config,{},seed);reference.advance(256);
  assert.ok(reference.contacts.some(e=>e.objectId==='leaf-01'&&e.observedAtTick===95));
  const referenceEvents=t=>reference.events.filter(e=>e.observedAtTick===undefined||e.observedAtTick<=t);
  const deltas=[7,13,19,3,23,11];
  for(const initialRate of [...PLAYBACK_RATES,'mixed']){
    const sim=new Controller(core,config,{},seed);
    let scheduledRate=initialRate==='mixed'?0.25:initialRate;
    const clock=new PlaybackClock(5,scheduledRate);prime(clock);
    let creditQuarterMs=0, frame=0;
    const samples=[];
    while(sim.state.tick<targetTick){
      assert.ok(frame<1000,'Clock failed to make progress');
      if(initialRate==='mixed'){
        const next={7:1,13:0.5,21:0.25}[frame];
        if(next!==undefined){scheduledRate=next;const before=sim.snapshot();clock.setRate(next);assert.deepEqual(sim.snapshot(),before);}
      }
      const dt=deltas[frame%deltas.length];
      // Independent integer-credit oracle, no per-frame floor/remainder algorithm.
      creditQuarterMs+=dt*(scheduledRate*4);
      const expectedTick=Math.min(targetTick,Math.floor(creditQuarterMs/20));
      const count=clock.consume(dt,targetTick-sim.state.tick);sim.advance(count);
      assert.equal(sim.state.tick,expectedTick,'Clock schedule disagrees with exact rational credit');
      assert.deepEqual(sim.snapshot(),reference.frames[expectedTick]);
      assert.deepEqual(sim.events,referenceEvents(expectedTick));
      samples.push({frame,deltaMs:dt,rate:scheduledRate,physicalTick:sim.state.tick,remainderSimMs:clock.snapshot().remainderSimMs});
      frame++;
    }
    assert.deepEqual(sim.frames,reference.frames.slice(0,targetTick+1));
    runs.push({seed,rate:initialRate,targetTick,frames:frame,trajectoryPrefixSha256:sha256(Buffer.from(JSON.stringify(sim.frames))),events:structuredClone(sim.events),samples});
  }
  checks.push('One explicit-seed real-core prefix matches exact integer-credit oracle, every physical frame and collision events across3 rates and rate changes');
  check('Native seek94/+1/+10/+100 and seek95 remain exact after clock resets',()=>{
    const sim=new Controller(core,config,{},seed), clock=new PlaybackClock(5);
    sim.seek(94);clock.reset();assert.deepEqual(sim.snapshot(),reference.frames[94]);
    for(const n of [1,10,100]){clock.reset();sim.advance(n);assert.deepEqual(sim.snapshot(),reference.frames[sim.state.tick]);}
    assert.equal(sim.state.tick,205);sim.seek(95);clock.reset();
    assert.deepEqual(sim.snapshot(),reference.frames[95]);
    assert.equal(clock.consume(100,sim.maxTicks-sim.state.tick),0);assert.equal(sim.state.tick,95);
  });
  assert.equal(ambientRandomAccesses,0);
} finally {
  Object.defineProperty(Math,'random',mathDescriptor);
  if(cryptoTrapInstalled) Object.defineProperty(globalThis,'crypto',cryptoDescriptor);
}
assert.ok(cryptoTrapInstalled,'Node24 crypto-access trap must be available for this check');
const helper=readFileSync(path.join(root,'src/playback-clock.mjs'));
assert.deepEqual(scanBrowserText('src/playback-clock.js',helper).violations,[]);
checks.push('New helper browser text passes the existing strict scanner; SDK exception implementation unchanged');
const baselineCommit='e7ed4d068f33ee6ecda491f15dc46a6fd548ef96';
for(const relative of ['src/controller.mjs','inputs/config.json','inputs/manifest.json','inputs/view-math.mjs','style.css']){
  const old=execFileSync('git',['show',`${baselineCommit}:experiments/p2-free-approach/builder/${relative}`],{cwd:root});
  assert.deepEqual(canonicalLF(readFileSync(path.join(root,relative))),canonicalLF(old),'Protected source changed: '+relative);
}
const sources=['src/playback-clock.mjs','src/main.mjs','index.html','scripts/build-static.mjs','scripts/check-static.mjs','scripts/check-playback.mjs'];
const sourceRecords=sources.map(relative=>({path:relative,canonicalLfSha256:sha256(canonicalLF(readFileSync(path.join(root,relative))))}));
const report={schema:'r4d.p2.playback-source-selfcheck.v1',status:'TARGETED_SOURCE_CHECKS_PASSED',checkedAtUtc:new Date().toISOString(),baselineCommit,compiledCoreSha256,configSha256:pins.configSha256,checks,ambientRandomAccesses,cryptoTrapInstalled,referenceTicks:256,clockDrivenPrefixTicks:128,sourceRecords,runs,browserExecuted:false,domOrWebGLPass:false,newBuildPerformed:false,limitations:['Main DOM/visibility listener wiring, UI interaction and browser download not executed','Real Android touch/scroll/size/scene not reproduced','Existing compiled03 core is a read-only test dependency, not a new candidate or new runtime artifact']};
mkdirSync(output,{recursive:false});
writeFileSync(path.join(output,'EVIDENCE.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,checks:checks.length,clockRuns:runs.map(({seed,rate,frames,targetTick})=>({seed,rate,frames,targetTick})),ambientRandomAccesses,browserExecuted:false,newBuildPerformed:false,evidenceBytes:readFileSync(path.join(output,'EVIDENCE.json')).length,evidenceSha256:sha256(readFileSync(path.join(output,'EVIDENCE.json')))}));
