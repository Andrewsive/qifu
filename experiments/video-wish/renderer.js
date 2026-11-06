import { TEXT_SIZE,homography,project } from './tracking.js';

export function textLayout({wish,name,serial}) {
  const chars=Array.from(wish),columns=Math.max(1,Math.ceil(chars.length/6)),rows=Math.ceil(chars.length/columns);
  const font=Math.min(94,280/columns,420/Math.max(rows,1));
  const items=[{text:String(serial),x:192,y:58,size:34},{text:name,x:192,y:104,size:25}];
  chars.forEach((text,i)=>items.push({text,x:192+((columns-1)/2-Math.floor(i/rows))*font*1.24,y:210+(i%rows)*font*1.12,size:font}));
  return items;
}

export function makeTextCanvas(data) {
  const canvas=document.createElement('canvas');[canvas.width,canvas.height]=TEXT_SIZE;
  const c=canvas.getContext('2d');c.textAlign='center';c.textBaseline='middle';c.fillStyle='#642c20';
  for(const item of textLayout(data)){c.font=`${item.size}px KaiTi, STKaiti, SimSun, serif`;c.fillText(item.text,item.x,item.y)}
  c.strokeStyle='#763b2870';c.lineWidth=1.6;c.beginPath();c.moveTo(143,138);c.lineTo(241,138);c.stroke();
  return canvas;
}

function triangle(c,image,source,dest) {
  const [[u0,v0],[u1,v1],[u2,v2]]=source,[[x0,y0],[x1,y1],[x2,y2]]=dest;
  const denominator=u0*(v1-v2)+u1*(v2-v0)+u2*(v0-v1);
  const a=(x0*(v1-v2)+x1*(v2-v0)+x2*(v0-v1))/denominator;
  const b=(y0*(v1-v2)+y1*(v2-v0)+y2*(v0-v1))/denominator;
  const d=(x0*(u2-u1)+x1*(u0-u2)+x2*(u1-u0))/denominator;
  const e=(y0*(u2-u1)+y1*(u0-u2)+y2*(u1-u0))/denominator;
  c.save();c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.lineTo(x2,y2);c.closePath();c.clip();
  c.setTransform(a,b,d,e,x0-a*u0-d*v0,y0-b*u0-e*v0);c.drawImage(image,0,0);c.restore();
}

export function drawWish(c,texture,quad,opacity=1) {
  if(opacity<=0)return;
  let matrix;try{matrix=homography(quad)}catch{return}
  c.save();c.globalAlpha=opacity*.88;c.globalCompositeOperation='multiply';
  // Small triangles approximate a projective surface with Canvas 2D; the same
  // measured quad also drives the offline perspective filter in the MP4 export.
  const cols=6,rows=12,w=texture.width,h=texture.height;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
    const u=x/cols,v=y/rows,u1=(x+1)/cols,v1=(y+1)/rows;
    const src=[[u*w,v*h],[u1*w,v*h],[u1*w,v1*h],[u*w,v1*h]],dst=[[u,v],[u1,v],[u1,v1],[u,v1]].map(p=>project(matrix,...p));
    triangle(c,texture,[src[0],src[1],src[2]],[dst[0],dst[1],dst[2]]);
    triangle(c,texture,[src[0],src[2],src[3]],[dst[0],dst[2],dst[3]]);
  }c.restore();
}
