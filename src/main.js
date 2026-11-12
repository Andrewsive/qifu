import { savePrizeGift } from './lottery-gift.js';
import './style.css';
import './ritual.css';
import './mobile-stages.css';
import './wish-flow.css';
import './waiting.css';
import './lighting-mobile.css';
import './handoff.css';
import './sync.css';
import './sync-compact.css';
import './crowd.css';
import './participation.css';
import './visitor-flow.css';
import './celebration.css';
import './component-fixes.css';
import './generated-preview.css';
import './mobile-fit.css';
import './recording-demo.css';
import './phone-preview.css';
import './wish-transfer.css';
import './night-tour.css';
import './night-tour-mobile.css';
import './visual-variants.css';
import './gongbi.css';
import './ink-wash.css';
import './ritual-flow.css';
import './wall-countdown.css';
import './lantern-crafting.css';
import './lottery.css';
import './lottery-gift.css';
import { createLottery,startLottery,lotteryView,lotteryScene,personalPrize,personalGift } from './lottery.js';
import { renderCraftScene, bindCraftScene, createCraftPhase, nextCraftPhase, saveCraftPicture } from './lantern-crafting.js';
import { RELEASE_DURATION_MS, isFinaleStage } from './ritual-motion.js';
import { releaseCanvas, releasePhoneScene } from './ritual-views.js';
import { mountVisualPicker } from './visual-variants.js';
import { createWishTransfer, wishTransferView } from './wish-transfer.js';
import { createGrowingPool, addPoolGuest, freezeGrowingPool, growingPoolEntries, growingPoolPose, growingPoolScale, syncGrowingPool } from './growing-pool.js';
import { createRecordingDemo, RECORDING_COLLECTION_MS } from './recording-demo.js';
import { createCollectionClock, collectionCountdown } from './collection-clock.js';
import { installMobileFit } from './mobile-fit.js';
import { renderWishLantern } from './wish-lantern.js';
import { GLOW_START_KEY, FINALE_DURATION_MS, saveFinalePicture, setCelebrationPreviewClock } from './celebration.js';
const KEY='xixi-wishes-v4',SK='xixi-stage-v4',EK='xixi-event-v4',DK='xixi-draft-v1';
const OPENING_KEY='xixi-opening-v1',VISITOR_KEY='xixi-visitor-v1',OPENING_MS=10000;
const POOL_KEY='xixi-wish-pool-v1',COLLECTION_KEY='xixi-collection-clock-v1';
const LOTTERY_KEY='xixi-lottery-v1';
let demoSandbox = null;
const glowKey = () => demoSandbox?.glowStartedAt || localStorage.getItem(GLOW_START_KEY) || "";
const opening=()=>{if(demoSandbox)return demoSandbox.opening;try{return JSON.parse(localStorage.getItem(OPENING_KEY))||{}}catch{return {}}};
const visitor=()=>{if(demoSandbox)return demoSandbox.visitor;try{return JSON.parse(sessionStorage.getItem(VISITOR_KEY))||{step:'landing',wishId:null}}catch{return {step:'landing',wishId:null}}};
function setVisitor(value){if(demoSandbox){demoSandbox.visitor={...demoSandbox.visitor,...value};return}sessionStorage.setItem(VISITOR_KEY,JSON.stringify({...visitor(),...value}))}
function personalWish(){return read().find(w=>String(w.id)===String(visitor().wishId))}
if(!visitor().participantId)setVisitor({participantId:crypto.randomUUID()});
function lotteryState(){if(demoSandbox)return demoSandbox.lottery;try{return JSON.parse(localStorage.getItem(LOTTERY_KEY))}catch{return null}}
function storeLottery(value){if(demoSandbox)demoSandbox.lottery=value;else if(value)localStorage.setItem(LOTTERY_KEY,JSON.stringify(value));else localStorage.removeItem(LOTTERY_KEY)}
function isLotteryScreen(){return stage()==='lottery'||stage()==='close'&&!!lotteryState()?.winners}
function beginLottery(autostart=true,at=Date.now()){
  const roundId=poolState().cycleId;let state=lotteryState();
  if(!state||state.roundId!==roundId){state=createLottery(read(),roundId);setVisitor({lotteryPrizeTab:'gift',lotteryPreviewWishId:null})}
  if(autostart)state=startLottery(state,at);
  storeLottery(state);setStage('lottery',at);render();
}
function runLottery(){const state=lotteryState();if(!state)return;storeLottery(startLottery(state));render()}
function replayLottery(){const state=lotteryState();if(!state?.winners)return;storeLottery({...state,startedAt:Date.now()});setStage('lottery');render()}
function lotteryViewerId(){return visitor().lotteryPreviewWishId??visitor().wishId}
function lotteryPreviewSelect(){const state=lotteryState(),view=lotteryView(state),value=visitor().lotteryPreviewWishId||'';return `<label class="lottery-preview-label">手机预览身份<select id="lotteryPreview" aria-label="手机预览身份"><option value="">当前游客</option>${(state?.participants||[]).map(p=>{const prize=personalPrize(state,p.wishId,view);return `<option value="${htmlText(p.wishId)}" ${value===p.wishId?'selected':''}>${htmlText(p.name)} · ${prize?prize.label:view.phase==='done'?'未中奖':'待开奖'}</option>`}).join('')}</select></label>`}
function lotteryTools(){const state=lotteryState(),view=lotteryView(state);return `<div class="lottery-host-tools"><p>${state?.participants.length||0} 位参与者 · 一等奖1名 / 二等奖2名 / 三等奖3名<br>头像为本地演示形象 · 同一参与者不重复获奖</p>${lotteryPreviewSelect()}<button id="startLottery" ${view.phase!=='ready'?'disabled':''}>开始头像抽奖</button><button id="replayLottery" ${view.phase!=='done'?'disabled':''}>重播开奖动画</button></div>`}
function lotteryPhone(){return `<section class="mobile mobile-v2"><div class="intro"><span>VISITOR MOBILE · 游客端</span><h2>灯市好礼</h2><p>孔明灯放飞仪式礼成，与白墙共同揭晓新春好彩头。</p></div><div class="phone"><div class="bar">19:28 <b>万愿成灯</b> •••</div><div class="scroll">${lotteryScene(lotteryState(),{surface:'mobile',wishId:lotteryViewerId(),showGift:visitor().lotteryPrizeTab!=='list',animationAt:visitor().lotteryPreviewWishId?visitor().lotteryPreviewAt:undefined})}</div></div></section>`}
function personalTransfer(){const v=visitor(),ev=event();return String(v.wishId)===String(ev.wishId)?ev:v.transfer||null}
function transferFrameKey(){return [stage(),wishTransferView(event()).key,wishTransferView(personalTransfer()).phone].join("|")}
function refreshTransferFrame(){if(stage()==='collect'&&$('main').dataset.transferKey!==transferFrameKey())render();refreshCollectionCountdowns()}
const stages=[['idle','待机','水乡画卷静候来客'],['guide','引导','扫码入市，写下新岁心愿'],['collect','互动收愿','低空亮灯，静候集体放飞'],['light','少女点灯与放飞','少女点亮主灯，万千愿灯共同启程'],['glow','万灯同辉','远景灯海汇成新年快乐，烟花贺岁'],['lottery','灯市抽奖','滚动参与者头像，揭晓一二三等奖'],['close','收束','灯火长明，好运相随']];
const types=[['lotus','莲影灯','清和如意','莲'],['moon','月白灯','长乐未央','月'],['fish','锦鲤灯','年年有余','鲤'],['plum','梅枝灯','春信先归','梅']];
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const read=()=>{if(demoSandbox)return demoSandbox.wishes;try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}},write=v=>{if(demoSandbox)demoSandbox.wishes=v;else localStorage.setItem(KEY,JSON.stringify(v));dispatchEvent(new Event('sync'))};
const stage=()=>demoSandbox?.stage||localStorage.getItem(SK)||'collect',setStage=(v,at=Date.now())=>{const previous=stage();if(v==='idle'||(['guide','collect'].includes(v)&&!['guide','collect'].includes(previous)))storePool(createGrowingPool(at));else if(['light','glow','lottery','close'].includes(v))storePool(freezeGrowingPool(poolState(),at));if(v==='idle')storeCollectionClock(null);else if(['guide','collect'].includes(v)&&!['guide','collect'].includes(previous))startCollectionClock(at);if(demoSandbox){const now=at;if(v==='idle')demoSandbox.opening={startedAt:now,endsAt:now+OPENING_MS};if(v==='glow'){demoSandbox.glowStartedAt=now;demoSandbox.event={...event(),phase:'glow',startedAt:now,endsAt:null};setCelebrationPreviewClock(now)}demoSandbox.stage=v;dispatchEvent(new Event('sync'));return}if(v==='idle')localStorage.setItem(OPENING_KEY,JSON.stringify({startedAt:at,endsAt:at+OPENING_MS}));if(v==='glow'){const now=at;localStorage.setItem(GLOW_START_KEY,String(now));localStorage.setItem(EK,JSON.stringify({...event(),phase:'glow',startedAt:now,endsAt:null}))}localStorage.setItem(SK,v);dispatchEvent(new Event('sync'))};
const event=()=>{if(demoSandbox)return demoSandbox.event;try{return JSON.parse(localStorage.getItem(EK))||{}}catch{return{}}},setEvent=v=>{if(demoSandbox)demoSandbox.event=v;else localStorage.setItem(EK,JSON.stringify(v));dispatchEvent(new Event('sync'))};
function storePool(pool){if(demoSandbox)demoSandbox.pool=pool;else localStorage.setItem(POOL_KEY,JSON.stringify(pool));return pool}
function poolState(){if(demoSandbox?.pool)return demoSandbox.pool;try{const pool=JSON.parse(localStorage.getItem(POOL_KEY));if(pool?.version===1&&Number.isFinite(pool.startedAt)&&Array.isArray(pool.guests))return pool}catch{}const pool=createGrowingPool();return storePool(['light','glow','lottery','close'].includes(stage())?freezeGrowingPool(pool):pool)}
function storeCollectionClock(clock){if(demoSandbox)demoSandbox.collection=clock;else if(clock)localStorage.setItem(COLLECTION_KEY,JSON.stringify(clock));else localStorage.removeItem(COLLECTION_KEY);return clock}
function startCollectionClock(at=Date.now()){return storeCollectionClock({...createCollectionClock(at,demoSandbox?RECORDING_COLLECTION_MS:undefined),roundId:poolState().cycleId})}
function collectionClock(){
  let clock=demoSandbox?.collection;
  if(!demoSandbox)try{clock=JSON.parse(localStorage.getItem(COLLECTION_KEY))}catch{}
  const roundId=poolState().cycleId;
  if(clock?.roundId===roundId&&Number.isFinite(clock.startedAt)&&Number.isFinite(clock.endsAt)&&clock.endsAt>clock.startedAt)return clock;
  const now=Date.now(),ev=event();
  if(!demoSandbox&&ev.phase==='waiting'&&ev.endsAt>now)return storeCollectionClock({startedAt:Math.min(ev.startedAt||now,now),endsAt:ev.endsAt,roundId});
  return startCollectionClock(now);
}
function countdownCopy(view){return view.finished&&!read().length?'愿池静候第一盏灯':view.urgent?'灯火将起，请共候这一刻':'万千心愿，静候一同放飞'}
function wallCountdown(){
  const clock=collectionClock(),view=collectionCountdown(clock);
  return `<div class="wall-countdown ${view.urgent?'is-urgent':''}" data-ends-at="${clock.endsAt}"><small>距离点灯放飞还有</small><b role="timer" aria-label="距离点灯放飞还有" data-collection-countdown>${view.text}</b><p data-collection-copy>${countdownCopy(view)}</p></div>`;
}
function refreshCollectionCountdowns(){
  if(!['guide','collect'].includes(stage()))return;
  const clock=collectionClock(),view=collectionCountdown(clock);
  $$('[data-collection-countdown]').forEach(node=>{if(node.textContent!==view.text)node.textContent=view.text;node.dataset.endsAt=clock.endsAt});
  $$('.wall-countdown').forEach(node=>{node.classList.toggle('is-urgent',view.urgent);node.dataset.endsAt=clock.endsAt});
  $$('[data-collection-copy]').forEach(node=>{const copy=countdownCopy(view);if(node.textContent!==copy)node.textContent=copy});
}
function recordPoolGuest(wish,litAt=Date.now()){const before=poolState(),after=addPoolGuest(before,{wishId:wish.id,type:wish.type,litAt});return after===before?before:storePool(after)}
function refreshGrowingPool(resume=false){
  const pool=poolState(),ev=event(),wish=stage()==='collect'&&ev.phase==='waiting'&&ev.startedAt>=pool.startedAt?read().find(w=>String(w.id)===String(ev.wishId)):null;
  const current=wish?recordPoolGuest(wish,ev.wallStartedAt??ev.startedAt):pool;
  $$('.wall .field').forEach(field=>syncGrowingPool(field,current,Date.now(),resume));
  $$('.boundary').forEach(boundary=>{const active=['guide','collect'].includes(stage());if(active&&!boundary.querySelector('.crowd-live'))boundary.insertAdjacentHTML('beforeend','<div class="crowd-live"><i></i> 灯火渐聚 · 等候集体放飞</div>');if(!active)boundary.querySelector('.crowd-live')?.remove()});
  const entries=growingPoolEntries(current),scale=growingPoolScale(entries.length);
  const origins=JSON.stringify(entries.map(entry=>({...growingPoolPose(entry),scale})));
  $$('.release-canvas,.celebration-canvas').forEach(canvas=>{if(canvas.dataset.poolOrigins!==origins)canvas.dataset.poolOrigins=origins});
}
const draft=()=>{if(demoSandbox)return demoSandbox.draft;try{return JSON.parse(localStorage.getItem(DK))||{}}catch{return{}}},setDraft=v=>{if(demoSandbox)demoSandbox.draft=v;else localStorage.setItem(DK,JSON.stringify(v));dispatchEvent(new Event('sync'))};
if(['form','generated'].includes(visitor().step))setVisitor({step:'craft',craft:createCraftPhase(draft().generated?'ready':'choose')});
if(!localStorage.getItem(KEY))write([['愿家人岁岁安康','阿禾','lotus'],['愿新的一年常有好消息','小满','moon'],['愿所求皆如愿，所行皆坦途','南枝','fish'],['愿我们还能一起看很多次春天','清嘉','plum']].map((x,i)=>({id:Date.now()+i,serial:126+i,wish:x[0],name:x[1],type:x[2]})));
if(event().phase==='arrival')setEvent({...event(),phase:'waiting',endsAt:Date.now()+120000});
if(!localStorage.getItem(SK))setStage('idle');
if(stage()==='glow'&&!localStorage.getItem(GLOW_START_KEY))localStorage.setItem(GLOW_START_KEY,String(Date.now()));
if(stage()==='idle'&&!opening().endsAt)localStorage.setItem(OPENING_KEY,JSON.stringify({startedAt:Date.now(),endsAt:Date.now()+OPENING_MS}));
let recordingDemo;
function stopAutoShow(){if(recordingDemo?.hasSession)recordingDemo.stop()}
function restartOpening(){stopAutoShow();storeLottery(null);setVisitor({step:'landing',wishId:null,form:{},lotteryPrizeTab:'gift',lotteryPreviewWishId:null});setDraft({});setEvent({});setStage('idle');render()}
function startAutoShow(){if(location.hash!=='#sync')location.hash='#sync';recordingDemo.start();render()}
function setCraftPhase(phase,at=Date.now(),duration){
  setVisitor({step:'craft',craft:createCraftPhase(phase,at,draft().wish,duration)});
  if(phase==='ready')setDraft({...draft(),generated:true});
  render();
}
function advanceCraft(){
  const v=visitor();if(v.step!=='craft')return;
  const next=nextCraftPhase(v.craft);if(next)setCraftPhase(next);
}
const L=(t='lotus',s='')=>`<span class="lantern ${t} ${s}"><i></i><b>${types.find(x=>x[0]===t)?.[3]||'愿'}</b><em></em></span>`;
$('#app').innerHTML=`<header><a href="#sync"><i class="seal">愿</i><span><b>西溪且留下</b><small>万愿成灯 · 新春灯市</small></span></a><nav><a href="#sync">双屏联调</a><a href="#mobile">游客手机</a><a href="#wall">白墙投影</a><a href="#control">演出控制</a><a href="./video-wish.html">视频合成</a></nav><label>LOCAL DEMO · 非现场联网</label></header><main></main>`;
mountVisualPicker($('header'));
function toast(x){let e=document.createElement('div');e.className='toast';e.textContent=x;document.body.append(e);setTimeout(()=>e.remove(),2300)}
const htmlText=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function updateRecordingForm(wish='',name='',type='plum'){
  if(!demoSandbox)return;
  setVisitor({form:{wish,name,type}});
  const phone=$('.mobile'),textarea=phone&&$('textarea',phone),input=phone&&$('input',phone);
  if(textarea&&textarea.value!==wish)textarea.value=wish;
  if(input&&input.value!==name)input.value=name;
  if(phone&&$('#count',phone))$('#count',phone).textContent=wish.length+' / 28';
  if(phone)$$('[data-t]',phone).forEach(button=>button.classList.toggle('chosen',button.dataset.t===type));
}
recordingDemo=createRecordingDemo({
  openSession(){
    const wishes=read().map(wish=>({...wish}));
    while(new Set(wishes.map(w=>w.participantId||w.name||w.id)).size<6){const n=wishes.length;wishes.push({id:'recording-guest-'+n,participantId:'recording-guest-'+n,serial:126+n,type:types[n%4][0],name:['知鱼','听雨','云舟','南星','小荷','阿桥'][n%6]+(n>=6?n:''),wish:'愿新岁平安喜乐'})}
    const serial=Math.max(125,...wishes.map(wish=>Number(wish.serial)||0))+1;
    demoSandbox={lottery:null,collection:null,pool:createGrowingPool(),wishes,stage:'collect',event:{},draft:{},visitor:{step:'landing',wishId:null,form:{}},opening:{},glowStartedAt:null,sample:{id:'recording-sample',serial,type:'plum',name:'小溪',wish:'愿家人平安喜乐'}};
  },
  closeSession(){demoSandbox=null;setCelebrationPreviewClock(null)},
  enter(phase,{startedAt}){
    const sample=demoSandbox.sample;
    if(phase==='opening'){setVisitor({step:'landing',wishId:null,form:{}});setStage('idle',startedAt)}
    if(phase==='invite')setStage('collect',startedAt);
    if(phase==='guide')setVisitor({step:'guide'});
    if(phase==='choose')setVisitor({step:'craft',form:{wish:'',name:'',type:sample.type},craft:createCraftPhase('choose',startedAt)});
    if(['unfolding','frame','shaping','write','writing','ignite','igniting','generated'].includes(phase)){
      const craftPhase=phase==='generated'?'ready':phase;
      if(['writing','ignite','igniting','generated'].includes(phase)){demoSandbox.draft={...sample,generated:phase==='generated'};setVisitor({form:{wish:sample.wish,name:sample.name,type:sample.type}})}
      setCraftPhase(craftPhase,startedAt,phase==='writing'?6000:undefined);
    }
    if(phase==='handoff'){
      const now=startedAt;
      demoSandbox.wishes=[...demoSandbox.wishes,sample];
      demoSandbox.visitor={step:'submitted',wishId:sample.id,submittedAt:now,form:{},transfer:createWishTransfer({wishId:sample.id,startedAt:now,waitingMs:8000,ceremonyEndsAt:collectionClock().endsAt})};
      demoSandbox.draft={};
      demoSandbox.event=demoSandbox.visitor.transfer;
      recordPoolGuest(sample,now);
    }
    if(phase==='lighting')beginLighting(startedAt);
    if(phase==='glow')setStage('glow',startedAt);
    if(phase==='lottery')beginLottery(true,startedAt);
    if(phase==='close')setStage('close');
  },
  update(phase,progress){
    if(phase==='write'){
      const sample=demoSandbox.sample,wish=Array.from(sample.wish),name=Array.from(sample.name);
      const count=Math.floor(progress*(wish.length+name.length+1));
      updateRecordingForm(wish.slice(0,count).join(''),name.slice(0,Math.max(0,count-wish.length)).join(''),sample.type);
    }
  },
  progress(){refreshTransferFrame();if(isLotteryScreen()&&$('.lottery-scene')?.dataset.lotteryKey!==lotteryView(lotteryState()).key)render()},
  render,
});
function finaleWall(){return releaseCanvas(null,'wall').replace('release-canvas','celebration-canvas')+'<div class="celebration-phase">03 · 灯海汇愿</div><div class="celebration-caption"><small>万愿成灯 · 万灯同辉</small><b data-finale-title>灯海渐远</b><p data-finale-copy>让每一盏愿灯，都汇成新年祝福</p></div>'}
function finalePhone(mine){return `<section class="m-scene glow glow-finale"><div class="step">03 <span>万灯同辉</span></div><h1>万灯同辉</h1><p class="finale-subtitle">万千愿灯，汇成一句新年快乐</p><div class="mobile-celebration-stage">${releaseCanvas(null,'mobile').replace('release-canvas','celebration-canvas')}</div>${mine?`<div class="finale-personal">第 ${mine.serial} 盏 · ${htmlText(mine.name)} · 已汇入新年灯海</div>`:''}<div class="finale-mobile-status"><b data-finale-title>灯海渐远</b><p data-finale-copy>让每一盏愿灯，都汇成新年祝福</p></div><button id="viewMine">保存新年快乐纪念画面</button></section>`}
function beginLighting(startedAt=Date.now()){setEvent({phase:'lighting',startedAt,endsAt:startedAt+RELEASE_DURATION_MS});setStage('light',startedAt);render();if(!recordingDemo?.active)toast('少女点亮心灯 · 万千愿灯一同启程')}
function wall(inner=false){
  const ws=read(),st=stage(),ev=event(),meta=stages.find(x=>x[0]===st),picked=ws.find(x=>String(x.id)===String(ev.wishId));
  const raffle=isLotteryScreen();
  const release=st==='light'?releaseCanvas(null,'wall')+'<div class="release-wall-meta"><small>万愿成灯 · 共同放飞</small><b data-release-title>少女点灯</b><p data-release-copy>让美好心愿，与众灯一同启程</p></div>':'';
  return `<section class="wall ${['guide','collect'].includes(st)?'is-collecting':''} ${!raffle&&isFinaleStage(st)?'glow':''} ${st==='light'?'lighting':''} ${raffle?'lottery':''}"><div class="boundary"><div class="night-town-scene" aria-hidden="true"></div><div class="night-water-glimmer" aria-hidden="true"></div><div class="moon"></div><div class="mount"></div><div class="village"><i></i><i></i><i></i><i></i></div><div class="water"></div><div class="title"><small>西溪灯事 · 新春特别呈现</small><h1>西溪且留下</h1><p>万 愿 成 灯</p></div><div class="field"></div>${['guide','collect'].includes(st)?wallCountdown():''}${release}${raffle?lotteryScene(lotteryState()):isFinaleStage(st)?finaleWall():''}<div class="caption"><b>${meta[1]}</b><span>${meta[2]}</span></div></div>${inner?'':`<div class="walltools"><button id="full">全屏投影</button><button id="shot">保存节目纪念画面</button></div>`}</section>`;
}
function mobile(){let mine=read().at(-1),st=stage(),meta=stages.find(x=>x[0]===st),picked=read().find(x=>String(x.id)===String(event().wishId));return `<section class="mobile"><div class="intro"><span>VISITOR MOBILE · 游客端</span><h2>入一盏灯<br>留一桩愿</h2><p>选择灯型，写下心愿。提交后，愿灯将进入公共白墙的点灯队列。</p><aside><b>功能原型</b> 同一浏览器本地状态模拟多人愿灯队列。</aside></div><div class="phone"><div class="bar">19:28 <b>西溪灯市</b> •••</div><div class="scroll"><div class="mobile-stage ${st}"><i></i><div><small>公共白墙 · 当前环节</small><b>${meta[1]}</b><span>${st==='light'&&picked?`正在点亮第 ${picked.serial} 盏 · ${picked.name}`:meta[2]}</span></div></div><div class="hero"><small>西溪且留下 · 新春特别灯事</small><h1>万愿<br>成灯</h1><p>一念入灯，随水入画</p></div><form><label>择一盏愿灯</label><div class="choices">${types.map((x,i)=>`<button type="button" data-t="${x[0]}" class="${i?'':'chosen'}">${L(x[0],'mini')}<b>${x[1]}</b><small>${x[2]}</small></button>`).join('')}</div><label>写下心愿 <small id="count">0 / 28</small></label><textarea maxlength="28" placeholder="愿新岁，常安常乐……"></textarea><label>落款昵称</label><input maxlength="8" placeholder="2–8个字"><button class="submit">放愿入灯市 <b>→</b></button><p id="status"></p></form><div class="ticket">${mine?`<small>我的愿灯</small>${L(mine.type)}<b>第 ${mine.serial} 盏</b><p>${mine.wish}</p><span>${mine.name} · 已进入点灯队列</span><button id="save">保存个人纪念图</button>`:'<b>尚未放入愿灯</b><p>完成上方心愿，即可获得专属序号。</p>'}</div></div></div></section>`}
function control(){const ws=read(),state=lotteryState(),view=lotteryView(state);return `<section class="control"><div class="chead"><div><span>SHOW CONTROL · 主持 / 控制台</span><h2>万愿成灯 · 演出流程</h2></div><b>● 本地状态同步中</b></div><div class="grid"><aside><h3>节目段落</h3>${stages.map((x,i)=>`<button data-s="${x[0]}" class="${stage()===x[0]?'active':''}"><i>0${i+1}</i><b>${x[1]}</b><small>${x[2]}</small></button>`).join('')}<button id="draw" class="run">✦ 开始孔明灯放飞</button><button id="auto">▶ 加速自动演示</button><button id="reset">↺ 收束 / 复位</button><div class="lottery-control"><strong>新春抽奖 · 一等奖1名 / 二等奖2名 / 三等奖3名</strong><p>高潮结尾后自动进入抽奖。头像为本地演示形象，后续对接小程序参与者头像。</p><button id="startLottery" ${stage()!=='lottery'||view.phase!=='ready'?'disabled':''}>开始头像抽奖</button><button id="replayLottery" ${view.phase!=='done'?'disabled':''}>重播开奖动画</button><p>每位参与者仅有一次机会；人数不足时按实际人数颁奖。</p></div></aside><div class="preview"><label>白墙输出预监 <span>安全画面边界 100%</span></label>${wall(true)}</div><aside class="queue"><h3>参与愿灯 <span>${ws.length}</span></h3><div>${ws.map((w,i)=>`<button disabled><i>${String(i+1).padStart(2,'0')}</i>${L(w.type,'mini')}<span><b>${htmlText(w.name)}</b><small>${htmlText(w.wish)}</small></span><em>已入灯市</em></button>`).join('')}</div><button id="mock">＋ 模拟一位新游客</button><button id="clear">清空演示愿灯</button></aside></div></section>`}
function mobileV2(){let mine=personalWish(),st=stage(),meta=stages.find(x=>x[0]===st),picked=read().find(x=>String(x.id)===String(event().wishId));const card=mine?`<div class="mine-card">${L(mine.type)}<div><small>我的愿灯 · 第 ${mine.serial} 盏</small><b>${mine.wish}</b><span>${mine.name}</span></div></div>`:`<div class="mobile-empty">你还没有放入愿灯</div>`;let scene='';
if(st==='idle')scene=`<section class="m-scene idle"><small>西溪且留下 · 新春灯事</small><h1>一念入灯<br>愿照新岁</h1><p>白墙灯市即将开启</p><div class="m-moon"></div><button data-go="guide">进入数字灯市</button></section>`;
if(st==='guide')scene=`<section class="m-scene guide"><i>01</i><small>第一步 · 许愿入灯</small><h1>写下一桩<br>新岁心愿</h1><div class="guide-lines"><span>择一盏宋韵灯型</span><span>写下心愿与昵称</span><span>获得专属愿灯编号</span></div><button data-go="collect">开始许愿</button></section>`;
if(st==='collect')scene=`<section class="m-scene collect"><div class="step">01 <span>许愿入灯</span></div><h1>我的心愿灯签</h1><form><label>择一盏愿灯</label><div class="choices">${types.map((x,i)=>`<button type="button" data-t="${x[0]}" class="${i?'':'chosen'}">${L(x[0],'mini')}<b>${x[1]}</b><small>${x[2]}</small></button>`).join('')}</div><label>写下心愿 <small id="count">0 / 28</small></label><textarea maxlength="28" placeholder="愿新岁，常安常乐……"></textarea><label>落款昵称</label><input maxlength="8" placeholder="2–8个字"><button class="submit">放愿入灯市 <b>→</b></button><p id="status"></p></form>${card}</section>`;
if(st==='light')scene=releasePhoneScene(mine);
if(st==='glow')scene=finalePhone(mine);
if(st==='close')scene=finalePhone(mine);
return `<section class="mobile mobile-v2"><div class="intro"><span>VISITOR MOBILE · 游客端</span><h2>手机伴随屏</h2><p>手机画面与公共白墙实时对应，画面会随主持控制台同步切换。</p><aside><b>当前环节</b> ${meta[1]} · ${meta[2]}</aside></div><div class="phone"><div class="bar">19:28 <b>万愿成灯</b> •••</div><div class="scroll">${scene}</div></div></section>`}
function generatedWishScene(d){return `<section class="m-scene generated generated-preview"><div class="generated-heading"><div class="step">01 <span>许愿入灯</span></div><h1>我的心愿灯签</h1><p>一盏微光 · 寄予山河</p></div><div class="generated-stage"><figure class="generated-illustration">${renderWishLantern(d)}</figure><div class="generated-type"><i></i>${types.find(x=>x[0]===d.type)?.[1]||'宋韵愿灯'}<i></i></div></div><div class="generated-status"><i></i>已生成，等待上墙</div><div class="generated-actions"><button id="saveDraft"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2v10m-4-4 4 4 4-4M3 12v5h14v-5" /></svg>保存愿灯图片</button><button id="enterMarket">放愿望入灯市 <span aria-hidden="true">→</span></button></div></section>`}
function mobileV3(force=false){if(stage()!=='collect'&&!force)return mobileV2();let d=draft(),mine=personalWish(),body=d.generated?generatedWishScene(d):`<section class="m-scene collect"><div class="step">01 <span>许愿入灯</span></div><h1>我的心愿灯签</h1><form><label>择一盏愿灯</label><div class="choices">${types.map((x,i)=>`<button type="button" data-t="${x[0]}" class="${i?'':'chosen'}">${L(x[0],'mini')}<b>${x[1]}</b><small>${x[2]}</small></button>`).join('')}</div><label>写下心愿 <small id="count">0 / 28</small></label><textarea maxlength="28" placeholder="愿新岁，常安常乐……"></textarea><label>落款昵称</label><input maxlength="8" placeholder="2–8个字"><button class="submit">生成我的愿灯 <b>→</b></button><p id="status"></p></form>${mine?`<div class="mine-card">${L(mine.type)}<div><small>上一盏愿灯 · 第 ${mine.serial} 盏</small><b>${mine.wish}</b><span>${mine.name}</span></div></div>`:''}</section>`;return `<section class="mobile mobile-v2"><div class="intro"><span>VISITOR MOBILE · 游客端</span><h2>许愿入灯</h2><p>先生成并保存个人愿灯，再确认放入灯市；确认后白墙才会播放愿灯点亮动画。</p><aside><b>当前环节</b> 互动收愿 · 低空亮灯，静候集体放飞</aside></div><div class="phone"><div class="bar">19:28 <b>万愿成灯</b> •••</div><div class="scroll">${body}</div></div></section>`}
function mobileV4(){let ev=event(),w=read().find(x=>String(x.id)===String(ev.wishId));if(stage()==='collect'&&ev.phase==='arrival'&&w)return `<section class="mobile mobile-v2"><div class="intro"><span>VISITOR MOBILE · 游客端</span><h2>愿灯入市</h2><p>个人愿灯已经进入公共画面，白墙正在同步播放愿灯点亮动画。</p><aside><b>请抬头</b> 看向白墙，寻找你的愿望光迹</aside></div><div class="phone"><div class="bar">19:28 <b>万愿成灯</b> •••</div><div class="scroll"><section class="m-scene entering"><div class="step">01 <span>愿灯上墙</span></div><div class="enter-lantern">${L(w.type)}</div><h1>愿灯正汇入<br>西溪灯市</h1><p>第 ${w.serial} 盏 · ${w.name}</p><div class="look-wall">↑ 请抬头看向公共白墙</div><div class="enter-status"><i></i> 白墙入场动画播放中</div><button id="save">查看我的愿灯</button></section></div></div></section>`;return mobileV3()}
function mobileV5(){let ev=personalTransfer(),w=personalWish();if(stage()==='collect'&&ev?.phase==='waiting'&&w)return `<section class="mobile mobile-v2"><div class="intro"><span>VISITOR MOBILE · 游客端</span><h2>等待点灯放飞</h2><p>愿灯已经进入灯市，正在等待与万千心愿一同放飞。</p><aside><b>保持期待</b> 灯火将起，一起迎接这场新春仪式</aside></div><div class="phone"><div class="bar">19:28 <b>万愿成灯</b> •••</div><div class="scroll"><section class="m-scene waiting"><div class="step">01 → 02 <span>等待点灯放飞</span></div><div class="waiting-wall-prompt"><b>↑ 请抬头看向公共白墙</b><span>你的愿灯已留在灯海中，静候集体放飞</span></div><div class="waiting-lantern">${L(w.type)}</div><small>第 ${w.serial} 盏 · ${w.name}</small><h1>愿灯已进入<br>西溪愿池</h1><p>距离点灯放飞还有</p><div class="countdown" id="countdown" data-collection-countdown data-ends-at="${collectionClock().endsAt}">${collectionCountdown(collectionClock()).text}</div><div class="waiting-note"><i></i> 倒计时结束将自动进入点灯仪式</div><div class="wish-reminder">“${w.wish}”</div></section></div></div></section>`;return mobileV4()}
function mobileV6(){return mobileV5().replace('下一轮点灯放飞将在','距离点灯放飞还有').replace('倒计时结束将自动进入点灯仪式','静候灯火亮起，让心愿一同飞向新岁')}
function mobileV7(){
  const mine=personalWish();
  if(stage()!=='light')return mobileV6();
  return `<section class="mobile mobile-v2"><div class="intro"><span>VISITOR MOBILE · 游客端</span><h2>少女点灯与放飞</h2><p>宋韵少女点亮主灯，再与万千孔明灯共同启程。</p><aside><b>共同放飞</b> 随后拉远为灯海，汇成新年快乐</aside></div><div class="phone"><div class="bar">19:28 <b>万愿成灯</b> •••</div><div class="scroll">${releasePhoneScene(mine)}</div></div></section>`;
}
function mobileV8(){let ev=personalTransfer(),w=personalWish();if(stage()==='collect'&&w&&wishTransferView(ev).phone==='handoff')return `<section class="mobile mobile-v2"><div class="intro"><span>VISITOR MOBILE · 游客端</span><h2>送愿入灯市</h2><p>白墙已为你点亮一盏愿灯，手机正在收起灯签。</p><aside><b>许愿入灯</b> 请看白墙，新亮起的愿灯会留在低处，静候集体放飞</aside></div><div class="phone"><div class="bar">19:28 <b>万愿成灯</b> •••</div><div class="scroll"><section class="m-scene handoff"><div class="step">01 <span>许愿入灯</span></div><div class="handoff-copy">愿灯已生成<br><b>正在送往西溪灯市</b></div><div class="handoff-lantern">${L(w.type)}<small>第 ${w.serial} 盏 · ${w.name}</small><strong>${w.wish}</strong></div><div class="handoff-light"></div><p>↑ 请抬头看白墙，你的愿灯已亮起</p></section></div></div></section>`;return mobileV7()}
function syncView(){let meta=stages.find(x=>x[0]===stage());return `<section class="sync-page ${recordingDemo.active?'is-auto-playing':''}"><div class="sync-head"><div><span>DUAL-SCREEN PREVIEW · 双屏流程联调</span><h2>白墙投影 × 游客手机</h2></div><div><b>${meta[1]}</b><small>${meta[2]}</small></div></div>${recordingDemo.controls()}${isLotteryScreen()&&!recordingDemo.hasSession?lotteryTools():''}<div class="sync-grid"><article class="sync-wall"><label>PUBLIC WALL · 公共白墙输出${isFinaleStage(stage())?'<button id="replayFinale" aria-label="重播万灯同辉高潮动画">↻ 重播高潮</button>':''}</label>${wall(true)}</article><article class="sync-phone"><label>VISITOR MOBILE · 游客手机伴随屏</label>${visitorMobile()}</article></div><div class="sync-hint">两端共享同一本地模拟状态 · 可直接在右侧手机完成许愿并观察左侧白墙同步变化</div>${recordingDemo.countdown()}</section>`}
function visitorMobile(){
  if(isLotteryScreen())return lotteryPhone();
  if(['light','glow','lottery','close'].includes(stage()))return mobileV8();
  const v=visitor();
  if(v.step==='craft')return '<section class="mobile mobile-v2"><div class="intro"><span>VISITOR MOBILE · 游客端</span><h2>亲手做一盏愿灯</h2><p>展纸、撑灯、书愿、点亮，让新岁的心愿有一处安放。</p></div><div class="phone"><div class="bar">19:28 <b>万愿成灯</b> •••</div><div class="scroll">'+renderCraftScene({craft:v.craft,form:v.form,draft:draft()})+'</div></div></section>';
  if(['form','generated'].includes(v.step))return mobileV3(true);
  if(v.step==='submitted')return mobileV8();
  const isGuide=v.step==='guide';
  const scene=isGuide
    ? '<section class="m-scene guide"><i>01</i><small>第一步 · 亲手成灯</small><h1>做一盏灯<br>寄一桩心愿</h1><div class="guide-lines"><span>择纸撑灯，让愿灯成形</span><span>落笔书愿，留下你的名字</span><span>亲手点亮，再放入灯市</span></div><button data-go="collect">开始制灯</button></section>'
    : '<section class="m-scene idle visitor-landing"><small>西溪且留下 · 新春灯事</small><h1>看灯火入画<br>留一桩心愿</h1><p>万千心愿正在汇入西溪灯市</p><div class="m-moon"></div><div class="visitor-invite">下一盏灯，愿为你而亮</div><button data-go="guide">我也来许愿点灯 →</button></section>';
  return '<section class="mobile mobile-v2"><div class="intro"><span>VISITOR MOBILE · 游客端</span><h2>'+ (isGuide?'许愿引导':'走近西溪灯市')+'</h2><p>看见他人的愿灯在白墙点亮，也为新岁留下一盏自己的愿灯。</p><aside><b>参与灯事</b> '+(isGuide?'选灯、写愿、落款，生成你的灯签':'点击进入数字灯市，开始你的许愿之旅')+'</aside></div><div class="phone"><div class="bar">19:28 <b>万愿成灯</b> •••</div><div class="scroll">'+scene+'</div></div></section>';
}
function visitorViewKey(){
  const v=visitor(),ev=event(),st=stage();
  if(isLotteryScreen())return ['lottery',lotteryState()?.startedAt,lotteryView(lotteryState()).key,lotteryViewerId(),v.lotteryPrizeTab].join(':');
  if(['light','glow','close'].includes(st))return [st,isFinaleStage(st)?glowKey():ev.startedAt,v.wishId].join(':');
  if(v.step==='submitted')return [v.step,v.wishId,st,ev.phase,v.submittedAt||ev.startedAt,wishTransferView(personalTransfer()).phone].join(':');
  if(v.step==='craft')return [v.step,v.craft?.phase,v.craft?.startedAt,v.form?.type,draft().id||''].join(':');
  return [v.step,draft().id||''].join(':');
}
function render(){
  if(stage()==='close'&&!glowKey()){const at=Date.now()-FINALE_DURATION_MS;if(demoSandbox){demoSandbox.glowStartedAt=at;setCelebrationPreviewClock(at)}else localStorage.setItem(GLOW_START_KEY,String(at))}
  const h=location.hash||'#sync',main=$('main'),samePage=main.dataset.route===h;
  const focused=document.activeElement,selection=main.contains(focused)&&(focused instanceof HTMLInputElement||focused instanceof HTMLTextAreaElement)?{start:focused.selectionStart,end:focused.selectionEnd}:null;
  const oldWall=samePage?$('.wall',main):null,oldPhone=samePage?$('.mobile',main):null;
  const phoneKey=(demoSandbox?'recording:':'')+visitorViewKey(),wallKey=[demoSandbox?'recording':'live',stage(),stage()==='idle'?opening().startedAt:'',event().phase,event().startedAt,read().length,wishTransferView(event()).wall,isFinaleStage(stage())?glowKey():'',isLotteryScreen()?lotteryState()?.startedAt:'',isLotteryScreen()?lotteryView(lotteryState()).key:''].join(':');
  main.innerHTML=h==='#sync'?syncView():h==='#mobile'?visitorMobile():h==='#control'?control():`<section class="wallpage"><label>PUBLIC PROJECTION · 公共白墙端 <b>当前节目：${stages.find(x=>x[0]===stage())[1]}</b></label>${wall()}</section>`;
  let newWall=$('.wall',main),newPhone=$('.mobile',main);
  if(oldWall?.dataset.sceneKey===wallKey&&newWall){newWall.replaceWith(oldWall);newWall=oldWall}
  if(oldPhone?.dataset.viewKey===phoneKey&&newPhone){newPhone.replaceWith(oldPhone);newPhone=oldPhone}
  if(newWall)newWall.dataset.sceneKey=wallKey;
  if(newPhone)newPhone.dataset.viewKey=phoneKey;
  $$('header nav a').forEach(link=>{if(link.getAttribute('href')===h)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
  main.dataset.route=h;main.dataset.transferKey=transferFrameKey();bind();
  if(selection&&document.contains(focused)){focused.focus({preventScroll:true});focused.setSelectionRange(selection.start,selection.end)}
}
function bindVisitor(phone){
  if(phone.dataset.bound==='yes')return;
  phone.dataset.bound='yes';
  $$('[data-go]',phone).forEach(b=>b.onclick=()=>{if(b.dataset.go==='collect')setCraftPhase('choose');else{setVisitor({step:'guide'});render()}});
  const input=$('input',phone),textarea=$('textarea',phone),saved=visitor().form||{};
  if(input)input.value=saved.name||'';
  if(textarea){textarea.value=saved.wish||'';$('#count',phone).textContent=textarea.value.length+' / 28'}
  function rememberForm(){
    setVisitor({form:{name:input?.value||'',wish:textarea?.value||'',type:$('[data-t].chosen',phone)?.dataset.t||'lotus'}});
  }
  $$('[data-t]',phone).forEach(b=>{
    b.classList.toggle('chosen',b.dataset.t===(saved.type||'lotus'));
    b.onclick=()=>{$$('[data-t]',phone).forEach(x=>x.classList.remove('chosen'));b.classList.add('chosen');rememberForm()};
  });
  if(input)input.oninput=rememberForm;
  if(textarea)textarea.oninput=()=>{$('#count',phone).textContent=textarea.value.length+' / 28';rememberForm()};
  const form=$('form',phone);
  if(form)form.onsubmit=e=>{
    e.preventDefault();
    const wish=textarea.value.trim(),name=input.value.trim(),status=$('#status',phone),a=read();
    if(!wish||!name){status.textContent='请先写下心愿并留下昵称';return}
    if(a.some(x=>x.wish===wish&&x.name===name)){status.textContent='这盏愿灯已进入灯市，请勿重复提交';return}
    const type=$('[data-t].chosen',phone).dataset.t;
    rememberForm();setVisitor({step:'generated'});
    setDraft({generated:true,id:Date.now(),serial:126+a.length,wish,name,type});render();
  };
  $('#saveDraft',phone)?.addEventListener('click',()=>{saveCraftPicture(draft(),document.documentElement.dataset.visual).then(()=>toast('愿灯纪念图已生成，可保存留念')).catch(()=>toast('图片暂未生成，请再试一次'))});
  $('#enterMarket',phone)?.addEventListener('click',()=>{
    const d=draft(),a=read();
    if(!d.generated){render();return}
    const existing=a.find(x=>String(x.id)===String(d.id));
    if(existing){setVisitor({step:'submitted',wishId:existing.id,submittedAt:visitor().submittedAt||event().startedAt||0,transfer:String(event().wishId)===String(existing.id)?event():null});localStorage.setItem(DK,'{}');render();toast('这盏愿灯已入市，请继续观看白墙');return}
    const item={id:d.id,participantId:visitor().participantId,serial:d.serial,wish:d.wish,name:d.name,type:d.type},now=Date.now();
    if(collectionCountdown(collectionClock(),now).finished&&!a.length)startCollectionClock(now);
    const transfer=createWishTransfer({wishId:item.id,startedAt:now,ceremonyEndsAt:collectionClock().endsAt});
    // Publish the complete handoff together; a partial sync must not cache the old preview as the handoff screen.
    setVisitor({step:'submitted',wishId:item.id,submittedAt:now,form:{},transfer});
    recordPoolGuest(item,now);
    localStorage.setItem(KEY,JSON.stringify([...a,item]));
    localStorage.setItem(EK,JSON.stringify(transfer));
    localStorage.setItem(DK,'{}');
    dispatchEvent(new Event('sync'));
    render();toast('愿灯已入市 · 请期待下一轮点灯放飞');
  });
  $('#viewMine',phone)?.addEventListener('click',()=>{saveFinalePicture(personalWish());toast('正在生成万灯同辉纪念画面…')});
  $('#save',phone)?.addEventListener('click',()=>toast('个人纪念图已保存（功能原型反馈）'));
  bindCraftScene(phone,{
    choose(type){setVisitor({form:{...visitor().form,type}});render()},
    remember(wish,name){setVisitor({form:{...visitor().form,wish,name}})},
    action(action){
      if(action==='reset'){setVisitor({step:'craft',craft:createCraftPhase('choose'),form:{}});setDraft({});render();return}
      const phases={unfold:'unfolding',shape:'shaping',ignite:'igniting',edit:'write',choose:'choose'};
      if(phases[action])setCraftPhase(phases[action]);
    },
    write(wish,name){
      const old=draft(),a=read(),type=visitor().form?.type||'lotus';
      setVisitor({step:'craft',form:{wish,name,type},craft:createCraftPhase('writing',Date.now(),wish)});
      setDraft({generated:false,id:old.id||Date.now(),serial:old.serial||Math.max(125,...a.map(w=>Number(w.serial)||0))+1,wish,name,type});render();
    }
  });
}
function bind(){
  const phone=$('.mobile');if(phone)bindVisitor(phone);if(phone)$('.phone',phone).inert=recordingDemo.active;recordingDemo.paintControls();
  $$('#mock,#clear').forEach(button=>button.disabled=recordingDemo.hasSession);
  const preview=$('#lotteryPreview');if(preview)preview.onchange=()=>{setVisitor({lotteryPreviewWishId:preview.value||null,lotteryPreviewAt:Date.now(),lotteryPrizeTab:'gift'});render()};
  const ev=event();
  refreshGrowingPool(true);
  refreshCollectionCountdowns();
  $$('.release-canvas').forEach(canvas=>canvas.dataset.startedAt=ev.startedAt||Date.now());
  $$('.handoff-lantern,.handoff-light').forEach(el=>el.style.animationDelay=-wishTransferView(personalTransfer()).phoneElapsed+'ms');
  $$('.craft-scene').forEach(el=>el.style.setProperty('--craft-offset',-Math.max(0,Date.now()-(visitor().craft?.startedAt||Date.now()))+'ms'));
  if(stage()==='light')$$('.lighting .ritual,.lighting .title,.lighting .girl,.lighting .girl>em,.lighting .girl>span,.lighting .blessing,.lighting .trail,.lighting .field').forEach(el=>el.style.animationDelay=-Math.max(0,Date.now()-ev.startedAt)+'ms');
  $$('[data-w]').forEach(b=>b.onclick=()=>{
    $$('[data-w]').forEach(x=>x.classList.remove('on'));b.classList.add('on');
  });
  $$('[data-s]').forEach(b=>b.onclick=()=>{
    stopAutoShow();
    if(b.dataset.s==='idle')restartOpening();
    else if(b.dataset.s==='light')beginLighting();
    else if(b.dataset.s==='lottery')beginLottery(false);
    else{setStage(b.dataset.s);render()}
  });
  const handlers={
    '#replayFinale':()=>{stopAutoShow();setStage('glow');render()},
    '#draw':()=>{stopAutoShow();beginLighting()},
    '#startLottery':()=>{stopAutoShow();runLottery()},
    '#replayLottery':()=>{stopAutoShow();replayLottery()},
    '#lotterySaveFinale':()=>saveFinalePicture(personalWish()),
    '#showLotteryWinners':()=>{setVisitor({lotteryPrizeTab:'list'});render()},
    '#showPrizeGift':()=>{setVisitor({lotteryPrizeTab:'gift'});render()},
    '#savePrizeGift':()=>{const gift=personalGift(lotteryState(),lotteryViewerId());if(!gift)return toast('请等待你的奖项揭晓');savePrizeGift(gift).then(()=>toast('消费券图片已生成')).catch(()=>toast('图片暂未生成，请再试一次'))},
    '#full':()=>$('.wall').requestFullscreen?.(),
    '#shot':()=>saveFinalePicture(personalWish()),
    '#mock':()=>{const a=read(),i=a.length,ss=['愿奔赴皆有回响','愿春风常伴，旧愿皆偿','愿日日有欢喜','愿山河无恙，家人安康'],wish={id:Date.now(),serial:126+i,type:types[i%4][0],wish:ss[i%4],name:['小荷','云舟','阿桥','听雨'][i%4]};if(['guide','collect'].includes(stage()))recordPoolGuest(wish);write([...a,wish]);render()},
    '#clear':()=>{storeLottery(null);storePool(createGrowingPool());write([]);setEvent({});render()},
    '#reset':restartOpening,
    '#auto':startAutoShow,
    '#startRecordingDemo':startAutoShow,
    '#restartRecordingDemo':()=>recordingDemo.restart(),
    '#stopRecordingDemo':()=>recordingDemo.stop(),
    '#cleanRecordingDemo':()=>recordingDemo.toggleClean()
  };
  for(const [selector,handler] of Object.entries(handlers)){const button=$(selector);if(button)button.onclick=handler}
}
setInterval(()=>{
  refreshGrowingPool();if(recordingDemo.active)return;advanceCraft();refreshTransferFrame();const ev=event();
  if(stage()==='collect'&&collectionCountdown(collectionClock()).finished&&read().length){beginLighting();return}
  if(ev.phase==='lighting'&&ev.endsAt<=Date.now()&&stage()==='light'){setStage('glow');render();toast('愿灯已放飞 · 灯海汇聚中');return}
  if(stage()==='glow'&&Date.now()-Number(glowKey())>=FINALE_DURATION_MS+3000){beginLottery(true,Number(glowKey())+FINALE_DURATION_MS+3000);return}
  if(isLotteryScreen()&&$('.lottery-scene')?.dataset.lotteryKey!==lotteryView(lotteryState()).key)render();
},250);
addEventListener('hashchange',render);addEventListener('storage',render);addEventListener('sync',()=>{if(['#mobile','#sync'].includes(location.hash||'#sync'))render()});render();
function applyParticipationGuide(){
  const st=stage(),clock=opening(),elapsed=Math.max(0,Date.now()-(clock.startedAt||Date.now()));
  if(!recordingDemo.active&&st==='idle'&&clock.endsAt&&Date.now()>=clock.endsAt){setStage('collect');render();refreshGrowingPool();return}
  $$('.boundary').forEach(boundary=>{
    if(!['idle','guide','collect'].includes(st)){
      boundary.querySelectorAll('.participation-intro,.join-entry,.opening-lights').forEach(el=>el.remove());
      boundary.classList.remove('opening-mode');return;
    }
    if(st==='idle'&&!boundary.querySelector('.participation-intro')){
      boundary.classList.add('opening-mode');
      boundary.style.setProperty('--opening-offset',-elapsed+'ms');
      boundary.insertAdjacentHTML('beforeend',`<div class="participation-intro"><div class="intro-seal">愿</div><small>西溪且留下 · 新春灯事</small><h2><span>拿出手机</span><span>搜索小程序</span><span>许愿点灯</span></h2><p>一念入灯 · 万愿成光</p><i></i></div><div class="opening-lights"><i></i><i></i><i></i><i></i><i></i></div>${joinEntry(true)}`);
    }
    if(['guide','collect'].includes(st)){
      boundary.classList.remove('opening-mode');
      if(!boundary.querySelector('.join-entry'))boundary.insertAdjacentHTML('beforeend',joinEntry(false));
    }
  });
}
function joinEntry(delayed=false){return `<div class="join-entry ${delayed?'delayed':''}"><div class="demo-qr"><i></i></div><div><small>微信扫一扫 · 演示入口</small><b>进入「万愿成灯」</b><span>① 选灯　② 写愿　③ 放入灯市</span></div></div>`}
setInterval(applyParticipationGuide,350);setTimeout(applyParticipationGuide,100);
installMobileFit();
