'use strict';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const copy = o => JSON.parse(JSON.stringify(o));
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names = {ball:'Шарик',buttons:'Вся панель',button1:'Кнопка Один',button2:'Кнопка Два',button3:'Кнопка Три',text:'Надпись'};
const kind = target => target.startsWith('button') ? 'buttons' : target;
const variants = [
  {id:'comet',kind:'ball',name:'Кометный след',description:'Длинный затухающий хвост',color:'#83d9ff',length:28,speed:1,radius:110},
  {id:'beads',kind:'ball',name:'Бусы',description:'Крупные отдельные точки',color:'#ffba76',length:14,speed:.7,radius:85},
  {id:'glow',kind:'buttons',name:'Мягкая подсветка',description:'Кнопки светятся вместе',color:'#a9a0ff',stagger:0},
  {id:'cascade',kind:'buttons',name:'Каскад',description:'Появление со сдвигом по очереди',color:'#8de5b5',stagger:.25},
  {id:'rise',kind:'text',name:'Вверх и раствориться',description:'Мягкое появление надписи',color:'#ffcf83',shift:30},
  {id:'slide',kind:'text',name:'Боковой вход',description:'Сдвиг и быстрое появление',color:'#f5a1cf',shift:75}
];
const defaults = () => ({entry:'effects',target:'ball',text:'Привет, мастерская!',steps:[],selected:null,recipeId:null});
// Only an explicit URL query isolates tests. No reset of participant storage exists.
const testSpace = new URLSearchParams(location.search).get('test');
const storageKey = testSpace ? `r4d-fx01:test:${testSpace}` : 'r4d-fx01:work';
let draft = defaults(), recipes = [], undo = [], redo = [], preview = null;
let previewBlocked = null;
let playing = true, elapsed = 0, lastFrame = 0, gesture = null, gestureTimer = 0, saveTimer = 0;
let storageError = '', loaded = false, pendingSave = false;
try {
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    const data = JSON.parse(raw);
    if (data.version !== 1 || !data.draft || !Array.isArray(data.draft.steps) || !Array.isArray(data.recipes)) throw Error('Нераспознанный формат данных');
    draft = data.draft; recipes = data.recipes; loaded = true;
  }
} catch (e) { storageError = `Не удалось прочитать сохранённую работу: ${e.message}. Автосохранение остановлено, чтобы не затереть данные.`; }
const readError = storageError;
const selected = () => draft.steps.find(s => s.id === draft.selected);
const variant = id => variants.find(v => v.id === id);
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const number = n => n.toLocaleString('ru-RU',{maximumFractionDigits:2});
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `s${Date.now()}${Math.random().toString(36).slice(2)}`;
function newStep(v,target,id=uid()) {
  return {id,target,variant:v.id,relation:'after',delay:0,duration:v.kind==='ball'?4:2,length:v.length??20,speed:v.speed??1,radius:v.radius??110,color:v.color,stagger:v.stagger??.2,shift:v.shift??30};
}
function status(message) {
  $('#storage-status').textContent = storageError || message;
  $('#storage-status').classList.toggle('error',!!storageError);
  renderSave();
}
function persist() {
  clearTimeout(saveTimer);
  if (readError) return status('');
  try {
    localStorage.setItem(storageKey,JSON.stringify({version:1,draft,recipes}));
    storageError=''; pendingSave=false; status('Черновик сохранён на этом устройстве');
  } catch(e) { storageError=`Не сохранено: локальное хранилище недоступно или заполнено. Работа пока только в этой вкладке. (${e.name})`; status(''); }
}
function scheduleSave() { clearTimeout(saveTimer); pendingSave=true; status('Изменения в черновике…'); saveTimer=setTimeout(persist,400); }
function record(before) {
  if (equal(before,draft)) return;
  undo.push(before); if(undo.length>80) undo.shift(); redo=[]; scheduleSave(); updateHistory(); renderSave();
}
function finishGesture() {
  clearTimeout(gestureTimer);
  if(!gesture) return;
  const before=gesture.before; gesture=null; record(before); persist();
}
function beginGesture(key) {
  if(gesture?.key!==key) { finishGesture(); gesture={key,before:copy(draft)}; pendingSave=true; status('Изменения в черновике…'); }
}
function change(fn) {
  finishGesture(); clearPreview(); const before=copy(draft); fn(); normalize(); record(before); seekSelected(); render();
}
function seekSelected() {
  const item=schedule().find(item=>item.step.id===draft.selected);
  elapsed=item?item.start+Math.min(.35,item.step.duration/2):0;
}
function normalize() {
  if(draft.steps.length) draft.steps[0].relation='start';
  if(!selected()) draft.selected=null;
}
function clearPreview() { if(preview) {preview=null; $('#preview-status').hidden=true; $$('.previewing').forEach(e=>e.classList.remove('previewing'));} }
function chooseTarget(target) {
  finishGesture(); clearPreview(); draft.target=target;
  const step=draft.steps.find(s=>s.target===target);
  draft.selected=step?.id??null; scheduleSave(); render();
}
function switchEntry(entry) { finishGesture(); clearPreview(); draft.entry=entry; scheduleSave(); render(); }
function doUndo(back) {
  finishGesture(); clearPreview(); const source=back?undo:redo,dest=back?redo:undo;
  if(!source.length) return; dest.push(copy(draft)); draft=source.pop(); seekSelected(); persist(); render();
}
function applyVariant(id,add=false) {
  previewBlocked=id;
  change(()=>{
    const v=variant(id), old=selected();
    if(old && old.target===draft.target && !add) {
      const replacement=newStep(v,draft.target,old.id);
      Object.assign(replacement,{relation:old.relation,delay:old.delay,duration:old.duration});
      draft.steps[draft.steps.indexOf(old)]=replacement;
    } else { const step=newStep(v,draft.target); draft.steps.push(step); draft.selected=step.id; }
  });
}
function startPreview(id,card) {
  if(previewBlocked===id)return;
  finishGesture(); const old=selected();
  preview={step:newStep(variant(id),draft.target),replace:old?.target===draft.target?old.id:null};
  $('#preview-status').textContent=`Примерка: ${variant(id).name} · ${names[draft.target]}. Уведите указатель или нажмите Esc — вернётся черновик.`;
  $('#preview-status').hidden=false; card.classList.add('previewing');
}
function mini(v) {
  if(v.kind==='ball') return `<svg viewBox="0 0 74 48" class="mini" aria-hidden="true"><circle cx="37" cy="24" r="16" fill="none" stroke="#344957"/><g class="orb"><circle cx="53" cy="24" r="5" fill="${v.color}"/><circle cx="49" cy="15" r="3" fill="${v.color}" opacity=".5"/><circle cx="42" cy="9" r="2" fill="${v.color}" opacity=".3"/></g></svg>`;
  if(v.kind==='buttons') return `<svg viewBox="0 0 74 48" class="mini" aria-hidden="true">${[0,1,2].map((n)=>`<rect class="${v.id==='glow'?'pulse':'reveal'}" x="${8+n*21}" y="15" width="17" height="20" rx="3" fill="${v.color}" style="animation-delay:${n*v.stagger}s"/>`).join('')}</svg>`;
  return `<svg viewBox="0 0 74 48" class="mini" aria-hidden="true"><text class="reveal" x="37" y="31" text-anchor="middle" fill="${v.color}" font-size="22">Aa</text></svg>`;
}
function renderGallery() {
  const objects=draft.entry==='objects';
  $('#library-heading').innerHTML=`<h2>${objects?'Выберите объект':'Найдите эффект'}</h2><p class="muted">${objects?'На сцене или в списке. Затем примеряйте эффекты.':'Наведите на вариант для примерки. Примените, когда понравится.'}</p>`;
  $('#objects').innerHTML=objects?`<div class="object-list">${Object.entries(names).map(([id,name])=>`<button data-object="${id}" aria-pressed="${id===draft.target}">${name}</button>`).join('')}</div><h3>Эффекты · ${names[draft.target]}</h3>`:'';
  $('#categories').innerHTML=objects?'':`<div class="categories" aria-label="Виды эффектов">${[['ball','Следы шарика'],['buttons','Свет и каскад кнопок'],['text','Появление надписи']].map(([id,label])=>`<button data-object="${id}" aria-pressed="${kind(draft.target)===id}">${label}</button>`).join('')}</div>`;
  $('#gallery').innerHTML=variants.filter(v=>v.kind===kind(draft.target)).map(v=>{
    const replacing=selected()?.target===draft.target;
    return `<article class="card" data-variant="${v.id}" tabindex="0" aria-label="Примерить: ${v.name}"><div class="card-title">${mini(v)}<div><h3>${v.name}</h3><small>${v.description}</small></div></div><div class="card-actions"><button data-apply="${v.id}">${replacing?'Заменить шаг':'Применить'}</button>${replacing?`<button data-add="${v.id}">Добавить шаг</button>`:''}</div></article>`;
  }).join('');
  $$('[data-object]').forEach(b=>b.onclick=()=>chooseTarget(b.dataset.object));
  $$('.card').forEach(card=>{
    card.onpointerenter=()=>startPreview(card.dataset.variant,card);
    card.onpointerleave=()=>{previewBlocked=null;clearPreview();};
    card.onfocus=()=>startPreview(card.dataset.variant,card);
    card.onfocusout=e=>{if(!card.contains(e.relatedTarget))clearPreview();};
    card.onkeydown=e=>{if(e.key==='Escape')clearPreview();};
  });
  $$('[data-apply]').forEach(b=>b.onclick=()=>applyVariant(b.dataset.apply));
  $$('[data-add]').forEach(b=>b.onclick=()=>applyVariant(b.dataset.add,true));
}
function schedule(steps=draft.steps) {
  let previous=null;
  return steps.map(step=>{
    const start=(step.relation==='with'?(previous?.start??0):step.relation==='after'?(previous?.end??0):0)+step.delay;
    const item={step,start,end:start+step.duration}; previous=item; return item;
  });
}
function duration() { return Math.max(4,...schedule().map(s=>s.end))+.7; }
function renderSteps() {
  const times=schedule();
  $('#steps').innerHTML=draft.steps.length?draft.steps.map((s,i)=>`<div class="step ${draft.selected===s.id?'selected':''}" data-step="${s.id}"><div><button class="step-name" data-select="${s.id}">${i+1}. ${esc(variant(s.variant).name)} · ${names[s.target]}</button><small>${s.relation==='start'?'Сначала':s.relation==='with'?'Одновременно с предыдущим':'После предыдущего'} · ${number(times[i].start)}–${number(times[i].end)} с</small></div><div class="step-actions"><button data-move="-1" data-id="${s.id}" aria-label="Выше: ${esc(variant(s.variant).name)}" ${i===0?'disabled':''}>Выше</button><button data-move="1" data-id="${s.id}" aria-label="Ниже: ${esc(variant(s.variant).name)}" ${i===draft.steps.length-1?'disabled':''}>Ниже</button><button data-delete="${s.id}" aria-label="Убрать: ${esc(variant(s.variant).name)}">Убрать</button></div></div>`).join(''):'<p class="muted">Здесь появятся применённые эффекты. Для одного эффекта композицию собирать не нужно.</p>';
  $$('[data-select]').forEach(b=>b.onclick=()=>{finishGesture();clearPreview();draft.selected=b.dataset.select;draft.target=selected().target;scheduleSave();render();});
  $$('[data-move]').forEach(b=>b.onclick=()=>change(()=>{
    const i=draft.steps.findIndex(s=>s.id===b.dataset.id),j=i+Number(b.dataset.move);
    [draft.steps[i],draft.steps[j]]=[draft.steps[j],draft.steps[i]];
    if(i===0||j===0) draft.steps[1].relation='after';
  }));
  $$('[data-delete]').forEach(b=>b.onclick=()=>change(()=>{draft.steps=draft.steps.filter(s=>s.id!==b.dataset.delete);draft.selected=draft.steps.find(s=>s.target===draft.target)?.id??null;}));
}
const ranges={length:[4,60,1,.1],speed:[.2,3,.1,.01],radius:[40,180,5,1],delay:[0,5,.1,.01],duration:[.5,8,.1,.01],stagger:[0,.6,.05,.01],shift:[0,120,5,1]};
function numeric(label,key,value,unit='') {
  const [min,max,step]=ranges[key];
  return `<label class="field"><span>${label}${unit?` · ${unit}`:''}</span><input class="number" data-param="${key}" aria-label="${label}" type="number" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
}
function updateParam(key,value) {
  const s=selected(); if(!s) return;
  if(key==='color') s.color=value;
  else { const [min,max]=ranges[key]; const n=Number(value); if(!Number.isFinite(n))return; s[key]=Math.round(Math.min(max,Math.max(min,n))*100)/100; }
  seekSelected();
}
function syncNumber(key) {const input=$(`[data-param="${key}"]`);if(input && selected())input.value=selected()[key];}
function refreshAfterGesture() {renderSteps();updateHistory();}
function bindEdit(input,key) {
  input.oninput=()=>{clearPreview();beginGesture(`param:${key}`);updateParam(key,input.value);clearTimeout(gestureTimer);gestureTimer=setTimeout(()=>{finishGesture();refreshAfterGesture();},500);};
  input.onchange=()=>{syncNumber(key);finishGesture();refreshAfterGesture();};
  input.onblur=()=>{syncNumber(key);finishGesture();refreshAfterGesture();};
  if(key==='color')return;
  input.addEventListener('wheel',e=>{
    e.preventDefault();e.stopPropagation();if(!e.deltaY)return;
    clearPreview();beginGesture(`wheel:${key}`);
    const step=ranges[key][e.shiftKey?3:2];updateParam(key,selected()[key]+(e.deltaY<0?step:-step));syncNumber(key);
    clearTimeout(gestureTimer);gestureTimer=setTimeout(()=>{finishGesture();refreshAfterGesture();},300);
  },{passive:false});
}
function renderSettings() {
  const s=selected();
  if(!s) {$('#settings').innerHTML=`<h2>${names[draft.target]}</h2><p class="help">Примерьте вариант в галерее и нажмите «Применить». Здесь появятся его настройки.</p>${draft.target==='text'?textField():''}`;bindText();return;}
  const k=kind(s.target),i=draft.steps.indexOf(s);
  $('#settings').innerHTML=`<h2>${esc(variant(s.variant).name)}</h2><p class="muted">${names[s.target]} · шаг ${i+1}</p><p class="wheel-hint">Колесо над числом — изменить. Shift + колесо — точнее. Клик и ввод тоже работают.</p>${k==='ball'?numeric('Длина хвоста','length',s.length,'точек')+numeric('Скорость','speed',s.speed)+numeric('Радиус траектории','radius',s.radius,'на сцене'):''}${s.target==='buttons'?numeric('Интервал кнопок','stagger',s.stagger,'с'):''}${k==='text'?textField()+numeric('Сдвиг','shift',s.shift,'на сцене'):''}<label class="field"><span>Цвет</span><input type="color" data-param="color" aria-label="Цвет эффекта" value="${s.color}"></label>${numeric('Длительность','duration',s.duration,'с')}<label class="field"><span>Начало шага</span><select id="relation" ${i===0?'disabled':''}><option value="start">Сначала (от начала)</option><option value="with">Одновременно с предыдущим</option><option value="after">После предыдущего</option></select></label>${numeric('Задержка','delay',s.delay,'с')}<p class="help">Выбранный шаг меняется в черновике. Сохранённый рецепт остаётся прежним до «Сохранить редакцию».</p>`;
  $$('[data-param]').forEach(input=>bindEdit(input,input.dataset.param));
  $('#relation').value=s.relation;
  $('#relation').onchange=e=>change(()=>selected().relation=e.target.value);
  bindText();
}
function textField() {return `<label class="field"><span>Текст надписи</span><input id="caption" aria-label="Текст надписи" value="${esc(draft.text)}" maxlength="60"></label>`;}
function bindText() {const input=$('#caption');if(!input)return;input.oninput=()=>{clearPreview();beginGesture('text');draft.text=input.value;seekSelected();clearTimeout(gestureTimer);gestureTimer=setTimeout(finishGesture,500);};input.onblur=()=>{finishGesture();persist();};}
function updateHistory() {$('#undo').disabled=!undo.length&&!gesture;$('#redo').disabled=!redo.length;}
function render() {
  $$('[data-entry]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.entry===draft.entry));
  $('#target').value=draft.target;
  $$('[data-target]').forEach(g=>g.classList.toggle('selected',g.dataset.target===draft.target));
  renderGallery();renderSteps();renderSettings();updateHistory();renderSave();
}
function renderSave() {
  const r=recipes.find(r=>r.id===draft.recipeId);
  const dirty=!!r&&!sameWork(recipeConfig(),r.revisions.at(-1).config);
  $('#recipe-count').textContent=recipes.length;
  $('#work-title').textContent=r?`Черновик: ${r.name}`:'Новый черновик';
  $('#pin').disabled=!draft.steps.length;
  $('#save-recipe').hidden=!r;
  $('#save-recipe').disabled=!!readError||(!dirty&&!storageError);
  $('#save-hint').classList.toggle('error',!!storageError);
  $('#save-hint').textContent=storageError?'Не сохранено на этом устройстве. Работа пока только в этой вкладке.':r?(dirty?'Правки в черновике. Сохраните редакцию, чтобы обновить рецепт.':pendingSave?'Сохранение на этом устройстве…':'Редакция сохранена на этом устройстве. Новых правок нет.'):pendingSave?'Сохранение черновика на этом устройстве… Рецепт ещё не закреплён.':'Черновик не закреплён. Примените эффект и закрепите понравившуюся работу.';
}
function recipeConfig() {const d=copy(draft);delete d.recipeId;return d;}
function sameWork(a,b) {return equal({text:a.text,steps:a.steps},{text:b.text,steps:b.steps});}
function thumbnail(config) {
  const s=config.steps.find(s=>kind(s.target)==='ball')??config.steps[0];
  const col=s?.color??'#b1dfff';
  return `<svg viewBox="0 0 100 70" aria-label="Превью рецепта">${s&&kind(s.target)==='ball'?`<path d="M15 45 Q45 5 80 35" fill="none" stroke="${col}" stroke-width="${s.variant==='beads'?5:3}" stroke-dasharray="${s.variant==='beads'?'1 8':'3 4'}"/><circle cx="80" cy="35" r="8" fill="${col}"/>`:s&&kind(s.target)==='buttons'?`<g fill="${col}"><rect x="10" y="25" width="22" height="25" rx="4"/><rect x="39" y="${s.variant==='cascade'?20:25}" width="22" height="25" rx="4"/><rect x="68" y="${s.variant==='cascade'?15:25}" width="22" height="25" rx="4"/></g>`:`<text x="50" y="40" text-anchor="middle" fill="${col}" font-size="16">${esc(config.text.slice(0,9))}</text>`}<text x="7" y="63" fill="#aabfce" font-size="10">${config.steps.length} шаг.</text></svg>`;
}
function renderRecipes() {
  $('#recipes').innerHTML=recipes.length?recipes.map(r=>`<article class="recipe">${thumbnail(r.revisions.at(-1).config)}<div><input aria-label="Название рецепта" data-name="${r.id}" value="${esc(r.name)}" maxlength="70"><div class="meta">${r.revisions.length} редакц. · ${new Date(r.revisions.at(-1).date).toLocaleString('ru-RU')}</div><div class="actions"><button data-open="${r.id}">Открыть в черновике</button></div>${r.revisions.length>1?`<label class="field"><span>Сохранённые редакции</span><select aria-label="Редакция: ${esc(r.name)}" data-revision="${r.id}">${r.revisions.map((v,i)=>`<option value="${i}" ${i===r.revisions.length-2?'selected':''}>Редакция ${i+1}${i===r.revisions.length-1?' · последняя':''} · ${new Date(v.date).toLocaleTimeString('ru-RU')}</option>`).join('')}</select></label><div class="actions"><button data-restore="${r.id}">Вернуть редакцию в черновик</button></div>`:''}</div></article>`).join(''):'<p>Здесь пока пусто. Примените эффект и закрепите понравившуюся работу.</p>';
  $$('[data-name]').forEach(input=>{input.onchange=()=>{const r=recipes.find(r=>r.id===input.dataset.name);r.name=input.value.trim()||r.name;input.value=r.name;persist();renderSave();};});
  $$('[data-open]').forEach(b=>b.onclick=()=>openRecipe(b.dataset.open));
  $$('[data-restore]').forEach(b=>b.onclick=()=>openRecipe(b.dataset.restore,Number($(`[data-revision="${b.dataset.restore}"]`).value)));
}
function openRecipe(id,index) {
  change(()=>{const r=recipes.find(r=>r.id===id);draft={...copy(r.revisions[index??r.revisions.length-1].config),recipeId:id};});
  $('#collection').hidden=true;$('#collection-toggle').setAttribute('aria-expanded','false');persist();
}
function pinRecipe() {
  finishGesture();clearPreview();const first=draft.steps[0];if(!first)return;
  const base=`${variant(first.variant).name} · ${names[first.target]}`;
  const n=recipes.filter(r=>r.name.startsWith(base)).length;
  const r={id:uid(),name:base+(n?` ${n+1}`:''),revisions:[{date:new Date().toISOString(),config:recipeConfig()}]};
  recipes.push(r);draft.recipeId=r.id;persist();renderSave();renderRecipes();$('#collection').hidden=false;$('#collection-toggle').setAttribute('aria-expanded','true');
}
function saveRevision() {
  finishGesture();clearPreview();const r=recipes.find(r=>r.id===draft.recipeId);if(!r)return;
  if(!sameWork(recipeConfig(),r.revisions.at(-1).config))r.revisions.push({date:new Date().toISOString(),config:recipeConfig()});
  persist();renderSave();renderRecipes();
}

// A single clock renders the current configuration. Replacing or undoing cannot leave stale animation nodes.
function ballPosition(s,t) {const a=t*s.speed*1.8;return [690+Math.cos(a)*s.radius,215+Math.sin(a)*s.radius*.68];}
function drawScene(t) {
  const active=schedule().filter(s=>t>=s.start&&t<=s.end&&s.step.id!==preview?.replace).map(s=>({s:s.step,t:t-s.start}));
  if(preview)active.push({s:preview.step,t:elapsed%preview.step.duration});
  let svg='<ellipse cx="690" cy="215" rx="110" ry="74.8" fill="none" stroke="#334957" stroke-dasharray="3 7"/>';
  const ballEffects=active.filter(a=>kind(a.s.target)==='ball');
  const primaryBall=ballEffects.at(-1)?.s??newStep(variants[0],'ball','base');
  for(const {s,t:st} of ballEffects) {
    for(let i=Math.ceil(s.length);i>0;i--) {const p=ballPosition(s,st-i*.033);const opacity=(1-i/(s.length+1))*.8;svg+=`<circle cx="${p[0]}" cy="${p[1]}" r="${s.variant==='beads'?4.5:2.2+opacity*3}" fill="${s.color}" opacity="${opacity}"/>`;}
  }
  const bp=ballPosition(primaryBall,ballEffects.at(-1)?.t??t);
  svg+=`<circle cx="${bp[0]}" cy="${bp[1]}" r="13" fill="${primaryBall.color}"/><circle cx="${bp[0]-3}" cy="${bp[1]-4}" r="4" fill="#ffffffaa"/>`;
  for(let i=0;i<3;i++) {
    const effects=active.filter(a=>a.s.target==='buttons'||a.s.target===`button${i+1}`);
    let y=185,opacity=1,fill='#2d4352',stroke='#5d7d91';
    const overlays=[];
    for(const {s,t:st} of effects) {
      const phase=st-(s.target==='buttons'?i*s.stagger:0);
      if(s.variant==='cascade') {const p=Math.max(0,Math.min(1,phase/.4));y+=25*(1-p);opacity*=.15+.85*p;if(phase>=0)fill=s.color;}
      else {const glow=.35+.3*(1+Math.sin(phase*5));if(phase>=0)overlays.push(`<rect x="${61+i*100}" y="${y-4}" width="98" height="78" rx="18" fill="${s.color}" opacity="${glow*.45}"/>`);stroke=s.color;}
    }
    svg+=overlays.join('')+`<g opacity="${opacity}"><rect x="${65+i*100}" y="${y}" width="90" height="70" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="2"/><text x="${110+i*100}" y="${y+42}" text-anchor="middle" fill="#fff" class="button-label">${['Один','Два','Три'][i]}</text></g>`;
  }
  const textEffects=active.filter(a=>a.s.target==='text');
  let tx=500,ty=460,op=textEffects.length||!draft.steps.some(s=>s.target==='text')?1:0,color='#dcebf4';
  for(const {s,t:st} of textEffects) {const p=st/s.duration,fade=Math.min(1,p*5,(1-p)*5);op*=Math.max(0,fade);if(s.variant==='rise')ty+=(1-Math.min(1,p*3))*s.shift-p*s.shift*.3;else tx-=(1-Math.min(1,p*4))*s.shift;color=s.color;}
  svg+=`<text x="${tx}" y="${ty}" text-anchor="middle" fill="${color}" font-size="30" opacity="${op}">${esc(draft.text)}</text>`;
  $('#scene-art').innerHTML=svg;
  const s=selected(),handle=!!s&&kind(s.target)==='ball';$('#geometry').toggleAttribute('hidden',!handle);
  if(handle){const x=690+s.radius;$('#radius-handle').setAttribute('cx',x);$('#radius-handle').setAttribute('aria-valuenow',s.radius);$('#radius-line').setAttribute('x2',x);$('#radius-label').setAttribute('x',x);$('#radius-label').textContent=`Радиус ${number(s.radius)}`;}
}
function tick(now) {
  if(lastFrame&&playing)elapsed+=Math.min(.1,(now-lastFrame)/1000);lastFrame=now;
  const time=elapsed%duration();drawScene(time);$('#play-time').textContent=`${number(Math.round(time*10)/10)} с`;requestAnimationFrame(tick);
}
$('#target').innerHTML=Object.entries(names).map(([id,name])=>`<option value="${id}">${name}</option>`).join('');
$('#target').onchange=e=>chooseTarget(e.target.value);
$$('[data-entry]').forEach(b=>b.onclick=()=>switchEntry(b.dataset.entry));
$$('[data-target]').forEach(g=>{g.onclick=()=>chooseTarget(g.dataset.target);g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();chooseTarget(g.dataset.target);}};});
$('#undo').onclick=()=>doUndo(true);$('#redo').onclick=()=>doUndo(false);
$('#play').onclick=()=>{finishGesture();playing=!playing;$('#play').textContent=playing?'Пауза':'Воспроизвести';};
$('#restart').onclick=()=>{finishGesture();elapsed=0;playing=true;$('#play').textContent='Пауза';};
$('#pin').onclick=pinRecipe;$('#save-recipe').onclick=saveRevision;
$('#collection-toggle').onclick=()=>{finishGesture();clearPreview();$('#collection').hidden=!$('#collection').hidden;$('#collection-toggle').setAttribute('aria-expanded',!$('#collection').hidden);renderRecipes();};
$('#collection-close').onclick=()=>{$('#collection').hidden=true;$('#collection-toggle').setAttribute('aria-expanded','false');};
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){clearPreview();$('#collection').hidden=true;$('#collection-toggle').setAttribute('aria-expanded','false');}
  if(e.target.matches('input,textarea,select,[contenteditable=true]'))return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();doUndo(!e.shiftKey);}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();doUndo(false);}
});
const handle=$('#radius-handle');let dragging=false;
handle.onpointerdown=e=>{if(!selected())return;e.preventDefault();e.stopPropagation();clearPreview();beginGesture('radius-drag');dragging=true;handle.setPointerCapture(e.pointerId);};
handle.onpointermove=e=>{if(!dragging)return;const point=new DOMPoint(e.clientX,e.clientY).matrixTransform($('#stage').getScreenCTM().inverse());updateParam('radius',point.x-690);syncNumber('radius');};
function finishDrag(){if(!dragging)return;dragging=false;finishGesture();refreshAfterGesture();}
handle.onpointerup=finishDrag;handle.onpointercancel=finishDrag;handle.onlostpointercapture=finishDrag;
handle.onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();change(()=>updateParam('radius',selected().radius+(e.key==='ArrowLeft'?-1:1)*(e.shiftKey?1:5)));handle.focus();}};
window.addEventListener('pagehide',()=>{finishGesture();persist();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){finishGesture();persist();}});
normalize();render();status(loaded?'Черновик восстановлен с этого устройства':'Черновик сохраняется на этом устройстве');
requestAnimationFrame(tick);
