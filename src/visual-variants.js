export const VISUAL_VARIANTS = [
  { id: 'night-tour', label: '国风夜游', title: '西溪且留下 · 万愿成灯' },
  { id: 'gongbi', label: '宋韵工笔', title: '宋韵工笔 · 西溪且留下' },
  { id: 'ink-wash', label: '水墨雅韵', title: '水墨雅韵 · 西溪且留下' },
];

export function resolveVisualVariant(value) {
  return VISUAL_VARIANTS.find(variant => variant.id === value) || VISUAL_VARIANTS[0];
}

export function currentVisualVariant() {
  return resolveVisualVariant(document.documentElement.dataset.visual);
}

function applyVisualVariant(value) {
  const variant = resolveVisualVariant(value);
  document.documentElement.dataset.visual = variant.id;
  document.title = variant.title;
  document.querySelectorAll('#visualVariant').forEach(picker => { picker.value = variant.id; });
  return variant;
}

applyVisualVariant(new URL(location.href).searchParams.get('style'));
window.addEventListener('popstate', () => {
  applyVisualVariant(new URL(location.href).searchParams.get('style'));
  window.dispatchEvent(new Event('visualchange'));
});

export function mountVisualPicker(header) {
  if (!header || header.querySelector('#visualVariant')) return;
  const label = document.createElement('label');
  label.className = 'visual-picker';
  label.innerHTML = `<span>视觉版本</span><select id="visualVariant" aria-label="视觉版本">${VISUAL_VARIANTS.map(variant => `<option value="${variant.id}">${variant.label}</option>`).join('')}</select>`;
  const badge = header.querySelector(':scope > label');
  header.insertBefore(label, badge || null);
  const picker = label.querySelector('select');
  picker.value = currentVisualVariant().id;
  picker.addEventListener('change', () => {
    const variant = applyVisualVariant(picker.value);
    const url = new URL(location.href);
    url.searchParams.set('style', variant.id);
    history.replaceState(history.state, '', url);
    window.dispatchEvent(new Event('visualchange'));
  });
}
