import { currentVisualVariant } from './visual-variants.js';
import { installRitualRenderer,paintRitual,ensureRitualArtwork } from './ritual-renderer.js';
export { FINALE_DURATION_MS } from './ritual-motion.js';
export const GLOW_START_KEY='xixi-glow-start-v1';
let previewClock=null;
export function setCelebrationPreviewClock(value){previewClock=value}
const startTime=()=>previewClock??(Number(localStorage.getItem(GLOW_START_KEY))||Date.now());
installRitualRenderer(startTime);
export async function saveFinalePicture(mine){
  const variant=currentVisualVariant();await ensureRitualArtwork(variant.id);
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;const c=canvas.getContext('2d');
  paintRitual(c,1080,1920,25.5,{finale:true,mobile:true,wish:mine,visual:variant.id});
  c.textAlign='center';c.fillStyle='#f8e7bf';c.font='34px SimSun, serif';c.fillText('西溪且留下 · 万愿成灯',540,140);
  c.font='76px SimSun, serif';c.fillText('万灯同辉',540,265);c.font='26px SimSun, serif';c.fillText('让每一个心愿，都有灯火相伴',540,330);
  if(mine){c.fillStyle='#ead6ad';c.font='27px SimSun, serif';c.fillText('第 '+mine.serial+' 盏 · '+mine.name,540,1450);c.font='34px SimSun, serif';const chars=Array.from(mine.wish||'');for(let i=0;i<chars.length;i+=14)c.fillText(chars.slice(i,i+14).join(''),540,1520+Math.floor(i/14)*48)}
  c.fillStyle='#e2c899';c.font='28px SimSun, serif';c.fillText('新年快乐 · 愿岁岁平安',540,1790);c.font='20px SimSun, serif';c.fillText('西溪新春灯事 · 灯火纪念',540,1840);
  canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='西溪新年快乐-'+variant.label+'-'+(mine?.serial||'纪念')+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),30000)},'image/png');
}
