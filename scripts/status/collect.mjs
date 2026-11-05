import { readFile, writeFile } from 'node:fs/promises';
import { services, validFeed } from './model.mjs';
const output=process.argv[2] || 'apps/docs/public/status.json';
let previous={version:1,samples:[]};
try { const data=JSON.parse(await readFile(output,'utf8')); if(!validFeed(data)) throw Error('Invalid history'); previous=data; } catch(e) { if(e.code!=='ENOENT') throw e; }
const timeout=()=>AbortSignal.timeout(20000);
async function page(url) { const r=await fetch(url,{signal:timeout()}); if(!r.ok || !(await r.text()).includes('کاشی')) throw Error('page'); }
async function file(url,zip=false) {
  const r=await fetch(url,{signal:timeout(),headers:{Range:'bytes=0-1023'}});
  if(!r.ok || !r.body) throw Error('download');
  const reader=r.body.getReader(); const {value}=await reader.read(); await reader.cancel();
  if(!value || (zip ? value[0]!==80||value[1]!==75 : value[0]!==31||value[1]!==139)) throw Error('format');
}
const packages=JSON.parse(await readFile('package.json','utf8')).workspaces.filter(p=>p.startsWith('packages/'));
const probes={
  site:()=>Promise.all(['https://kashi.sepantapouya.com/','https://kashi.sepantapouya.com/docs/installation/'].map(page)),
  figma:()=>file('https://kashi.sepantapouya.com/downloads/kashi-figma-plugin.zip',true),
  npm:()=>Promise.all(packages.map(async p=>{
    const {name}=JSON.parse(await readFile(`${p}/package.json`,'utf8'));
    const r=await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`,{signal:timeout()});
    if(!r.ok) throw Error('registry'); const data=await r.json();
    if(!data.version || !data.dist?.tarball?.startsWith('https://registry.npmjs.org/')) throw Error('metadata');
    await file(data.dist.tarball);
  })),
};
const checks=Object.fromEntries(await Promise.all(services.map(async ({id})=>{
  const start=performance.now(); let state='up';
  try {await probes[id]();} catch {state='down';}
  return [id,{state,ms:Math.round(performance.now()-start)}];
})));
const sample={at:new Date().toISOString(),source:process.env.GITHUB_ACTIONS?'github-actions':'local',checks};
const cutoff=Date.now()-90*86400000;
const samples=[...previous.samples.filter(s=>Date.parse(s.at)>cutoff),sample].slice(-5000);
await writeFile(output,JSON.stringify({version:1,samples}));
console.log(JSON.stringify(sample,null,2));
