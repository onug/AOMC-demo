// Audio narration utility for web demo
// Place this file in web-demo/lib/audio.ts
// Audio files go in web-demo/public/narration/audio/web/

const AUDIO_BASE_PATH = '/narration/audio/web';

// Map step IDs to audio file names
const STEP_AUDIO_MAP: Record<string, string> = {
  'title': 'title',
  'framing': 'framing',
  's1-title': 'scenario1_title',
  's1-phishing': 's1_phishing',
  's1-agent-deploy': 's1_agent_deploy',
  's1-rogue-joins': 's1_rogue_joins',
  's1-v1': 's1_identity',
  's1-recon': 's1_recon',
  's1-v2': 's1_runtime',
  's1-pii': 's1_data_exfil',
  's1-v3': 's1_data',
  's1-ransomware': 's1_ransomware',
  's1-pivot': 's1_lateral',
  's1-v4': 's1_zerotrust',
  's1-tools': 's1_tools',
  's1-v5': 's1_tools_violation',
  's1-autonomy': 's1_autonomy',
  's1-v6': 's1_autonomy_violation',
  's1-blast': 's1_damage',
  'incidents': 's1_incidents',
  's2-title': 'scenario2_title',
  's2-id-intro': 's2_identity_intro',
  's2-id-violation': 's2_identity_violation',
  's2-id-enable': 's2_identity_blocked',
  's2-id-blocked': 's2_identity_blocked',
  's2-rt-intro': 's2_runtime_intro',
  's2-rt-violation': 's2_runtime_violation',
  's2-rt-enable': 's2_runtime_blocked',
  's2-rt-blocked': 's2_runtime_blocked',
  's2-dg-intro': 's2_data_intro',
  's2-dg-violation': 's2_data_violation',
  's2-dg-enable': 's2_data_blocked',
  's2-dg-blocked': 's2_data_blocked',
  's2-zt-intro': 's2_zerotrust_intro',
  's2-zt-violation': 's2_zerotrust_violation',
  's2-zt-enable': 's2_zerotrust_blocked',
  's2-zt-blocked': 's2_zerotrust_blocked',
  's2-ta-intro': 's2_tools_intro',
  's2-ta-violation': 's2_tools_violation',
  's2-ta-enable': 's2_tools_blocked',
  's2-ta-blocked': 's2_tools_blocked',
  's2-ag-intro': 's2_autonomy_intro',
  's2-ag-violation': 's2_autonomy_violation',
  's2-ag-enable': 's2_autonomy_blocked',
  's2-ag-blocked': 's2_autonomy_blocked',
  's2-audit': 'audit_trail',
  'finale': 'conclusion',
};

let currentAudio: HTMLAudioElement | null = null;
let onAudioEndCallback: (() => void) | null = null;

// Play audio for a step and return a promise that resolves when audio finishes
export function playStepAudio(stepId: string): Promise<void> {
  return new Promise((resolve) => {
    stopAudio();
    
    const audioFile = STEP_AUDIO_MAP[stepId];
    if (!audioFile) {
      resolve();
      return;
    }
    
    const audioPath = `${AUDIO_BASE_PATH}/${audioFile}.mp3`;
    
    try {
      currentAudio = new Audio(audioPath);
      
      // Resolve when audio ends
      currentAudio.onended = () => {
        currentAudio = null;
        if (onAudioEndCallback) {
          onAudioEndCallback();
          onAudioEndCallback = null;
        }
        resolve();
      };
      
      // Also resolve on error (so we don't block forever)
      currentAudio.onerror = () => {
        currentAudio = null;
        resolve();
      };
      
      currentAudio.play().catch(() => {
        resolve(); // Resolve even if play fails
      });
    } catch {
      resolve();
    }
  });
}

export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio = null;
  }
  onAudioEndCallback = null;
}

export function isAudioPlaying(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}

// Wait for current audio to finish (if any)
export function waitForAudioEnd(): Promise<void> {
  return new Promise((resolve) => {
    if (!currentAudio || currentAudio.paused || currentAudio.ended) {
      resolve();
      return;
    }
    onAudioEndCallback = resolve;
  });
}

// Check if we should block advancing to next step
export function shouldBlockAdvance(): boolean {
  return isAudioPlaying();
}
