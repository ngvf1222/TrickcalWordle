import trickcalData from '../data/trickcalWords.json';

export const CHARACTERS = trickcalData.characters || [];
const EPOCH = new Date('2022-01-01T00:00:00+09:00').getTime();

/**
 * 이름 뒤에 빈칸을 붙여 지정된 최대 글자수로 맞춤
 */
export function padWord(word, maxLen = 9) {
  if (!word) return ' '.repeat(maxLen);
  return word.padEnd(maxLen, ' ');
}

/**
 * Deterministic pseudo-random number generator (Mulberry32-based)
 */
export function getDailyWordIndex(dayIndex, totalWords) {
  let t = (dayIndex + 0x6D2B79F5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const rand = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return Math.floor(rand * totalWords);
}

/**
 * Calculates daily word and stats given a base date and max length
 */
export function calculateDaily(dateObj = new Date(), maxLen = 9) {
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(dateObj).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  const dateStr = `${parts.year}-${parts.month}-${parts.day}`;
  const todayMidnight = new Date(`${dateStr}T00:00:00+09:00`).getTime();
  const nextMidnight = todayMidnight + 24 * 60 * 60 * 1000;
  const nowMs = dateObj.getTime();
  const nextResetSeconds = Math.max(0, Math.floor((nextMidnight - nowMs) / 1000));

  const dayIndex = Math.floor((todayMidnight - EPOCH) / (1000 * 60 * 60 * 24));
  
  const eligible = CHARACTERS.filter(c => c.length <= maxLen);
  const pool = eligible.length > 0 ? eligible : CHARACTERS;
  const wordIndex = getDailyWordIndex(dayIndex, pool.length);
  const rawWord = pool[wordIndex];

  return {
    word: rawWord,
    paddedWord: padWord(rawWord, maxLen),
    gameNumber: dayIndex,
    date: dateStr,
    nextResetSeconds,
    maxLength: maxLen,
  };
}
