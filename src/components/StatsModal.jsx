import React, { useState, useEffect } from 'react';
import { X, Share2, RotateCcw, Clock } from 'lucide-react';
import { generateShareText } from '../utils/wordleLogic';
import { getCharacterImageUrl } from '../utils/characterImage';

export default function StatsModal({
  isOpen,
  onClose,
  stats,
  isGameOver,
  isWon,
  targetWord,
  evaluations = [],
  gameInfo,
  onNewGame,
  onShowToast,
}) {
  const [timeLeft, setTimeLeft] = useState('');

  // Live countdown to next server midnight
  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const parts = formatter.formatToParts(now).reduce((acc, p) => {
        acc[p.type] = p.value;
        return acc;
      }, {});
      const dateStr = `${parts.year}-${parts.month}-${parts.day}`;
      const nextMidnight = new Date(`${dateStr}T00:00:00+09:00`).getTime() + 24 * 60 * 60 * 1000;
      const diffSec = Math.max(0, Math.floor((nextMidnight - now.getTime()) / 1000));

      const h = String(Math.floor(diffSec / 3600)).padStart(2, '0');
      const m = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
      const s = String(diffSec % 60).padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const winPercentage = stats.played > 0 
    ? Math.round((stats.wins / stats.played) * 100) 
    : 0;

  const maxDistribution = Math.max(...Object.values(stats.distribution), 1);

  const handleShare = () => {
    const text = generateShareText(evaluations, targetWord, gameInfo);
    navigator.clipboard.writeText(text).then(() => {
      onShowToast('📋 결과가 클립보드에 복사되었습니다!');
    }).catch(() => {
      onShowToast('❌ 복사 실패');
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl relative text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-center text-sm font-extrabold tracking-widest text-slate-400 uppercase mb-4">
          통계 (STATISTICS)
        </h2>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-4 gap-2 text-center mb-5">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.played}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">플레이</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{winPercentage}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">승률 %</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.currentStreak}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">현재 연승</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.maxStreak}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">최대 연승</div>
          </div>
        </div>

        {/* Guess Distribution */}
        <div className="mb-5">
          <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">
            시도 횟수 분포 (GUESS DISTRIBUTION)
          </h3>
          <div className="space-y-1.5 text-xs font-mono">
            {[1, 2, 3, 4, 5, 6].map((attempt) => {
              const count = stats.distribution[attempt] || 0;
              const percentage = Math.max((count / maxDistribution) * 100, 8);
              const isCurrentAttempt = isGameOver && isWon && evaluations.length === attempt;

              return (
                <div key={attempt} className="flex items-center gap-2">
                  <span className="w-2.5 font-bold text-slate-400">{attempt}</span>
                  <div className="flex-1 bg-slate-900/60 rounded overflow-hidden">
                    <div
                      className={`h-5 flex items-center justify-end px-2 font-bold text-white transition-all duration-500 rounded ${
                        isCurrentAttempt
                          ? 'bg-emerald-500 shadow-sm'
                          : count > 0 ? 'bg-slate-600' : 'bg-slate-700/60'
                      }`}
                      style={{ width: `${count > 0 ? percentage : 8}%` }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Answer Reveal with Character Image */}
        {isGameOver && (
          <div className="bg-slate-900/90 p-4 rounded-2xl border-2 border-emerald-500/60 text-center mb-5 shadow-xl relative overflow-hidden">
            <div className="relative inline-block mb-2">
              <img
                src={getCharacterImageUrl(targetWord)}
                alt={targetWord}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-400 shadow-lg mx-auto bg-slate-950"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${
                isWon 
                  ? 'bg-emerald-600 border-emerald-400 text-white' 
                  : 'bg-rose-600 border-rose-400 text-white'
              }`}>
                {isWon ? '정답' : '실패'}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-0.5 font-semibold">
              정답 사도/캐릭터
            </div>
            <div className="text-2xl font-black tracking-tight text-white font-sans">
              {targetWord}
            </div>
          </div>
        )}

        {/* Next Wordle Countdown (Daily Mode) */}
        {gameInfo?.isDaily && (
          <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-center gap-2 text-xs mb-4 font-mono">
            <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">다음 데일리 사도/캐릭터까지:</span>
            <span className="font-extrabold text-white">{timeLeft}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-2">
          {isGameOver && (
            <button
              onClick={handleShare}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-700/30"
            >
              <Share2 className="w-4 h-4" />
              <span>공유하기</span>
            </button>
          )}

          <button
            onClick={() => {
              onNewGame();
              onClose();
            }}
            className={`py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs tracking-wider transition flex items-center justify-center gap-1.5 border border-slate-600 ${
              isGameOver ? 'flex-1' : 'w-full'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>새 게임</span>
          </button>
        </div>

      </div>
    </div>
  );
}
