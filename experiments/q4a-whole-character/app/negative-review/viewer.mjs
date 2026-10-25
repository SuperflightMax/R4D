import{Application,Assets,Container,Graphics,MeshSimple}from'pixi.js';
const $=id=>document.getElementById(id);
let data,manifest,selected=0,index=0,timer=null,acceptedView,rejectedView;
const json=async url=>{const r=await fetch(url);if(!r.ok)throw new Error(`${url}: HTTP${r.status}`);return r.json();};
const clearPlay=()=>{if(timer){clearInterval(timer);timer=null;}$('play').textContent='Проиграть';$('play-status').textContent='Пауза';};
async function meshView(host){
 const app=new Application();await app.init({resizeTo:host,backgroundAlpha:0,antialias:true,preference:'webgl',autoDensity:true,resolution:Math.min(devicePixelRatio,2)});
 app.ticker.stop();host.appendChild(app.canvas);app.canvas.setAttribute('role','img');app.canvas.setAttribute('aria-label',host.getAttribute('aria-label'));
 const texture=await Assets.load('assets/hip-texture.png'),group=new Container();app.stage.addChild(group);
 const mesh=new MeshSimple({texture,vertices:new Float32Array(data.rest.vertices.flat()),uvs:new Float32Array(data.rest.vertices.flatMap(([x,y])=>[x/1024,y/1536])),indices:new Uint16Array(data.rest.triangles.flat())});
 const grid=new Graphics(),focus=new Graphics();group.addChild(mesh,grid,focus);let last=null;
 function draw(vertices,showGrid,showTexture,rejected=false){
  last=[vertices,showGrid,showTexture,rejected];mesh.vertices.set(vertices.flat());mesh.visible=showTexture;
  const scale=Math.min((app.screen.width-30)/430,(app.screen.height-24)/420);
  group.scale.set(scale);group.position.set((app.screen.width-430*scale)/2-330*scale,(app.screen.height-420*scale)/2-580*scale);
  grid.clear();if(showGrid){for(const t of data.rest.triangles){const p=t.map(i=>vertices[i]);grid.moveTo(...p[0]).lineTo(...p[1]).lineTo(...p[2]).closePath();}grid.stroke({width:.65,color:document.body.dataset.theme==='dark'?0xd5ebe5:0x1f615d,alpha:.52});}
  focus.clear();if(showGrid||rejected){const p=data.rejected.indices.map(i=>vertices[i]);focus.moveTo(...p[0]).lineTo(...p[1]).lineTo(...p[2]).closePath().stroke({width:2.2,color:0xd24250});}
  app.renderer.render({container:app.stage});
 }
 const ro=new ResizeObserver(()=>{app.resize();if(last)draw(...last);});ro.observe(host);
 return{draw};
}
function source(){const item=data.wholes[selected];$('whole').src=item.asset;$('shoulder').src=item.shoulderAsset;$('hip-context').src=item.hipAsset;$('open-whole').href=item.asset;$('whole-title').textContent=item.label;$('source-status').textContent=item.status;$('shoulder-note').textContent=item.shoulderNote;$('source-origin').textContent=`${item.catalogStatus} Происхождение: ${item.origin} · SHA256 ${item.sha256}`;$('source-review').href=item.review;}
function frame(){const row=data.accepted[index];$('frame').value=String(index);$('frame-label').textContent=`Состояние ${index} · принято`;$('drop-label').textContent=`Опускание таза ${(row.low*230).toFixed(4).replace('.',',')} /230 px исходника`;$('full-range').value=index;$('full-range-label').textContent=`${index} /240 полного диапазона. Доступны только состояния low0…25.`;$('frame-metrics').textContent=`low${index}/240 · σmin ${row.minSingularValue.toPrecision(8)} · condition ${row.maxCondition.toPrecision(6)} · pin error ${row.pinErrorPx}`;acceptedView?.draw(row.vertices,$('mesh').checked,$('texture').checked,false);window.__negativeReviewState={acceptedIndex:index,acceptedCount:data.accepted.length,playing:!!timer,rejectedInPlayback:false,interpolation:false};}
async function rejected(){if(!$('rejected').open)return;clearPlay();frame();if(!rejectedView)rejectedView=await meshView($('rejected-stage'));rejectedView.draw(data.rejected.vertices,true,true,true);}
function play(){if(timer){clearPlay();frame();return;}if(index===25)index=0;timer=setInterval(()=>{if(index>=25){clearPlay();frame();return;}index+=1;frame();if(index===25){clearPlay();frame();}},Number($('speed').value));$('play').textContent='Пауза';$('play-status').textContent='Показ сохранённых состояний';frame();}
try{
 [data,manifest]=await Promise.all([json('data/evidence.json'),json('source-manifest.json')]);
 if(data.accepted.length!==26||data.accepted.some((r,i)=>r.label!==`low-${i}`)||data.rejected.meta.outputIndex!==26)throw new Error('Неверный frozen output set');
 for(const[itemIndex,item]of data.wholes.entries())$('source-select').add(new Option(item.label,String(itemIndex)));
 selected=4;$('source-select').value='4';source();acceptedView=await meshView($('accepted-stage'));frame();
 for(const id of['play','restart','frame','source-select'])$(id).disabled=false;
 $('candidate-version').textContent=`${manifest.version} · source package ${data.sourceCommit} · ${manifest.entries.length} записей происхождения. Локальные файлы, без CDN и внешних запросов.`;
 $('loading').textContent='Локальные данные загружены. Показ остановлен.';
 $('source-select').addEventListener('change',e=>{selected=Number(e.target.value);source();});
 $('frame').addEventListener('input',e=>{clearPlay();index=Number(e.target.value);frame();});
 $('play').addEventListener('click',play);$('restart').addEventListener('click',()=>{clearPlay();index=0;frame();});
 $('speed').addEventListener('change',()=>{if(timer){clearPlay();play();}});
 for(const id of['mesh','texture'])$(id).addEventListener('change',frame);
 $('theme').addEventListener('change',()=>{document.body.dataset.theme=$('theme').value;frame();rejectedView?.draw(data.rejected.vertices,true,true,true);});
 $('rejected').addEventListener('toggle',()=>{rejected().catch(fail);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clearPlay();frame();}});
}catch(error){fail(error);}
function fail(error){clearPlay();$('error').hidden=false;$('error').textContent=`Данные не удалось показать: ${error.message}. Управление заблокировано; это не отсутствие данных исследования.`;for(const id of['play','restart','frame'])$(id).disabled=true;console.error(error);}
