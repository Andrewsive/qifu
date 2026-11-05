export const PHONE_HANDOFF_MS = 6000;
export const WALL_ARRIVAL_MS = 4000;

/** The phone finishes first; its waiting screen and the wall arrival start together. */
export function createWishTransfer({ wishId, startedAt = Date.now(), waitingMs = 120000 }) {
  const wallStartedAt = startedAt + PHONE_HANDOFF_MS;
  return {
    phase: 'waiting',
    transferId: String(wishId) + ':' + startedAt,
    wishId,
    startedAt,
    phoneEndsAt: wallStartedAt,
    wallStartedAt,
    wallEndsAt: wallStartedAt + WALL_ARRIVAL_MS,
    endsAt: wallStartedAt + waitingMs,
  };
}

export function wishTransferView(event, now = Date.now()) {
  if (event?.phase !== 'waiting' || !Number.isFinite(event.wallStartedAt) || !Number.isFinite(event.wallEndsAt)) {
    return { phone: 'waiting', wall: 'settled', wallActive: false, wallElapsed: 0, phoneElapsed: 0, key: 'settled' };
  }
  const phone = now < event.phoneEndsAt ? 'handoff' : 'waiting';
  const wall = now < event.wallStartedAt ? 'queued' : now < event.wallEndsAt ? 'floating' : 'settled';
  return {
    phone,
    wall,
    wallActive: wall === 'floating',
    wallElapsed: Math.max(0, now - event.wallStartedAt),
    phoneElapsed: Math.max(0, now - event.startedAt),
    key: String(event.transferId) + ':' + wall,
  };
}

/** A re-render resumes the same animation at its absolute progress, never from zero. */
export function syncWallArrival(boundary, event, markup, now = Date.now()) {
  const view = wishTransferView(event, now);
  if (!view.wallActive) {
    boundary.classList.remove('wish-arrival');
    boundary.querySelectorAll('.arrival-wish,.arrival-path').forEach(node => node.remove());
    boundary.style.removeProperty('--arrival-offset');
    delete boundary.dataset.arrivalEvent;
    return;
  }
  if (boundary.dataset.arrivalEvent !== event.transferId || !boundary.querySelector('.arrival-wish')) {
    boundary.querySelectorAll('.arrival-wish,.arrival-path').forEach(node => node.remove());
    boundary.insertAdjacentHTML('beforeend', markup);
    boundary.dataset.arrivalEvent = event.transferId;
  }
  boundary.style.setProperty('--arrival-offset', -view.wallElapsed + 'ms');
  boundary.classList.add('wish-arrival');
}
