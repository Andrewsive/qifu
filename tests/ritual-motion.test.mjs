import test from 'node:test';
import assert from 'node:assert/strict';
import { floatingPose, releaseLampPose, finaleLampPose, heroPose, finalePhase, fireworkBursts, RELEASE_DURATION_MS, FINALE_DURATION_MS, isFinaleStage } from '../src/ritual-motion.js';
import { poolLantern, releaseCanvas, releasePhoneScene } from '../src/ritual-views.js';
import { RECORDING_STEPS } from '../src/recording-demo.js';

test('collection stays low and floating for all visitors and never turns into an ascent', () => {
  for(let i=0;i<120;i++)for(const time of [0,4,30,300]){
    const p=floatingPose('visitor-'+i,time);
    assert.ok(p.y>=.67&&p.y<=.82);assert.ok(p.x>=.08&&p.x<=.92);
  }
  assert.equal(poolLantern().replace(/<[^>]*>/g,''),'');
});

test('girl lights a shared blank main lantern on both screens, with personal identity kept outside the animation', () => {
  const mine={id:'alice',serial:1,name:'小溪',wish:'家人安康'},picked={id:'bob',serial:2,name:'阿禾',wish:'学业有成'};
  const phone=releasePhoneScene(mine,picked),wall=releaseCanvas(null);
  assert.match(phone,/少女点灯/);assert.match(phone,/第 1 盏 · 小溪/);
  assert.match(phone,/data-wish-id=""/);assert.match(phone,/data-wish=""/);
  assert.doesNotMatch(phone,/家人安康|data-wish-id="alice"/);
  assert.doesNotMatch(phone,/学业有成|release-lucky/);
  assert.match(wall,/孔明灯共同放飞动画/);assert.doesNotMatch(wall,/bob|学业有成/);
  assert.doesNotMatch(releasePhoneScene(picked,picked),/release-lucky|恭喜|幸运/);
});

test('wish payloads remain escaped in the release canvas', () => {
  const html=releaseCanvas({id:1,wish:'"<script>',name:'A&B',serial:1});
  assert.doesNotMatch(html,/<script>/);assert.match(html,/&quot;&lt;script&gt;/);assert.match(html,/A&amp;B/);
});

test('main lantern and its background preserve their position at the cut to the far shot', () => {
  const release=heroPose(12),start=heroPose(0,true);
  assert.ok(Math.abs(release.x-start.x)<1e-10);assert.ok(Math.abs(release.y-start.y)<1e-10);assert.ok(Math.abs(release.scale-start.scale)<1e-10);
  for(let i=0;i<80;i++){
    const from=releaseLampPose(i,12),to=finaleLampPose(i,0,{x:.4,y:.5});
    assert.equal(from.x,to.x);assert.equal(from.y,to.y);assert.equal(to.alpha,1);
  }
});

test('released lanterns remain in view and hold the greeting after forming', () => {
  const target={x:.32,y:.56};
  for(let i=0;i<920;i++)for(const t of [0,6,12,17,28,120]){
    const p=finaleLampPose(i,t,target);
    assert.ok(p.x>=.03&&p.x<=.97);assert.ok(p.y>=.2&&p.y<=.9);
    if(t>=17){assert.ok(Math.abs(p.x-target.x)<1e-10);assert.ok(Math.abs(p.y-target.y)<1e-10);assert.equal(p.alpha,1)}
  }
});

test('the greeting forms before fireworks, with a readable hold and a lasting happy ending', () => {
  assert.equal(isFinaleStage('close'),true);assert.equal(isFinaleStage('glow'),true);assert.equal(isFinaleStage('collect'),false);
  assert.equal(finalePhase(6).id,'pullback');assert.equal(finalePhase(10).id,'forming');
  assert.equal(finalePhase(18).id,'greeting');assert.equal(fireworkBursts(19.99).length,0);
  assert.ok(fireworkBursts(21).length>0);assert.equal(finalePhase(29).title,'新年快乐');
  assert.equal(RECORDING_STEPS.find(s=>s.id==='lighting').duration,RELEASE_DURATION_MS);
  assert.ok(RECORDING_STEPS.find(s=>s.id==='glow').duration>FINALE_DURATION_MS);
});
