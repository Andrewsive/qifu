import test from 'node:test';
import assert from 'node:assert/strict';
import { createGrowingPool,addPoolGuest,freezeGrowingPool,growingPoolEntries,growingPoolPose,POOL_INTERVAL_MS,POOL_AMBIENT_LIMIT } from '../src/growing-pool.js';
import { releaseLampPose,finaleLampPose } from '../src/ritual-motion.js';

test('the waiting pool grows from a few lights, without removing earlier lights',()=>{
  const pool=createGrowingPool(1000),first=growingPoolEntries(pool,1000),later=growingPoolEntries(pool,1000+POOL_INTERVAL_MS*12);
  assert.equal(first.length,6);assert.equal(later.length,18);
  for(const old of first)assert.deepEqual(later.find(light=>light.id===old.id),old);
});

test('each real submission adds an immediate lamp, once, independent of ambient growth',()=>{
  const before=createGrowingPool(1000),after=addPoolGuest(before,{wishId:42,type:'plum',litAt:1600});
  assert.equal(growingPoolEntries(after,1600).length,growingPoolEntries(before,1600).length+1);
  assert.equal(addPoolGuest(after,{wishId:'42',litAt:1700}),after);
  assert.ok(growingPoolEntries(after,120000).some(light=>light.wishId==='42'));
});

test('existing lamp positions remain stable as more guests and ambience arrive',()=>{
  let pool=addPoolGuest(createGrowingPool(0),{wishId:1,litAt:100});
  const old=growingPoolEntries(pool,200).map(light=>({id:light.id,pose:growingPoolPose(light)}));
  pool=addPoolGuest(pool,{wishId:2,litAt:3000});
  for(const light of old)assert.deepEqual(growingPoolPose(growingPoolEntries(pool,20000).find(item=>item.id===light.id)),light.pose);
  for(const light of growingPoolEntries(pool,20000)){const p=growingPoolPose(light);assert.ok(p.y>=.665&&p.y<=.815)}
});

test('release freezes accumulation; restarting begins a new sparse pool',()=>{
  const pool=freezeGrowingPool(addPoolGuest(createGrowingPool(0),{wishId:1,litAt:100}),10000);
  assert.deepEqual(growingPoolEntries(pool,10000),growingPoolEntries(pool,999999));
  assert.equal(addPoolGuest(pool,{wishId:2,litAt:10001}),pool);
  assert.equal(growingPoolEntries(createGrowingPool(20000),20000).length,6);
});

test('long waits bound ambience but retain every submitted lamp',()=>{
  const pool=addPoolGuest(createGrowingPool(0),{wishId:1,litAt:100});
  assert.equal(growingPoolEntries(pool,86400000).length,POOL_AMBIENT_LIMIT+1);
});

test('the accumulated cohort starts flying from its pool positions and remains at the finale cut',()=>{
  const origins=growingPoolEntries(createGrowingPool(0),40000).map(growingPoolPose);
  for(let i=0;i<origins.length;i++){
    const initial=releaseLampPose(i,0,origins[i]);
    assert.equal(initial.x,origins[i].x);assert.equal(initial.y,origins[i].y);assert.equal(initial.alpha,1);
    const end=releaseLampPose(i,12,origins[i]),finale=finaleLampPose(i,0,{x:.5,y:.5},origins);
    assert.equal(end.x,finale.x);assert.equal(end.y,finale.y);assert.equal(finale.alpha,1);
  }
});
