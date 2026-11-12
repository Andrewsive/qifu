import { createPrizeGift,renderPrizeGift } from './lottery-gift.js';
export const PRIZES=[{id:'first',label:'一等奖',count:1},{id:'second',label:'二等奖',count:2},{id:'third',label:'三等奖',count:3}];
export const DRAW_ORDER=['third','second','first'];
export const LOTTERY_ROLL_MS=3500,LOTTERY_HOLD_MS=2000;
export const LOTTERY_DURATION_MS=(LOTTERY_ROLL_MS+LOTTERY_HOLD_MS)*DRAW_ORDER.length;
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const seed=value=>Array.from(String(value)).reduce((n,c)=>(n*31+c.codePointAt(0))>>>0,7);
function randomUnit(){const data=new Uint32Array(1);crypto.getRandomValues(data);return data[0]/4294967296}

export function createLottery(wishes,roundId){
  const seen=new Map(),participants=[];
  for(const wish of wishes){const id=String(wish.participantId??wish.userId??(wish.name?'demo:'+wish.name:wish.id??''));if(!id)continue;const old=seen.get(id);if(old){if(!old.wishIds.includes(String(wish.id)))old.wishIds.push(String(wish.id));continue}const person={id,wishId:String(wish.id),wishIds:[String(wish.id)],serial:wish.serial,name:String(wish.name||'游客'+(wish.serial||participants.length+1)),avatarUrl:wish.avatarUrl||''};seen.set(id,person);participants.push(person)}
  return {version:1,roundId,participants,startedAt:null,winners:null};
}
export function startLottery(state,at=Date.now(),random=randomUnit){
  if(state.startedAt!==null||!state.participants.length)return state;
  const pool=state.participants.map(p=>({...p}));
  for(let i=pool.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[pool[i],pool[j]]=[pool[j],pool[i]]}
  const winners={};let offset=0;
  // Reserve the first prize before allocating the remaining tiers when the pool is small.
  for(const prize of PRIZES){winners[prize.id]=pool.slice(offset,offset+prize.count);offset+=winners[prize.id].length}
  return {...state,startedAt:at,winners};
}
export function lotteryView(state,now=Date.now()){
  if(!state?.participants?.length)return {phase:'empty',key:'empty',revealed:[],prize:null,elapsed:0};
  if(state.startedAt===null||!state.winners)return {phase:'ready',key:'ready',revealed:[],prize:null,elapsed:0};
  const elapsed=Math.max(0,now-state.startedAt),index=Math.min(2,Math.floor(elapsed/(LOTTERY_ROLL_MS+LOTTERY_HOLD_MS))),within=elapsed%(LOTTERY_ROLL_MS+LOTTERY_HOLD_MS);
  if(elapsed>=LOTTERY_DURATION_MS)return {phase:'done',key:'done',revealed:[...DRAW_ORDER],prize:null,elapsed};
  const phase=within<LOTTERY_ROLL_MS?'rolling':'reveal',prize=PRIZES.find(p=>p.id===DRAW_ORDER[index]);
  return {phase,key:index+':'+phase,revealed:DRAW_ORDER.slice(0,index+(phase==='reveal'?1:0)),prize,elapsed,roundElapsed:within};
}
export function personalPrize(state,wishId,view=lotteryView(state)){
  if(wishId===null||wishId===undefined)return null;
  return PRIZES.find(p=>view.revealed.includes(p.id)&&state.winners?.[p.id]?.some(w=>(w.wishIds||[w.wishId]).includes(String(wishId))))||null;
}
export function avatar(person,size=''){
  if(/^https?:\/\//i.test(person.avatarUrl||''))return `<span class="lottery-avatar ${size}"><img src="${escape(person.avatarUrl)}" alt="${escape(person.name)}的头像" referrerpolicy="no-referrer"></span>`;
  const n=seed(person.id||person.name),background=['#36596b','#786049','#49685f','#76545a','#526281','#846a4a'][n%6],robe=['#cb895e','#a7b5a1','#e0be7d','#ba7f74','#b6c5cf','#cfb58d'][n%6],hair=n%2?'M16 32Q10 6 31 8Q52 7 48 32L43 24Q23 29 20 18Z':'M15 31Q10 9 31 8Q52 9 49 32L43 21Q26 26 20 20Z';
  return `<span class="lottery-avatar ${size}"><svg viewBox="0 0 64 64" role="img" aria-label="${escape(person.name)}的演示头像"><rect width="64" height="64" rx="32" fill="${background}"/><circle cx="49" cy="13" r="7" fill="#efcf8c" opacity=".45"/><path d="M8 66Q9 42 32 42Q55 42 56 66" fill="${robe}"/><path d="M27 41V48L32 53L37 48V41" fill="#dba985"/><ellipse cx="32" cy="29" rx="16" ry="19" fill="#e9bd98"/><path d="${hair}" fill="#343035"/><path d="M18 63L26 47L32 55L39 47L47 63" fill="none" stroke="#f1d6a4" opacity=".6"/><path d="M24 30h2m12 0h2M29 38q3 2 6 0" fill="none" stroke="#765247" stroke-width="1.4" stroke-linecap="round"/></svg></span>`;
}
export function personalGift(state,wishId,view=lotteryView(state)){const prize=personalPrize(state,wishId,view);return createPrizeGift(state,prize,wishId,prize?state.startedAt+DRAW_ORDER.indexOf(prize.id)*(LOTTERY_ROLL_MS+LOTTERY_HOLD_MS)+LOTTERY_ROLL_MS:0)}
function personCard(person,extra=''){return `<div class="lottery-person ${extra}">${avatar(person)}<b>${escape(person.name)}</b><small>愿灯 ${escape(person.serial)}</small></div>`}
export function lotteryScene(state,{surface='wall',wishId=null,now=Date.now(),showGift=true,animationAt}={}){
  const view=lotteryView(state,now),mine=personalPrize(state,wishId,view),mobile=surface==='mobile',rolling=view.phase==='rolling';
  if(mobile&&mine&&showGift){const gift=personalGift(state,wishId,view);return renderPrizeGift(gift,avatar(gift.person),now,view.key,animationAt)}
  let focus='';
  if(view.phase==='empty')focus='<div class="lottery-message"><b>静候你的加入</b><p>本轮暂无参与者，完成许愿后即可参与抽奖</p></div>';
  else if(view.phase==='ready')focus=`<div class="lottery-ready-avatars">${state.participants.slice(0,6).map(p=>avatar(p)).join('')}</div><p class="lottery-ready-copy">${state.participants.length} 位灯市来客，共候新春好彩头</p>`;
  else if(rolling){
    const count=Math.max(1,state.winners[view.prize.id].length),offset=-(view.roundElapsed||0);
    focus=`<div class="lottery-reels" role="img" aria-label="参与者头像滚动中" style="--reel-offset:${offset}ms;--reel-count:${state.participants.length}">${Array.from({length:count},(_,column)=>{const people=Array.from({length:state.participants.length+1},(_,i)=>state.participants[(i+column*3)%state.participants.length]);return `<div class="lottery-reel"><div class="lottery-reel-track" aria-hidden="true" style="--reel-delay:${offset-column*75}ms">${people.map(p=>`<div class="lottery-reel-item">${avatar(p)}<span>${escape(p.name)}</span></div>`).join('')}</div></div>`}).join('')}</div><p class="lottery-rolling-copy">好运正在向你走来</p>`;
  }else if(view.phase==='reveal')focus=`<div class="lottery-reveal" role="status">${state.winners[view.prize.id].map(p=>personCard(p,'is-revealed')).join('')||'<p>本轮暂无该奖项得主</p>'}</div><p class="lottery-reveal-copy">${state.winners[view.prize.id].length?'恭喜以上灯市来客':'感谢每一份新春心愿'}</p>`;
  else focus=`<div class="lottery-complete"><i>✦</i><b>${mine?'恭喜你，获得'+mine.label:'好运揭晓 · 灯火长明'}</b><p>${mine?'请凭本页面与愿灯编号向现场工作人员确认领奖':'感谢每一位游客，与西溪共赴新岁'}</p></div>`;
  const board=`<div class="lottery-board">${PRIZES.map(prize=>`<section class="lottery-prize ${view.revealed.includes(prize.id)?'is-open':''}"><h3><i>${prize.id==='first'?'壹':prize.id==='second'?'贰':'叁'}</i>${prize.label}</h3><div>${view.revealed.includes(prize.id)?state.winners[prize.id].map(p=>personCard(p)).join('')||'<span class="lottery-pending">本轮暂无得主</span>':'<span class="lottery-pending">静候揭晓</span>'}</div></section>`).join('')}</div>`;
  return `<section class="${mobile?'m-scene ':''}lottery-scene lottery-${surface} lottery-${view.phase}" data-lottery-key="${view.key}"><div class="lottery-heading"><small>04 · 灯市好礼</small><h${mobile?'1':'2'}>${view.prize?'正在揭晓 · '+view.prize.label:'新春好彩头'}</h${mobile?'1':'2'}><p>${view.phase==='ready'?'以一城灯火，答谢每一份心愿':view.phase==='done'?'一城灯火，共享新春好礼':'三等奖 → 二等奖 → 一等奖'}</p></div><div class="lottery-focus">${focus}</div>${board}${mobile?`<div class="lottery-phone-note">${mine&&view.phase!=='done'?'✦ 恭喜你，获得'+mine.label:view.phase==='done'?'获奖游客请向现场工作人员确认领奖':'与白墙同步揭晓 · 请留意你的头像与昵称'}</div>${mine?'<button id="showPrizeGift">查看我的消费券</button>':'<button id="lotterySaveFinale">保存新年灯海纪念图</button>'}`:''}<div class="lottery-sparkles" aria-hidden="true">✦ · ✧ · ✦</div></section>`;
}
