import React from 'react';
import { decomposeChar } from '../utils/jamo';

export default function WordleBoard({
  guesses = [],
  currentGuess = '',
  maxAttempts = 6,
  evaluations = [], // Array of row evaluations (from evaluateWordJamo)
  isShaking = false,
  isWinningRow = false,
  maxLength = 9,
  theme = 'dark',
}) {
  const isDark = theme === 'dark';

  const rows = [];
  for (let rowIndex = 0; rowIndex < maxAttempts; rowIndex++) {
    const isCompletedRow = rowIndex < guesses.length;
    const isCurrentRow = rowIndex === guesses.length;

    let rowLetters = [];
    let rowEval = isCompletedRow ? evaluations[rowIndex] || [] : [];

    if (isCompletedRow) {
      rowLetters = guesses[rowIndex].split('');
    } else if (isCurrentRow) {
      rowLetters = currentGuess.split('');
    }

    const tiles = [];
    for (let colIndex = 0; colIndex < maxLength; colIndex++) {
      const rawChar = rowLetters[colIndex] || '';
      const sylEval = rowEval[colIndex];
      const isSpace = rawChar === ' ';

      // Responsive tile width based on maxLength (e.g. 6 tiles can be larger than 9 tiles!)
      let sizeClass = maxLength <= 6 
        ? "w-11 h-16 sm:w-14 sm:h-18 md:w-16 md:h-20" 
        : "w-8.5 h-13 sm:w-11 sm:h-16 md:w-12 md:h-16";

      let tileClass = `${sizeClass} font-extrabold rounded-xl flex flex-col items-center justify-between p-1 select-none transition-all duration-300 font-sans `;

      if (isCompletedRow && sylEval) {
        if (sylEval.allCorrect) {
          tileClass += "bg-emerald-600/90 border-2 border-emerald-400 text-white shadow-md shadow-emerald-950/30 ";
        } else if (sylEval.someCorrect) {
          tileClass += isDark
            ? "bg-slate-800 border-2 border-emerald-500/70 text-slate-100 shadow-sm "
            : "bg-white border-2 border-emerald-500 text-slate-900 shadow-sm ";
        } else if (sylEval.somePresent) {
          tileClass += isDark
            ? "bg-slate-800 border-2 border-amber-400/70 text-slate-100 shadow-sm "
            : "bg-white border-2 border-amber-500 text-slate-900 shadow-sm ";
        } else {
          tileClass += isDark
            ? "bg-slate-800/80 border-2 border-slate-700 text-slate-400 "
            : "bg-slate-200 border-2 border-slate-300 text-slate-500 ";
        }

        if (isWinningRow && rowIndex === guesses.length - 1) {
          tileClass += "animate-bounce-win ";
        }
      } else if (isCurrentRow) {
        if (rawChar && rawChar !== ' ') {
          tileClass += isDark
            ? "bg-slate-800 text-white border-2 border-slate-400 animate-tile-pop "
            : "bg-white text-slate-900 border-2 border-slate-600 animate-tile-pop shadow-sm ";
        } else {
          tileClass += isDark
            ? "bg-slate-900/60 text-slate-500 border-2 border-slate-800 "
            : "bg-slate-100 text-slate-400 border-2 border-slate-300 ";
        }
      } else {
        tileClass += isDark
          ? "bg-slate-900/40 text-slate-600 border-2 border-slate-800/80 "
          : "bg-slate-100/60 text-slate-300 border-2 border-slate-200 ";
      }

      // Render Tile Contents
      let mainContent = null;
      let jamoBadges = null;

      if (isCompletedRow && sylEval) {
        if (isSpace) {
          mainContent = (
            <div className={`my-auto text-xs font-normal ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
              ␣
            </div>
          );
        } else {
          mainContent = (
            <div className={`text-sm sm:text-base font-black leading-tight pt-0.5 ${
              sylEval.allCorrect ? 'text-white' : isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {rawChar}
            </div>
          );

          // Sub-Jamo badges
          jamoBadges = (
            <div className="flex items-center justify-center gap-0.5 w-full pb-0.5">
              {sylEval.jamos.map((jObj, jIdx) => {
                let badgeColor = isDark ? "bg-slate-700 text-slate-400" : "bg-slate-300 text-slate-700";
                if (jObj.status === 'correct') {
                  badgeColor = "bg-emerald-500 text-white shadow-xs font-bold ring-1 ring-emerald-300/40";
                } else if (jObj.status === 'present') {
                  badgeColor = "bg-amber-500 text-white shadow-xs font-bold ring-1 ring-amber-300/40";
                }
                return (
                  <span
                    key={jIdx}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded flex items-center justify-center text-[9px] sm:text-[10px] leading-none ${badgeColor}`}
                  >
                    {jObj.jamo}
                  </span>
                );
              })}
            </div>
          );
        }
      } else if (isCurrentRow && rawChar && rawChar !== ' ') {
        mainContent = (
          <div className={`text-sm sm:text-base font-black leading-tight pt-0.5 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {rawChar}
          </div>
        );
        // Preview decomposed jamo while typing
        const previewJamos = decomposeChar(rawChar);
        jamoBadges = (
          <div className="flex items-center justify-center gap-0.5 w-full pb-0.5 opacity-60">
            {previewJamos.map((j, idx) => (
              <span
                key={idx}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-[9px] sm:text-[10px] flex items-center justify-center ${
                  isDark ? 'bg-slate-700/60 text-slate-300' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {j}
              </span>
            ))}
          </div>
        );
      } else {
        mainContent = (
          <div className={`my-auto text-xs font-mono ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            {isCurrentRow && isSpace ? '␣' : ''}
          </div>
        );
      }

      tiles.push(
        <div
          key={colIndex}
          className={tileClass}
          style={
            isCompletedRow
              ? { animationDelay: `${colIndex * 50}ms` }
              : undefined
          }
        >
          {mainContent}
          {jamoBadges}
        </div>
      );
    }

    rows.push(
      <div
        key={rowIndex}
        className={`flex justify-center gap-1 sm:gap-1.5 ${
          isCurrentRow && isShaking ? 'animate-shake' : ''
        }`}
      >
        {tiles}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 sm:gap-1.5 items-center justify-center my-2 sm:my-3">
      {rows}
    </div>
  );
}
