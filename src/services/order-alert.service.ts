import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

let audioContext: AudioContext | null = null;
let audioElement: HTMLAudioElement | null = null;

const ORDER_ALERT_SOUND_PATH = "/sounds/u_oepgi4ep3v-som_matricula-464025.mp3";

function beepAt(
  context: AudioContext,
  startAt: number,
  frequency: number,
  duration: number,
  gainValue: number
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startAt);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(gainValue, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

function playGeneratedBeep() {
  const WebAudioContext =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!WebAudioContext) return;

  audioContext = audioContext || new WebAudioContext();

  const startAt = audioContext.currentTime;
  beepAt(audioContext, startAt, 880, 0.16, 0.08);
  beepAt(audioContext, startAt + 0.18, 1175, 0.22, 0.06);
}

async function playWebAlertSound() {
  if (!audioElement) {
    audioElement = new Audio(ORDER_ALERT_SOUND_PATH);
    audioElement.preload = "auto";
  }

  audioElement.currentTime = 0;
  await audioElement.play();
}

export async function playNewOrderAlert() {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    if (audioContext?.state === "suspended") {
      try {
        await audioContext.resume();
      } catch {
        // Ignore and let the HTML audio attempt below decide.
      }
    }

    try {
      await playWebAlertSound();
    } catch {
      playGeneratedBeep();
    }
    return;
  }

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Ignore alert fallback errors on unsupported devices.
  }
}
