import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { CHARACTERS } from '../utils/dictionary';
import { getCharacterImageUrl } from '../utils/characterImage';

export default function CharacterListModal({ isOpen, onClose, onSelect, maxLen = 9 }) {
  const [query, setQuery] = useState('');
  const [selectedLength, setSelectedLength] = useState(null);

  const eligibleCharacters = useMemo(() => {
    return CHARACTERS.filter(name => name.length <= maxLen);
  }, [maxLen]);

  const filtered = useMemo(() => {
    return eligibleCharacters.filter((name) => {
      const matchQuery = !query || name.toLowerCase().includes(query.toLowerCase());
      const matchLen = selectedLength === null || name.length === selectedLength;
      return matchQuery && matchLen;
    });
  }, [eligibleCharacters, query, selectedLength]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl relative text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>트릭컬 사도/캐릭터 도감</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                총 {CHARACTERS.length}명
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              사도/캐릭터를 클릭하면 입력창에 바로 적용됩니다
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 border-b border-slate-700/60 bg-slate-900/40 space-y-2.5">
          <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="사도/캐릭터 이름 검색..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Length Filter Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-0.5">
            <span className="text-slate-500 shrink-0">글자수:</span>
            <button
              onClick={() => setSelectedLength(null)}
              className={`px-2 py-0.5 rounded-md font-semibold shrink-0 transition ${
                selectedLength === null
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              전체
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((len) => (
              <button
                key={len}
                onClick={() => setSelectedLength(selectedLength === len ? null : len)}
                className={`px-2 py-0.5 rounded-md font-semibold shrink-0 transition ${
                  selectedLength === len
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {len}자
              </button>
            ))}
          </div>
        </div>

        {/* Characters Grid */}
        <div className="p-3 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs">
              검색 결과가 없습니다.
            </div>
          ) : (
            filtered.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onSelect(name);
                  onClose();
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-900/60 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-500/70 text-left transition flex items-center gap-2 group"
              >
                <img
                  src={getCharacterImageUrl(name)}
                  alt=""
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover shrink-0 bg-slate-950 border border-slate-700/80 group-hover:border-emerald-400"
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-emerald-300 truncate">
                    {name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {name.length}자
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700/80 bg-slate-900/50 flex justify-between items-center text-xs text-slate-400">
          <span>선택 가능한 사도/캐릭터: {filtered.length}명</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
