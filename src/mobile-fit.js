/** Fit every companion scene to its actual screen, including short landscape screens. */
export function installMobileFit() {
  const screens = new Map();
  let frame = 0;
  function fitPreview(preview) {
    const desktop = window.matchMedia('(min-width: 821px)').matches;
    preview.dataset.phoneRatio = desktop ? '9:19.5' : 'viewport';
    if (desktop) {
      const scale = Math.min(preview.clientWidth / 390, preview.clientHeight / 845);
      preview.style.setProperty('--phone-preview-scale', String(Math.max(.05, scale)));
    } else {
      preview.style.removeProperty('--phone-preview-scale');
    }
  }
  function fit(screen) {
    const scene = screen.querySelector(':scope > .m-scene');
    const width = screen.clientWidth;
    const height = screen.clientHeight;
    if (!scene || !width || !height) return;
    scene.style.width = '';
    scene.style.height = '';
    scene.style.transform = '';
    let scale = 1;
    for (let pass = 0; pass < 4; pass++) {
      const logicalHeight = height / scale;
      const required = Math.max(scene.scrollHeight, ...Array.from(scene.children, child => {
        const style = getComputedStyle(child);
        if (style.position === 'absolute' || style.position === 'fixed') return 0;
        return child.offsetTop + child.offsetHeight + (parseFloat(style.marginBottom) || 0);
      }));
      if (required <= logicalHeight + 1) break;
      scale = Math.min(scale, height / (required + 2));
      scene.style.width = width / scale + 'px';
      scene.style.height = height / scale + 'px';
      scene.style.transform = 'scale(' + scale + ')';
    }
    scene.dataset.fitScale = scale.toFixed(3);
    const artwork = scene.querySelector('.song-girl-frame');
    if (artwork) {
      const girl = artwork.querySelector('.song-girl');
      girl.style.transform = 'translate(-50%, -50%) scale(' +
        Math.min(artwork.clientWidth / 230, artwork.clientHeight / 310, 1) + ')';
    }
  }
  function refresh() {
    frame = 0;
    const viewport = window.visualViewport;
    if (!viewport || viewport.scale === 1) {
      document.documentElement.style.setProperty('--app-height', (viewport?.height || window.innerHeight) + 'px');
    }
    document.querySelectorAll('.mobile > .phone').forEach(phone => {
      const preview = document.createElement('div');
      preview.className = 'phone-preview';
      phone.before(preview);
      preview.append(phone);
    });
    document.querySelectorAll('.phone-preview').forEach(fitPreview);
    for (const [screen, observer] of screens) {
      if (!screen.isConnected) { observer.disconnect(); screens.delete(screen); }
    }
    document.querySelectorAll('.phone > .scroll').forEach(screen => {
      if (!screens.has(screen)) {
        const observer = new ResizeObserver(schedule);
        observer.observe(screen);
        const preview = screen.closest('.phone-preview');
        if (preview) observer.observe(preview);
        screens.set(screen, observer);
      }
      fit(screen);
    });
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(refresh);
  }
  const mutations = new MutationObserver(records => {
    if (records.some(record => Array.from(record.addedNodes).some(node =>
      node.nodeType === 1 && (node.matches('.mobile,.phone,.m-scene') || node.querySelector('.phone'))
    ))) schedule();
  });
  mutations.observe(document.querySelector('main'), { childList: true, subtree: true });
  window.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  document.fonts.ready.then(schedule);
  schedule();
  if (import.meta.hot) import.meta.hot.dispose(() => {
    mutations.disconnect();
    screens.forEach(observer => observer.disconnect());
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', schedule);
    window.visualViewport?.removeEventListener('resize', schedule);
  });
}
