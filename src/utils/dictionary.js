import { CHARACTERS, padWord, calculateDaily } from './dailyLogic';

const characterSet = new Set(CHARACTERS);

export { CHARACTERS, padWord };

/**
 * Fetches server daily metadata WITHOUT exposing the target word
 */
export async function getDailyInfoFromServer(maxLen = 9) {
  try {
    const res = await fetch(`/api/daily?maxLen=${maxLen}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        ...data,
        isSecure: true,
      };
    }
  } catch (err) {
    console.warn('Failed to fetch /api/daily, using client fallback:', err);
  }

  // Fallback to client calculation if server is offline
  const fallback = calculateDaily(new Date(), maxLen);
  return {
    gameNumber: fallback.gameNumber,
    date: fallback.date,
    nextResetSeconds: fallback.nextResetSeconds,
    targetLength: fallback.word.length,
    fallbackWord: fallback.word,
    isSecure: false,
  };
}

/**
 * Submits daily guess to server for secure Jamo evaluation
 */
export async function submitDailyGuessToServer(guess, maxLen = 9, isGameOver = false) {
  try {
    const res = await fetch('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guess, maxLen, isGameOver }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Server guess evaluation failed:', err);
  }
  return null;
}

/**
 * Requests the answer from server when game is lost
 */
export async function revealDailyAnswerFromServer(maxLen = 9) {
  try {
    const res = await fetch('/api/reveal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxLen }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.word;
    }
  } catch (err) {
    console.warn('Server answer reveal failed:', err);
  }
  return null;
}

/**
 * Returns a random character for Practice Mode matching maxLen
 */
export function getRandomWord(maxLen = 9) {
  const eligible = CHARACTERS.filter(c => c.length <= maxLen);
  const pool = eligible.length > 0 ? eligible : CHARACTERS;
  const randomIndex = Math.floor(Math.random() * pool.length);
  const rawWord = pool[randomIndex];
  return {
    word: rawWord,
    paddedWord: padWord(rawWord, maxLen),
  };
}

/**
 * Validates whether the name is an existing Trickcal character and <= maxLen
 */
export function isValidCharacter(name, maxLen = 9) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return characterSet.has(trimmed) && trimmed.length <= maxLen;
}

/**
 * Searches characters matching query and maxLen
 */
export function searchCharacters(query, maxLen = 9) {
  if (!query) return [];
  const q = query.trim().toLowerCase();
  return CHARACTERS.filter(name => name.length <= maxLen && name.toLowerCase().includes(q));
}
