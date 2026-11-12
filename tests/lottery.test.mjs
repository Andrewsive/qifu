import test from 'node:test';
import assert from 'node:assert/strict';
import { createLottery,startLottery,lotteryView,personalPrize,personalGift,lotteryScene,LOTTERY_DURATION_MS } from '../src/lottery.js';
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
  const complete=lotteryScene(state,{surface:'mobile',wishId:1,now:18000});assert.match(complete,/恭喜你/);assert.match(complete,/喜获一等奖/);
});

test('a winner gets congratulations and a pending voucher only when their own prize is revealed',()=>{
  const state=startLottery(createLottery(guests,'gift-round'),1000,()=>.5);
  for(const [id,revealedAt]of [['third',4500],['second',10000],['first',15500]]){
    const winner=state.winners[id][0],before=lotteryScene(state,{surface:'mobile',wishId:winner.wishId,now:revealedAt-1});
    assert.doesNotMatch(before,/lottery-winner|新春消费券|专属券码/);
    const after=lotteryScene(state,{surface:'mobile',wishId:winner.wishId,now:revealedAt});
    assert.match(after,/lottery-winner/);assert.match(after,/新春消费券/);assert.match(after,/待核销/);assert.match(after,/--win-offset:-0ms/);
    assert.doesNotMatch(after,/已核销|立即核销/);
  }
});
test('non-winners keep the current public winners list and never receive a voucher',()=>{
  const state=startLottery(createLottery(guests,'gift-round'),1000,()=>.5),ids=new Set(Object.values(state.winners).flat().map(p=>p.id)),miss=state.participants.find(p=>!ids.has(p.id));
  assert.equal(personalGift(state,miss.wishId,lotteryView(state,18000)),null);
  const html=lotteryScene(state,{surface:'mobile',wishId:miss.wishId,now:18000});
  assert.match(html,/lottery-board/);assert.doesNotMatch(html,/lottery-winner|新春消费券|savePrizeGift/);
  assert.doesNotMatch(lotteryScene(state,{surface:'wall',wishId:state.winners.first[0].wishId,now:18000}),/lottery-winner|新春消费券/);
});
test('coupons stay unique and pending after a refresh, and all wishes of one visitor share their coupon',()=>{
  const wishes=[...guests,{...guests[0],id:100}],state=startLottery(createLottery(wishes,'gift-round'),1000,()=>.99),view=lotteryView(state,18000);
  const gifts=Object.values(state.winners).flat().map(p=>personalGift(state,p.wishId,view));
  assert.equal(new Set(gifts.map(g=>g.code)).size,6);assert.ok(gifts.every(g=>g.status==='pending'));
  const first=personalGift(state,1,view),alias=personalGift(state,100,view);assert.equal(alias.code,first.code);
  const copy=JSON.parse(JSON.stringify(state));assert.equal(personalGift(copy,1,lotteryView(copy,99999)).code,first.code);
  const list=lotteryScene(state,{surface:'mobile',wishId:1,now:18000,showGift:false});assert.match(list,/lottery-board/);assert.match(list,/showPrizeGift/);assert.doesNotMatch(list,/prize-voucher/);
});
