import React from 'react';
import { X, Sparkles, Lightbulb } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-2xl relative text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-center text-sm font-extrabold tracking-widest text-slate-400 uppercase mb-4">
          트릭컬 자모 워들 규칙
        </h2>

        <div className="space-y-3.5 text-xs text-slate-300">
          <p className="leading-relaxed">
            숨겨진 <strong>트릭컬 캐릭터(137명)</strong>를 <strong>6번의 기회</strong> 안에 맞추는 게임입니다.
            <br/>
            (단, <strong>띄어쓰기</strong>와 이격의 경우 <strong>괄호</strong>까지 정확해야합니다.)
          </p>

          {/* Key Feature: Jamo Decomposition */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-emerald-500/40 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>한글 자모(초성·중성·종성) 단위 세부 판정</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              글자 전체가 달라도 <strong>겹치는 자음이나 모음</strong>이 있으면 개별적으로 색상이 판정됩니다!
            </p>

            {/* Visual Example: 베니 vs 버터 */}
            <div className="pt-1.5 border-t border-slate-700/60">
              <div className="text-[11px] text-amber-300 font-semibold mb-1.5">
                예시) 정답이 [베니]일 때 [버터]를 입력한 경우:
              </div>
              <div className="flex gap-2 items-center">
                {/* Tile 버 */}
                <div className="w-12 h-14 rounded-xl bg-slate-800 border-2 border-emerald-500/70 p-1 flex flex-col justify-between items-center shadow">
                  <span className="font-black text-sm text-white">버</span>
                  <div className="flex gap-0.5">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-500 text-white font-bold text-[9px] flex items-center justify-center">ㅂ</span>
                    <span className="w-3.5 h-3.5 rounded bg-slate-700 text-slate-400 text-[9px] flex items-center justify-center">ㅓ</span>
                  </div>
                </div>

                {/* Tile 터 */}
                <div className="w-12 h-14 rounded-xl bg-slate-800 border-2 border-slate-700 p-1 flex flex-col justify-between items-center shadow">
                  <span className="font-black text-sm text-slate-400">터</span>
                  <div className="flex gap-0.5">
                    <span className="w-3.5 h-3.5 rounded bg-slate-700 text-slate-400 text-[9px] flex items-center justify-center">ㅌ</span>
                    <span className="w-3.5 h-3.5 rounded bg-slate-700 text-slate-400 text-[9px] flex items-center justify-center">ㅓ</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-tight pl-1">
                  ➡️ <strong className="text-emerald-400">ㅂ</strong>은 정답(베)의 초성과 일치하여 <strong className="text-emerald-400">초록색</strong>, 나머지는 <strong className="text-slate-400">회색</strong>으로 표시됩니다!
                </div>
              </div>
            </div>
          </div>

          {/* Color meanings */}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center">ㄱ</span>
              <span><strong className="text-emerald-400">초록색 자모</strong>: 해당 위치에 정확히 일치</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">ㅗ</span>
              <span><strong className="text-amber-400">노란색 자모</strong>: 이름에 포함되어 있으나 다른 위치</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-slate-700 text-slate-400 text-[10px] flex items-center justify-center">ㅁ</span>
              <span><strong className="text-slate-400">회색 자모</strong>: 정답 이름에 포함되지 않음</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700 text-[11px] text-slate-400">
            💡 <strong>글자수 팁</strong>: 뒤쪽의 <code className="text-emerald-400">␣ (빈칸)</code>이 초록색으로 맞으면 캐릭터의 총 글자수를 바로 알 수 있습니다.
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition shadow-lg shadow-emerald-700/20"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );
}
