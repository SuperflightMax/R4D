import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { root, sha256, canonicalLF } from './pins.mjs';

const baselineRef='08f9b9eaa6aa1063eb7fcd9cf373ddacf907725a';
const source=canonicalLF(readFileSync(path.join(root,'src/main.mjs'))).toString('utf8');
const old=execFileSync('git',['show',`${baselineRef}:experiments/p2-free-approach/builder/src/main.mjs`],{cwd:root,encoding:'utf8'});
const fn=(text,name,indent='  ')=>{
  const start=text.indexOf(`${indent}function ${name}(`);assert.ok(start>=0,name);
  const end=text.indexOf(`\n${indent}}`,start);assert.ok(end>start,name);
  return text.slice(start+indent.length,end+indent.length+2);
};
const checks=[];
const check=(name,action)=>{action();checks.push(name);};
const model=(fitSource,width=1118,height=554,zoom=2)=>{
  let w=width,h=height;const canvas={width:w,height:h};const resizes=[];let redraws=0;
  const physical=Object.freeze({tick:95,rngU32:1586005467,done:false});const before=JSON.stringify(physical);
  // Independent scroll-container model: 15px classic gutters consume client
  // space, but never alter the fixed border box. No renderer/browser/core runs.
  const clients=()=>{
    let vertical=false,horizontal=false;
    for(let n=0;n<4;n++){
      const cw=w-(vertical?15:0),ch=h-(horizontal?15:0);
      const nextV=canvas.height>ch,nextH=canvas.width>cw;
      if(nextV===vertical&&nextH===horizontal)break;
      vertical=nextV;horizontal=nextH;
    }
    return {width:w-(vertical?15:0),height:h-(horizontal?15:0)};
  };
  const stage={getBoundingClientRect:()=>({width:w+2,height:h+2}),get clientWidth(){return clients().width;},get clientHeight(){return clients().height;}};
  const select={value:String(zoom)};
  const scene={scale:{set(v){this.value=v;}},position:{set(x,y){this.value=[x,y];}}};
  const context=vm.createContext({stage,app:{canvas,renderer:{resize(x,y){assert.ok(Number.isInteger(x)&&Number.isInteger(y)&&x>0&&y>0);canvas.width=x;canvas.height=y;resizes.push([x,y]);}}},scene,
    getComputedStyle:()=>({borderLeftWidth:'1px',borderRightWidth:'1px',borderTopWidth:'1px',borderBottomWidth:'1px'}),$:()=>select,
    sim:{state:physical,advance(){throw new Error('Zoom advanced physical state');},seek(){throw new Error('Zoom sought physical state');},reset(){throw new Error('Zoom reset physical state');}},
    render(){redraws++;assert.equal(JSON.stringify(physical),before);}});
  const fit=vm.runInContext(`'use strict'; (${fitSource})`,context);
  return {fit,canvas,resizes,scene,get redraws(){return redraws;},select,physical,before,setViewport(x,y){w=x;h=y;}};
};

check('C04 negative control reproduces observed alternating paused buffer sizes',()=>{
  const c=model(fn(old,'fit'));for(let i=0;i<6;i++)c.fit();
  assert.deepEqual(c.resizes.slice(1,5),[[1103,1078],[1108,1108],[1103,1078],[1108,1108]]);
});
check('Desktop zoom200 settles despite classic scrollbar client-size feedback',()=>{
  const c=model(fn(source,'fit'));for(let i=0;i<8;i++)c.fit();
  assert.deepEqual(c.resizes,[[1118,1108]]);assert.equal(c.redraws,8);assert.equal(JSON.stringify(c.physical),c.before);
});
check('Zoom and viewport changes use exact expected buffers; repeat observer events do not resize',()=>{
  const c=model(fn(source,'fit'),1118,554,1);c.fit();assert.equal(c.resizes.length,0);assert.equal(c.redraws,1);
  for(const [zoom,expected] of [[1.5,[1118,831]],[2,[1118,1108]],[1,[1118,554]]]){
    c.select.value=String(zoom);c.fit();const count=c.resizes.length;for(let i=0;i<4;i++)c.fit();
    assert.deepEqual([c.canvas.width,c.canvas.height],expected);assert.equal(c.resizes.length,count);
  }
  c.select.value='2';c.setViewport(900,500);c.fit();const count=c.resizes.length;for(let i=0;i<4;i++)c.fit();
  assert.deepEqual([c.canvas.width,c.canvas.height],[1000,1000]);assert.equal(c.resizes.length,count);
});
check('Narrow border-box remains stable at all existing zoom values',()=>{
  const c=model(fn(source,'fit'),341,650,1);
  for(const [zoom,expected] of [[1,[341,650]],[1.5,[512,650]],[2,[682,682]]]){
    c.select.value=String(zoom);c.fit();const count=c.resizes.length;for(let i=0;i<5;i++)c.fit();
    assert.deepEqual([c.canvas.width,c.canvas.height],expected);assert.equal(c.resizes.length,count);
  }
});
check('Real zoom and ResizeObserver share fit/redraw; QA zoom has no second redraw',()=>{
  assert.ok(source.includes("new ResizeObserver(fit).observe(stage)"));assert.ok(source.includes("$('zoom').onchange = fit"));
  assert.ok(source.includes("setZoom: value => { $('zoom').value = String(value); fit(); }"));
  assert.ok(fn(source,'fit').includes('render();'));
});
const initial='Original replay download help';
const label={textContent:initial,classList:{error:false,toggle(name,value){assert.equal(name,'error');this.error=value;}}};
const context=vm.createContext({$:()=>label});
vm.runInContext(source.slice(source.indexOf('const initialSaveStatus'),source.indexOf('async function main()')),context);
const call=code=>vm.runInContext(code,context);
check('Completion hint clears on nonterminal render and reappears on another terminal render',()=>{
  call('syncCompletionHint(false)');assert.equal(label.textContent,initial);
  call('syncCompletionHint(true)');assert.match(label.textContent,/Запуск завершён/);
  call('syncCompletionHint(false)');assert.equal(label.textContent,initial);
  call('syncCompletionHint(true)');assert.match(label.textContent,/Запуск завершён/);
});
check('Download and error messages survive terminal and nonterminal transitions',()=>{
  call("setSaveStatus('Download delivered', 'download')");call('syncCompletionHint(false)');call('syncCompletionHint(true)');assert.equal(label.textContent,'Download delivered');assert.equal(label.classList.error,false);
  call("setSaveStatus('Actual error', 'error')");call('syncCompletionHint(false)');call('syncCompletionHint(true)');assert.equal(label.textContent,'Actual error');assert.equal(label.classList.error,true);
});
check('Status ownership is wired into actual render/save/error paths; scene drawing unchanged',()=>{
  const currentRender=fn(source,'render');assert.ok(currentRender.includes('syncCompletionHint(sim.state.done);'));
  assert.equal(currentRender.replace('    syncCompletionHint(sim.state.done);\n',''),fn(old,'render'));
  assert.ok(source.includes("setSaveStatus(`JSON передан браузеру для скачивания: ${filename}`, 'download')"));
  assert.ok(source.includes("setSaveStatus(error?.message || String(error), 'error')"));
  assert.equal(fn(source,'seek'),fn(old,'seek'));assert.equal(fn(source,'start'),fn(old,'start'));assert.equal(fn(source,'step'),fn(old,'step'));
});
check('Protected controller/clock/config/projection/art/style/controls source blobs unchanged from C04',()=>{
  const files=['index.html','style.css','package.json','src/controller.mjs','src/playback-clock.mjs',
    ...execFileSync('git',['ls-tree','-r','--name-only',baselineRef,'--','experiments/p2-free-approach/builder/inputs','experiments/p2-free-approach/builder/source-packets'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean).map(p=>p.replace('experiments/p2-free-approach/builder/',''))];
  for(const file of files){const baseline=execFileSync('git',['show',`${baselineRef}:experiments/p2-free-approach/builder/${file}`],{cwd:root,maxBuffer:4*1024*1024});const current=readFileSync(path.join(root,file));const binary=/\.(png|jpg|webp)$/.test(file);assert.equal(sha256(binary?current:canonicalLF(current)),sha256(binary?baseline:canonicalLF(baseline)),file);}
});
const report={schema:'r4d.p2.candidate05.ui-model-check.v1',checks,sourceMainSha256:sha256(canonicalLF(Buffer.from(source))),baselineRef,
  browserExecuted:false,pixiOrGpuExecuted:false,coreOrControllerExecuted:false,simulationExecuted:false,black200ActualFixVerified:false,independentQa:false,
  limitations:['Only actual fit/status functions executed in isolated VM with a modeled15px scrollbar container','This does not establish the original black-frame cause or actual PUBLIC05 GPU behavior','Physical state non-advance is a bounded model/source invariant, not a new live-state/physics matrix']};
const i=process.argv.indexOf('--report');
if(i>=0){const target=path.resolve(process.argv[i+1]);assert.ok(target.replaceAll('\\','/').toLowerCase().startsWith('e:/r4d/perspective/p2-runtime/'));assert.ok(!existsSync(target));writeFileSync(target,JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
console.log(JSON.stringify({pass:true,checks:checks.length,...report}));
