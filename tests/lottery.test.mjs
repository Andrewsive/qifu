import test from 'node:test';
import assert from 'node:assert/strict';
import { createLottery,startLottery,lotteryView,personalPrize,lotteryScene,LOTTERY_DURATION_MS } from '../src/lottery.js';
const guests=Array.from({length:12},(_,i)=>({id:i+1,participantId:'guest-'+i,serial:126+i,name:'游客'+i,wish:'平安'}));

test('one frozen participant entry covers multiple wishes and wins at most one prize',()=>{
  const snapshot=createLottery([...guests,{...guests[0],id:100}], 'round-1');
  assert.equal(snapshot.participants.length,12);assert.deepEqual(snapshot.participants[0].wishIds,['1','100']);
  const state=startLottery(snapshot,1000,()=>.5);
  assert.equal(state.winners.first.length,1);assert.equal(state.winners.second.length,2);assert.equal(state.winners.third.length,3);
  const ids=Object.values(state.winners).flat().map(p=>p.id);assert.equal(new Set(ids).size,6);
  assert.strictEqual(startLottery(state,9000,()=>0),state);
  guests.push({id:99,participantId:'late',name:'迟到游客'});assert.equal(state.participants.length,12);guests.pop();
});
test('third, second and first prizes are revealed only after each roll; refresh keeps the same winners',()=>{
  const state=startLottery(createLottery(guests,'round'),1000,()=>.5),copy=JSON.parse(JSON.stringify(state));
  for(const [at,phase,revealed]of [[1000,'rolling',[]],[4499,'rolling',[]],[4500,'reveal',['third']],[6500,'rolling',['third']],[10000,'reveal',['third','second']],[12000,'rolling',['third','second']],[15500,'reveal',['third','second','first']],[17500,'done',['third','second','first']]]){
    assert.equal(lotteryView(copy,at).phase,phase);assert.deepEqual(lotteryView(copy,at).revealed,revealed);
  }
  const winner=state.winners.first[0];assert.equal(personalPrize(state,winner.wishId,lotteryView(state,1000)),null);
  assert.equal(personalPrize(state,winner.wishId,lotteryView(state,17500)).id,'first');
  assert.deepEqual(copy.winners,state.winners);assert.equal(LOTTERY_DURATION_MS,16500);
});
test('empty and small pools do not invent winners; first prize is reserved when only one guest participates',()=>{
  const empty=createLottery([],'empty');assert.strictEqual(startLottery(empty,0),empty);assert.equal(lotteryView(empty).phase,'empty');
  for(let size=1;size<=5;size++){
    const state=startLottery(createLottery(guests.slice(0,size),'small'),0,()=>0);
    assert.equal(state.winners.first.length,1);assert.equal(Object.values(state.winners).flat().length,size);
    assert.equal(lotteryView(state,LOTTERY_DURATION_MS).phase,'done');
  }
});
test('display escapes participant names and gives a visitor no early congratulations',()=>{
  const state=startLottery(createLottery([{id:1,serial:126,name:'<script>A&B'}],'safe'),1000,()=>0);
  const rolling=lotteryScene(state,{surface:'mobile',wishId:1,now:1000});assert.doesNotMatch(rolling,/<script>|恭喜你/);assert.match(rolling,/&lt;script&gt;A&amp;B/);
  const complete=lotteryScene(state,{surface:'mobile',wishId:1,now:18000});assert.match(complete,/恭喜你，获得一等奖/);
});
