import {createSimRunSession,stepSimRunSession,timeoutSimRunSession} from './native-core.js';

export const CORE_COMMIT='5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023';
export const P1_COMMIT='4b47db04c7140ebf88f69b91faa0b790d46f22ec';
export function uintSeed(value){
 const number=Number(value);
 if(!Number.isInteger(number)||number<0||number>0xffffffff)throw Error('Seed: целое число от 0 до 4294967295');
 return number;
}
export function makeRun(baseline,seed){
 const config=structuredClone(baseline);config.rng.seed=uintSeed(seed);
 const hits=[];
 const session=createSimRunSession(config,{onEvent:event=>{if(event.type==='object_hit')hits.push(structuredClone(event));}});
 const states=[structuredClone(session.state)];
 const maxTicks=Math.ceil(config.board.timeSecMax*1000/config.defaults.tickMs);
 while(!session.state.done && session.state.tick<maxTicks){stepSimRunSession(session);states.push(structuredClone(session.state));}
 if(!session.state.done){timeoutSimRunSession(session);states[states.length-1]=structuredClone(session.state);}
 return {config,seed,states,hits,lastTick:states.length-1,result:structuredClone(session.state.result)};
}
export function checkpoint(run,tick,build){
 return {schema:'r4d-p3-checkpoint-v1',coreCommit:CORE_COMMIT,p1Commit:P1_COMMIT,configSha256:build.configSha256,projectionSha256:build.projectionSha256,
  seed:run.seed,dropId:run.config.board.drops[0].id,config:structuredClone(run.config),tick,state:structuredClone(run.states[tick])};
}
const canonical=value=>JSON.stringify(value,(_,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
export function importCheckpoint(data,baseline,build){
 if(data.schema!=='r4d-p3-checkpoint-v1'||data.coreCommit!==CORE_COMMIT||data.p1Commit!==P1_COMMIT||data.configSha256!==build.configSha256||data.projectionSha256!==build.projectionSha256)throw Error('Checkpoint другой версии ядра, геометрии или проекции');
 const seed=uintSeed(data.seed),expected=structuredClone(baseline);expected.rng.seed=seed;
 if(canonical(data.config)!==canonical(expected)||data.dropId!==expected.board.drops[0].id)throw Error('Checkpoint меняет общие условия запуска');
 const run=makeRun(baseline,seed);
 if(!Number.isInteger(data.tick)||data.tick<0||data.tick>run.lastTick||canonical(data.state)!==canonical(run.states[data.tick]))throw Error('Состояние checkpoint не совпало с настоящим повтором');
 return {run,tick:data.tick};
}
