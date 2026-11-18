import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';

function dailyApiPlugin() {
  const wordData = JSON.parse(fs.readFileSync(new URL('./src/data/trickcalWords.json', import.meta.url)));
  const characters = wordData.characters || [];
  const EPOCH = new Date('2022-01-01T00:00:00+09:00').getTime();

  const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  const JUNG = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
  const JONG = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

  function decomposeChar(char) {
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

  function evaluateWordJamo(guessStr, targetStr, maxLen) {
    const guessPadded = guessStr.padEnd(maxLen, " ");
    const targetPadded = targetStr.padEnd(maxLen, " ");

    const targetPool = {};
    for (let i = 0; i < maxLen; i++) {
      const jamos = decomposeChar(targetPadded[i]);
      for (const j of jamos) {
        targetPool[j] = (targetPool[j] || 0) + 1;
      }
    }

    const guessDecomposed = [];
    const targetDecomposed = [];
    for (let i = 0; i < maxLen; i++) {
      guessDecomposed.push(decomposeChar(guessPadded[i]));
      targetDecomposed.push(decomposeChar(targetPadded[i]));
    }

    const syllableEvals = [];

    // Pass 1: exact matches
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

    // Pass 2: present or absent
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

      const allCorrect = item.jamos.every(j => j.status === "correct") && item.char === item.targetChar;
      const someCorrect = item.jamos.some(j => j.status === "correct");
      const somePresent = item.jamos.some(j => j.status === "present");

      item.allCorrect = allCorrect;
      item.someCorrect = someCorrect;
      item.somePresent = somePresent;
    }

    return syllableEvals;
  }

  function getDailyWordIndex(dayIndex, totalWords) {
    let t = (dayIndex + 0x6D2B79F5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const rand = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return Math.floor(rand * totalWords);
  }

  function getDailyInfo() {
    const now = new Date();
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

    const parts = formatter.formatToParts(now).reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

    const dateStr = `${parts.year}-${parts.month}-${parts.day}`;
    const todayMidnight = new Date(`${dateStr}T00:00:00+09:00`).getTime();
    const nextMidnight = todayMidnight + 24 * 60 * 60 * 1000;
    const nextResetSeconds = Math.max(0, Math.floor((nextMidnight - now.getTime()) / 1000));
    const dayIndex = Math.floor((todayMidnight - EPOCH) / (1000 * 60 * 60 * 24));

    // Uniform global daily character from all 137 characters
    const wordIndex = getDailyWordIndex(dayIndex, characters.length);
    const targetWord = characters[wordIndex];

    return {
      targetWord,
      gameNumber: dayIndex,
      date: dateStr,
      serverTime: now.toISOString(),
      nextResetSeconds,
      targetLength: targetWord.length,
    };
  }

  return {
    name: 'wordle-daily-api',
    configureServer(server) {
      // 1. GET /api/daily: Returns date, countdown, gameNumber, targetLength WITHOUT plain word!
      server.middlewares.use('/api/daily', (req, res, next) => {
        if (req.method !== 'GET') return next();

        const info = getDailyInfo();

        const payload = JSON.stringify({
          gameNumber: info.gameNumber,
          date: info.date,
          serverTime: info.serverTime,
          nextResetSeconds: info.nextResetSeconds,
          targetLength: info.targetLength,
        });

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.end(payload);
      });

      // 2. POST /api/guess: Server evaluates the guess
      server.middlewares.use('/api/guess', (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const guess = (data.guess || '').trim();
            const info = getDailyInfo();
            // If target is longer than client's maxLen, automatically use target length / 9
            const effectiveMaxLen = Math.max(data.maxLen || 9, info.targetLength);

            const evalResult = evaluateWordJamo(guess, info.targetWord, effectiveMaxLen);
            const isWin = guess === info.targetWord;

            const payload = JSON.stringify({
              evalResult,
              isWin,
              effectiveMaxLen,
              answer: (isWin || data.isGameOver) ? info.targetWord : null,
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(payload);
          } catch (e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid request' }));
          }
        });
      });

      // 3. POST /api/reveal: Reveals answer when game is lost
      server.middlewares.use('/api/reveal', (req, res, next) => {
        if (req.method !== 'POST') return next();

        const info = getDailyInfo();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ word: info.targetWord }));
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dailyApiPlugin(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  }
});
