export const VIDEO_SIZE = [1470, 630];
export const TEXT_SIZE = [384, 640];
export const DEFAULT_WISH = { wish: '家人安康', name: '小溪', serial: '018' };

// Manually calibrated against this specific clip. Points are TL, TR, BR, BL,
// in original video pixels. These are measurements, not automatic tracking.
export const DEFAULT_TRACK = [
  { t: 0, q: [[836,99],[1016,102],[972,335],[865,335]] },
  { t: .25, q: [[843,82],[1022,87],[980,315],[875,316]] },
  { t: .5, q: [[852,58],[1030,65],[987,289],[887,289]] },
  { t: .75, q: [[858,28],[1039,34],[996,260],[900,260]] },
  { t: 1, q: [[868,-6],[1047,1],[1004,225],[911,225]] },
  { t: 1.25, q: [[874,-35],[1050,-28],[1009,204],[919,203]] },
  { t: 1.5, q: [[880,-65],[1050,-59],[1009,185],[925,185]] },
  { t: 1.75, q: [[880,-88],[1048,-81],[1010,165],[925,165]] },
  { t: 2, q: [[881,-95],[1041,-88],[1008,148],[924,148]] },
  { t: 2.25, q: [[883,-94],[1028,-86],[1001,131],[924,131]] },
  { t: 2.5, q: [[886,-89],[1016,-82],[994,116],[925,116]] },
  { t: 2.75, q: [[888,-84],[1006,-77],[987,103],[927,103]] },
  { t: 3, q: [[891,-78],[998,-72],[981,90],[928,90]] },
  { t: 3.5, q: [[896,-67],[984,-62],[973,73],[930,73]] },
  { t: 4, q: [[900,-58],[976,-53],[968,56],[932,56]] },
  { t: 5, q: [[906,-44],[964,-39],[960,34],[931,34]] },
  { t: 6.08, q: [[910,-33],[954,-29],[952,15],[931,15]] },
];

export function quadAt(time, track = DEFAULT_TRACK) {
  if (time <= track[0].t) return track[0].q.map(point => [...point]);
  if (time >= track.at(-1).t) return track.at(-1).q.map(point => [...point]);
  const index = track.findIndex(frame => frame.t > time), a = track[index - 1], b = track[index];
  const fraction = (time - a.t) / (b.t - a.t);
  return a.q.map((point, i) => point.map((value, axis) => value + (b.q[i][axis] - value) * fraction));
}

export function textOpacity(time) { return Math.max(0, Math.min(1, (3.25 - time) / .8)); }

/** Project unit-square coordinates onto a quadrilateral, preserving perspective. */
export function homography(quad) {
  const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]] = quad;
  const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3;
  const dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;
  const denominator=dx1*dy2-dx2*dy1;
  if(Math.abs(denominator)<1e-9)throw new Error('灯面四角过于接近，请调整定位');
  const g=(dx3*dy2-dx2*dy3)/denominator,h=(dx1*dy3-dx3*dy1)/denominator;
  return [x1-x0+g*x1,x3-x0+h*x3,x0,y1-y0+g*y1,y3-y0+h*y3,y0,g,h,1];
}

export function project(matrix, u, v) {
  const w=matrix[6]*u+matrix[7]*v+1;
  return [(matrix[0]*u+matrix[1]*v+matrix[2])/w,(matrix[3]*u+matrix[4]*v+matrix[5])/w];
}

export function upsertFrame(track, time, quad) {
  const frame={t:Number(time.toFixed(4)),q:quad.map(point=>point.map(value=>Number(value.toFixed(2))))};
  const result=track.filter(item=>Math.abs(item.t-time)>1/48);
  return [...result,frame].sort((a,b)=>a.t-b.t);
}
