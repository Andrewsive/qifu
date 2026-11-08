import test from 'node:test';
import assert from 'node:assert/strict';
import { createCollectionClock,collectionCountdown } from '../src/collection-clock.js';
import { createWishTransfer } from '../src/wish-transfer.js';
import { RECORDING_COLLECTION_MS,RECORDING_STEPS } from '../src/recording-demo.js';

test('a collection round has one deadline for early and late visitors',()=>{
  const clock=createCollectionClock(1000);
  const early=createWishTransfer({wishId:1,startedAt:5000,ceremonyEndsAt:clock.endsAt});
  const late=createWishTransfer({wishId:2,startedAt:90000,ceremonyEndsAt:clock.endsAt});
  assert.equal(early.endsAt,121000);assert.equal(late.endsAt,early.endsAt);
  assert.equal(collectionCountdown(clock,61000).text,'01:00');
  assert.equal(collectionCountdown({startedAt:late.startedAt,endsAt:late.endsAt},61000).text,'01:00');
});

test('countdown rounds up consistently, emphasizes the final ten seconds and clamps at zero',()=>{
  const clock=createCollectionClock(1000);
  assert.equal(collectionCountdown(clock,1000).text,'02:00');
  assert.equal(collectionCountdown(clock,110001).text,'00:11');
  assert.equal(collectionCountdown(clock,111000).urgent,true);
  assert.equal(collectionCountdown(clock,120999).text,'00:01');
  const end=collectionCountdown(clock,999999);
  assert.equal(end.text,'00:00');assert.equal(end.finished,true);assert.equal(end.urgent,false);assert.equal(end.progress,1);
});

test('accelerated wall and phone clocks finish exactly at the recorded release cue',()=>{
  const start=1000,clock=createCollectionClock(start,RECORDING_COLLECTION_MS);
  const invite=RECORDING_STEPS.findIndex(step=>step.id==='invite');
  const lighting=RECORDING_STEPS.findIndex(step=>step.id==='lighting');
  const planned=RECORDING_STEPS.slice(invite,lighting).reduce((sum,step)=>sum+step.duration,0);
  assert.equal(clock.endsAt,start+planned);assert.equal(RECORDING_COLLECTION_MS,52000);
  assert.equal(collectionCountdown(clock,start+planned-1000).text,'00:01');
  assert.equal(collectionCountdown(clock,start+planned).finished,true);
});
