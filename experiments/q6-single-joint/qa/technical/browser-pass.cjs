async (page) => {
 const result={errors:[],warnings:[],requestFailures:[],httpErrors:[],checks:[],samples:[],layouts:[],assetResponses:[]};
 page.on('pageerror',e=>result.errors.push(String(e)));
 page.on('console',m=>{if(m.type()==='error')result.errors.push(m.text());if(m.type()==='warning')result.warnings.push(m.text());});
 page.on('requestfailed',r=>result.requestFailures.push({url:r.url(),failure:r.failure()}));
 page.on('response',r=>{if(r.status()>=400)result.httpErrors.push({url:r.url(),status:r.status()});if(/art\/.*\.png/.test(r.url()))result.assetResponses.push({url:r.url(),status:r.status()});});
 const check=(ok,name,detail)=>{result.checks.push({name,ok,detail});};
 const snap=()=>page.evaluate(()=>window.__Q6.snapshot());
 const advance=dt=>page.evaluate(dt=>window.__Q6.advance(dt),dt);
 const mode=page.getByRole('combobox',{name:'Сравнение',exact:true}), state=page.getByRole('combobox',{name:'Цель',exact:true});
 const output='D:/dev/R4D/experiments/q6-single-joint/qa/technical/output/playwright/';
 const shot=async name=>{await page.locator('#panels').screenshot({path:output+name+'.png'});};
 const layout=async name=>{const l=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,visible:[...document.querySelectorAll('article:not([hidden])')].map(a=>({id:a.dataset.panel,meta:a.querySelector('.meta').textContent,canvas:[a.querySelector('canvas').width,a.querySelector('canvas').height],rect:(()=>{let r=a.querySelector('canvas').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})()}))}));result.layouts.push({name,...l});check(l.scroll<=l.width,'no overflow '+name,l);return l;};
 const saveSample=async name=>{const s=await snap();result.samples.push({name,...s,manifest:undefined});check(!s.issues.length,'no issues '+name,s.issues);
  const neutral=s.panels.filter(p=>!p.source);check(neutral.every(p=>p.loaded),'five loaded '+name);
  const ref=JSON.stringify(neutral[0].transform);check(neutral.every(p=>JSON.stringify(p.transform)===ref),'independent transform equality '+name);
  check(s.equality.exact&&s.equality.checked.length===5,'runtime pose identity check '+name);
  // Formula derived independently from the frozen contract, without importing rig.js.
  const p=s.pose, scale=s.zoom?.84:.42,cam=s.zoom?[210,80]:[210,185],rad=Math.PI/180;
  const a=p.angle*rad,b=a+p.thigh*rad,k=b+p.shin*rad;
  const rot=(x,y,t)=>[x*Math.cos(t)-y*Math.sin(t),x*Math.sin(t)+y*Math.cos(t)];
  const hip=rot(-56,1,a),root=[cam[0]+p.x*scale,cam[1]+p.y*scale],th=[root[0]+hip[0]*scale,root[1]+hip[1]*scale];
  for(const panel of s.panels){const o=panel.source?[39,240]:[41,284],off=rot(...o,b),t=panel.transform;
   check(Math.abs(t.thigh.x-th[0])<1e-10&&Math.abs(t.thigh.y-th[1])<1e-10&&Math.abs(t.shin.x-th[0]-off[0]*scale)<1e-10&&Math.abs(t.shin.y-th[1]-off[1]*scale)<1e-10&&Math.abs(t.shin.angle-k)<1e-10,'world formula '+name+' '+panel.id);
   check(t.thigh.scale===scale&&t.shin.scale===scale&&t.thigh.scaleY===scale&&t.shin.scaleY===scale&&t.thigh.layer===-10&&t.shin.layer===-11&&JSON.stringify(t.thigh.pivot)==='[98,35]'&&JSON.stringify(t.shin.pivot)==='[102,28]','fixed contract '+name+' '+panel.id);
  }return s;
 };
 await page.setViewportSize({width:1440,height:1100});await page.reload();await page.waitForFunction(()=>window.__Q6_READY===true);
 await saveSample('initial');await layout('desktop initial');await shot('01-initial-J');
 const poses=['bind','extreme_extension','extreme_flexion','step_overlap','jump_phase'];
 for(const pose of poses){await mode.selectOption('joint');await page.getByRole('button',{name:'Сброс bind',exact:true}).click();await state.selectOption(pose);
  for(let i=1;i<=12;i++){await advance(.38/12);await saveSample(pose+'-t'+i);}
  const s=await snap(),target=(await page.evaluate(()=>window.__Q6.contract.motion.pose_matrix)).find(p=>p.id===pose);
  check(Math.abs(s.pose.shin-target.shin_relative_deg)<1e-9&&Math.abs(s.pose.thigh-target.thigh_deg)<1e-9,'pose target '+pose);
  await shot('J-'+pose);await mode.selectOption('method');await shot('M-'+pose);await layout('desktop M '+pose);
 }
 await mode.selectOption('single');
 for(const v of ['J0','J1','J2','M1','M2']){await page.getByRole('combobox',{name:'Вариант',exact:true}).selectOption(v);const l=await layout('single '+v);check(l.visible.length===1&&l.visible[0].id===v,'single shows '+v);}
 await mode.selectOption('diagnostic');await page.getByRole('button',{name:'Сброс bind',exact:true}).click();
 let diag=await saveSample('diagnostic-bind');check(Math.abs(diag.panels[5].transform.shin.y-diag.panels[0].transform.shin.y+18.48)<1e-10,'source-neutral vertical delta');
 await page.getByRole('checkbox',{name:'Кости',exact:true}).check();await page.getByRole('checkbox',{name:'Оси',exact:true}).check();await page.getByRole('checkbox',{name:'Слои',exact:true}).check();
 await shot('diagnostic-bones-layers');let l=await layout('diagnostic');check(l.visible.map(x=>x.id).sort().join(',')==='J0,source','diagnostic only J0');check(l.visible.every(x=>x.meta.includes('−10 / shin −11')),'diagnostic effective layers');
 await mode.selectOption('joint');await state.selectOption('extreme_flexion');await advance(.137);const before=await saveSample('retarget-before');await state.selectOption('jump_phase');const immediate=await saveSample('retarget-immediate');check(JSON.stringify(before.pose)===JSON.stringify(immediate.pose),'arbitrary retarget no discontinuity');
 await advance(.113);const mid=await saveSample('retarget-mid');const q=.113/.38,e=q*q*(3-2*q);check(Math.abs(mid.pose.shin-(before.pose.shin+(80-before.pose.shin)*e))<1e-10,'retarget smoothstep from current');
 await state.selectOption('extreme_extension');const now=await snap();check(JSON.stringify(now.pose)===JSON.stringify(mid.pose),'second retarget no discontinuity');await advance(.167);await saveSample('retarget-second-mid');await shot('retarget-mid');
 await page.getByRole('checkbox',{name:'Кости',exact:true}).uncheck();await page.getByRole('checkbox',{name:'Оси',exact:true}).uncheck();await page.getByRole('checkbox',{name:'Слои',exact:true}).uncheck();
 await page.getByRole('button',{name:'Играть ↔ bind',exact:true}).click();const playA=await snap();
 for(let i=0;i<12;i++){await page.waitForTimeout(45);await saveSample('RAF-'+i);}
 await page.getByRole('button',{name:'Пауза',exact:true}).click();const paused=await snap();await page.waitForTimeout(180);const held=await snap();check(held.clock===paused.clock&&JSON.stringify(held.pose)===JSON.stringify(paused.pose),'pause exact');check(paused.clock>playA.clock,'actual RAF time advances');
 await page.getByRole('button',{name:'Шаг 1/60 с',exact:true}).click();const stepped=await saveSample('UI-step');check(Math.abs(stepped.clock-held.clock-1/60)<1e-10&&stepped.paused,'UI step exact');
 await page.getByRole('button',{name:'Сброс bind',exact:true}).click();const reset=await saveSample('UI-reset');check(reset.clock===0&&reset.paused&&JSON.stringify(reset.pose)==='{"x":0,"y":0,"angle":0,"thigh":0,"shin":0}','UI reset exact');
 for(const theme of ['light','dark'])for(const zoom of ['target','zoom']){
  await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption(theme);await page.getByRole('combobox',{name:'Масштаб',exact:true}).selectOption(zoom);await state.selectOption('extreme_flexion');await advance(.38);await saveSample(theme+'-'+zoom);await shot(theme+'-'+zoom+'-J');await mode.selectOption('method');await shot(theme+'-'+zoom+'-M');await mode.selectOption('joint');
 }
 await page.setViewportSize({width:390,height:844});
 for(const group of ['joint','method','single','diagnostic']){await mode.selectOption(group);await layout('mobile '+group);await saveSample('mobile '+group);await shot('mobile-'+group);}
 result.uniqueAssetURLs=[...new Set(result.assetResponses.map(x=>x.url))];check(result.uniqueAssetURLs.length===11,'11 distinct PNG assets fetched',result.uniqueAssetURLs);
 check(!result.errors.length&&!result.warnings.length&&!result.requestFailures.length&&!result.httpErrors.length,'clean browser/network');
 await page.evaluate(r=>{window.__QA_RESULT=r;},result);
 return {samples:result.samples.length,checks:result.checks.length,failures:result.checks.filter(x=>!x.ok),errors:result.errors,warnings:result.warnings,assets:result.uniqueAssetURLs.length};
}
