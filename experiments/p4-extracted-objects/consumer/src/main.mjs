import * as core from '@millionko/sim-core';
import {createAdapter} from '@p1/adapter';
import {createReplay} from './replay.mjs';
import {Scene} from './scene.mjs';
const $=id=>document.getElementById(id);
const json=async url=>{const response=await fetch(url);if(!response.ok)throw new Error(`${url}: ${response.status}`);return response.json();};
const say=text=>$('message').textContent=text;
try{
 const [config,p1,binding,artBinding]=await Promise.all(['config.json','p1-manifest.json','binding.json','art-binding.json'].map(p=>json('./input/'+p)));
 const manifest=artBinding?await json('./art/manifest.json'):null;
 const adapter=createAdapter(core,config),replay=createReplay(core,adapter,binding);
 const scene=new Scene($('scene'),config,p1,replay);await scene.init(manifest);
 let playing=false,accumulator=0,last=performance.now();
 const pause=()=>{playing=false;accumulator=0;$('play').textContent='Продолжить';};
 function sync(){
  const s=replay.snapshot();$('seed').value=replay.seed;$('seek').value=s.tick;$('tick-input').value=s.tick;
  $('time').textContent=`${s.tick} · ${(s.timeSec).toFixed(3)} с`;
  $('state').textContent=JSON.stringify(s,null,2);$('events').textContent=JSON.stringify(replay.events(),null,2);
  scene.render();
 }
 function guard(fn){return async()=>{try{await fn();}catch(e){pause();say(e.message);}};}
 const start=seed=>{replay.restart(seed);playing=true;accumulator=0;last=performance.now();$('play').textContent='Пауза';say('');sync();};
 $('random').onclick=guard(()=>{const a=new Uint32Array(1);crypto.getRandomValues(a);if(a[0]===replay.seed)a[0]=(a[0]+1)>>>0;start(a[0]);});
 $('replay').onclick=guard(()=>start(Number($('seed').value)));
 $('play').onclick=()=>{playing=!playing;accumulator=0;last=performance.now();$('play').textContent=playing?'Пауза':'Продолжить';};
 $('step').onclick=guard(()=>{pause();replay.stepTicks(1);sync();});
 $('steps').onclick=guard(()=>{pause();const n=Number($('count').value);if(!Number.isInteger(n)||n<1||n>replay.maxTicks)throw new Error('Неверное число тиков');replay.stepTicks(n);sync();});
 const seek=tick=>{pause();replay.seek(tick);sync();};
 $('seek').max=$('tick-input').max=replay.maxTicks;
 $('seek').oninput=guard(()=>seek(Number($('seek').value)));
 $('goto').onclick=guard(()=>seek(Number($('tick-input').value)));
 for(const name of ['art','geometry'])$(name).onchange=()=>{scene[name]=$(name).checked;scene.render();};
 $('view').onchange=()=>{scene.view=$('view').value;scene.render();};
 $('zoom').oninput=()=>{scene.zoom=Number($('zoom').value);scene.render();};
 $('export').onclick=()=>{
  pause();sync();const a=document.createElement('a');const blob=new Blob([JSON.stringify(replay.checkpoint(artBinding),null,2)+'\n'],{type:'application/json'});
  a.href=URL.createObjectURL(blob);a.download=`p4-seed${replay.seed}-tick${replay.snapshot().tick}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);
 };
 $('import').onchange=guard(async()=>{
  pause();const file=$('import').files[0];if(!file)return;
  const value=JSON.parse(await file.text());replay.restore(value);sync();
  say(JSON.stringify(value.art)===JSON.stringify(artBinding)?'Checkpoint точно воспроизведён.':'Симуляция воспроизведена; версия арта отличается от сохранённой.');
 });
 $('art-status').textContent=manifest?`Комплект ${manifest.version}: ${manifest.objects.length}/29 объектов. Проверка стыка, без QA PASS.`:'Комплект Artist ещё не подключён. Исходник + диагностическая геометрия; извлечение не подтверждено.';
 $('versions').textContent=JSON.stringify({binding,artBinding,configCounts:{pins:config.board.pins.length,segments:config.board.segments.length,buckets:config.board.buckets.length,drops:config.board.drops.length}},null,2);
 // Inspection surface exposes observed native snapshots; no setter for physics.
 window.p4={snapshot:()=>replay.snapshot(),checkpoint:()=>replay.checkpoint(artBinding),inspection:()=>scene.inspection(),events:()=>replay.events()};
 window.p4Ready=true;sync();
 function frame(now){
  if(playing){
   accumulator+=Math.min(now-last,250);
   const n=Math.floor(accumulator/config.defaults.tickMs);
   if(n){replay.stepTicks(n);accumulator-=n*config.defaults.tickMs;if(replay.snapshot().done)pause();sync();}
  }
  last=now;requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
}catch(e){$('art-status').textContent='Ошибка подключения';say(e.message);console.error(e);}
