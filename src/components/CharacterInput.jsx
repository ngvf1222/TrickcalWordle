import React, { useState, useEffect, useRef } from 'react';
import { Search, Dices, List, CornerDownLeft, X } from 'lucide-react';
import { searchCharacters } from '../utils/dictionary';
import { getCharacterImageUrl } from '../utils/characterImage';
import { sounds } from '../utils/sound';

export default function CharacterInput({
  value,
  onChange,
  onSubmit,
  onOpenList,
  onRandomPick,
  difficulty = 'normal',
  maxLen = 9,
  disabled = false,
  theme = 'dark',
}) {
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const isDark = theme === 'dark';

  const showSuggestions = difficulty === 'easy';
  const showListButton = difficulty === 'easy';

  // Update suggestions when user types (only in easy mode)
  useEffect(() => {
    if (!showSuggestions || !value || value.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    const matches = searchCharacters(value, maxLen);
    setSuggestions(matches.slice(0, 6));
  }, [value, maxLen, showSuggestions]);

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      sounds.playKey();
      onSubmit();
    }
  };

  const handleSelectSuggestion = (charName) => {
    sounds.playKey();
    onChange(charName);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-2 px-2">
      {/* Suggestions Pills (Easy Mode Only) */}
      {showSuggestions && suggestions.length > 0 && !disabled && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 animate-fade-in">
          {suggestions.map((charName) => (
            <button
              key={charName}
              type="button"
              onClick={() => handleSelectSuggestion(charName)}
              className="px-2.5 py-1 rounded-xl bg-emerald-950/70 hover:bg-emerald-800/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold transition active:scale-95 shadow-sm flex items-center gap-1.5"
            >
              <img
                src={getCharacterImageUrl(charName)}
                alt=""
                className="w-4 h-4 rounded-full object-cover shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span>{charName}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Input Control Bar */}
      <div className={`relative flex items-center border-2 rounded-2xl p-1.5 shadow-lg transition ${
        isDark 
          ? 'bg-slate-800 border-slate-700 focus-within:border-emerald-500' 
          : 'bg-white border-slate-300 focus-within:border-emerald-500'
      }`}>
        <Search className={`w-4 h-4 ml-2.5 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={showListButton ? "사도 이름 입력..." : "사도 이름 직접 입력 (기억력 추리)..."}
          className={`w-full bg-transparent px-2.5 py-1.5 text-sm sm:text-base font-bold focus:outline-none ${
            isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
          }`}
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            className={`p-1 rounded-lg mr-1 transition ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Enter Submit Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playKey();
            onSubmit();
          }}
          disabled={disabled || !value.trim()}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-700/20 shrink-0"
        >
          <span>제출</span>
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Tool Helpers */}
      <div className="flex items-center justify-between text-xs pt-0.5 px-1">
        <button
          type="button"
          onClick={onRandomPick}
          disabled={disabled}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition disabled:opacity-40 ${
            isDark 
              ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-300 border-slate-700/70' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-amber-600 border-slate-300'
          }`}
        >
          <Dices className="w-3.5 h-3.5 text-amber-500" />
          <span>랜덤 추천</span>
        </button>

        <span className={`text-[11px] hidden sm:inline ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {maxLen}칸 기준 빈칸(␣) 자동 채움
        </span>

        {showListButton ? (
          <button
            type="button"
            onClick={onOpenList}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition ${
              isDark 
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-emerald-300 border-slate-700/70' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-emerald-600 border-slate-300'
            }`}
          >
            <List className="w-3.5 h-3.5 text-emerald-500" />
            <span>도감 (이지 전용)</span>
          </button>
        ) : (
          <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {difficulty === 'hard' ? '하드모드 (5회)' : '기본모드 (도감X)'}
          </span>
        )}
      </div>
    </div>
  );
}
