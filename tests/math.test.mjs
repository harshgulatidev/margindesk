import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate, defaults} from '../dist/math.js';
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-7,`${actual} != ${expected}`);
test('discount, shipping, packaging and percentage fees combine correctly',()=>{
  const r=calculate(defaults);close(r.revenue,719.1);close(r.platformFee,57.528);close(r.costs,482.528);close(r.profit,236.572);
});
test('suggested list price actually reaches requested margin',()=>{
  for(const fee of [0,8,35]) for(const discount of [0,10,75]) {
    const v={...defaults,fee,discount,fixed:14,target:30};
    const r=calculate(v);close(calculate({...v,price:r.suggested}).margin,30);
    close(calculate({...v,price:r.breakEven}).profit,0);
  }
});
test('100% discount has no finite break-even or target list price',()=>{
  const r=calculate({...defaults,discount:100});assert.equal(r.margin,null);assert.equal(r.breakEven,null);assert.equal(r.suggested,null);close(r.profit,-425);
});
test('losses and fixed fees are represented, not clamped',()=>{
  const r=calculate({...defaults,price:100,discount:0,fixed:5});close(r.profit,-338);close(r.margin,-338);
});
test('unreachable target is explicit',()=>assert.equal(calculate({...defaults,fee:40,target:60}).suggested,null));
test('bad inputs cannot produce misleading amounts',()=>{
  for(const patch of [{price:NaN},{cost:-1},{fee:100},{target:100},{discount:101},{shipping:Infinity},{price:1e10}]) assert.throws(()=>calculate({...defaults,...patch}));
});
test('zero-cost free offer remains defined',()=>{
  const r=calculate({...defaults,price:0,cost:0,shipping:0,packaging:0,discount:0,fee:0,fixed:0});close(r.profit,0);assert.equal(r.margin,null);close(r.breakEven,0);
});
