'use strict';
const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { pathToFileURL } = require('node:url');
const root = 'K:/Agents/R4D/Review/HO-TP-01/runtime';
const output = path.join(root, 'output/playwright');
const points = { bread: [340,680], bowl: [630,600] };
const emptyPoints = [[270,625],[495,625],[274,728],[518,709],[465,722],[409,735],[270,780],[520,628],[505,670],[350,733],[625,646],[610,549],[523,562],[1400,600],[50,50]];

async function check() {
  fs.mkdirSync(output, { recursive: true });
  const errors = [], external = [];
  const browser = await chromium.launch({ executablePath: 'C:/Users/user/AppData/Local/ms-playwright/chromium-1208/chrome-win64/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('requestfailed', request => errors.push(request.url() + ': ' + request.failure()?.errorText));
    await page.route(/^https?:\/\//, route => { external.push(route.request().url()); return route.abort(); });
    await page.clock.install({ time: new Date('2026-11-19T15:00:00Z') });
    await page.clock.pauseAt(new Date('2026-11-19T15:00:01Z'));
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await page.waitForFunction(() => window.HOTP01?.snapshot().loaded);
    const state = () => page.evaluate(() => window.HOTP01.snapshot());
    const tick = ms => page.clock.runFor(ms);
    async function clickButton(id) {
      const box = await page.locator('#' + id).boundingBox();
      await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
    }
    async function clickNative(point) {
      const box = await page.locator('#scene').boundingBox();
      await page.mouse.click(box.x + point[0]*box.width/1672, box.y + point[1]*box.height/941);
    }
    async function saveCanvas(filename, crop = null) {
      const url = await page.evaluate(crop => {
        const canvas = document.querySelector('#scene');
        if (!crop) return canvas.toDataURL('image/png');
        const target = document.createElement('canvas');
        target.width = crop[2]; target.height = crop[3];
        target.getContext('2d').drawImage(canvas, ...crop, 0, 0, crop[2], crop[3]);
        return target.toDataURL('image/png');
      }, crop);
      fs.writeFileSync(path.join(output, filename), Buffer.from(url.split(',')[1], 'base64'));
    }
    const assets = await page.evaluate(() => ({ source: window.HOTP01_ASSETS.source, objects: window.HOTP01_ASSETS.objects, expectedBothState: window.HOTP01_ASSETS.expectedBothState }));
    const refs = { source: assets.source.dataUrl };
    for (const item of ['bread','bowl']) {
      const entry = assets.objects[item].expectedState;
      const bytes = fs.readFileSync(entry.path);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
      refs[item] = 'data:image/png;base64,' + bytes.toString('base64');
      refs[item+'Alpha'] = assets.objects[item].alpha.dataUrl;
      refs[item+'Hit'] = assets.objects[item].hitMask.dataUrl;
    }
    const bothBytes=fs.readFileSync(assets.expectedBothState.path);
    assert.equal(createHash('sha256').update(bothBytes).digest('hex'),assets.expectedBothState.sha256);
    refs.both='data:image/png;base64,'+bothBytes.toString('base64');
    await page.evaluate(async refs => {
      window.__authorRefs = {};
      for (const [name,url] of Object.entries(refs)) {
        const image = new Image(); image.src = url; await image.decode();
        const canvas = new OffscreenCanvas(1672,941), ctx = canvas.getContext('2d');
        ctx.drawImage(image,0,0);
        window.__authorRefs[name] = ctx.getImageData(0,0,1672,941).data;
      }
    }, refs);
    async function measure(expected = null) {
      return page.evaluate(async expected => {
        const canvas = document.querySelector('#scene'), pixels = canvas.getContext('2d').getImageData(0,0,1672,941).data;
        const source = window.__authorRefs.source, reference = expected && window.__authorRefs[expected];
        let changed=0, outside=0, separateFragment=0, maxReferenceError=0, referenceDifferentPixels=0, referenceDifferencesOutsideFeather=0;
        const bbox=[1672,941,-1,-1];
        for (let y=0;y<941;y++) for (let x=0;x<1672;x++) {
          const i=(y*1672+x)*4;
          let diff=false, refDiff=false;
          for (let c=0;c<4;c++) {
            if (pixels[i+c]!==source[i+c]) diff=true;
            if (reference && pixels[i+c]!==reference[i+c]) { refDiff=true; maxReferenceError=Math.max(maxReferenceError,Math.abs(pixels[i+c]-reference[i+c])); }
          }
          if (refDiff) {
            referenceDifferentPixels++;
            const alpha=expected==='both'?Math.max(window.__authorRefs.breadAlpha[i],window.__authorRefs.bowlAlpha[i]):window.__authorRefs[expected+'Alpha']?.[i];
            if (alpha===0 || alpha===255) referenceDifferencesOutsideFeather++;
          }
          if (diff) {
            changed++; bbox[0]=Math.min(bbox[0],x); bbox[1]=Math.min(bbox[1],y); bbox[2]=Math.max(bbox[2],x); bbox[3]=Math.max(bbox[3],y);
            if (x>=960 || y<480) outside++;
            if (x>=495 && x<545 && y>=695 && y<730) separateFragment++;
          }
        }
        const digest=await crypto.subtle.digest('SHA-256',pixels);
        return { pixelSha256:[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join(''), changedPixels:changed, changedBBox:changed?bbox:null, outsideRoiChangedPixels:outside, separateFragmentChangedPixels:separateFragment, maxReferenceError, referenceDifferentPixels, referenceDifferencesOutsideFeather };
      }, expected);
    }
    function preserved(m) { assert.equal(m.outsideRoiChangedPixels,0); assert.equal(m.separateFragmentChangedPixels,0); }
    const initial = await state();
    assert.deepEqual(initial.availableStates,['both','bread_removed','bowl_removed','both_removed']);
    assert.equal(initial.state,'both');
    const original = await measure('source');
    assert.equal(original.changedPixels,0);
    const fit = await page.evaluate(() => {
      const r=document.querySelector('#scene').getBoundingClientRect(), f=document.querySelector('#frames');
      const controlsOutside=[...document.querySelectorAll('button,figcaption,#status,footer')].every(e=>{const b=e.getBoundingClientRect();return b.bottom<=r.top||b.top>=r.bottom||b.right<=r.left||b.left>=r.right;});
      return { width:r.width,height:r.height,right:r.right,bottom:r.bottom,documentHeight:document.documentElement.scrollHeight,frameScroll:f.scrollHeight,frameHeight:f.clientHeight,controlsOutside };
    });
    assert.equal(await page.locator('canvas').count(),1);
    assert.ok(fit.width>1400 && fit.right<=1920 && fit.bottom<=1080 && fit.documentHeight===1080 && fit.frameScroll<=fit.frameHeight+1 && fit.controlsOutside);
    assert.ok(Math.abs(fit.width/fit.height-1672/941)<0.001);

    // Compare every pixel of the runtime lookup to independent decoding of the
    // selected opaque L PNGs. Reading PNG alpha would wrongly hit the whole frame.
    const maskVerification=await page.evaluate(()=>{
      let mismatchedPixels=0,opaqueFileAlphaPixels=0;
      const nonzero={bread:0,bowl:0},total=1672*941;
      for(let index=0;index<total;index++){
        const offset=index*4,bread=window.__authorRefs.breadHit[offset]>=128,bowl=window.__authorRefs.bowlHit[offset]>=128;
        if(bread)nonzero.bread++;if(bowl)nonzero.bowl++;
        if(window.__authorRefs.breadHit[offset+3]===255&&window.__authorRefs.bowlHit[offset+3]===255)opaqueFileAlphaPixels++;
        const expected=bread?'bread':bowl?'bowl':null;
        if(window.HOTP01.contourAt(index%1672+.5,Math.floor(index/1672)+.5)!==expected)mismatchedPixels++;
      }
      return {mismatchedPixels,nonzero,opaqueFileAlphaPixels,total,decoder:window.HOTP01.snapshot().hitDecoder,masks:window.HOTP01.snapshot().hitMasks};
    });
    assert.equal(maskVerification.mismatchedPixels,0);
    assert.deepEqual(maskVerification.nonzero,{bread:16036,bowl:13742});
    assert.equal(maskVerification.opaqueFileAlphaPixels,1672*941);
    const boundaryProbes=[[350,730,'bread'],[350,731,null],[625,641,'bowl'],[625,644,null]];
    for(const[x,y,expected]of boundaryProbes)assert.equal(await page.evaluate(([x,y])=>window.HOTP01.contourAt(x,y),[x,y]),expected);
    // Diagnostic overlays of exact selected hit-mask luminance only. They never
    // appear on the playable canvas and do not expand or redraw the hit geometry.
    for (const item of ['bread','bowl']) {
      const url=await page.evaluate(item=>{
        const source=document.querySelector('#scene'), crop=item==='bread'?[176,535,480,320]:[464,480,384,256];
        const full=new OffscreenCanvas(1672,941),ctx=full.getContext('2d');ctx.drawImage(source,0,0);
        const pixels=ctx.getImageData(0,0,1672,941),mask=window.__authorRefs[item+'Hit'];
        for(let i=0;i<pixels.data.length;i+=4)if(mask[i]>=128){pixels.data[i]=Math.round(pixels.data[i]*.6);pixels.data[i+1]=Math.round(pixels.data[i+1]*.6+90);pixels.data[i+2]=Math.round(pixels.data[i+2]*.6+95);}
        ctx.putImageData(pixels,0,0);
        const target=document.createElement('canvas');target.width=crop[2]*3;target.height=crop[3]*3;
        const out=target.getContext('2d');out.imageSmoothingEnabled=false;out.drawImage(full,...crop,0,0,target.width,target.height);return target.toDataURL('image/png');
      },item);
      fs.writeFileSync(path.join(output,'hit-mask-'+item+'-v004.png'),Buffer.from(url.split(',')[1],'base64'));
    }
    const positivePoints={bread:[[300,680],[350,700],[450,670]],bowl:[[540,585],[625,575],[660,615],[725,590]]};
    for(const [item,list]of Object.entries(positivePoints))for(const [x,y]of list) assert.equal(await page.evaluate(([x,y])=>window.HOTP01.contourAt(x,y),[x,y]),item);
    for(const point of emptyPoints){
      assert.equal(await page.evaluate(([x,y])=>window.HOTP01.contourAt(x,y),point),null,'Unexpected hit at '+point);
      await clickNative(point);assert.equal((await state()).state,'both');
    }
    assert.equal((await measure()).pixelSha256,original.pixelSha256);

    const transitions={};
    async function transitionSamples(item) {
      const locations={bread:{body:[340,680],contact:[350,731]},bowl:{body:[630,600],contact:[625,644]}};
      return page.evaluate(locations=>{
        const data=document.querySelector('#scene').getContext('2d').getImageData(0,0,1672,941).data;
        return Object.fromEntries(Object.entries(locations).map(([name,[x,y]])=>{
          const i=(y*1672+x)*4;return [name,{x,y,source:[...window.__authorRefs.source.slice(i,i+3)],current:[...data.slice(i,i+3)]}];
        }));
      },locations[item]);
    }
    async function remove(item, capture=false) {
      const before=await measure();
      await clickNative(points[item]);
      assert.equal((await state()).transitionProgress[item],0);
      assert.equal((await measure()).pixelSha256,before.pixelSha256);
      const crop=item==='bread'?[176,535,480,320]:[464,480,384,256];
      if(capture) await saveCanvas(item+'-begin-v004.png',crop);
      await tick(96);
      const middle=await state(), mid=await measure();
      const midSamples=capture?await transitionSamples(item):null;
      assert.ok(middle.transitionProgress[item]>0.3 && middle.transitionProgress[item]<0.7);
      assert.notEqual(mid.pixelSha256,before.pixelSha256);preserved(mid);
      if(capture) await saveCanvas(item+'-middle-v004.png',crop);
      await tick(128);
      assert.equal((await state()).transitionProgress[item],1);
      const endSamples=capture?await transitionSamples(item):null;
      if(capture) for(const name of ['body','contact']) {
        const end=endSamples[name],mid=midSamples[name];
        assert.ok(end.current.some((value,c)=>Math.abs(value-end.source[c])>2),'No restoration at '+item+' '+name);
        for(let c=0;c<3;c++) assert.ok(Math.abs(mid.current[c]-(end.source[c]+middle.transitionProgress[item]*(end.current[c]-end.source[c])))<=2,'Object/contact transition mismatch');
      }
      if(capture) await saveCanvas(item+'-end-v004.png',crop);
      return { beginHash:before.pixelSha256,middleProgress:middle.transitionProgress[item],middle:mid,end:await measure(),middleSamples:midSamples,endSamples };
    }
    await page.screenshot({path:path.join(output,'initial-v004-1920x1080.png')});
    transitions.bread=await remove('bread',true);
    assert.equal((await state()).state,'bread_removed');
    const breadSingle=await measure('bread');preserved(breadSingle);
    assert.ok(breadSingle.maxReferenceError<=1,'Canvas vs artist bread state error >1: '+JSON.stringify(breadSingle));
    assert.equal(breadSingle.referenceDifferencesOutsideFeather,0);
    const singleEvents=(await state()).events.length;
    await clickNative(points.bread);assert.equal((await state()).events.length,singleEvents);
    assert.equal((await measure()).pixelSha256,breadSingle.pixelSha256);
    await clickButton('compare');
    assert.equal((await state()).state,'bread_removed');assert.equal((await measure()).pixelSha256,original.pixelSha256);
    await clickNative(points.bowl);assert.equal((await state()).state,'bread_removed');
    await clickButton('compare');assert.equal((await measure()).pixelSha256,breadSingle.pixelSha256);
    await clickButton('zoom');
    const native=await page.locator('#scene').boundingBox();assert.equal(native.width,1672);assert.equal(native.height,941);
    await remove('bowl'); // Actual 1:1 input exercises coordinate conversion.
    assert.equal((await state()).state,'both_removed');
    const finalA=await measure('both');preserved(finalA);
    assert.ok(finalA.maxReferenceError<=1);assert.equal(finalA.referenceDifferencesOutsideFeather,0);
    await clickButton('zoom');assert.equal((await measure()).pixelSha256,finalA.pixelSha256);
    await saveCanvas('both-removed-v004.png');
    await page.screenshot({path:path.join(output,'both-removed-v004-1920x1080.png')});
    await clickButton('reset');assert.equal((await measure()).pixelSha256,original.pixelSha256);
    transitions.bowl=await remove('bowl',true);
    assert.equal((await state()).state,'bowl_removed');
    const bowlSingle=await measure('bowl');preserved(bowlSingle);
    assert.ok(bowlSingle.maxReferenceError<=1,'Canvas vs artist bowl state error >1: '+JSON.stringify(bowlSingle));
    assert.equal(bowlSingle.referenceDifferencesOutsideFeather,0);
    await remove('bread');
    const finalB=await measure('both');assert.equal(finalB.pixelSha256,finalA.pixelSha256);assert.equal((await state()).state,'both_removed');
    assert.ok(finalB.maxReferenceError<=1);assert.equal(finalB.referenceDifferencesOutsideFeather,0);
    const endEvents=(await state()).events.length;
    await clickNative(points.bread);await clickNative(points.bowl);
    assert.equal((await state()).events.length,endEvents);assert.equal((await measure()).pixelSha256,finalA.pixelSha256);
    const orders=(await state()).events;

    for(const items of [[],['bread'],['bowl'],['bread','bowl']]){
      await clickButton('reset');
      for(const item of items) await remove(item);
      await clickButton('reset');await tick(240);
      assert.equal((await state()).state,'both');assert.equal((await state()).animating,false);assert.equal((await measure()).pixelSha256,original.pixelSha256);
    }
    // Overlapping pickups, and reset while a transition is still running.
    await clickNative(points.bread);await clickNative(points.bowl);await tick(224);
    assert.equal((await measure()).pixelSha256,finalA.pixelSha256);
    await clickButton('reset');await clickNative(points.bread);await tick(96);await clickButton('reset');await tick(300);
    assert.equal((await state()).state,'both');assert.equal((await measure()).pixelSha256,original.pixelSha256);
    await clickNative(points.bowl);await tick(96);await clickButton('compare');await tick(128);
    assert.equal((await state()).state,'bowl_removed');assert.equal((await measure()).pixelSha256,original.pixelSha256);
    await clickButton('compare');assert.equal((await measure()).pixelSha256,bowlSingle.pixelSha256);
    await clickButton('reset');
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    const result={authorCheckOnly:true,checkedUtc:new Date().toISOString(),browser:browser.version(),viewport:{width:1920,height:1080},manifestSha256:initial.manifestSha256,artStatus:initial.artStatus,fit,initial:original,maskVerification,boundaryProbes,positivePoints,emptyPoints,breadSingle,bowlSingle,transitions,finalOrderA:finalA,finalOrderB:finalB,eventsForTwoOrders:orders,checks:{realMouseInput:true,exactLumaMasksEveryPixel:true,emptyAndRepeatedClicks:true,bothOrdersSameFinal:true,selectedOfflineBothCompared:true,resetFromAllFourStates:true,resetDuringTransition:true,comparisonDisablesPickupAndPreservesState:true,comparisonDuringTransition:true,nativePixelsAndFit:true,overlappingPickups:true,outsideRoiUnchanged:true,separateFragmentUnchanged:true},consoleErrors:errors,externalRequests:external,notAccepted:['independent QA','human art acceptance','bowl upper linen seam correction','generalisation beyond these two objects']};
    fs.writeFileSync(path.join(output,'author-check-v004.json'),JSON.stringify(result,null,2)+'\n');
    console.log(JSON.stringify(result,null,2));
  }finally{await browser.close();}
}
check().catch(error=>{console.error(error);process.exitCode=1;});
