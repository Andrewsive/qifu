import test from 'node:test';
import assert from 'node:assert/strict';
import { createWishTransfer, wishTransferView, syncWallArrival } from '../src/wish-transfer.js';
import { RECORDING_DURATION, RECORDING_STEPS } from '../src/recording-demo.js';

test('submission lights the wall immediately and the phone then enters waiting', () => {
  const event = createWishTransfer({ wishId: 'visitor', startedAt: 1000 });
  assert.equal(wishTransferView(event, 1000).phone, 'handoff');
  assert.equal(wishTransferView(event, 1000).wallActive, true);
  assert.equal(wishTransferView(event, 4999).wallActive, true);
  assert.equal(wishTransferView(event, 5000).wall, 'settled');
  assert.equal(wishTransferView(event, 7000).phone, 'waiting');
  assert.equal(wishTransferView(event, 7000).wall, 'settled');
  assert.equal(event.endsAt, 127000);
});

test('rebinding resumes absolute wall progress and cannot replay an expired arrival', () => {
  const event = createWishTransfer({ wishId: 'visitor', startedAt: 0 });
  const nodes = new Set();
  const classes = new Set();
  const properties = new Map();
  let insertions = 0;
  const boundary = {
    dataset: {},
    classList: { add: value => classes.add(value), remove: value => classes.delete(value) },
    style: { setProperty: (key, value) => properties.set(key, value), removeProperty: key => properties.delete(key) },
    querySelector: () => [...nodes][0] || null,
    querySelectorAll: () => [...nodes],
    insertAdjacentHTML() {
      insertions++;
      for (let i = 0; i < 2; i++) {
        const node = { remove: () => nodes.delete(node) };
        nodes.add(node);
      }
    },
  };
  syncWallArrival(boundary, event, 'arrival', -1);
  assert.equal(insertions, 0);
  syncWallArrival(boundary, event, 'arrival', 200);
  assert.equal(insertions, 1);
  assert.equal(properties.get('--arrival-offset'), '-200ms');
  syncWallArrival(boundary, event, 'arrival', 2500);
  assert.equal(insertions, 1);
  assert.equal(properties.get('--arrival-offset'), '-2500ms');
  syncWallArrival(boundary, event, 'arrival', 4000);
  syncWallArrival(boundary, event, 'arrival', 16000);
  assert.equal(nodes.size, 0);
  assert.equal(classes.has('wish-arrival'), false);
  assert.equal(insertions, 1);
});

test('legacy waiting events stay settled instead of retroactively replaying', () => {
  assert.equal(wishTransferView({ phase: 'waiting', wishId: 'old', startedAt: 0 }, 5000).wallActive, false);
});

test('the recording gives the wall time to finish before lighting, within the complete crafting timeline', () => {
  const handoff = RECORDING_STEPS.find(step => step.id === 'handoff');
  const waiting = RECORDING_STEPS.find(step => step.id === 'waiting');
  const event = createWishTransfer({ wishId: 'sample', startedAt: 0, waitingMs: waiting.duration });
  assert.equal(handoff.duration, event.phoneEndsAt);
  assert.equal(handoff.duration + waiting.duration, event.endsAt);
  assert.ok(event.wallEndsAt < event.endsAt);
  assert.equal(RECORDING_DURATION, 135500);
});
