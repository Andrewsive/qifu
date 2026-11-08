import './style.css';
import { VIDEO_SIZE,DEFAULT_WISH,DEFAULT_TRACK,quadAt,textOpacity,upsertFrame } from './tracking.js';
import { makeTextCanvas,drawWish } from './renderer.js';
import sourceVideo from './media/source.mp4';
import sampleVideo from './media/wish-sample.mp4';

document.getElementById('video-wish-app').innerHTML=`
<header><span class="seal">愿</span><div><b>愿写灯间</b><small>西溪且留下 · 心愿视频合成试验</small></div><a href="./#sync">返回祈福 Demo ↗</a></header>
<main><div class="heading"><div><div class="eyebrow">VIDEO × PERSONAL WISH</div><h1>让这一盏灯，写上你的心愿</h1></div><span class="badge">预制视频 · 实时心愿</span></div>
<div class="layout"><section><div class="player"><div class="player-top"><span>少女放灯 · 原视频 1470 × 630 / 24 fps</span><span><i class="status-dot"></i><span id="state">加载视频</span></span></div>
<div class="screen"><video id="source" src="${sourceVideo}" muted playsinline preload="auto"></video><canvas id="composite" width="1470" height="630" aria-label="祝福心愿实时合成画面"></canvas><div class="load-note" id="loading">正在加载动画…</div></div>
<div class="timebar"><input id="seek" type="range" min="0" max="6.08" step="0.001" value="0" aria-label="视频进度"><output id="time">00:00.00 / 00:06.08</output></div>
<div class="controls"><button id="play" class="primary">▶ 播放合成</button><button id="replay">↺ 从头重播</button><label><input type="checkbox" id="overlay" checked>显示心愿</label><label><input type="checkbox" id="loop" checked>循环播放</label><label><input type="checkbox" id="audio">原片声音</label><select id="speed" aria-label="播放速度"><option value="1">正常速度</option><option value="0.5">半速观察</option></select><button class="right" id="snapshot">保存当前画面</button></div></div>
<p class="description" id="description"><strong>网页里的祝福可以随时更换。</strong>文字根据这段视频的灯面定位，跟随主灯移动、缩放和透视变化。</p>
<details><summary>灯面定位校准与数据</summary><div class="calibration"><label><input type="checkbox" id="calibrate">显示灯面四角，暂停后可拖动校准</label><div>橙色四边形是文字贴合的灯面。当前为人工标定，修改会保存为此时间点的关键帧。请先在近景处校准。</div><div class="buttons"><button id="saveFrame">保存当前定位</button><button id="downloadTrack">下载定位数据 JSON</button><button id="resetTrack">恢复初始定位</button></div><div id="trackStatus"></div></div></details>
<div class="steps"><div><b>01 · 视频提供场景</b>人物、灯笼和灯海来自你提供的原片。</div><div><b>02 · 程序实时写愿</b>祝福、昵称和编号独立生成，贴合灯面。</div><div><b>03 · 同步跟随放飞</b>读取视频时间，计算这一帧的文字位置。</div></div>
</section><aside class="panel"><h2>写下你的新岁心愿</h2><p>同一段动画，可以承载不同的祝福。</p><form id="wishForm"><label class="field" for="wish">祝福心愿 <small id="count">4 / 28</small></label><textarea id="wish" maxlength="28" rows="2">家人安康</textarea><div class="row"><div><label class="field" for="name">落款昵称</label><input id="name" maxlength="8" value="小溪"></div><div><label class="field" for="serial">编号</label><input id="serial" maxlength="5" value="018" inputmode="numeric"></div></div><div class="samples"><button type="button" data-wish="家人安康">家人安康</button><button type="button" data-wish="万事顺遂">万事顺遂</button><button type="button" data-wish="岁岁平安">岁岁平安</button><button type="button" data-wish="愿所行皆坦途">愿所行皆坦途</button></div><button class="primary" type="submit">换上我的心愿，再放一次灯 →</button><p class="note">建议 4–8 字，近景更清晰；最长 28 字会自动分列。修改文字时，画面会即时更新。</p></form>
<div class="export"><a class="download" id="sample" href="${sampleVideo}" download="家人安康-点灯放飞样片.mp4">↓ 下载 MP4 样片 · 家人安康</a><p>MP4 为固定文案成片，便于发送给厂家。上方网页可实时更换心愿，无需重新制作底片。</p></div></aside></div></main><footer>独立技术验证 · 使用原片，保留原有画面与标识 · 当前灯面由关键帧标定</footer><div id="message" role="status" hidden></div>`;

const $=selector=>document.querySelector(selector),video=$('#source'),canvas=$('#composite'),c=canvas.getContext('2d');
const STORAGE='xixi-video-wish-track-v1';
let track=structuredClone(DEFAULT_TRACK),texture=makeTextCanvas(DEFAULT_WISH),draft=null,dragIndex=-1,messageTimer;
try{const saved=JSON.parse(localStorage.getItem(STORAGE));if(Array.isArray(saved)&&saved.length>=2&&saved.every(frame=>Number.isFinite(frame.t)&&frame.q?.length===4&&frame.q.every(p=>p.length===2&&p.every(Number.isFinite))))track=saved.sort((a,b)=>a.t-b.t)}catch{}

function message(text){clearTimeout(messageTimer);$('#message').textContent=text;$('#message').hidden=false;messageTimer=setTimeout(()=>$('#message').hidden=true,2600)}
function stamp(seconds){const t=Math.max(0,seconds);return `${String(Math.floor(t/60)).padStart(2,'0')}:${(t%60).toFixed(2).padStart(5,'0')}`}
function currentQuad(){return draft||quadAt(video.currentTime,track)}
function draw(time=video.currentTime){
  if(video.readyState<2||video.seeking)return;
  c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.drawImage(video,0,0,...VIDEO_SIZE);
  const q=draft||quadAt(time,track);if($('#overlay').checked)drawWish(c,texture,q,textOpacity(time));
  if($('#calibrate').checked){c.save();c.strokeStyle='#f5d08d';c.lineWidth=2;c.setLineDash([6,4]);c.beginPath();q.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.stroke();c.setLineDash([]);q.forEach((p,i)=>{c.fillStyle='#b45b35';c.beginPath();c.arc(...p,7,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#fff0c7';c.font='14px sans-serif';c.fillText(['左上','右上','右下','左下'][i],p[0]+11,p[1]+5)});c.restore()}
  $('#seek').value=String(time);$('#time').textContent=stamp(time)+' / '+stamp(video.duration||6.08);
  $('#state').textContent=video.paused?'暂停预览 · 可换心愿':'正在播放 · 实时合成';
  $('#trackStatus').textContent=`已标定 ${track.length} 个关键帧 · 当前 ${time.toFixed(3)} 秒`;
}
function refreshText(){const data={wish:$('#wish').value.trim(),name:$('#name').value.trim(),serial:$('#serial').value.trim()};texture=makeTextCanvas(data);$('#count').textContent=Array.from($('#wish').value).length+' / 28';draw()}
function persist(){localStorage.setItem(STORAGE,JSON.stringify(track))}
async function play(){try{await video.play()}catch{message('请再次点击播放，允许浏览器开始视频播放')}}
function replay(){draft=null;video.currentTime=0;play()}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
video.addEventListener('loadedmetadata',()=>{$('#seek').max=String(video.duration);draw()});
video.addEventListener('loadeddata',()=>{$('#loading').hidden=true;draw()});
video.addEventListener('error',()=>{$('#loading').hidden=false;$('#loading').textContent='动画暂时未能加载，请刷新页面重试'});
video.addEventListener('play',()=>{$('#play').textContent='Ⅱ 暂停'});video.addEventListener('pause',()=>{$('#play').textContent='▶ 播放合成';draw()});
video.addEventListener('seeked',()=>draw());video.addEventListener('ended',()=>{if($('#loop').checked)replay();else draw()});
if(video.requestVideoFrameCallback){const tick=(now,meta)=>{draw(meta.mediaTime);video.requestVideoFrameCallback(tick)};video.requestVideoFrameCallback(tick)}else{const tick=()=>{if(!video.paused)draw();requestAnimationFrame(tick)};requestAnimationFrame(tick)}
$('#play').onclick=()=>video.paused?play():video.pause();$('#replay').onclick=replay;
$('#seek').oninput=event=>{video.pause();draft=null;video.currentTime=Number(event.target.value)};
$('#speed').onchange=event=>video.playbackRate=Number(event.target.value);
$('#overlay').onchange=()=>draw();$('#calibrate').onchange=()=>{video.pause();draw()};
$('#audio').onchange=()=>{video.muted=!$('#audio').checked};
for(const selector of ['#wish','#name','#serial'])$(selector).oninput=refreshText;
$('#wishForm').onsubmit=event=>{event.preventDefault();if(!$('#wish').value.trim()){message('先写下一句心愿，再放飞');$('#wish').focus();return}refreshText();replay();message('已换上你的心愿，正在重新放飞')};
document.querySelectorAll('[data-wish]').forEach(button=>button.onclick=()=>{$('#wish').value=button.dataset.wish;refreshText();replay()});
$('#snapshot').onclick=()=>canvas.toBlob(blob=>{if(blob)download(blob,'心愿放飞-'+($('#wish').value.trim()||'留念')+'.png')},'image/png');
$('#saveFrame').onclick=()=>{video.pause();track=upsertFrame(track,video.currentTime,currentQuad());draft=null;persist();draw();message('已保存当前时间点的灯面定位')};
$('#downloadTrack').onclick=()=>download(new Blob([JSON.stringify({video:{width:1470,height:630,fps:24,duration:video.duration},order:['TL','TR','BR','BL'],keyframes:track},null,2)],{type:'application/json'}),'灯面定位数据.json');
$('#resetTrack').onclick=()=>{video.pause();track=structuredClone(DEFAULT_TRACK);draft=null;localStorage.removeItem(STORAGE);draw();message('已恢复这段视频的初始定位')};
canvas.addEventListener('pointerdown',event=>{if(!$('#calibrate').checked||!video.paused)return;const r=canvas.getBoundingClientRect(),p=[(event.clientX-r.left)/r.width*1470,(event.clientY-r.top)/r.height*630],q=currentQuad();dragIndex=q.findIndex(point=>Math.hypot(point[0]-p[0],point[1]-p[1])<35);if(dragIndex<0)return;draft=q.map(point=>[...point]);canvas.setPointerCapture(event.pointerId)});
canvas.addEventListener('pointermove',event=>{if(dragIndex<0)return;const r=canvas.getBoundingClientRect();draft[dragIndex]=[(event.clientX-r.left)/r.width*1470,(event.clientY-r.top)/r.height*630];draw()});
function finishDrag(){if(dragIndex<0)return;track=upsertFrame(track,video.currentTime,draft);draft=null;dragIndex=-1;persist();draw()}
canvas.addEventListener('pointerup',finishDrag);canvas.addEventListener('pointercancel',finishDrag);
if(video.readyState>=2){$('#loading').hidden=true;draw()}
