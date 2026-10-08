/** WPM = (correct characters / 5) / minutes. Returns 0 for non-positive time. */
export const wpm = (correctChars: number, seconds: number) => seconds > 0 ? correctChars / 5 / (seconds / 60) : 0;
export const rawWpm = (typedChars: number, seconds: number) => wpm(typedChars, seconds);
/** Accuracy = correct / typed * 100. Untyped characters are not errors. 100 when nothing typed. */
export const accuracy = (correct: number, typed: number) => typed > 0 ? (correct / typed) * 100 : 100;
