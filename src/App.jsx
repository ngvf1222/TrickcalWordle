import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import WordleBoard from './components/WordleBoard';
import CharacterInput from './components/CharacterInput';
import CharacterListModal from './components/CharacterListModal';
import HelpModal from './components/HelpModal';
import StatsModal from './components/StatsModal';
import SettingsModal from './components/SettingsModal';
import { 
  getDailyInfoFromServer, 
  submitDailyGuessToServer,
  revealDailyAnswerFromServer,
  getRandomWord, 
  isValidCharacter,
  padWord,
  CHARACTERS
} from './utils/dictionary';
import { evaluateWordJamo, isWinningGuess } from './utils/wordleLogic';
import { loadStats, saveGameResult } from './utils/stats';
import { sounds } from './utils/sound';

function getStableDayNumber() {
  const EPOCH = new Date('2022-01-01T00:00:00+09:00').getTime();
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(now).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  const midnight = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00+09:00`).getTime();
  return Math.floor((midnight - EPOCH) / (1000 * 60 * 60 * 24));
}

export default function App() {
  const [muted, setMuted] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Settings State: Difficulty, Theme, Max Length
  const [difficulty, setDifficulty] = useState(() => {
    return localStorage.getItem('wordle_difficulty') || 'normal';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('wordle_theme') || 'dark';
  });

  // Default Max Length: Mobile = 6 (92% pool, readable), Desktop = 9 (Full 100%)
  const [maxLen, setMaxLen] = useState(() => {
    const saved = localStorage.getItem('wordle_maxlen');
    if (saved) return Number(saved);
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 6;
    }
    return 9;
  });

  const maxAttempts = difficulty === 'hard' ? 5 : 6;

  // Stable Daily Game Number (Never null!)
  const [dailyNumber, setDailyNumber] = useState(() => getStableDayNumber());
  const [dailyTargetLength, setDailyTargetLength] = useState(2);

  // Game Mode & Target Info
  const [isDaily, setIsDaily] = useState(true);
  const [practiceWord, setPracticeWord] = useState(null);
  const [fallbackDailyWord, setFallbackDailyWord] = useState(null);

  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [isWinningRow, setIsWinningRow] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [revealedWord, setRevealedWord] = useState(null);
  const [stats, setStats] = useState(() => loadStats());

  const showToast = useCallback((message, duration = 2400) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(cur => (cur === message ? null : cur));
    }, duration);
  }, []);

  // Determine active board maxLen:
  // If Daily Mode and targetLength > 6, FORCE 9 columns on mobile and desktop!
  const isDailyLongWord = isDaily && (dailyTargetLength > 6);
  const activeMaxLen = isDailyLongWord ? 9 : maxLen;

  // Sync Daily Metadata from server
  const syncDailyInfo = useCallback(() => {
    getDailyInfoFromServer(maxLen).then((info) => {
      if (info.gameNumber) {
        setDailyNumber(info.gameNumber);
      }
      if (info.targetLength) {
        setDailyTargetLength(info.targetLength);
        // If daily answer is longer than 6 letters and user has a shorter board setting, notify!
        if (info.targetLength > 6 && maxLen < 9) {
          showToast(`📢 오늘의 사도는 6글자를 초과(${info.targetLength}자)하여 9칸 보드가 자동 적용되었습니다!`, 3600);
        }
      }
      if (info.fallbackWord) {
        setFallbackDailyWord(info.fallbackWord);
      }
    });
  }, [maxLen, showToast]);

  useEffect(() => {
    syncDailyInfo();
  }, [syncDailyInfo]);

  const triggerShake = (message) => {
    sounds.playError();
    setIsShaking(true);
    showToast(message);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Start new practice game
  const handleNewGame = useCallback(() => {
    const random = getRandomWord(maxLen);
    setIsDaily(false);
    setPracticeWord(random.word);
    setCurrentGuess('');
    setGuesses([]);
    setEvaluations([]);
    setIsShaking(false);
    setIsWinningRow(false);
    setIsGameOver(false);
    setIsWon(false);
    setRevealedWord(null);
    showToast('새로운 사도로 연습 게임 시작!');
  }, [maxLen, showToast]);

  // Switch to Daily game
  const handleDailyGame = useCallback(() => {
    setIsDaily(true);
    setCurrentGuess('');
    setGuesses([]);
    setEvaluations([]);
    setIsShaking(false);
    setIsWinningRow(false);
    setIsGameOver(false);
    setIsWon(false);
    setRevealedWord(null);
    syncDailyInfo();
    showToast(`오늘의 트릭컬 워들 (#${dailyNumber}) 시작!`);
  }, [dailyNumber, syncDailyInfo, showToast]);

  // Reset when settings change
  const handleResetGameWithNewSettings = ({ difficulty: newDiff, maxLen: newLen }) => {
    setCurrentGuess('');
    setGuesses([]);
    setEvaluations([]);
    setIsShaking(false);
    setIsWinningRow(false);
    setIsGameOver(false);
    setIsWon(false);
    setRevealedWord(null);

    if (isDaily) {
      syncDailyInfo();
    } else {
      const random = getRandomWord(newLen);
      setPracticeWord(random.word);
    }
    showToast('새 설정이 적용되었습니다.');
  };

  // Submit Guess
  const handleSubmitGuess = async () => {
    if (isGameOver) return;

    const trimmed = currentGuess.trim();
    if (!trimmed) {
      triggerShake('사도 이름을 입력해주세요!');
      return;
    }

    if (!isValidCharacter(trimmed, activeMaxLen)) {
      triggerShake(`목록에 없거나 ${activeMaxLen}자를 초과하는 사도입니다!`);
      return;
    }

    // Play tile flip sound
    for (let idx = 0; idx < activeMaxLen; idx++) {
      setTimeout(() => sounds.playFlip(idx), idx * 50);
    }

    let evalResult = null;
    let isWin = false;
    let answerWord = null;

    if (isDaily) {
      // SECURE: Server-side evaluation
      const res = await submitDailyGuessToServer(trimmed, activeMaxLen, guesses.length + 1 >= maxAttempts);
      if (res && res.evalResult) {
        evalResult = res.evalResult;
        isWin = res.isWin;
        answerWord = res.answer;
      } else {
        // Offline fallback
        const target = fallbackDailyWord || '베니';
        evalResult = evaluateWordJamo(padWord(trimmed, activeMaxLen), padWord(target, activeMaxLen), activeMaxLen);
        isWin = trimmed === target;
        answerWord = isWin ? target : null;
      }
    } else {
      // Practice mode local evaluation
      const target = practiceWord || '베니';
      evalResult = evaluateWordJamo(padWord(trimmed, activeMaxLen), padWord(target, activeMaxLen), activeMaxLen);
      isWin = trimmed === target;
      answerWord = isWin ? target : null;
    }

    const paddedGuess = padWord(trimmed, activeMaxLen);
    const newGuesses = [...guesses, paddedGuess];
    const newEvaluations = [...evaluations, evalResult];

    setGuesses(newGuesses);
    setEvaluations(newEvaluations);
    setCurrentGuess('');

    const exhausted = newGuesses.length >= maxAttempts;

    if (isWin) {
      setIsGameOver(true);
      setIsWon(true);
      setIsWinningRow(true);
      setRevealedWord(answerWord || trimmed);
      sounds.playWin();
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

      const updatedStats = saveGameResult(true, newGuesses.length);
      setStats(updatedStats);

      setTimeout(() => setIsStatsOpen(true), 1300);
    } else if (exhausted) {
      setIsGameOver(true);
      setIsWon(false);
      sounds.playError();

      if (isDaily && !answerWord) {
        const revealed = await revealDailyAnswerFromServer(activeMaxLen);
        setRevealedWord(revealed || fallbackDailyWord || '');
      } else {
        setRevealedWord(practiceWord || answerWord || '');
      }

      const updatedStats = saveGameResult(false, maxAttempts);
      setStats(updatedStats);

      setTimeout(() => setIsStatsOpen(true), 1500);
    }
  };

  // Random character roll
  const handleRandomPick = () => {
    sounds.playKey();
    const eligible = CHARACTERS.filter(c => c.length <= activeMaxLen);
    const pool = eligible.length > 0 ? eligible : CHARACTERS;
    const randomIndex = Math.floor(Math.random() * pool.length);
    setCurrentGuess(pool[randomIndex]);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans select-none transition-colors duration-300 ${
      isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <Header
        muted={muted}
        setMuted={setMuted}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewGame={handleNewGame}
        difficulty={difficulty}
        maxLen={activeMaxLen}
        theme={theme}
      />

      {/* Mode Sub-Header */}
      <div className="flex items-center justify-center gap-2 pt-2 text-xs">
        <button
          onClick={handleDailyGame}
          className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1.5 cursor-pointer ${
            isDaily
              ? 'bg-emerald-600 text-white shadow'
              : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-black'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>오늘의 사도 #{dailyNumber}</span>
        </button>

        <button
          onClick={handleNewGame}
          className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
            !isDaily
              ? 'bg-emerald-600 text-white shadow'
              : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-black'
          }`}
        >
          무제한 연습
        </button>
      </div>

      {/* Notification banner if today's daily character is long (>6 chars) */}
      {isDailyLongWord && (
        <div className="max-w-md mx-auto px-2 pt-1 text-center">
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
            📢 오늘의 사도는 6글자를 초과하여 9칸 보드가 자동 적용되었습니다!
          </span>
        </div>
      )}

      {/* Main Board & Input Area */}
      <main className="flex-1 max-w-xl w-full mx-auto flex flex-col justify-between px-2 py-2 sm:py-3">
        {/* Wordle Board */}
        <div className="my-auto overflow-x-auto w-full flex justify-center py-1">
          <WordleBoard
            guesses={guesses}
            currentGuess={padWord(currentGuess, activeMaxLen)}
            maxAttempts={maxAttempts}
            evaluations={evaluations}
            isShaking={isShaking}
            isWinningRow={isWinningRow}
            maxLength={activeMaxLen}
            theme={theme}
          />
        </div>

        {/* Input Bar */}
        <div className="pb-3 pt-1">
          <CharacterInput
            value={currentGuess}
            onChange={setCurrentGuess}
            onSubmit={handleSubmitGuess}
            onOpenList={() => setIsListOpen(true)}
            onRandomPick={handleRandomPick}
            difficulty={difficulty}
            maxLen={activeMaxLen}
            disabled={isGameOver}
            theme={theme}
          />
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-51 animate-fade-in pointer-events-none px-2 max-w-sm w-full text-center">
          <div className="bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-2xl tracking-tight border border-slate-300">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Modals */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        isGameOver={isGameOver}
        isWon={isWon}
        targetWord={revealedWord || practiceWord || fallbackDailyWord || '정답'}
        evaluations={evaluations}
        gameInfo={{ isDaily, gameNumber: dailyNumber }}
        onNewGame={handleNewGame}
        onShowToast={showToast}
      />

      <CharacterListModal
        isOpen={isListOpen}
        onClose={() => setIsListOpen(false)}
        onSelect={(charName) => setCurrentGuess(charName)}
        maxLen={activeMaxLen}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        theme={theme}
        setTheme={setTheme}
        maxLen={maxLen}
        setMaxLen={setMaxLen}
        onResetGameWithNewSettings={handleResetGameWithNewSettings}
      />
    </div>
  );
}
