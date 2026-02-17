import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { BingoState } from './types.ts';
import { BINGO_RHYMES } from './constants/bingoRhymes.ts';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<BingoState>({
    allNumbers: Array.from({ length: 90 }, (_, i) => i + 1),
    drawnNumbers: [],
    currentNumber: null,
    remainingNumbers: Array.from({ length: 90 }, (_, i) => i + 1),
  });

  const [isAnimate, setIsAnimate] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [rollingNumber, setRollingNumber] = useState<number | null>(null);
  
  const rollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    };
  }, []);

  const drawNumber = useCallback(() => {
    if (gameState.remainingNumbers.length === 0 || isRolling) return;

    setIsRolling(true);
    setIsAnimate(false);
    
    let count = 0;
    const rollDuration = 600; 
    const rollInterval = 60; 
    const totalSteps = rollDuration / rollInterval;

    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);

    rollIntervalRef.current = window.setInterval(() => {
      setRollingNumber(Math.floor(Math.random() * 90) + 1);
      count++;

      if (count >= totalSteps) {
        if (rollIntervalRef.current) {
          clearInterval(rollIntervalRef.current);
          rollIntervalRef.current = null;
        }
        
        const randomIndex = Math.floor(Math.random() * gameState.remainingNumbers.length);
        const newNumber = gameState.remainingNumbers[randomIndex];
        const newRemaining = gameState.remainingNumbers.filter(n => n !== newNumber);

        setGameState(prev => ({
          ...prev,
          currentNumber: newNumber,
          drawnNumbers: [newNumber, ...prev.drawnNumbers],
          remainingNumbers: newRemaining
        }));

        setIsRolling(false);
        setIsAnimate(true);
        setTimeout(() => setIsAnimate(false), 400);
      }
    }, rollInterval);

  }, [gameState.remainingNumbers, isRolling]);

  const undoLastDraw = useCallback(() => {
    if (gameState.drawnNumbers.length === 0 || isRolling) return;
    const [lastDrawn, ...rest] = gameState.drawnNumbers;
    setGameState(prev => ({
      ...prev,
      drawnNumbers: rest,
      currentNumber: rest.length > 0 ? rest[0] : null,
      remainingNumbers: [...prev.remainingNumbers, lastDrawn].sort((a, b) => a - b)
    }));
  }, [gameState.drawnNumbers, isRolling]);

  const resetGame = useCallback(() => {
    if (confirm("Reset the whole board? This cannot be undone.")) {
      setGameState({
        allNumbers: Array.from({ length: 90 }, (_, i) => i + 1),
        drawnNumbers: [],
        currentNumber: null,
        remainingNumbers: Array.from({ length: 90 }, (_, i) => i + 1),
      });
    }
  }, []);

  const shareApp = useCallback(async () => {
    const shareData = {
      title: 'Pallion Bingo',
      text: 'Check out the Pallion Action Group Bingo!',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied!');
      }
    } catch (e) { console.error(e); }
  }, []);

  const progress = useMemo(() => (gameState.drawnNumbers.length / 90) * 100, [gameState.drawnNumbers]);

  return (
    <div className="h-screen w-screen flex flex-col p-2 md:p-6 bg-[#020617] text-white overflow-hidden">
      
      {/* Header */}
      <header className="flex items-start justify-between flex-shrink-0 mb-2 md:mb-4 landscape-header-compact">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-3xl font-black text-[#d946ef] uppercase tracking-tight leading-none landscape-title-text">
            PALLION ACTION GROUP BINGO!
          </h1>
          <span className="text-[7px] md:text-xs text-slate-700 font-bold uppercase tracking-[0.3em] mt-0.5 landscape-hide">
            2026 COMMUNITY EDITION
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 md:gap-3 bg-[#0f172a] px-2 py-1 md:px-4 md:py-2 rounded-xl border border-white/10 shadow-2xl">
          <span className="text-slate-500 font-bold text-[7px] md:text-xs uppercase tracking-widest">CALLS</span>
          <span className="text-sm md:text-3xl font-black text-white">{gameState.drawnNumbers.length}</span>
          <span className="text-slate-500 font-bold text-[7px] md:text-base">/90</span>
        </div>
      </header>

      {/* Main Split */}
      <main className="flex-1 min-h-0 flex flex-col md:flex-row landscape-flex-row gap-2.5 md:gap-6 overflow-hidden">
        
        {/* LEFT COLUMN */}
        <div className="flex-1 md:w-[40%] landscape-w-40 flex flex-col min-h-0 gap-2.5 md:gap-4 overflow-hidden">
          
          {/* Main Controls Card */}
          <div className="panel-bg rounded-[1.5rem] md:rounded-[2rem] flex-1 flex flex-col p-3 md:p-8 shadow-2xl border border-white/5 landscape-h-shrink overflow-hidden">
            
            {/* Draw Button */}
            <button
              onClick={drawNumber}
              disabled={gameState.remainingNumbers.length === 0 || isRolling}
              className={`w-full py-2.5 md:py-8 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#4c1d95] to-[#d946ef] text-white font-black text-xl md:text-5xl shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50 border-t border-white/20 flex-shrink-0 landscape-btn-sm`}
            >
              {isRolling ? <i className="fas fa-sync fa-spin"></i> : 'DRAW'}
            </button>

            {/* Ball Area */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-2 md:py-4 md:overflow-visible overflow-hidden">
              <div className="text-slate-600 font-black uppercase tracking-[0.4em] text-[7px] md:text-xs mb-1.5 md:mb-4 flex-shrink-0">
                LAST CALL
              </div>
              
              <div className={`relative flex-shrink-0 flex items-center justify-center w-28 h-28 md:w-64 md:h-64 landscape-ball-sm rounded-full border-4 md:border-8 border-[#7c3aed]/15 bg-[#0f172a]/40 transition-transform duration-300 ${isAnimate ? 'scale-105' : ''}`}>
                <span className={`text-5xl md:text-8xl landscape-ball-text font-black neon-glow transition-all duration-200 text-white ${isRolling ? 'opacity-20' : ''}`}>
                  {isRolling ? rollingNumber : (gameState.currentNumber ?? '—')}
                </span>
              </div>

              {/* Rhyme */}
              <div className="mt-2 md:mt-4 min-h-[1rem] md:min-h-[4rem] flex items-center justify-center px-4 flex-shrink-0">
                {!isRolling && gameState.currentNumber && (
                  <div className="text-[#d946ef] font-black text-[10px] md:text-4xl uppercase tracking-widest text-center leading-tight landscape-rhyme-sm">
                    "{BINGO_RHYMES[gameState.currentNumber]}"
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="mt-auto pt-2 md:pt-6 flex gap-1.5 md:gap-3 flex-shrink-0">
              <button onClick={undoLastDraw} disabled={gameState.drawnNumbers.length === 0 || isRolling} className="flex-1 py-2 md:py-5 bg-[#1e293b]/50 hover:bg-[#1e293b] rounded-lg md:rounded-2xl text-[8px] md:text-base font-black text-slate-400 border border-white/5 active:scale-95 transition-all flex items-center justify-center gap-1.5 landscape-action-btn">
                <i className="fas fa-undo"></i> <span className="uppercase">UNDO</span>
              </button>
              <button onClick={resetGame} disabled={isRolling} className="flex-1 py-2 md:py-5 bg-[#1e293b]/50 hover:bg-[#1e293b] rounded-lg md:rounded-2xl text-[8px] md:text-base font-black text-red-400/70 border border-white/5 active:scale-95 transition-all flex items-center justify-center gap-1.5 landscape-action-btn">
                <i className="fas fa-trash-alt"></i> <span className="uppercase">RESET</span>
              </button>
              <button onClick={shareApp} className="flex-1 py-2 md:py-5 bg-[#7c3aed]/20 hover:bg-[#7c3aed]/40 rounded-lg md:rounded-2xl text-[8px] md:text-base font-black text-[#7c3aed] border border-[#7c3aed]/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 landscape-action-btn">
                <i className="fas fa-share-alt"></i> <span className="uppercase">SHARE</span>
              </button>
            </div>
          </div>

          {/* Recent Tray Card */}
          <div className="panel-bg p-2 md:p-6 rounded-xl md:rounded-2xl border border-white/5 flex-shrink-0 overflow-hidden">
            <h3 className="text-[8px] md:text-xs text-slate-600 font-black uppercase tracking-widest mb-1.5 md:mb-2">RECENT</h3>
            <div className="flex gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide py-0.5">
              {gameState.drawnNumbers.slice(1, 15).map((num, i) => (
                <div key={i} className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 rounded-lg bg-[#1e293b] border border-white/5 flex items-center justify-center font-black text-xs md:text-xl text-slate-500 landscape-recent-box">
                  {num}
                </div>
              ))}
              {gameState.drawnNumbers.length < 2 && <div className="text-slate-800 font-bold text-[8px] italic py-1">Awaiting calls...</div>}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Master Board */}
        <div className="flex-1 md:w-[60%] landscape-w-60 flex flex-col bg-[#0f172a]/20 rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-6 border border-white/5 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-2 md:mb-4 flex-shrink-0">
            <h2 className="text-[10px] md:text-xl font-black text-slate-500 uppercase tracking-widest">MASTER BOARD</h2>
            <div className="h-[1px] flex-1 mx-3 md:mx-6 bg-white/5"></div>
            <div className="text-[8px] md:text-base text-slate-700 font-black font-mono">1–90</div>
          </div>

          <div className="flex-1 min-h-0">
            <div className="bingo-grid h-full">
              {gameState.allNumbers.map((num) => {
                const isDrawn = gameState.drawnNumbers.includes(num);
                const isCurrent = gameState.currentNumber === num && !isRolling;
                return (
                  <div key={num} className={`flex items-center justify-center rounded-md md:rounded-xl transition-all duration-150 border text-[9px] md:text-2xl font-black 
                    ${isCurrent 
                      ? 'bg-[#d946ef] text-white border-white/40 scale-105 z-10 shadow-[0_0_20px_rgba(217,70,239,0.5)]' 
                      : isDrawn 
                        ? 'bg-[#7c3aed]/25 text-[#7c3aed] border-[#7c3aed]/30 shadow-[inset_0_0_10px_rgba(124,58,237,0.1)]' 
                        : 'bg-transparent text-slate-900 border-white/5'
                    }`}>
                    {num}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-2 md:mt-6 pt-2 md:pt-4 border-t border-white/5 flex-shrink-0">
            <div className="h-1 md:h-3 w-full bg-[#1e293b] rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#d946ef] transition-all duration-700 shadow-[0_0_15px_rgba(217,70,239,0.3)]" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

      </main>

      <footer className="text-center text-slate-800 text-[6px] md:text-xs flex-shrink-0 uppercase tracking-[0.5em] font-black py-2 md:py-4 landscape-hide">
        PAG BINGO! © 2026
      </footer>
    </div>
  );
};

export default App;