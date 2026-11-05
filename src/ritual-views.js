const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function poolLantern(type = 'lotus') {
  return `<span class="pond-lamp ${escape(type)}" aria-hidden="true"><i></i><b></b><em></em></span>`;
}

export function releaseCanvas(wish, surface = 'wall') {
  return `<canvas class="release-canvas" data-surface="${surface}" data-wish-id="${escape(wish?.id)}" data-wish="${escape(wish?.wish)}" data-name="${escape(wish?.name)}" data-serial="${escape(wish?.serial)}" aria-label="第${escape(wish?.serial)}盏愿灯，${escape(wish?.name)}的心愿：${escape(wish?.wish)}"></canvas>`;
}

export function releasePhoneScene(mine, picked) {
  const wish = mine || picked;
  const lucky = !!mine && String(mine.id) === String(picked?.id);
  return `<section class="m-scene release-mobile ${lucky ? 'is-lucky' : ''}"><div class="step">02 <span>点灯放飞</span></div><h1>灯起，愿行</h1><p>${mine ? '你的心愿，正在随灯启程' : '同赏本轮幸运愿灯'}</p><div class="release-stage">${releaseCanvas(wish, 'mobile')}${lucky ? '<div class="release-lucky" role="status">✦ 恭喜，你的愿灯成为本轮幸运主灯 ✦</div>' : ''}</div><div class="release-identity">第 ${escape(wish?.serial)} 盏 · ${escape(wish?.name)}</div><div class="release-status"><b data-release-title>点亮心灯</b><p data-release-copy>将美好心愿，写进这一盏光</p></div><small class="release-note">${lucky ? '你的放飞画面，正在公共白墙同步呈现' : mine ? '我的愿灯一同放飞 · 白墙展示本轮幸运愿灯' : '灯火相伴，共迎新岁'}</small></section>`;
}
