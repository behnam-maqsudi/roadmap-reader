import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const profile = mkdtempSync(join(tmpdir(), 'cdp-'))
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless=new','--remote-debugging-port=9416',`--user-data-dir=${profile}`,
   '--window-size=1600,1000','--no-first-run','--no-default-browser-check','http://localhost:5199/'],
  { stdio: 'ignore' })
let page
for (let i=0;i<100&&!page;i++){ try{ const l=await (await fetch('http://127.0.0.1:9416/json/list')).json(); page=l.find(t=>t.type==='page'&&t.webSocketDebuggerUrl) }catch{}; if(!page) await sleep(200) }
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej})
let id=0; const pend=new Map()
ws.onmessage=(e)=>{const m=JSON.parse(e.data); if(m.id&&pend.has(m.id)){const p=pend.get(m.id);pend.delete(m.id);m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result)}}
const send=(m,p={})=>{const i=++id;ws.send(JSON.stringify({id:i,method:m,params:p}));return new Promise((res,rej)=>pend.set(i,{res,rej}))}
const ev=async(x)=>{const r=await send('Runtime.evaluate',{expression:x,returnByValue:true,awaitPromise:true}); return r.exceptionDetails?{__err:r.exceptionDetails.exception?.description}:r.result.value}
await send('Runtime.enable'); await sleep(4500)

const r = await ev(`(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms))
  const phases = [...document.querySelectorAll('.phase-list-inner a, .phase-list-inner button')]
  const ids = () => [...document.querySelectorAll('.prose h1[id],.prose h2[id],.prose h3[id]')].map(h=>h.id)
  const home = phases[0]
  const before = ids()
  for (let i=1;i<phases.length;i++) { phases[i].click(); await sleep(420); home.click(); await sleep(420) }
  const after = ids()
  // کدام سطرها فرق کردند؟
  const diffs = []
  for (let i=0;i<Math.max(before.length,after.length);i++) {
    if (before[i]!==after[i]) diffs.push({i, before: before[i], after: after[i]})
  }
  return { nBefore: before.length, nAfter: after.length, diffCount: diffs.length, diffs: diffs.slice(0,8) }
})()`)
console.log(JSON.stringify(r, null, 1))
ws.close(); chrome.kill(); try{rmSync(profile,{recursive:true,force:true})}catch{}
process.exit(0)
