// Planning-only rendering. Reads the intact SVG; no parts, masks, rig or runtime.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async () => {
 const svg=fs.readFileSync(path.join(__dirname,'pose-guide.svg'));
 await sharp(svg).png().toFile(path.join(__dirname,'pose-guide.png'));
 console.log('Rendered whole pose-guide.png, 1024x1536 RGBA.');
})().catch(e=>{console.error(e);process.exitCode=1;});
