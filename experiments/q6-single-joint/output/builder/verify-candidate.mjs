import fs from 'node:fs';import crypto from 'node:crypto';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(fs.readFileSync('output/builder/q6-c1-files.json'));const results=[];
for(const entry of [...manifest.runtime,...manifest.immutableInputs]){const bytes=fs.readFileSync(entry.file);results.push({file:entry.file,ok:hash(bytes)===entry.sha256&&bytes.length===entry.bytes});}
const output={candidate:manifest.candidate,checked:results.length,runtime:manifest.runtimeCount,immutableInputs:manifest.inputCount,failures:results.filter(x=>!x.ok),files:results};
fs.writeFileSync('output/builder/freeze-verification.json',JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify({checked:output.checked,failures:output.failures}));if(output.failures.length)process.exitCode=1;
