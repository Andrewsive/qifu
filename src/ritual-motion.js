export const RELEASE_DURATION_MS = 12000;
export const FINALE_DURATION_MS = 30000;
export const FORMATION_START = 7;
export const FORMATION_END = 17;
export const FIREWORKS_START = 20;
export const isFinaleStage = stage => stage === 'glow' || stage === 'close';
export const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
export const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
export const noise = value => { const n = Math.sin(value * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
export function seedOf(value) { return Array.from(String(value)).reduce((n, char) => (n * 31 + char.codePointAt(0)) >>> 0, 7); }

export function floatingPose(id, seconds = 0) {
  const seed = seedOf(id);
  return { x: .08 + noise(seed) * .84, y: .68 + noise(seed + 2) * .13 + Math.sin(seconds * 1.3 + seed) * .008 };
}

export function releasePhase(seconds) {
  if (seconds < 3) return { id: 'igniting', title: '点亮心灯', copy: '将美好心愿，写进这一盏光' };
  if (seconds < 8) return { id: 'releasing', title: '心愿放飞', copy: '你的愿灯，与万千心愿一同启程' };
  return { id: 'joining', title: '愿赴新岁', copy: '让灯火带着祝福，汇入远方灯海' };
}

export function finalePhase(seconds) {
  if (seconds < 7) return { id: 'pullback', title: '灯海渐远', copy: '拉远这一城灯火，让每一盏愿灯都有归处' };
  if (seconds < 17) return { id: 'forming', title: '众愿成字', copy: '万千盏灯，汇成同一句新年祝福' };
  if (seconds < 20) return { id: 'greeting', title: '新年快乐', copy: '愿你所盼，皆有回响' };
  if (seconds < 28) return { id: 'fireworks', title: '烟花贺岁', copy: '以满城灯火，迎一个欢喜新年' };
  return { id: 'hold', title: '新年快乐', copy: '灯火长明，愿岁岁平安' };
}

export function releaseLampPose(index, seconds, origin = null) {
  const seed = index + 41;
  const flight = ease((seconds - 2 - noise(seed) * 2) / 7);
  return {
    x: origin ? origin.x + (.08 + noise(seed + 1) * .84 + Math.sin(seconds * .45 + index) * .004 - origin.x) * flight : .08 + noise(seed + 1) * .84 + Math.sin(seconds * .45 + index) * .004,
    y: (origin?.y ?? .82) + (.25 + noise(seed + 2) * .4 - (origin?.y ?? .82)) * flight,
    scale: .5 + noise(seed + 3) * .6,
    alpha: origin ? 1 : ease((seconds - noise(seed) * 2) / 3),
  };
}

/** Released lights remain visible and converge to the text, rather than exiting at the roof. */
export function finaleLampPose(index, seconds, target, origins = []) {
  const start = releaseLampPose(index, 12, origins[index]);
  const cohort = origins.length || 80;
  const pullback = ease(seconds / 7);
  const far = index < cohort
    ? { x: .5 + (start.x - .5) * .48, y: .43 + (start.y - .43) * .48 }
    : { x: .035 + noise(index + 91) * .93, y: .23 + noise(index + 97) * .53 };
  const origin = index < cohort ? start : { x: far.x, y: .9 };
  const x = origin.x + (far.x - origin.x) * pullback;
  const y = origin.y + (far.y - origin.y) * pullback;
  const form = ease((seconds - FORMATION_START) / (FORMATION_END - FORMATION_START));
  return {
    x: x + (target.x - x) * form,
    y: y + (target.y - y) * form,
    alpha: index < cohort ? 1 : ease((seconds - noise(index) * 2) / 4),
    scale: (.75 - pullback * .35) * (1 - form) + .36 * form,
  };
}

export function heroPose(seconds, finale = false) {
  const flight = ease((seconds - 3) / 7);
  if (!finale) return { x: .52, y: .55 - flight * .12, scale: 1 - flight * .36, light: .3 + ease(seconds / 3) * .7 };
  const pull = ease(seconds / 7);
  const first = releaseLampPose(0, 12);
  return { x: .52 + (.5 + (first.x - .5) * .48 - .52) * pull, y: .43 + (.43 + (first.y - .43) * .48 - .43) * pull, scale: .64 * (1 - pull) + .045 * pull, light: 1 };
}

export function fireworkBursts(seconds) {
  if (seconds < FIREWORKS_START) return [];
  const clock = seconds < 30 ? seconds : 20 + (seconds - 30) % 12;
  return [20, 22.2, 24.3, 26.2].map((start, i) => ({
    index: i, age: clock - start, x: [.15, .84, .26, .73][i], y: [.29, .32, .24, .23][i], radius: [.13, .15, .10, .12][i],
  })).filter(burst => burst.age >= 0 && burst.age <= 2.6);
}
