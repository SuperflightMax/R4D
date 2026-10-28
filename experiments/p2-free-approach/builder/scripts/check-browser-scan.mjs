import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scanBrowserText } from './scan-browser-text.mjs';

const i=process.argv.indexOf('--pixi');
if(i<0 || !process.argv[i+1]) throw new Error('--pixi is required');
const sdk=readFileSync(process.argv[i+1]);
const controls=[
  ['quoted-drive','const p="E:/example-private/core.ts";'],
  ['template-drive','const p=`E:/example-private/core.ts`;'],
  ['file-uri','{"url":"file:///E:/example-private/core.ts"}'],
  ['other-drive-backslash',String.raw`const p="Z:\\example-private\\data";`],
  ['lowercase-drive','const p=`d:/example-private/core.ts`;'],
  ['no-general-boundary','const p="prefixE:/example-private";'],
  ['private-checkout','const p="millionko-source/lead";'],
  ['private-source','packages/sim-core/src/Sim.ts'],
  ['source-map','//# sourceMappingURL=private.map'],
  ['http-url-with-drive','https://example.test/?local=E:/example-private'],
];
for(const [name,text] of controls) assert.ok(scanBrowserText('src/control.js',Buffer.from(text)).violations.length>0,name);
assert.equal(scanBrowserText('src/control.js',Buffer.from('https://example.test/docs')).violations.length,0);
const clean=scanBrowserText('vendor/pixi.js',sdk);
assert.deepEqual(clean.violations,[]);
assert.deepEqual(clean.exceptions,[{kind:'pinned-pixi-uri-regex',start:135846,end:135849}]);
const altered=scanBrowserText('vendor/pixi.js',Buffer.concat([sdk,Buffer.from('\nconst p=`E:/example-private/core.ts`;')]));
assert.ok(altered.violations.some(x=>x.kind==='pinned-sdk-integrity-mismatch'));
assert.ok(altered.violations.some(x=>x.kind==='absolute-drive-path'));
assert.equal(altered.exceptions.length,0);
assert.ok(scanBrowserText('src/unpinned-sdk.js',sdk).violations.length>0);
console.log(JSON.stringify({pass:true,positiveControls:controls.map(x=>x[0]),normalHttpSchemeAccepted:true,pinnedSdkExactSpanOnly:true,tamperedSdkRejected:true,renamedUnpinnedSdkRejected:true}));
