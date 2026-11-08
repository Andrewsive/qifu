import { renderWishLantern } from './wish-lantern.js';

export const CRAFT_TYPES=[['lotus','莲影灯','清和如意','#d8aa79'],['moon','月白灯','长乐未央','#e9ddbb'],['fish','锦鲤灯','年年有余','#d9a061'],['plum','梅枝灯','春信先归','#d3a08e']];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const CRAFT_DURATIONS={unfolding:2400,shaping:2600,igniting:2000};
const next={unfolding:'frame',shaping:'write',writing:'ignite',igniting:'ready'};
export function writingDuration(wish=''){return Math.max(3800,Math.min(8200,1500+Array.from(wish).length*220))}
export function createCraftPhase(phase='choose',at=Date.now(),wish='',duration){
  const span=duration??(phase==='writing'?writingDuration(wish):CRAFT_DURATIONS[phase]);
  return {phase,startedAt:at,endsAt:span?at+span:null};
}
export function nextCraftPhase(craft,now=Date.now()){
  return craft?.endsAt&&now>=craft.endsAt?next[craft.phase]||null:null;
}
export function craftingStep(phase){return ['choose','unfolding'].includes(phase)?0:['frame','shaping'].includes(phase)?1:['write','writing'].includes(phase)?2:3}
export function validateCraftWish(wish,name){if(!wish.trim())return '先写下一句想寄给新岁的祝福';if(!name.trim())return '请留下你的落款，让这盏灯属于你';return ''}
function paper(type){const color=CRAFT_TYPES.find(t=>t[0]===type)?.[3]||'#d8aa79';return `<svg class="craft-paper" viewBox="0 0 320 410" aria-hidden="true"><defs><linearGradient id="craft-paper-fill" x1="0" x2="1"><stop stop-color="${color}"/><stop offset=".5" stop-color="#f9ecd0"/><stop offset="1" stop-color="${color}"/></linearGradient></defs><g class="paper-spread"><path d="M49 118 Q159 104 271 118 L264 296 Q160 310 56 296Z" fill="url(#craft-paper-fill)" stroke="#bc915c" stroke-width="1.2"/><path d="M102 113 L105 301 M160 111 V305 M218 113 L215 302" fill="none" stroke="#a781533f"/><path d="M61 126 Q160 114 260 126 M65 287 Q160 298 255 287" fill="none" stroke="#fff1d0"/><g fill="none" stroke="#b58c55" opacity=".6"><path d="M73 230 Q91 197 82 159 M83 185 Q99 183 101 169 M82 208 Q65 198 66 184 M241 161 Q223 191 238 246 M234 191 Q249 183 250 174"/><circle cx="82" cy="176" r="5"/><circle cx="101" cy="169" r="4"/><circle cx="66" cy="184" r="4"/><circle cx="238" cy="214" r="5"/></g></g><path class="paper-ribbon" d="M155 303 Q137 335 162 357 Q180 371 151 398" fill="none" stroke="#b16948" stroke-width="2" opacity=".6"/></svg>`}

export function renderCraftScene({craft,form={},draft={},now=Date.now()}){
  const phase=craft?.phase||'choose',type=form.type||draft.type||'lotus',step=craftingStep(phase),elapsed=Math.max(0,now-(craft?.startedAt||now));
  const duration=craft?.endsAt?craft.endsAt-craft.startedAt:0,count=Math.max(1,Array.from(draft.wish||form.wish||'').length);
  const titles={choose:['择一张灯纸','以一张灯纸，承载新岁的期盼'],unfolding:['灯纸轻展','让一张灯纸，在指尖慢慢舒展'],frame:['以竹为骨','轻触撑起，让心愿有一处安放'],shaping:['一盏灯，慢慢成形','灯骨撑起，灯纸承光'],write:['把心愿写进灯里','落笔之前，想一想最牵挂的人'],writing:['落笔成愿','一字一句，都是此刻的真心'],ignite:['为心愿点一盏灯','灯已成，愿你所盼皆有回响'],igniting:['灯火初明','把这一点温暖，寄给新的一年'],ready:['你的愿灯已成','亲手成灯，落笔成愿，灯火可亲']};
  const title=titles[phase]||titles.choose,showWriting=['writing','ignite','igniting','ready'].includes(phase);
  let artwork=['choose','unfolding'].includes(phase)?paper(type):renderWishLantern({...draft,type,sky:true,blank:!showWriting,serial:showWriting?draft.serial:"",name:showWriting?draft.name:""});
  let controls='';
  if(phase==='choose')controls=`<div class="craft-types" role="group" aria-label="选择灯纸">${CRAFT_TYPES.map(t=>`<button type="button" data-craft-type="${t[0]}" aria-pressed="${type===t[0]}" class="${type===t[0]?'chosen':''}"><i style="--paper-tint:${t[3]}"></i><b>${t[1]}</b><small>${t[2]}</small></button>`).join('')}</div><button class="craft-primary" data-craft-action="unfold">展开这一张灯纸 <span aria-hidden="true">→</span></button>`;
  if(phase==='frame')controls='<p class="craft-invitation">一张灯纸，一副灯骨<br>请亲手为它撑起形状</p><button class="craft-primary" data-craft-action="shape">撑起我的孔明灯 <span aria-hidden="true">↑</span></button>';
  if(phase==='write')controls=`<form class="craft-form"><label for="craftWish">写下心愿 <small id="count">${Array.from(form.wish||'').length} / 28</small></label><textarea id="craftWish" maxlength="28" placeholder="愿新岁，常安常乐……">${esc(form.wish||'')}</textarea><label for="craftName">落款昵称</label><input id="craftName" maxlength="8" placeholder="2–8个字" value="${esc(form.name||'')}"><p id="status" role="status"></p><button class="craft-primary" type="submit">落笔，将心愿写入灯面 <span aria-hidden="true">↗</span></button></form><button class="craft-text" data-craft-action="choose">换一张灯纸</button>`;
  if(phase==='ignite')controls='<p class="craft-invitation">心愿已落在灯面<br>再为它点起一簇暖光</p><button class="craft-primary" data-craft-action="ignite">点亮我的愿灯 <span aria-hidden="true">✦</span></button>';
  if(phase==='ready')controls='<div class="craft-finished"><i></i> 已亲手制成 · 等待放入灯市</div><div class="craft-ready-actions"><button id="saveDraft">保存我的愿灯</button><button id="enterMarket" class="craft-primary">放愿望入灯市 <span aria-hidden="true">→</span></button></div><button class="craft-text" data-craft-action="edit">重新书写心愿</button>';
  if(next[phase])controls=`<div class="craft-progress" role="status"><span>${phase==='writing'?'墨迹正逐字落在灯面':phase==='igniting'?'灯火正在温柔亮起':'你的孔明灯正在成形'}</span><i><b></b></i><small>请静候片刻</small></div>`;
  return `<section class="m-scene craft-scene craft-${phase}" data-craft-phase="${phase}" style="--craft-offset:-${elapsed}ms;--craft-duration:${duration||2400}ms;--write-step:${Math.max(120,duration/(count+2))}ms;--signature-delay:${Math.max(0,duration-600)}ms"><div class="craft-top"><small>万愿成灯 · 指尖灯作</small><button class="craft-text" data-craft-action="reset" aria-label="重新制作愿灯">↺</button></div><ol class="craft-steps" aria-label="制灯进度">${['择纸','成灯','书愿','点亮'].map((text,i)=>`<li class="${i===step?'current':i<step?'done':''}" ${i===step?'aria-current="step"':''}><i>${i<step?'✓':i+1}</i>${text}</li>`).join('')}</ol><div class="craft-heading"><h1>${title[0]}</h1><p>${title[1]}</p></div><div class="craft-workbench"><div class="craft-halo"></div><div class="craft-lantern">${artwork}</div><div class="craft-table"></div></div><div class="craft-controls">${controls}</div></section>`;
}

export function bindCraftScene(phone,hooks){
  const scene=phone.querySelector('.craft-scene');if(!scene)return;
  phone.querySelectorAll('[data-craft-type]').forEach(button=>button.onclick=()=>hooks.choose(button.dataset.craftType));
  phone.querySelectorAll('[data-craft-action]').forEach(button=>button.onclick=()=>hooks.action(button.dataset.craftAction));
  const form=scene.querySelector('form');if(!form)return;
  const wish=form.querySelector('textarea'),name=form.querySelector('input');
  const remember=()=>{hooks.remember(wish.value,name.value);form.querySelector('#count').textContent=Array.from(wish.value).length+' / 28'};
  wish.oninput=remember;name.oninput=remember;
  form.onsubmit=event=>{event.preventDefault();const error=validateCraftWish(wish.value,name.value);if(error){form.querySelector('#status').textContent=error;(wish.value.trim()?name:wish).focus();return}remember();hooks.write(wish.value.trim(),name.value.trim())};
}

export async function saveCraftPicture(wish,visual='night-tour'){
  const night=visual==='night-tour',background=night?'#0d1c30':visual==='ink-wash'?'#e4e6d9':'#f0e4c9',ink=night?'#eddaa9':'#6d583b';
  const art=renderWishLantern({...wish,sky:true}).replace('class="craft-svg-flame" display="none"','class="craft-svg-flame"').replace('<svg ','<svg x="200" y="250" width="680" height="900" ');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440"><rect width="1080" height="1440" fill="${background}"/><rect x="45" y="45" width="990" height="1350" rx="8" fill="none" stroke="${ink}" opacity=".4"/><g text-anchor="middle" fill="${ink}" font-family="SimSun,serif"><text x="540" y="136" font-size="42" letter-spacing="10">西溪且留下 · 万愿成灯</text><text x="540" y="203" font-size="23" letter-spacing="8">亲手成灯 · 落笔成愿</text><text x="540" y="1240" font-size="29">愿灯已成，愿你所盼皆有回响</text><text x="540" y="1310" font-size="21">第 ${esc(wish.serial)} 盏 · ${esc(wish.name)}</text></g>${art}</svg>`;
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
  try{const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url});const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;canvas.getContext('2d').drawImage(image,0,0);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('PNG生成失败');const link=document.createElement('a'),download=URL.createObjectURL(blob);link.href=download;link.download='西溪愿灯-'+wish.serial+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(download),1500)}finally{URL.revokeObjectURL(url)}
}
