import{Application,Assets,MeshSimple,Container,Graphics}from'pixi.js';
import{tracedGeometry}from'../builder/early-v02-03/geometry.mjs';
import{materialMeshes,materialPose,boundaryPose,boundaryAudit}from'./boundary-cloth.mjs';

const input=await(await fetch('stage-a-input.json')).json();
const faces=tracedGeometry(input.trace,input.source.cropRect);
const {meshes}=materialMeshes(faces,input.source.cropRect,input.source.cells);
const texture=await Assets.load(`art/${input.source.file}`);
const app=new Application();
const host=document.querySelector('#stage');
await app.init({resizeTo:host,antialias:true,background:'#eee9df',resolution:Math.min(devicePixelRatio,2),autoDensity:true});
host.appendChild(app.canvas);
app.canvas.setAttribute('aria-label','Технический просмотр near/far ткани на сохранённых позах');
const container=new Container();const lines=new Graphics();app.stage.addChild(container);
const objects={};
for(const side of['far','near']){
  const m=meshes[side];objects[side]=new MeshSimple({texture,vertices:m.vertices,uvs:m.uvs,indices:m.indices});
  container.addChild(objects[side]);
}
container.addChild(lines);
const samples=input.samples;
for(let i=0;i<samples.length;i++)document.querySelector('#sample').add(new Option(samples[i].label,String(i)));
const bounds={minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};
for(const s of samples)for(const m of Object.values(meshes))for(const p of materialPose(m,input.rest,s.pose)){
  bounds.minX=Math.min(bounds.minX,p.x);bounds.minY=Math.min(bounds.minY,p.y);
  bounds.maxX=Math.max(bounds.maxX,p.x);bounds.maxY=Math.max(bounds.maxY,p.y);
}
const coverage=input.report.sourceCoverage;
document.querySelector('#gate').textContent=`Этап A: ${input.report.result}. Геометрия остановлена после первого полного gate; покрытие B и repair не выполнялись.`;
document.querySelector('#coverage').textContent=`Всего ${coverage.nonzero} ненулевых ячеек: near ${coverage.near}, far ${coverage.far}. Исключено ${coverage.unassigned}; двойных видимых владельцев ${coverage.duplicateVisibleOwner}. ${coverage.outsideTraceButIncluded} ячеек вне приблизительной трассы также включены через ближайшую аффинную грань; из них ${coverage.outsideTraceVisibleSource} — видимый v02. Скрытое расширение overlap: 0 px.`;
function draw(){
  const row=samples[Number(document.querySelector('#sample').value)];
  const dark=document.querySelector('#background').value==='dark';
  app.renderer.background.color=dark?'#242631':'#eee9df';
  const w=bounds.maxX-bounds.minX,h=bounds.maxY-bounds.minY;
  const scale=Math.min((app.screen.width-90)/w,(app.screen.height-90)/h);
  container.scale.set(scale);container.position.set((app.screen.width-w*scale)/2-bounds.minX*scale,
    (app.screen.height-h*scale)/2-bounds.minY*scale);
  lines.clear();
  for(const side of['near','far']){
    const m=meshes[side],posed=materialPose(m,input.rest,row.pose),vertices=objects[side].vertices;
    for(let i=0;i<posed.length;i++){vertices[i*2]=posed[i].x;vertices[i*2+1]=posed[i].y;}
    if(document.querySelector('#wire').checked)for(const f of m.faces){
      const p=boundaryPose(f,input.rest,row.pose);
      for(const audit of boundaryAudit(f,p)){
        const q=audit.indices.map(i=>p[i]);
        lines.moveTo(q[0].x,q[0].y).lineTo(q[1].x,q[1].y).lineTo(q[2].x,q[2].y).closePath()
          .stroke({width:0.6/scale,color:audit.inverted?0xff3333:side==='near'?0x007fa3:0xc5298b,alpha:0.8});
      }
    }
    const result=input.report.rows.find(r=>r.pose===row.label&&r.side===side);
    if(result.first){const q=result.first.target[0];lines.circle(q.x,q.y,3/scale).fill(0xff2222);}
  }
  const results=input.report.rows.filter(r=>r.pose===row.label);
  document.querySelector('#numbers').textContent=results.map(r=>`${r.side}: отрицательных треугольников ячеек alpha≥1 / ≥128: ${r.invertedCellTriangles.alpha1} / ${r.invertedCellTriangles.alpha128}`).join(' · ');
}
for(const id of['sample','wire','background'])document.querySelector(`#${id}`).addEventListener('change',draw);
app.ticker.add(()=>{if(app.screen.width!==draw.width||app.screen.height!==draw.height){draw.width=app.screen.width;draw.height=app.screen.height;draw();}});
draw();
