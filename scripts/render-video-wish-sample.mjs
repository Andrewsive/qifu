import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DEFAULT_TRACK,DEFAULT_WISH,TEXT_SIZE,VIDEO_SIZE } from '../experiments/video-wish/tracking.js';
import { textLayout } from '../experiments/video-wish/renderer.js';

const root=process.cwd(),output=path.join(root,'output','video-wish');
const source=path.join(root,'experiments','video-wish','media','source.mp4');
fs.mkdirSync(output,{recursive:true});
const font='output/video-wish/ink-font.ttf';
fs.copyFileSync('C:/Windows/Fonts/simkai.ttf',path.join(root,font));
const escapeText=value=>String(value).replace(/\\/g,'\\\\').replace(/'/g,"'\\''").replace(/:/g,'\\:').replace(/%/g,'\\%');
const data={wish:process.argv[2]||DEFAULT_WISH.wish,name:process.argv[3]||DEFAULT_WISH.name,serial:process.argv[4]||DEFAULT_WISH.serial};
function run(args){const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});if(result.error)throw result.error;if(result.status!==0)throw new Error(result.stderr||'FFmpeg failed')}
const draw=textLayout(data).map(item=>`drawtext=fontfile=${font}:text='${escapeText(item.text)}':fontsize=${item.size}:fontcolor=0x642c20@0.88:x=${item.x}-tw/2:y=${item.y}-th/2`).join(',');
run(['-f','lavfi','-i',`color=c=black@0.0:s=${TEXT_SIZE.join('x')},format=rgba`,'-vf',draw+',drawbox=x=143:y=138:w=98:h=2:color=0x763b28@0.44:t=fill','-frames:v','1','output/video-wish/text-texture.png']);
function expression(corner,axis){let result=String(DEFAULT_TRACK.at(-1).q[corner][axis]);for(let i=DEFAULT_TRACK.length-2;i>=0;i--){const a=DEFAULT_TRACK[i],b=DEFAULT_TRACK[i+1],av=a.q[corner][axis],bv=b.q[corner][axis];result=`if(lt(on,${b.t*24}),${av}+(${bv-av})*(on-${a.t*24})/${(b.t-a.t)*24},${result})`}return result}
const order=[0,1,3,2],perspective=order.flatMap((corner,index)=>['x','y'].map((axis,j)=>`${axis}${index}='${expression(corner,j)}'`)).join(':')+':sense=destination:eval=frame:interpolation=cubic';
const graph=`[0:v]format=gbrp,split=2[base][paper];[1:v]scale=${VIDEO_SIZE.join(':')},format=rgba,perspective=${perspective},fade=t=out:st=2.45:d=0.8:alpha=1[warped];[warped]split=2[col][matte];[col]format=gbrp[ink];[matte]alphaextract,format=gray[mask];[paper][ink]blend=all_mode=multiply[printed];[base][printed][mask]maskedmerge,format=yuv420p[out]`;
fs.writeFileSync(path.join(output,'render-filter.txt'),graph);
run(['-i',source,'-loop','1','-framerate','24','-i','output/video-wish/text-texture.png','-filter_complex',graph,'-map','[out]','-map','0:a?','-c:v','libx264','-crf','18','-preset','fast','-c:a','copy','-t','6.08','-movflags','+faststart','output/video-wish/wish-sample.mp4']);
fs.writeFileSync(path.join(output,'sample-manifest.json'),JSON.stringify({source:'视频节点 1.mp4',...data,size:VIDEO_SIZE,fps:24,calibration:'manual keyframes',exportedAt:new Date().toISOString()},null,2));
console.log('MP4 exported: '+path.join(output,'wish-sample.mp4'));
