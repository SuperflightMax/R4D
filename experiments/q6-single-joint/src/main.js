import {Application,Assets,Sprite,Graphics} from 'pixi.js';
import contract from '../FROZEN_CONTRACT.json';
import {Motion} from './motion.js';
import {transforms,equality} from './rig.js';
import './style.css';

const $=id=>document.getElementById(id),motion=new Motion(contract),panels=[];
const base=import.meta.env.BASE_URL;
const names={J0:'J0 · исходные торцы',J1:'J1 · открытый край (M2)',J2:'J2 · J1 + наколенник',M1:'M1 · mini-atlas',M2:'M2 · локальный ремонт',source:'J0 · исходная привязка'};
const manifest=await fetch(`${base}art/manifest.json`).then(r=>{if(!r.ok)throw new Error(`runtime manifest HTTP ${r.status}`);return r.json();});
const issues=[];
for(const id of ['J0','J1','J2','M1','M2','source']){
  const variant=id==='source'?'J0':id,entry=manifest.variants[variant];
  const article=document.createElement('article');article.dataset.panel=id;
  const title=document.createElement('h2');title.textContent=names[id];
  const viewport=document.createElement('div');viewport.className='viewport';
  const meta=document.createElement('p');meta.className='meta';
  article.append(title,viewport,meta);$('panels').append(article);
  const panel={id,source:id==='source',variant,article,viewport,meta,pose:motion.pose,loaded:false,sprites:{}};panels.push(panel);
  if(!entry){const message=document.createElement('div');message.className='missing';message.textContent=`Нет входных файлов ${variant}.\nОжидается отдельная передача арта CTO; замена не создана.`;viewport.append(message);issues.push(`${variant}: missing inputs`);continue;}
  try{
    const app=new Application();await app.init({width:440,height:660,antialias:true,background:'#e8e3d9',resolution:1,autoDensity:false,autoStart:false,sharedTicker:false,preference:'webgl'});panel.app=app;viewport.append(app.canvas);
    app.stage.sortableChildren=true;
    for(const part of ['thigh','shin',...(entry.overlay?['overlay']:[])]){
      const input=entry[part];const response=await fetch(`${base}${input.file}`);if(!response.ok)throw new Error(`${input.file}: HTTP ${response.status}`);
      const bytes=await response.arrayBuffer();const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
      if(hash!==input.sha256)throw new Error(`${input.file}: SHA256 mismatch`);
      const texture=await Assets.load(`${base}${input.file}`);
      const expected=part==='thigh'?contract.source.thigh_size:contract.source.shin_size;
      if(texture.width!==expected[0]||texture.height!==expected[1])throw new Error(`${input.file}: wrong canvas ${texture.width}×${texture.height}`);
      const sprite=new Sprite(texture);app.stage.addChild(sprite);panel.sprites[part]=sprite;
    }
    panel.graphics=new Graphics();panel.graphics.zIndex=100;app.stage.addChild(panel.graphics);panel.loaded=true;
  }catch(error){issues.push(`${id}: ${error.message}`);const warning=document.createElement('div');warning.className='missing';warning.textContent=`Входы не загружены: ${error.message}`;viewport.append(warning);}
}
let paused=true,last=performance.now(),lastReadout=0,lastSnapshot;
function visibleIds(){const mode=$('mode').value;return mode==='joint'?['J0','J1','J2']:mode==='method'?['M1','M2']:mode==='diagnostic'?['source','J0']:[$('variant').value];}
function apply(sprite,t){sprite.position.set(t.x,t.y);sprite.rotation=t.angle;sprite.scale.set(t.scale);sprite.pivot.set(...t.pivot);sprite.zIndex=t.layer;}
function actual(sprite){return {x:sprite.x,y:sprite.y,angle:sprite.rotation,scale:sprite.scale.x,scaleY:sprite.scale.y,pivot:[sprite.pivot.x,sprite.pivot.y],layer:sprite.zIndex};}
function render(force=false){
  const zoom=$('zoom').value==='zoom',dark=$('theme').value==='dark',visible=visibleIds();
  const neutral=transforms(contract,motion.pose,zoom),source=transforms(contract,motion.pose,zoom,true);
  const records=[];
  for(const panel of panels){
    panel.article.hidden=!visible.includes(panel.id);
    const world=panel.source?source:neutral;
    if(!panel.loaded){panel.meta.textContent='Ожидание точных художественных входов';records.push({id:panel.id,source:panel.source,loaded:false,pose:motion.pose});continue;}
    apply(panel.sprites.thigh,world.thigh);apply(panel.sprites.shin,world.shin);
    if(panel.sprites.overlay)apply(panel.sprites.overlay,{...world.shin,layer:contract.rig.overlay.layer});
    const transform={root:world.root,thigh:actual(panel.sprites.thigh),shin:actual(panel.sprites.shin)};
    records.push({id:panel.id,source:panel.source,loaded:true,pose:panel.pose,transform});
    panel.app.renderer.background.color=dark?'#20252d':'#e8e3d9';
    const g=panel.graphics;g.clear();
    if($('bones').checked)g.moveTo(world.root.x,world.root.y).lineTo(world.thigh.x,world.thigh.y).lineTo(world.shin.x,world.shin.y).stroke({color:0xf24c40,width:2});
    if($('pivots').checked)for(const t of [world.root,world.thigh,world.shin])g.circle(t.x,t.y,4).fill(0xffdd22).stroke({color:0x111111,width:1});
    panel.meta.textContent=$('layers').checked?`thigh −10 / shin −11${panel.variant==='J2'?' / overlay −8':''}${panel.source?' · source offset [39,240] · manifest shin −9, runtime −11':' · neutral offset [41,284]'} · pivots [98,35] / [102,28]`:`${panel.source?'Исходный runtime offset':'Нейтральная привязка'} · ${zoom?'0.84':'0.42'}${manifest.variants[panel.variant].note?' · '+manifest.variants[panel.variant].note:''}`;
    if(!panel.article.hidden)panel.app.render();
  }
  const check=equality(records);lastSnapshot={...motion.snapshot(),paused,mode:$('mode').value,variant:$('variant').value,theme:$('theme').value,zoom,bones:$('bones').checked,pivots:$('pivots').checked,layers:$('layers').checked,equality:check,issues:[...issues],panels:records.map(r=>({id:r.id,source:r.source,loaded:r.loaded,transform:r.transform,cssScale:panels.find(p=>p.id===r.id).viewport.getBoundingClientRect().width/440})),manifest};
  $('single-label').hidden=$('mode').value!=='single';
  $('play').textContent=paused?'Играть ↔ bind':'Пауза';$('play').setAttribute('aria-pressed',String(!paused));
  $('equality').textContent=`Точное равенство позы/transform: ${check.exact?'ДА':'НЕТ'} · проверены ${check.checked.join(', ')||'нет загруженных вариантов'} · source offset и дополнительный J2 overlay исключены.`;$('equality').className=check.exact?'ok':'bad';
  $('notice').textContent=issues.length?`Неполные входы: ${issues.join('; ')}`:'Все 5 вариантов загружены: SHA-256 и размеры PNG проверены.';
  $('mode-note').textContent=$('mode').value==='method'?'M1 и M2 нацелены на один дизайн J1; это сравнение получения деталей.':$('mode').value==='diagnostic'?'Только J0: изменено смещение [39,240] → [41,284]. Слои действующего runtime сохранены −10/−11. Это отдельная диагностика сборки.':'J0 / J1 / J2: сравнение оформления. J1 — результат M2 без подмены; J2 использует ту же подложку.';
  if(force||performance.now()-lastReadout>120){$('readout').textContent=JSON.stringify({...lastSnapshot,manifest:undefined},null,2);lastReadout=performance.now();}
}
function request(){motion.request($('state').value);render(true);}
$('state').onchange=request;$('request').onclick=request;
$('play').onclick=()=>{paused=!paused;motion.playing=!paused;last=performance.now();render(true);};
$('step').onclick=()=>{paused=true;motion.playing=false;motion.advance(contract.motion.step_seconds);render(true);};
$('reset').onclick=()=>{motion.reset();paused=true;$('state').value='bind';render(true);};
for(const id of ['mode','variant','theme','zoom','bones','pivots','layers'])$(id).onchange=()=>render(true);
function frame(now){const dt=(now-last)/1000;last=now;if(!paused)motion.advance(Math.min(dt,.1));render();requestAnimationFrame(frame);}
// Diagnostic stepping invokes the SAME Motion path; actual UI interactions remain testable.
window.__Q6={snapshot:()=>structuredClone(lastSnapshot),advance:dt=>{motion.advance(dt);render(true);},request:id=>{$('state').value=id;request();},reset:()=>$('reset').click(),contract};
render(true);window.__Q6_READY=true;requestAnimationFrame(frame);
