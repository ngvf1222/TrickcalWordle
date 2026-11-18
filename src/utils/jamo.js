// Hangul Jamo decomposition and fine-grained evaluation

export const CHO = [
  "ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ",
  "ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"
];

export const JUNG = [
  "ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ",
  "ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"
];

export const JONG = [
  "","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ",
  "ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"
];

/**
 * Decomposes a single character into Jamo array
 * e.g. "베" -> ["ㅂ", "ㅔ"], "핀" -> ["ㅍ", "ㅣ", "ㄴ"], "(" -> ["("], " " -> [" "]
 */
export function decomposeChar(char) {
  if (!char) return [" "];
  const code = char.charCodeAt(0);
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const sylCode = code - 0xAC00;
    const cho = Math.floor(sylCode / 588);
    const jung = Math.floor((sylCode % 588) / 28);
    const jong = sylCode % 28;
    const res = [CHO[cho], JUNG[jung]];
    if (jong > 0) res.push(JONG[jong]);
    return res;
  }
  return [char];
}

/**
 * Evaluates guess against target with per-Jamo granularity
 * @param {string} guessStr - e.g. "버터"
 * @param {string} targetStr - e.g. "베니"
 * @param {number} maxLen - default 9
 */
export function evaluateWordJamo(guessStr, targetStr, maxLen = 9) {
  const guessPadded = guessStr.padEnd(maxLen, " ");
  const targetPadded = targetStr.padEnd(maxLen, " ");

  // Count all Jamos in the target string
  const targetPool = {};
  for (let i = 0; i < maxLen; i++) {
    const jamos = decomposeChar(targetPadded[i]);
    for (const j of jamos) {
      targetPool[j] = (targetPool[j] || 0) + 1;
    }
  }

  // Decompose both words position by position
  const guessDecomposed = [];
  const targetDecomposed = [];
  for (let i = 0; i < maxLen; i++) {
    guessDecomposed.push(decomposeChar(guessPadded[i]));
    targetDecomposed.push(decomposeChar(targetPadded[i]));
  }

  const syllableEvals = [];

  // Pass 1: exact matches (Green)
  // An exact match: same syllable position i, same jamo position j, identical jamo
  for (let i = 0; i < maxLen; i++) {
    const gJamos = guessDecomposed[i];
    const tJamos = targetDecomposed[i];
    const jamoStatuses = [];

    for (let j = 0; j < gJamos.length; j++) {
      const gJ = gJamos[j];
      const tJ = tJamos[j];
      if (tJ && gJ === tJ) {
        jamoStatuses.push({ jamo: gJ, status: "correct" });
        targetPool[gJ] -= 1;
      } else {
        jamoStatuses.push({ jamo: gJ, status: "pending" });
      }
    }

    syllableEvals.push({
      char: guessPadded[i],
      targetChar: targetPadded[i],
      jamos: jamoStatuses,
    });
  }

  // Pass 2: present matches (Yellow) or absent (Gray)
  for (let i = 0; i < maxLen; i++) {
    const item = syllableEvals[i];
    for (const jObj of item.jamos) {
      if (jObj.status === "correct") continue;
      const gJ = jObj.jamo;
      if (targetPool[gJ] && targetPool[gJ] > 0) {
        jObj.status = "present";
        targetPool[gJ] -= 1;
      } else {
        jObj.status = "absent";
      }
    }

    // Determine overall syllable status
    const allCorrect = item.jamos.every(j => j.status === "correct") && item.char === item.targetChar;
    const someCorrect = item.jamos.some(j => j.status === "correct");
    const somePresent = item.jamos.some(j => j.status === "present");

    item.allCorrect = allCorrect;
    item.someCorrect = someCorrect;
    item.somePresent = somePresent;
  }

  return syllableEvals;
}

/**
 * Checks if the guess is a 100% win
 */
export function isWinningGuess(syllableEvals) {
  return syllableEvals.every(item => item.allCorrect);
}
