// Exact, small adapter for the Artist's actual early sphere/shadow packet.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { root,runtime } from './paths.mjs';

const commit='1adf57cfde5a20855c02a846baa045936e4d5a6d';
const prefix='experiments/p6-geometry-first-art/asset-artist/';
const pins={
  'SPRITE_PACKET_V01.json':'d23452ebeaa45725175fbc5d915420df0f2c60f13205eeffd3599622069640cb',
  'raw/ball-v01.png':'378cc5abe32dc2086bf87c580c31675d06b91b41bbef81065bc5fe786b88542c',
  'raw/ball-shadow-v01.png':'3a4e58a4d3b9b707e6ec10ffe80e26c561605a4f99d5498c04ae5c684cf5606a',
};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');

export function prepareSpriteV01(){
  const checkout=path.resolve(root,'../../..');
  const dir=path.join(runtime,'candidates','integration-02','assets-input');
  fs.mkdirSync(dir,{recursive:true});
  const sourceFiles=[];
  for(const [file,expected] of Object.entries(pins)){
    const gitBytes=execFileSync('git',['-C',checkout,'show',`${commit}:${prefix}${file}`],{cwd:checkout,maxBuffer:16*1024*1024});
    let bytes=gitBytes,source='exact Git blob',gitSha256=sha(gitBytes);
    if(file==='SPRITE_PACKET_V01.json'){
      // Lead explicitly authorizes these exact local P6 bytes. The supplied hash is CRLF;
      // Git's LF blob is independently pinned and compared, never silently substituted.
      if(gitSha256!=='5ef0efec3633755935fa260a13f0e4e218da16e1479b54c4caee7d3b0d32bb6c')throw new Error('Unexpected Git sprite packet');
      bytes=fs.readFileSync(path.join('E:/R4D/perspective/p6-worktrees/asset-artist',prefix,file));
      if(!gitBytes.equals(Buffer.from(bytes.toString('utf8').replaceAll('\r\n','\n'))))throw new Error('Local packet differs beyond CRLF');
      source='authorized local P6 bytes; exact CRLF packet hash; Git LF equivalence checked';
    }
    if(sha(bytes)!==expected)throw new Error(`Sprite source hash mismatch: ${file}`);
    const target=path.join(dir,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
    sourceFiles.push({file,source,bytes:bytes.length,sha256:expected,gitSha256,...(file.endsWith('.png')?{canvas:[bytes.readUInt32BE(16),bytes.readUInt32BE(20)]}:{})});
  }
  const packet=JSON.parse(fs.readFileSync(path.join(dir,'SPRITE_PACKET_V01.json')));
  const cfg=JSON.parse(fs.readFileSync(path.join(root,'inputs/config.json')));
  if(packet.physicalRadiusNative!==cfg.board.ball.r||packet.ball.visualLiftPx!==0)throw new Error('Unexpected actual packet radius/lift');
  for(const [file,canvas] of [[packet.ball.texture,packet.ball.canvas],[packet.shadow.texture,packet.shadow.canvas]]){
    const source=sourceFiles.find(f=>f.file===file);
    if(!source||JSON.stringify(source.canvas)!==JSON.stringify(canvas))throw new Error(`Actual PNG canvas differs from packet: ${file}`);
  }
  const draft=fs.readFileSync(path.join(root,'draft-v01/geometry-draft.png'));
  const draftHash=sha(draft);
  if(draftHash!=='bc13aa13e2b33b0e58cd0e87b90e684c3c4adbb3576d8d9b0379e3dee1bec532')throw new Error('Frozen draft differs');
  fs.writeFileSync(path.join(dir,'geometry-draft.png'),draft);
  const b=packet.ball,s=packet.shadow;
  const adapter={
    schema:'r4d.p6.artist-adapter.v1',id:'p6-integration-02-sprite-v01',stage:'sphere-shadow-only',
    status:'actual sphere/shadow over frozen geometry draft; board occlusion layers absent',
    p1Commit:packet.acceptedP1,configSha256:packet.configSha256,manifestSha256:packet.manifestSha256,
    width:1536,height:1536,
    spriteSource:{commit,packet:prefix+'SPRITE_PACKET_V01.json',packetSha256:pins['SPRITE_PACKET_V01.json'],files:sourceFiles},
    layers:[{id:'frozen-geometry-draft',role:'background',texture:'geometry-draft.png',fullFrame:true}],
    ball:{texture:b.texture,canvas:b.canvas,center:b.centerPx,visibleRadius:b.visibleRadiusPx,
      opacity:b.opacity,visualLiftPx:b.visualLiftPx,
      scaleRule:'half distance P(x+r,y) to P(x-r,y); uniform sphere scale; center=P(x,y)',
      alphaPolicy:'raw unchanged; no alpha suppression',
      shadow:{texture:s.texture,canvas:s.canvas,center:s.centerPx,
        visibleRadii:[s.visibleRadiusPx,s.visibleRadiusPx],radiusNative:[s.groundVisibleRadiusNative,s.groundVisibleRadiusNative],
        offsetNative:s.groundOffsetNative,opacity:s.opacity,
        projectionRule:s.projectionRule,alphaPolicy:'raw unchanged; no second perspective flatten'}},
    hashes:{'geometry-draft.png':draftHash,[b.texture]:b.sha256,[s.texture]:s.sha256},
    limitations:packet.limits,
  };
  const text=JSON.stringify(adapter,null,2)+'\n';
  const artistPath=path.join(dir,'artist.json');fs.writeFileSync(artistPath,text);
  const publicDir=path.join(root,'integration-02');fs.mkdirSync(publicDir,{recursive:true});
  fs.writeFileSync(path.join(publicDir,'SPRITE_ADAPTER_V01.json'),text);
  return {artistPath,adapter,adapterSha256:sha(text)};
}
