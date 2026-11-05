import { poolLantern } from './ritual-views.js';

export const POOL_BASE_LIGHTS = 6;
export const POOL_INTERVAL_MS = 1900;
export const POOL_AMBIENT_LIMIT = 160;
export const POOL_HIGHLIGHT_MS = 4000;

export function createGrowingPool(startedAt = Date.now()) {
  return { version: 1, cycleId: String(startedAt), startedAt, frozenAt: null, guests: [] };
}

export function addPoolGuest(pool, { wishId, type = 'lotus', litAt = Date.now() }) {
  if (pool.frozenAt !== null || pool.guests.some(guest => String(guest.wishId) === String(wishId))) return pool;
  return { ...pool, guests: [...pool.guests, { id: 'guest:' + wishId, wishId: String(wishId), type, litAt, slot: pool.guests.length * 2 + 1, source: 'guest' }] };
}

export function freezeGrowingPool(pool, at = Date.now()) {
  return pool.frozenAt !== null ? pool : { ...pool, frozenAt: at };
}

export function growingPoolEntries(pool, now = Date.now()) {
  const clock = pool.frozenAt ?? now;
  const extra = Math.min(POOL_AMBIENT_LIMIT - POOL_BASE_LIGHTS, Math.max(0, Math.floor((clock - pool.startedAt) / POOL_INTERVAL_MS)));
  const ambient = Array.from({ length: POOL_BASE_LIGHTS + extra }, (_, i) => ({
    id: 'ambient:' + i, slot: i * 2, source: 'ambient', type: ['lotus', 'moon', 'fish', 'plum'][i % 4],
    litAt: i < POOL_BASE_LIGHTS ? pool.startedAt - POOL_HIGHLIGHT_MS : pool.startedAt + (i - POOL_BASE_LIGHTS + 1) * POOL_INTERVAL_MS,
  }));
  return [...ambient, ...pool.guests.filter(guest => guest.litAt <= clock)];
}

export function growingPoolPose(entry) {
  return { x: .07 + (entry.slot * .61803398875 % 1) * .86, y: .665 + (entry.slot * .41421356237 % 1) * .15 };
}

export function growingPoolScale(count) { return Math.max(.52, Math.min(1, Math.sqrt(60 / Math.max(1, count)))); }

/** Append only: old lamps keep their DOM identity and never expire during collection. */
export function syncGrowingPool(field, pool, now = Date.now(), resume = false) {
  if (!field) return;
  if (field.dataset.poolCycle !== pool.cycleId) {
    field.replaceChildren(); field.dataset.poolCycle = pool.cycleId;
  }
  const entries = growingPoolEntries(pool, now);
  const existing = new Map(Array.from(field.children, node => [node.dataset.poolId, node]));
  for (const entry of entries) {
    let node = existing.get(entry.id);
    if (!node) {
      node = document.createElement(entry.source === 'guest' ? 'button' : 'span');
      node.className = 'pool-item pool-persistent ' + (entry.source === 'guest' ? 'pool-guest' : 'pool-ambient');
      node.dataset.poolId = entry.id;
      node.dataset.poolSource = entry.source;
      if (entry.source === 'guest') {
        node.type = 'button'; node.dataset.w = entry.wishId; node.setAttribute('aria-label', '已加入愿池的愿灯');
      } else node.setAttribute('aria-hidden', 'true');
      const pose = growingPoolPose(entry);
      node.style.setProperty('--pool-x', pose.x * 100 + '%');
      node.style.setProperty('--pool-y', pose.y * 100 + '%');
      node.style.setProperty('--d', -(entry.slot % 4) + 's');
      node.style.setProperty('--lit-offset', -Math.max(0, now - entry.litAt) + 'ms');
      node.innerHTML = '<span class="pool-light">' + poolLantern(entry.type) + '</span>';
      field.append(node);
    } else if (resume) node.style.setProperty('--lit-offset', -Math.max(0, now - entry.litAt) + 'ms');
  }
  if (field.dataset.poolCount !== String(entries.length)) {
    field.dataset.poolCount = String(entries.length);
    field.style.setProperty('--pool-lamp-scale', growingPoolScale(entries.length));
  }
}
