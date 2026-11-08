import test from 'node:test';
import assert from 'node:assert/strict';
import { createCraftPhase,nextCraftPhase,writingDuration,renderCraftScene,validateCraftWish } from '../src/lantern-crafting.js';
import { RECORDING_STEPS,RECORDING_COLLECTION_MS } from '../src/recording-demo.js';

test('craft animations resume on an absolute clock and stop for the visitor’s next action',()=>{
  for(const [phase,next] of [['unfolding','frame'],['shaping','write'],['writing','ignite'],['igniting','ready']]){
    const state=createCraftPhase(phase,1000,'愿家人平安');
    assert.equal(nextCraftPhase(state,state.endsAt-1),null);
    assert.equal(nextCraftPhase(JSON.parse(JSON.stringify(state)),state.endsAt),next);
    assert.equal(nextCraftPhase(createCraftPhase(next,state.endsAt),999999),null);
  }
  assert.ok(writingDuration('愿家人平安')<writingDuration('愿家人岁岁平安愿山河锦绣愿新岁万事顺遂'));
});

test('blank paper contains no default blessing; writing safely places each visitor character on the lamp',()=>{
  const blank=renderCraftScene({craft:createCraftPhase('write',1000),form:{type:'plum'}});
  assert.doesNotMatch(blank,/class="wish-letter"/);
  const writing=renderCraftScene({craft:createCraftPhase('writing',1000,'平安<&'),form:{type:'plum'},draft:{serial:158,name:'<游客>',wish:'平安<&'},now:1800});
  assert.equal((writing.match(/class="wish-character"/g)||[]).length,4);
  assert.match(writing,/--craft-offset:-800ms/);
  assert.match(writing,/&lt;游客&gt;/);
  assert.doesNotMatch(writing,/<游客>/);
  assert.match(validateCraftWish('  ','小溪'),/祝福/);
  assert.match(validateCraftWish('岁岁平安','  '),/落款/);
  assert.equal(validateCraftWish('岁岁平安','小溪'),'');
});

test('recording includes the whole craft ritual before submitting to the shared collection round',()=>{
  const ids=RECORDING_STEPS.map(step=>step.id);
  const steps=['choose','unfolding','frame','shaping','write','writing','ignite','igniting','generated','handoff','waiting','lighting'];
  for(let i=1;i<steps.length;i++)assert.ok(ids.indexOf(steps[i-1])<ids.indexOf(steps[i]));
  assert.equal(RECORDING_COLLECTION_MS,52000);
});
