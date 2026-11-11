import { currentVisualVariant } from './visual-variants.js';
import nightTown from '../public/assets/night-tour-town.svg';
import nightGirl from '../public/assets/song-lantern-girl.svg';
import gongbiTown from '../public/assets/gongbi-town-v1.png';
import gongbiGirl from '../public/assets/gongbi-girl-v1.png';
import inkTown from '../public/assets/ink-wash-town-v1.png';
import inkGirl from '../public/assets/ink-wash-girl-v1.png';
import { clamp,ease,noise,releasePhase,finalePhase,releaseLampPose,finaleLampPose,heroPose,fireworkBursts } from './ritual-motion.js';

const sources={'night-tour':[nightTown,nightGirl],gongbi:[gongbiTown,gongbiGirl],'ink-wash':[inkTown,inkGirl]},assets=new Map();
function artwork(id){
  if(!assets.has(id)){
    const entry={town:null,girl:null};
    entry.ready=Promise.all(sources[id].map((url,i)=>new Promise(resolve=>{const image=new Image();image.onload=()=>{entry[i?'girl':'town']=image;resolve()};image.onerror=resolve;image.src=url})));
    assets.set(id,entry);
  }
  return assets.get(id);
}
function townTexture(entry){
  if(!entry.town||entry.texture)return entry.texture;
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=576;const c=canvas.getContext('2d');
  c.drawImage(entry.town,0,0,1024,576);c.fillStyle='#08121c77';c.fillRect(0,0,1024,576);c.globalCompositeOperation='destination-in';
  const fade=c.createLinearGradient(0,0,0,576);fade.addColorStop(0,'transparent');fade.addColorStop(.42,'transparent');fade.addColorStop(.68,'#000');fade.addColorStop(1,'#000');c.fillStyle=fade;c.fillRect(0,0,1024,576);
  const sides=c.createLinearGradient(0,0,1024,0);sides.addColorStop(0,'transparent');sides.addColorStop(.09,'#000');sides.addColorStop(.91,'#000');sides.addColorStop(1,'transparent');c.fillStyle=sides;c.fillRect(0,0,1024,576);
  entry.texture=canvas;return canvas;
}
function world(c,w,h,t,finale,mobile,visual){
  const pull=finale?ease(t/7):0,camera=1-pull*.54,art=artwork(visual);
  const sky=c.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,visual==='ink-wash'?'#122528':visual==='gongbi'?'#172425':'#08162c');sky.addColorStop(.68,visual==='gongbi'?'#3c3930':'#263c40');sky.addColorStop(1,'#101d22');c.fillStyle=sky;c.fillRect(0,0,w,h);
  const horizon=h*(.73+pull*.15);
  for(let layer=0;layer<3;layer++){
    c.fillStyle=['#37505528','#243e443f','#172b31'][layer];c.beginPath();c.moveTo(0,h);
    for(let i=0;i<=32;i++)c.lineTo(w*i/32,horizon-h*(.03+noise(i+layer*40)*.045)+layer*h*.025);
    c.lineTo(w,h);c.closePath();c.fill();
  }
  const texture=townTexture(art);
  if(texture){c.globalAlpha=.95;const dw=w*camera,dh=h*camera;c.drawImage(texture,(w-dw)/2,h*.98-dh,dw,dh);c.globalAlpha=1}
  const haze=c.createRadialGradient(w*.5,h*.84,0,w*.5,h*.84,w*.48);haze.addColorStop(0,'#d5a55826');haze.addColorStop(1,'transparent');c.fillStyle=haze;c.fillRect(0,horizon,w,h-horizon);
  for(let i=0;i<28;i++){const y=h*(.84+i*.0052),spread=w*(.025+i*.004)*camera;c.strokeStyle='rgba(244,190,104,'+(.08+noise(i)*.13)*camera+')';c.lineWidth=Math.max(.7,h*.0015);c.beginPath();c.moveTo(w*.5-spread+Math.sin(t*.6+i)*3,y);c.lineTo(w*.5+spread,y);c.stroke()}
}
function lantern(c,x,y,height,wish=null,light=1,type=0){
  c.save();c.translate(x,y);const width=height*.72;
  const glow=c.createRadialGradient(0,0,width*.1,0,0,height*.95);glow.addColorStop(0,'rgba(255,191,75,'+.20*light+')');glow.addColorStop(1,'rgba(255,164,49,0)');c.fillStyle=glow;c.fillRect(-height,-height,height*2,height*2);
  const paper=c.createLinearGradient(-width/2,0,width/2,0);paper.addColorStop(0,['#ae5a32','#a84e30','#b87a3e','#a85a3e'][type%4]);paper.addColorStop(.3,'#f5bd73');paper.addColorStop(.55,'#ffe4aa');paper.addColorStop(.8,'#edb469');paper.addColorStop(1,'#ba6536');
  c.globalAlpha=.45+.55*light;c.fillStyle=paper;c.strokeStyle='#efca83';c.lineWidth=Math.max(.5,height*.004);
  c.beginPath();c.moveTo(-width*.44,-height*.42);c.quadraticCurveTo(0,-height*.55,width*.44,-height*.42);c.bezierCurveTo(width*.58,-height*.18,width*.46,height*.28,width*.32,height*.43);c.quadraticCurveTo(0,height*.51,-width*.32,height*.43);c.bezierCurveTo(-width*.46,height*.28,-width*.58,-height*.18,-width*.44,-height*.42);c.closePath();c.fill();c.stroke();
  c.save();c.globalAlpha*=.23;c.strokeStyle='#a05b34';
  for(const u of [-.32,-.16,0,.16,.32]){c.beginPath();c.moveTo(width*u,-height*.45);c.quadraticCurveTo(width*u*1.3,0,width*u*.72,height*.44);c.stroke()}
  for(let i=0;i<5;i++){c.beginPath();c.arc(width*(i%2?-.38:.38),height*(-.27+i*.11),height*.015,0,Math.PI*2);c.stroke()}c.restore();
  c.fillStyle='#7b3e24';c.globalAlpha=.8;c.beginPath();c.ellipse(0,height*.435,width*.32,height*.035,0,0,Math.PI*2);c.fill();
  c.globalAlpha=light;c.fillStyle='#fff4ba';c.beginPath();c.ellipse(0,height*.45,height*.027,height*.055,0,0,Math.PI*2);c.fill();
  if(wish&&height>45){
    c.globalAlpha=clamp((height-40)/55);c.fillStyle='#754224';c.textAlign='center';c.font=height*.065+'px SimSun, serif';c.fillText(String(wish.serial||''),0,-height*.31);c.font=height*.043+'px SimSun, serif';c.fillText(wish.name||'',0,-height*.23);
    const chars=Array.from(wish.wish||'愿新岁平安'),columns=Math.max(1,Math.ceil(chars.length/7)),rows=Math.ceil(chars.length/columns),font=Math.min(height*.14,width/(columns+1.3),height*.53/rows);
    c.font=font+'px SimSun, serif';chars.forEach((char,i)=>c.fillText(char,((columns-1)/2-Math.floor(i/rows))*font*1.2,-height*.08+i%rows*font));
  }c.restore();
}
const sprites=new Map();
function sprite(index){const type=index%4;if(!sprites.has(type)){const canvas=document.createElement('canvas');canvas.width=96;canvas.height=120;lantern(canvas.getContext('2d'),48,54,63,null,1,type);sprites.set(type,canvas)}return sprites.get(type)}
function tiny(c,x,y,size,alpha,index){c.globalAlpha=alpha;c.drawImage(sprite(index),x-size,y-size*1.25,size*2,size*2.5)}
let maskPoints;
function textPoints(){
  if(maskPoints)return maskPoints;
  const canvas=document.createElement('canvas');canvas.width=800;canvas.height=220;const c=canvas.getContext('2d',{willReadFrequently:true});
  c.font='900 170px SimSun, serif';c.textAlign='center';c.textBaseline='middle';c.fillText('新年快乐',400,116);
  const {data}=c.getImageData(0,0,800,220);maskPoints=[];
  for(let y=4;y<216;y+=4)for(let x=4;x<796;x+=4)if(data[(y*800+x)*4+3]>150)maskPoints.push({x:x/800,y:y/220});
  return maskPoints;
}
function targetFor(index,total,w,h,mobile){const points=textPoints(),p=points[Math.floor(index*points.length/total)%points.length],width=Math.min(w*.84,h*3),height=width*.275;return{x:.5+(p.x-.5)*width/w,y:(mobile?.43:.55)+(p.y-.5)*height/h}}
function fireworks(c,w,h,t){
  for(const burst of fireworkBursts(t)){
    const age=burst.age/2.6,radius=Math.min(w,h*1.8)*burst.radius;
    for(let i=0;i<76;i++){const angle=i*Math.PI*2/76+burst.index,length=radius*Math.pow(age,.55)*(.65+noise(i+50)*.35),x=w*burst.x+Math.cos(angle)*length,y=h*burst.y+Math.sin(angle)*length+h*.035*age*age;
      c.globalAlpha=Math.sin(Math.PI*clamp(age*1.1))*(1-age*.45);c.strokeStyle=i%5?'#f8d493':'#e89470';c.lineWidth=Math.max(.7,w/1200);c.beginPath();c.moveTo(x-Math.cos(angle)*radius*.08,y-Math.sin(angle)*radius*.08);c.lineTo(x,y);c.stroke();c.fillStyle='#fff0c5';c.beginPath();c.arc(x,y,Math.max(.7,w*.001),0,Math.PI*2);c.fill();
    }
  }c.globalAlpha=1;
}
export function paintRitual(c,w,h,t,{finale=false,mobile=false,wish=null,visual=currentVisualVariant().id,origins=[]}={}){
  c.clearRect(0,0,w,h);c.globalAlpha=1;world(c,w,h,t,finale,mobile,visual);
  if(!finale){
    for(let i=0;i<(origins.length||80);i++){const origin=origins[i],p=releaseLampPose(i,t,origin),protectedTitle=!mobile&&p.x>.27&&p.x<.75&&p.y<.31,targetSize=Math.max(3,Math.min(w*.011,h*.026)*p.scale),size=origin?32*origin.scale*(1-ease(t/9))+targetSize*ease(t/9):targetSize;tiny(c,p.x*w,p.y*h,size,p.alpha*(protectedTitle?.18:.8),i)}
    const hero=heroPose(t);lantern(c,hero.x*w,(hero.y-(mobile?.12:0))*h,h*(mobile?.50:.42)*hero.scale,wish,hero.light);
  }else{
    const total=Math.max(origins.length,mobile?520:920);
    for(let i=0;i<total;i++){if(i===0&&t<7)continue;const p=finaleLampPose(i,t,targetFor(i,total,w,h,mobile),origins),size=Math.max(mobile?1.6:2,Math.min(w*.014,h*.025)*p.scale);tiny(c,p.x*w,p.y*h,size,p.alpha*(.78+Math.sin(t*.8+i)*.12),i)}
    if(t<7){const hero=heroPose(t,true);lantern(c,hero.x*w,(hero.y-(mobile?.12*(1-ease(t/7)):0))*h,h*(mobile?.50:.42)*hero.scale,wish)}
    fireworks(c,w,h,t);
  }c.globalAlpha=1;
}
export async function ensureRitualArtwork(visual){await artwork(visual).ready}
export function installRitualRenderer(glowClock){
  const scenes=new Map();let frame=0;
  function mount(){
    for(const [canvas,entry]of scenes)if(!canvas.isConnected){entry.resize.disconnect();scenes.delete(canvas)}
    document.querySelectorAll('canvas.release-canvas,canvas.celebration-canvas').forEach(canvas=>{
      if(scenes.has(canvas))return;
      const c=canvas.getContext('2d'),entry={c,w:1,h:1,phase:'',resize:null};
      entry.resize=new ResizeObserver(()=>{const ratio=Math.min(devicePixelRatio||1,1.5);entry.w=Math.max(1,canvas.clientWidth);entry.h=Math.max(1,canvas.clientHeight);canvas.width=Math.round(entry.w*ratio);canvas.height=Math.round(entry.h*ratio);c.setTransform(ratio,0,0,ratio,0,0)});
      entry.resize.observe(canvas);scenes.set(canvas,entry);
    });if(scenes.size&&!frame)frame=requestAnimationFrame(tick);
  }
  function tick(){
    frame=0;
    for(const [canvas,entry]of scenes){
      if(!canvas.isConnected)continue;
      const finale=canvas.classList.contains('celebration-canvas'),startedAt=finale?glowClock():Number(canvas.dataset.startedAt)||Date.now(),seconds=Math.max(0,(Date.now()-startedAt)/1000);
      if(entry.originsKey!==canvas.dataset.poolOrigins){entry.originsKey=canvas.dataset.poolOrigins;try{entry.origins=JSON.parse(entry.originsKey||'[]')}catch{entry.origins=[]}}
      paintRitual(entry.c,entry.w,entry.h,seconds,{finale,origins:entry.origins,mobile:canvas.dataset.surface==='mobile',wish:canvas.dataset.wishId?{serial:canvas.dataset.serial,name:canvas.dataset.name,wish:canvas.dataset.wish}:null});
      const phase=finale?finalePhase(seconds):releasePhase(seconds);
      if(entry.phase!==phase.id){entry.phase=phase.id;const root=canvas.closest('.boundary,.m-scene');root.dataset[finale?'finalePhase':'releasePhase']=phase.id;const title=root.querySelector(finale?'[data-finale-title]':'[data-release-title]'),copy=root.querySelector(finale?'[data-finale-copy]':'[data-release-copy]');if(title)title.textContent=phase.title;if(copy)copy.textContent=phase.copy}
    }if(scenes.size)frame=requestAnimationFrame(tick);
  }
  const watcher=new MutationObserver(mount);watcher.observe(document.getElementById('app'),{childList:true,subtree:true});mount();document.fonts.ready.then(()=>{maskPoints=null});
  if(import.meta.hot)import.meta.hot.dispose(()=>{watcher.disconnect();cancelAnimationFrame(frame);scenes.forEach(entry=>entry.resize.disconnect())});
}

