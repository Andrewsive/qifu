import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_TRACK,quadAt,homography,project,textOpacity,upsertFrame } from '../experiments/video-wish/tracking.js';
import { textLayout } from '../experiments/video-wish/renderer.js';

test('projective mapping puts every texture corner exactly on the moving lamp',()=>{
  for(const t of [0,.14,.5,1.17,2,3,6]){
    const q=quadAt(t),matrix=homography(q);
    [[0,0],[1,0],[1,1],[0,1]].forEach((p,i)=>project(matrix,...p).forEach((v,axis)=>assert.ok(Math.abs(v-q[i][axis])<1e-7)));
  }
});
test('seeking and restarting use absolute video time; distant lettering fades away',()=>{
  assert.deepEqual(quadAt(-1),DEFAULT_TRACK[0].q);assert.deepEqual(quadAt(7),DEFAULT_TRACK.at(-1).q);
  assert.deepEqual(quadAt(.5),DEFAULT_TRACK.find(f=>f.t===.5).q);
  assert.equal(textOpacity(0),1);assert.equal(textOpacity(3.25),0);assert.equal(textOpacity(6),0);
});
test('calibration changes one time point while preserving the rest of the trajectory',()=>{
  const q=[[0,0],[10,0],[9,20],[1,20]],track=upsertFrame(DEFAULT_TRACK,.5,q);
  assert.equal(track.length,DEFAULT_TRACK.length);assert.deepEqual(quadAt(.5,track),q);
  assert.deepEqual(quadAt(2,track),quadAt(2));assert.notEqual(track,DEFAULT_TRACK);
});
test('a long wish remains within the text texture and metadata is independent',()=>{
  const data={wish:'愿家人平安喜乐岁岁常安愿山河锦绣岁岁团圆愿新岁万事顺遂',name:'测试游客',serial:'018'};
  for(const item of textLayout(data)){assert.ok(item.x>=0&&item.x<=384);assert.ok(item.y>=0&&item.y<=640)}
  assert.equal(textLayout(data)[0].text,'018');assert.equal(textLayout(data)[1].text,'测试游客');
});
