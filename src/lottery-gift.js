const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hash=value=>Array.from(String(value)).reduce((n,c)=>(n*31+c.codePointAt(0))>>>0,7).toString(36).toUpperCase().padStart(7,'0');
export function createPrizeGift(state,prize,wishId,revealedAt=state.startedAt){
  if(!prize)return null;
  const person=state.winners?.[prize.id]?.find(p=>(p.wishIds||[p.wishId]).includes(String(wishId)));
  if(!person)return null;
  const index=state.participants.findIndex(p=>p.id===person.id),tier={first:1,second:2,third:3}[prize.id];
  return {prizeId:prize.id,prizeLabel:prize.label,title:'新春消费券',status:'pending',statusLabel:'待核销',person,code:'XX-'+hash(state.roundId)+'-'+String(index+1).padStart(3,'0')+'-'+tier,revealedAt};
}
export function renderPrizeGift(gift,avatarMarkup,now=Date.now(),viewKey='done',animationAt=gift.revealedAt){
  const elapsed=Math.max(0,now-Math.max(animationAt,gift.revealedAt));
  return `<section class="m-scene lottery-scene lottery-mobile lottery-winner" data-lottery-key="${viewKey}" data-lottery-gift="${gift.prizeId}" style="--win-offset:-${elapsed}ms"><div class="gift-celebration" aria-hidden="true">${Array.from({length:18},(_,i)=>`<i style="--ray:${i*20}deg;--ray-delay:${i%3*90}ms"></i>`).join('')}<span>福</span></div><div class="gift-heading" role="status"><small>万愿成灯 · 新春好礼</small><h1>恭喜你</h1><p>喜获${gift.prizeLabel} · 好运入怀</p></div><div class="gift-owner">${avatarMarkup}<span>${escape(gift.person.name)}<small>愿灯 ${escape(gift.person.serial)}</small></span></div><article class="prize-voucher" aria-label="${gift.prizeLabel}新春消费券，待核销"><div class="voucher-top"><small>西溪且留下 · 灯市礼遇</small><b>${gift.statusLabel}</b></div><div class="voucher-main"><i>${{first:'壹',second:'贰',third:'叁'}[gift.prizeId]}</i><h2>${gift.title}</h2><p>${gift.prizeLabel}专属好礼</p><span>一城灯火相赠，愿新岁皆欢喜</span></div><div class="voucher-code"><small>专属券码</small><strong>${gift.code}</strong><p>请向现场工作人员出示本券<br>由工作人员核销使用</p></div><small class="voucher-demo">西溪新春灯市 · 演示券</small></article><div class="gift-actions"><button id="savePrizeGift">保存我的消费券</button><button id="showLotteryWinners">查看获奖名单 <span aria-hidden="true">→</span></button></div><p class="gift-note">好礼已为你留存，随时可回到此页查看</p></section>`;
}
export async function savePrizeGift(gift){
  if(!gift)throw new Error('暂无已揭晓的个人奖品');
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;const c=canvas.getContext('2d');
  c.fillStyle='#0d1d32';c.fillRect(0,0,1080,1440);c.strokeStyle='#c29b5e77';c.lineWidth=2;c.strokeRect(44,44,992,1352);
  c.textAlign='center';c.fillStyle='#ead3a0';c.font='28px SimSun,serif';c.fillText('西溪且留下 · 万愿成灯',540,125);c.font='78px SimSun,serif';c.fillText('恭喜你',540,250);c.font='34px SimSun,serif';c.fillText('喜获'+gift.prizeLabel+' · 好运入怀',540,321);
  const paper=c.createLinearGradient(150,400,930,1140);paper.addColorStop(0,'#f8ecd1');paper.addColorStop(1,'#e5cb98');c.fillStyle=paper;c.beginPath();c.roundRect(140,400,800,790,24);c.fill();
  c.fillStyle='#614a32';c.font='25px SimSun,serif';c.fillText('西溪新春灯市 · 专属好礼',540,465);c.font='64px SimSun,serif';c.fillText(gift.title,540,590);c.font='30px SimSun,serif';c.fillText(gift.prizeLabel+'专属礼遇',540,655);
  c.fillStyle='#8e4b35';c.beginPath();c.roundRect(427,705,226,62,31);c.fill();c.fillStyle='#fff1d2';c.font='30px SimSun,serif';c.fillText(gift.statusLabel,540,747);
  c.setLineDash([7,9]);c.strokeStyle='#ae8a5466';c.beginPath();c.moveTo(180,815);c.lineTo(900,815);c.stroke();c.setLineDash([]);
  c.fillStyle='#614a32';c.font='30px SimSun,serif';c.fillText(gift.person.name+' · 愿灯 '+gift.person.serial,540,890);c.font='22px SimSun,serif';c.fillText('专属券码',540,953);c.font='32px Georgia,serif';c.fillText(gift.code,540,1010);c.font='22px SimSun,serif';c.fillText('请出示本券，由现场工作人员核销使用',540,1093);c.font='18px SimSun,serif';c.fillText('西溪新春灯市 · 演示券',540,1154);
  c.fillStyle='#c7b38b';c.font='26px SimSun,serif';c.fillText('一城灯火相赠，愿新岁皆欢喜',540,1295);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('图片生成失败');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='西溪新春消费券-'+gift.prizeLabel+'-'+gift.person.serial+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
