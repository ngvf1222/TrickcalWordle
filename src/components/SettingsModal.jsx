import React, { useEffect } from 'react';
import { X, Moon, Sun, ShieldCheck, Zap, Heart, LayoutGrid } from 'lucide-react';
import { CHARACTERS } from '../utils/dictionary';

export default function SettingsModal({
  isOpen,
  onClose,
  difficulty, // 'easy' | 'normal' | 'hard'
  setDifficulty,
  theme, // 'dark' | 'light'
  setTheme,
  maxLen, // 3 | 4 | 6 | 9
  setMaxLen,
  onResetGameWithNewSettings,
}) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const lengthOptions = [
    { len: 9, label: '풀 (9자)', desc: '전체 137명 (컴퓨터 기본)' },
    { len: 6, label: '6자 (추천)', desc: '126명 (모바일 기본, 92%)' },
    { len: 4, label: '4자', desc: '115명 (84%)' },
    { len: 3, label: '3자', desc: '112명 (82%)' },
  ];

  const handleDifficultyChange = (newDiff) => {
    setDifficulty(newDiff);
    localStorage.setItem('wordle_difficulty', newDiff);
    onResetGameWithNewSettings({ difficulty: newDiff, maxLen });
  };

  const handleLengthChange = (newLen) => {
    setMaxLen(newLen);
    localStorage.setItem('wordle_maxlen', String(newLen));
    onResetGameWithNewSettings({ difficulty, maxLen: newLen });
  };

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('wordle_theme', newTheme);
  };

  const isDark = theme === 'dark';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className={`border rounded-2xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-2xl relative transition-colors ${
          isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X Button with prominent hit area */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          aria-label="설정 닫기"
          className={`absolute top-4 right-4 z-20 p-2 rounded-xl transition cursor-pointer ${
            isDark 
              ? 'text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95' 
              : 'text-slate-500 hover:text-black hover:bg-slate-100 active:scale-95'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-center text-sm font-extrabold tracking-widest uppercase mb-5 opacity-70">
          게임 설정 (SETTINGS)
        </h2>

        <div className="space-y-5 text-xs">
          
          {/* 1. Difficulty Mode */}
          <div>
            <label className="font-bold flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>난이도 모드</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {/* Easy */}
              <button
                type="button"
                onClick={() => handleDifficultyChange('easy')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  difficulty === 'easy'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold shadow-sm'
                    : isDark ? 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-extrabold">이지</span>
                </div>
                <div className="text-[10px] opacity-75 mt-1 leading-tight">
                  6회 시도<br />도감 & 추천 O
                </div>
              </button>

              {/* Normal */}
              <button
                type="button"
                onClick={() => handleDifficultyChange('normal')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  difficulty === 'normal'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold shadow-sm'
                    : isDark ? 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-extrabold">기본</span>
                </div>
                <div className="text-[10px] opacity-75 mt-1 leading-tight">
                  6회 시도<br />도감 X (추리)
                </div>
              </button>

              {/* Hard */}
              <button
                type="button"
                onClick={() => handleDifficultyChange('hard')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  difficulty === 'hard'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-bold shadow-sm'
                    : isDark ? 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-extrabold text-rose-400">하드</span>
                </div>
                <div className="text-[10px] opacity-75 mt-1 leading-tight">
                  5회 시도<br />도감 X (매운맛)
                </div>
              </button>
            </div>
          </div>

          {/* 2. Max Length (Board Width) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4 text-amber-500" />
                <span>글자수 제한 (보드 가로 칸 수)</span>
              </label>
              <span className="text-[11px] opacity-70">
                후보: {CHARACTERS.filter(c => c.length <= maxLen).length}명
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {lengthOptions.map((opt) => (
                <button
                  key={opt.len}
                  type="button"
                  onClick={() => handleLengthChange(opt.len)}
                  className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                    maxLen === opt.len
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold shadow-sm'
                      : isDark ? 'bg-slate-900/60 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="font-extrabold text-xs">{opt.label}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
            <p className="text-[10px] opacity-60 mt-1.5">
              💡 오늘의 사도가 6글자를 넘는 경우 모바일에서도 자동으로 9칸 보드가 적용됩니다.
            </p>
          </div>

          {/* 3. Theme (Dark / Light) */}
          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>테마 모드</span>
            </span>

            <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/60">
              <button
                type="button"
                onClick={() => toggleTheme('dark')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  isDark ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>다크</span>
              </button>

              <button
                type="button"
                onClick={() => toggleTheme('light')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  !isDark ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>라이트</span>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center text-xs font-bold">
            <a href='https://arca.live/b/trickcal/189521097'><span>버그 제보 및 문의</span></a>
          </div>

        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="mt-6 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition shadow-lg shadow-emerald-700/20 cursor-pointer"
        >
          설정 완료
        </button>
      </div>
    </div>
  );
}
