export const RECORDING_STEPS = [
  { id: 'lead', label: '录屏准备', duration: 3000 },
  { id: 'opening', label: '开场号召 · 灯市开启', duration: 10000 },
  { id: 'invite', label: '看见灯市 · 游客加入', duration: 3000 },
  { id: 'guide', label: '手机参与引导', duration: 3000 },
  { id: 'choose', label: '选择花灯', duration: 3000 },
  { id: 'write', label: '写下心愿与落款', duration: 5000 },
  { id: 'generated', label: '生成专属愿灯', duration: 5000 },
  { id: 'handoff', label: '放愿入灯市 · 手机收灯', duration: 6000 },
  { id: 'waiting', label: '请抬头看白墙 · 心愿上墙', duration: 8000 },
  { id: 'lighting', label: '幸运愿灯 · 点灯接福', duration: 8000 },
  { id: 'glow', label: '万灯同辉 · 众愿共明', duration: 21000 },
  { id: 'close', label: '礼成收束 · 留存纪念', duration: 4000 },
];
export const RECORDING_DURATION = RECORDING_STEPS.reduce((sum, step) => sum + step.duration, 0);
const timeText = milliseconds => {
  const seconds = Math.floor(milliseconds / 1000);
  return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
};

/** One cancellable timeline drives the two views; the host supplies isolated demo state. */
export function createRecordingDemo(hooks, clock = {}) {
  const now = clock.now || (() => performance.now());
  const wallNow = clock.wallNow || Date.now;
  const schedule = clock.schedule || (callback => setInterval(callback, 100));
  const cancel = clock.cancel || clearInterval;
  let timer = null;
  let startedAt = 0;
  let startedWallAt = 0;
  let index = -1;
  let elapsed = 0;
  let status = 'idle';
  let sessionOpen = false;
  let clean = false;
  const active = () => status === 'running';
  function render() { hooks.render(); paintControls(); }
  function paintControls() {
    if (typeof document === 'undefined') return;
    const step = RECORDING_STEPS[index];
    document.querySelectorAll('[data-recording-label]').forEach(node => {
      node.textContent = status === 'completed' ? '演示完成 · 可重新播放' : active() ? step.label : '完整双屏流程 · 约80秒';
    });
    document.querySelectorAll('[data-recording-time]').forEach(node => { node.textContent = timeText(elapsed) + ' / ' + timeText(RECORDING_DURATION); });
    document.querySelectorAll('[data-recording-progress]').forEach(node => { node.style.width = elapsed / RECORDING_DURATION * 100 + '%'; });
    document.querySelectorAll('[data-recording-count]').forEach(node => { node.textContent = String(Math.max(1, Math.ceil((3000 - elapsed) / 1000))); });
    document.querySelectorAll('.sync-page').forEach(node => {
      node.dataset.recordingStatus = status;
      node.dataset.recordingPhase = step?.id || '';
    });
    document.body.classList.toggle('recording-clean', clean);
  }
  function tick() {
    if (!active()) return;
    elapsed = Math.min(RECORDING_DURATION, Math.max(0, now() - startedAt));
    let offset = 0;
    let next = 0;
    while (next < RECORDING_STEPS.length - 1 && elapsed >= offset + RECORDING_STEPS[next].duration) {
      offset += RECORDING_STEPS[next++].duration;
    }
    while (index < next) {
      index++;
      const plannedOffset = RECORDING_STEPS.slice(0, index).reduce((sum, item) => sum + item.duration, 0);
      hooks.enter(RECORDING_STEPS[index].id, { startedAt: startedWallAt + plannedOffset });
      render();
    }
    const step = RECORDING_STEPS[index];
    hooks.update?.(step.id, Math.min(1, (elapsed - offset) / step.duration));
    hooks.progress?.();
    if (elapsed >= RECORDING_DURATION) {
      cancel(timer); timer = null; status = 'completed'; render();
    }
    paintControls();
  }
  function start() {
    if (timer !== null) cancel(timer);
    if (sessionOpen) hooks.closeSession();
    hooks.openSession();
    sessionOpen = true;
    status = 'running';
    index = -1;
    elapsed = 0;
    startedAt = now();
    startedWallAt = wallNow();
    tick();
    timer = schedule(tick);
  }
  function stop() {
    if (timer !== null) cancel(timer);
    timer = null;
    if (sessionOpen) hooks.closeSession();
    sessionOpen = false;
    status = 'idle';
    index = -1;
    elapsed = 0;
    clean = false;
    render();
  }
  function toggleClean() { clean = !clean; render(); }
  const escape = event => { if (event.key === 'Escape' && clean) { clean = false; render(); } };
  if (typeof document !== 'undefined') document.addEventListener('keydown', escape);
  if (import.meta.hot) import.meta.hot.dispose(() => {
    if (timer !== null) cancel(timer);
    if (typeof document !== 'undefined') { document.removeEventListener('keydown', escape); document.body.classList.remove('recording-clean'); }
  });
  return {
    start, restart: start, stop, toggleClean, paintControls,
    get active() { return active(); },
    get hasSession() { return sessionOpen; },
    get state() { return { status, phase: RECORDING_STEPS[index]?.id || '', elapsed, duration: RECORDING_DURATION, clean }; },
    controls() {
      return '<section class="recording-toolbar" aria-label="完整流程自动演示">' +
        '<div class="recording-actions"><button id="startRecordingDemo"' + (active() ? ' disabled' : '') + '>' +
        (active() ? '演示进行中' : status === 'completed' ? '↻ 重播完整演示' : '▶ 加速自动演示') + '</button>' +
        (sessionOpen ? '<button id="restartRecordingDemo">重新开始</button><button id="stopRecordingDemo">返回手动体验</button>' : '') +
        '<button id="cleanRecordingDemo" aria-pressed="' + clean + '" title="鼠标移至顶部显示控件，按 Esc 返回">' + (clean ? '退出净画面' : '录屏净画面') + '</button></div>' +
        '<div class="recording-progress"><div><b data-recording-label role="status" aria-live="polite">完整双屏流程 · 约80秒</b>' +
        '<span data-recording-time aria-hidden="true">' + timeText(elapsed) + ' / ' + timeText(RECORDING_DURATION) + '</span></div>' +
        '<div class="recording-track"><i data-recording-progress></i></div></div></section>';
    },
    countdown() {
      return active() && index === 0 ? '<div class="recording-countdown"><small>录屏即将开始</small><b data-recording-count>3</b><span>全程自动演示 · 净画面模式按 Esc 返回</span></div>' : '';
    },
  };
}
