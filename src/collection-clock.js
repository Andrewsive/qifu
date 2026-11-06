export const COLLECTION_DURATION_MS = 120000;

export function createCollectionClock(startedAt = Date.now(), duration = COLLECTION_DURATION_MS) {
  return { startedAt, endsAt: startedAt + duration };
}

export function collectionCountdown(clock, now = Date.now()) {
  const seconds = Math.max(0, Math.ceil((clock.endsAt - now) / 1000));
  return {
    text: String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0'),
    seconds,
    urgent: seconds > 0 && seconds <= 10,
    finished: seconds === 0,
    progress: Math.min(1, Math.max(0, (now - clock.startedAt) / Math.max(1, clock.endsAt - clock.startedAt))),
  };
}
