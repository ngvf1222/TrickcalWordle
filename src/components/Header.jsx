import React from 'react';
import { Volume2, VolumeX, HelpCircle, BarChart2, RotateCcw, Settings } from 'lucide-react';
import { sounds } from '../utils/sound';

export default function Header({
  muted,
  setMuted,
  onOpenHelp,
  onOpenStats,
  onOpenSettings,
  onNewGame,
  difficulty,
  maxLen,
  theme,
}) {
  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    sounds.setMuted(next);
    if (!next) {
      sounds.playKey();
    }
  };

  const isDark = theme === 'dark';

  const diffLabels = {
    easy: { text: '이지', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    normal: { text: '기본', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' },
    hard: { text: '하드', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' },
  };

  const diffBadge = diffLabels[difficulty] || diffLabels.normal;

  return (
    <header className={`border-b sticky top-0 z-40 transition-colors ${
      isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white/90 shadow-xs'
    } backdrop-blur`}>
      <div className="max-w-xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
        
        {/* Left Icons */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={onOpenHelp}
            aria-label="게임 방법"
            className={`p-2 rounded-lg transition ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="게임 방법"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <button
            onClick={toggleSound}
            aria-label={muted ? '소리 켜기' : '소리 끄기'}
            className={`p-2 rounded-lg transition ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={muted ? '소리 켜기' : '소리 끄기'}
          >
            {muted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-500" />}
          </button>
        </div>

        {/* Center Title & Badges */}
        <div className="text-center select-none flex flex-col items-center">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className={`text-base sm:text-lg font-black tracking-tight font-sans ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              트릭컬 워들
            </h1>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold border ${diffBadge.color}`}>
              {diffBadge.text}
            </span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold border ${
              isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}>
              {maxLen}자
            </span>
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={onOpenStats}
            aria-label="통계"
            className={`p-2 rounded-lg transition ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="통계 및 전적"
          >
            <BarChart2 className="w-5 h-5 text-amber-500" />
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="설정"
            className={`p-2 rounded-lg transition ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="게임 설정 (난이도, 테마, 글자수)"
          >
            <Settings className="w-5 h-5 text-indigo-400" />
          </button>

          <button
            onClick={onNewGame}
            aria-label="새 게임"
            className={`p-2 rounded-lg transition ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="새 게임 시작"
          >
            <RotateCcw className="w-5 h-5 text-emerald-500" />
          </button>
        </div>

      </div>
    </header>
  );
}
