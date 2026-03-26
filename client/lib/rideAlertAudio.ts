let lastRideAlertAt = 0;

const RIDE_ALERT_THROTTLE_MS = 1800;
const HINDI_RIDE_ALERT_TEXT = "राइड आ गया";

export const playHindiRideAlert = () => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const now = Date.now();
  if (now - lastRideAlertAt < RIDE_ALERT_THROTTLE_MS) {
    return;
  }

  lastRideAlertAt = now;

  const utterance = new SpeechSynthesisUtterance(HINDI_RIDE_ALERT_TEXT);
  utterance.lang = "hi-IN";
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};