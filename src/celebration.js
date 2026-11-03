export const GLOW_START_KEY = 'xixi-glow-start-v1';
export const FINALE_DURATION_MS = 18000;

const phases = [
  { until: 3, id: 'gathering', title: '愿光汇聚', copy: '一盏心灯，照见你我' },
  { until: 7, id: 'awakening', title: '灯市渐明', copy: '桥畔街巷，次第点亮' },
  { until: 13, id: 'rising', title: '众愿升空', copy: '万千心愿，同赴新岁' },
  { until: 18, id: 'radiance', title: '万灯同辉', copy: '此刻，西溪为所有心愿而亮' },
  { until: Infinity, id: 'hold', title: '万灯同辉', copy: '灯火长明，愿岁岁长安' },
];
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const smooth = v => { const t = clamp(v); return t * t * (3 - 2 * t); };
const noise = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
export const celebrationPhase = seconds => phases.find(p => seconds < p.until) || phases.at(-1);
const startTime = () => Number(localStorage.getItem(GLOW_START_KEY)) || Date.now();

const sprites = new Map();
function lanternSprite(type = 0) {
  if (sprites.has(type)) return sprites.get(type);
  const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 160;
  const c = canvas.getContext('2d');
  const glow = c.createRadialGradient(64, 75, 6, 64, 75, 62);
  glow.addColorStop(0, 'rgba(255,198,82,.8)'); glow.addColorStop(.38, 'rgba(248,151,47,.3)'); glow.addColorStop(1, 'rgba(240,137,35,0)');
  c.fillStyle = glow; c.fillRect(0, 0, 128, 160);
  c.translate(64, 74);
  const fill = c.createLinearGradient(-23, 0, 23, 0);
  const colors = ['#b96830', '#a84e29', '#c18e48', '#9c5731'];
  fill.addColorStop(0, colors[type % 4]); fill.addColorStop(.45, '#ffdda0'); fill.addColorStop(.65, '#f5bc60'); fill.addColorStop(1, colors[type % 4]);
  c.fillStyle = fill; c.strokeStyle = '#f5ce83'; c.lineWidth = .8;
  c.beginPath(); c.moveTo(-23,-27); c.quadraticCurveTo(0,-40,23,-27); c.bezierCurveTo(28,-15,21,23,15,29); c.quadraticCurveTo(0,38,-15,29); c.bezierCurveTo(-21,23,-28,-15,-23,-27); c.closePath(); c.fill(); c.stroke();
  c.globalAlpha = .33; c.strokeStyle = '#9c5b2c';
  [-13,0,13].forEach(x=>{c.beginPath();c.moveTo(x,-30);c.quadraticCurveTo(x*.8,0,x*.65,31);c.stroke()});
  c.globalAlpha = .65; c.beginPath(); c.ellipse(0,27,15,5,0,0,Math.PI*2); c.stroke();
  c.globalAlpha = .8; c.fillStyle = '#fff5bd'; c.beginPath(); c.ellipse(0,31,3,6,0,0,Math.PI*2); c.fill();
  c.globalAlpha = .8; c.font = '15px SimSun, serif'; c.textAlign = 'center'; c.fillStyle = '#8e4f25'; c.fillText('愿',0,4);
  sprites.set(type, canvas); return canvas;
}

function lamp(c, x, y, size, alpha = 1) {
  c.globalAlpha = alpha;
  c.drawImage(lanternSprite(0), x-size, y-size*1.2, size*2, size*2.5);
}

function town(c, w, h, seconds, isMobile) {
  const awake = smooth((seconds-1.2)/6), warmth = smooth((seconds-6)/8);
  const y = h*.77, houseCount = isMobile ? 10 : 16;
  for(let i=0;i<houseCount;i++) {
    const x = w*(.015+i/(houseCount-1)*.97);
    if(x>w*.38 && x<w*.64)continue;
    const houseW=w*(isMobile?.095:.066), houseH=h*(.075+noise(i+2)*.075);
    const lit = smooth((seconds-(i%8)*.37-1.4)/2);
    c.globalAlpha=.75; c.fillStyle='#142a26'; c.fillRect(x-houseW*.5,y-houseH,houseW,houseH);
    c.strokeStyle=`rgba(220,171,93,${.12+lit*.68})`;c.lineWidth=Math.max(.6,w/1800);
    c.strokeRect(x-houseW*.5,y-houseH,houseW,houseH);
    c.fillStyle='#0d211f';c.beginPath();c.moveTo(x-houseW*.68,y-houseH+.007*h);
    c.quadraticCurveTo(x-houseW*.47,y-houseH+.012*h,x,y-houseH-.026*h);
    c.quadraticCurveTo(x+houseW*.47,y-houseH+.012*h,x+houseW*.68,y-houseH+.007*h);c.closePath();c.fill();c.stroke();
    for(let j=0;j<3;j++) {
      c.globalAlpha=.12+lit*.85;c.fillStyle=j%2?'#ffe3a1':'#dfa45a';
      c.fillRect(x-houseW*.35+j*houseW*.25,y-houseH*.67,houseW*.13,houseH*.4);
    }
    lamp(c,x-houseW*.47,y-houseH*.64,Math.max(3,w*.006),lit*.85);
    lamp(c,x+houseW*.47,y-houseH*.64,Math.max(3,w*.006),lit*.85);
    // Reflected shop windows extend along the water below the shoreline.
    c.fillStyle='#f8bc69';
    for(let k=0;k<6;k++) {
      c.globalAlpha=lit*(1-k/6)*(.08+.04*Math.sin(seconds*1.6+k+i));
      c.fillRect(x-houseW*.2+Math.sin(seconds*.7+k+i)*w*.003,y+h*(.025+k*.02),houseW*(.4+k*.12),Math.max(.7,h*.003));
    }
  }
  // The arched bridge connects the two illuminated banks.
  const left=w*.365,right=w*.65,top=h*.685,base=h*.82;
  c.globalAlpha=.93;c.fillStyle='#263a2e';c.strokeStyle=`rgba(244,198,112,${.2+awake*.7})`;c.lineWidth=Math.max(1,w*.001);
  c.beginPath();c.moveTo(left,base);c.bezierCurveTo(left+w*.035,top,right-w*.055,top,right,base);c.lineTo(right,h*.855);c.lineTo(left,h*.855);c.closePath();
  c.moveTo(w*.44,h*.855);c.bezierCurveTo(w*.445,h*.755,w*.565,h*.755,w*.58,h*.855);c.closePath();c.fill('evenodd');c.stroke();
  for(let i=0;i<13;i++) {
    const t=i/12,x=left+(right-left)*t,archY=base-Math.sin(Math.PI*t)*h*.105;
    c.globalAlpha=awake*.8;c.fillStyle='#edc47c';c.fillRect(x,archY-h*.022,Math.max(1,w*.002),h*.025);
    lamp(c,x,archY-h*.026,Math.max(2,w*.004),awake*.8);
  }
  const water=c.createRadialGradient(w*.52,h*.88,0,w*.52,h*.88,w*.34);
  water.addColorStop(0,`rgba(237,171,67,${.08+warmth*.18})`);water.addColorStop(1,'rgba(237,171,67,0)');
  c.globalAlpha=1;c.fillStyle=water;c.fillRect(0,h*.76,w,h*.24);
  for(let i=0;i<48;i++) {
    const yy=h*(.79+i*.0041),range=w*(.035+(i/48)*.22),xx=w*.515+Math.sin(i*2.8+seconds*.9)*range*.4;
    c.globalAlpha=awake*(.1+noise(i+70)*.33);c.strokeStyle='#ffcb78';c.lineWidth=Math.max(.7,h*.0018);
    c.beginPath();c.moveTo(xx-range*.38,yy);c.lineTo(xx+range*.38,yy);c.stroke();
  }
  c.globalAlpha=1;
}

function paint(c,w,h,seconds,isMobile=false,background=false){
  c.clearRect(0,0,w,h);
  if(background){const bg=c.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#0a202b');bg.addColorStop(.65,'#19382e');bg.addColorStop(1,'#061b1c');c.fillStyle=bg;c.fillRect(0,0,w,h)}
  const gathering=smooth(seconds/3),warmth=smooth((seconds-3)/10),peak=smooth((seconds-10)/6);
  const veil=c.createRadialGradient(w*.52,h*.65,0,w*.52,h*.65,w*.72);
  veil.addColorStop(0,`rgba(255,180,63,${warmth*.17})`);veil.addColorStop(.5,`rgba(255,172,51,${warmth*.05})`);veil.addColorStop(1,'rgba(255,172,51,0)');
  c.fillStyle=veil;c.fillRect(0,0,w,h);
  town(c,w,h,seconds,isMobile);
  // Waves of light travel across the waterfront before the mass release.
  for(let wave=0;wave<3;wave++){
    const t=clamp((seconds-2-wave*1.4)/6);if(t<=0||t>=1)continue;
    c.globalAlpha=Math.sin(t*Math.PI)*.28;c.strokeStyle='#f9ce7e';c.lineWidth=Math.max(1,h*.002);
    c.beginPath();c.ellipse(w*.515,h*.81,w*(.05+t*.54),h*(.012+t*.09),0,0,Math.PI*2);c.stroke();
  }
  const total=isMobile?62:112;
  for(let i=0;i<total;i++){
    const delay=4.8+(i%6)*.44+Math.floor(i/6)*.085,flight=clamp((seconds-delay)/(5.8+(i%5)*.4));
    if(flight<=0)continue;
    const rise=1-Math.pow(1-flight,1.6),depth=.45+noise(i+100)*.75;
    const targetX=.025+noise(i+4)*.95,originX=.09+noise(i+88)*.82;
    const targetY=.14+noise(i+90)*.46;
    const x=w*(originX+(targetX-originX)*rise)+Math.sin(seconds*.7+i*1.9)*w*.003;
    const y=h*(.83-(.83-targetY)*rise)+Math.sin(seconds*.8+i)*h*.004;
    let alpha=smooth(flight*7)*(.5+depth*.35);
    // Preserve the existing architectural inscription as the visual centre.
    if(!isMobile&&x>w*.29&&x<w*.72&&y>h*.15&&y<h*.37)alpha*=.16;
    const bodySize=Math.max(3.5,Math.min(w*.018,h*.033)*depth);
    c.globalAlpha=alpha;c.drawImage(lanternSprite(i%4),x-bodySize,y-bodySize*1.25,bodySize*2,bodySize*2.5);
  }
  // Quiet moving gold flecks add depth without a flashing fireworks layer.
  const specks=isMobile?42:95;
  for(let i=0;i<specks;i++){
    const x=w*noise(i+141),drift=(seconds*.012+noise(i+177))%1,y=h*(.92-drift*.77);
    if(!isMobile&&x>w*.29&&x<w*.72&&y>h*.15&&y<h*.37)continue;
    c.globalAlpha=(.15+peak*.45)*(.4+.3*Math.sin(seconds*.9+i));c.fillStyle=i%4?'#f8cc7d':'#fff4cb';
    const r=(.6+noise(i+19)*1.1)*Math.max(.6,w/1000);
    c.beginPath();c.arc(x+Math.sin(seconds*.5+i)*w*.005,y,r,0,Math.PI*2);c.fill();
  }
  if(seconds>10&&seconds<18){
    const t=(seconds-10)/8;c.globalAlpha=Math.sin(t*Math.PI)*.1;c.strokeStyle='#ffdc93';c.lineWidth=Math.max(1,w*.001);
    for(let i=0;i<2;i++){c.beginPath();c.ellipse(w*.52,h*.66,w*(.11+t*.51+i*.06),h*(.05+t*.25+i*.02),0,Math.PI,Math.PI*2);c.stroke()}
  }
  c.globalAlpha=1;
}

const scenes=new Map();let frame=0;
function mount(){
  const current=[...document.querySelectorAll('canvas.celebration-canvas')];
  for(const [canvas,scene] of scenes)if(!canvas.isConnected){scene.resize.disconnect();scenes.delete(canvas)}
  for(const canvas of current){
    if(scenes.has(canvas))continue;
    const c=canvas.getContext('2d');if(!c)continue;
    const scene={canvas,c,w:1,h:1,phase:'',mobile:canvas.dataset.surface==='mobile',resize:null};
    scene.resize=new ResizeObserver(()=>{
      const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);
      scene.w=Math.max(1,box.width);scene.h=Math.max(1,box.height);
      canvas.width=Math.round(scene.w*dpr);canvas.height=Math.round(scene.h*dpr);c.setTransform(dpr,0,0,dpr,0,0);
    });scene.resize.observe(canvas);scenes.set(canvas,scene);
  }
  if(scenes.size&&!frame)frame=requestAnimationFrame(tick);
}
function tick(){
  frame=0;const seconds=Math.max(0,(Date.now()-startTime())/1000),phase=celebrationPhase(seconds);
  for(const scene of scenes.values()){
    if(!scene.canvas.isConnected)continue;
    paint(scene.c,scene.w,scene.h,seconds,scene.mobile);
    if(phase.id!==scene.phase){
      scene.phase=phase.id;
      const root=scene.canvas.closest('.boundary,.glow-finale');root.dataset.finalePhase=phase.id;
      const title=root.querySelector('[data-finale-title]'),copy=root.querySelector('[data-finale-copy]');
      if(title)title.textContent=phase.title;if(copy)copy.textContent=phase.copy;
    }
  }
  if(scenes.size)frame=requestAnimationFrame(tick);
}
const watcher=new MutationObserver(mount);
watcher.observe(document.getElementById('app'),{childList:true,subtree:true});mount();
if(import.meta.hot)import.meta.hot.dispose(()=>{watcher.disconnect();if(frame)cancelAnimationFrame(frame);scenes.forEach(s=>s.resize.disconnect());scenes.clear()});

export function saveFinalePicture(mine){
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;
  const c=canvas.getContext('2d');paint(c,1080,1920,20,true,true);
  c.textAlign='center';c.fillStyle='#f6e4ba';c.font='34px SimSun, serif';c.fillText('西溪且留下 · 万愿成灯',540,140);
  c.font='86px SimSun, serif';c.fillText('万灯同辉',540,275);c.font='28px SimSun, serif';c.fillText('万千心愿，汇作一城灯火',540,345);
  if(mine){
    c.globalAlpha=1;c.drawImage(lanternSprite(['lotus','moon','fish','plum'].indexOf(mine.type)),380,420,320,400);
    c.fillStyle='#fce7b4';c.font='28px SimSun, serif';c.fillText('第 '+mine.serial+' 盏 · '+mine.name,540,865);
    c.font='38px SimSun, serif';
    const chars=Array.from(mine.wish||'');for(let i=0;i<chars.length;i+=14)c.fillText(chars.slice(i,i+14).join(''),540,935+Math.floor(i/14)*55);
  }
  c.fillStyle='#dfc38f';c.font='25px SimSun, serif';c.fillText('愿岁岁长安，家家团圆',540,1780);c.font='20px SimSun, serif';c.fillText('西溪新春灯事 · 灯火纪念',540,1830);
  canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='西溪万灯同辉-'+(mine?.serial||'纪念')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)},'image/png');
}
