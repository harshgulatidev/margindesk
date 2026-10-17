import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../app.mjs';

let server;
let origin;
before(async()=>{
  server=createApp().listen(0,'127.0.0.1');
  await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject);});
  origin=`http://127.0.0.1:${server.address().port}`;
});
after(()=>new Promise(resolve=>server.close(resolve)));
test('Node deployment serves the app and static assets with correct MIME types',async()=>{
  const home=await fetch(origin);assert.equal(home.status,200);assert.match(await home.text(),/MarginDesk — Know what you keep/);
  const module=await fetch(origin+'/math.js');assert.equal(module.status,200);assert.match(module.headers.get('content-type'),/javascript/);
  assert.equal(module.headers.get('x-content-type-options'),'nosniff');
});
test('health endpoint allows deployment readiness checks',async()=>{
  const response=await fetch(origin+'/healthz');assert.equal(response.status,200);assert.deepEqual(await response.json(),{status:'ok',app:'MarginDesk'});
});
test('repository files and private paths are not publicly served',async()=>{
  for(const path of ['/package.json','/.env','/.git/config','/server.mjs','/LICENSE','/missing']) {
    const response=await fetch(origin+path);assert.equal(response.status,404,path);
  }
});
