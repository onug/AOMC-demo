// Audio narration for live demo dashboard
// Audio files served from public/narration/audio/live/
// Uses a queue so rapid WebSocket events don't cut off each other's narration.

const AUDIO_BASE_PATH = '/narration/audio/live';

let currentAudio: HTMLAudioElement | null = null;
const audioQueue: string[] = [];
let onQueueEmptyCallback: (() => void) | null = null;

function playNext(): void {
  if (audioQueue.length === 0) {
    currentAudio = null;
    if (onQueueEmptyCallback) {
      const cb = onQueueEmptyCallback;
      onQueueEmptyCallback = null;
      cb();
    }
    return;
  }
  const segmentId = audioQueue.shift()!;
  try {
    currentAudio = new Audio(`${AUDIO_BASE_PATH}/${segmentId}.mp3`);
    currentAudio.onended = () => playNext();
    currentAudio.onerror = () => playNext();
    currentAudio.play().catch(() => playNext());
  } catch {
    playNext();
  }
}

export function playAudio(segmentId: string): void {
  audioQueue.push(segmentId);
  // If nothing is currently playing, start the queue
  if (!currentAudio || currentAudio.paused) {
    playNext();
  }
}

export function stopAudio(): void {
  audioQueue.length = 0;
  onQueueEmptyCallback = null;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio = null;
  }
}

export function isAudioPlaying(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}

export function shouldBlockAdvance(): boolean {
  return isAudioPlaying();
}

/** Register a callback that fires when the queue drains and nothing is playing. */
export function setOnQueueEmpty(cb: (() => void) | null): void {
  if (cb && audioQueue.length === 0 && (!currentAudio || currentAudio.paused)) {
    // Queue is already empty — fire immediately
    cb();
    return;
  }
  onQueueEmptyCallback = cb;
}
