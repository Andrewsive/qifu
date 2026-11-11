const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function poolLantern(type = 'lotus') {
  return `<span class="pond-lamp ${escape(type)}" aria-hidden="true"><i></i><b></b><em></em></span>`;
}

export function releaseCanvas(wish, surface = 'wall') {
  return `<canvas class="release-canvas" data-surface="${surface}" data-wish-id="${escape(wish?.id)}" data-wish="${escape(wish?.wish)}" data-name="${escape(wish?.name)}" data-serial="${escape(wish?.serial)}" aria-label="${wish?'第'+escape(wish.serial)+'盏愿灯，'+escape(wish.name)+'的心愿：'+escape(wish.wish):'孔明灯共同放飞动画'}"></canvas>`;
}

export function releasePhoneScene(mine) {
  return `<section class="m-scene release-mobile"><div class="step">02 <span>少女点灯 · 孔明灯放飞</span></div><h1>灯起，愿行</h1><p>宋韵少女点亮心灯，与万千愿灯共同启程</p><div class="release-stage">${releaseCanvas(null,'mobile')}</div>${mine?`<div class="release-identity">我的愿灯 · 第 ${escape(mine.serial)} 盏 · ${escape(mine.name)} · 一同启程</div>`:''}<div class="release-status"><b data-release-title>少女点灯</b><p data-release-copy>一盏心灯亮起，照见万千新岁期盼</p></div><small class="release-note">灯火相伴，共迎新岁</small></section>`;
}
