
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
    const rollDuration = 500; 
    const rollInterval = 50; 
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
        setTimeout(() => setIsAnimate(false), 500);
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
      // Fix: Corrected sorting logic and resolved syntax error where comma operator caused 'b' to be treated as a second argument to sort()
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
      text: 'Check out the Pallion Action Group Bingo Caller!',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const progress = useMemo(() => (gameState.drawnNumbers.length / 90) * 100, [gameState.drawnNumbers]);

  return (
    <div className="h-screen w-screen flex flex-col p-2 md:p-6 gap-2 md:gap-4 bg-slate-950 text-slate-50 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between flex-shrink-0 px-2 mobile-landscape-hide">
        <div className="flex flex-col">
          <h1 className="text-lg md:text-3xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent uppercase tracking-tight">
            Pallion Action Group BINGO!
          </h1>
          <span className="text-[8px] md:text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">2026 Community Edition</span>
        </div>
        <div className="bg-slate-900/80 px-3 py-1 rounded-full border border-white/10 shadow-xl flex items-baseline gap-2">
          <span className="text-slate-500 font-bold text-[8px] md:text-[10px] uppercase">Drawn</span>
          <span className="text-sm md:text-2xl font-black text-slate-200">{gameState.drawnNumbers.length}</span>
          <span className="text-slate-600 font-bold text-[8px] md:text-xs">/ 90</span>
        </div>
      </header>

      <main className="flex-1 min-h-0 flex flex-col md:flex-row mobile-landscape-row gap-2 md:gap-6 overflow-hidden">
        
        {/* LEFT PANEL: Improved space usage */}
        <div className="flex-shrink-0 flex flex-col md:w-[40%] mobile-landscape-w-left gap-2 md:gap-4 overflow-hidden">
          <div className="gradient-border rounded-2xl md:rounded-[2.5rem] flex-1 flex flex-col p-4 md:p-10 shadow-2xl relative overflow-hidden">
            
            {/* 1. Large Draw Button */}
            <button
              onClick={drawNumber}
              disabled={gameState.remainingNumbers.length === 0 || isRolling}
              className={`w-full py-6 md:py-14 rounded-xl md:rounded-[2rem] bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-black text-2xl md:text-7xl shadow-2xl shadow-violet-500/30 active:scale-95 transition-all disabled:opacity-50 border-t border-white/20 mb-2 md:mb-auto mobile-landscape-btn-height ${!isRolling && gameState.remainingNumbers.length > 0 ? 'animate-pulse' : ''}`}
            >
              {isRolling ? <i className="fas fa-sync fa-spin"></i> : 'DRAW'}
            </button>

            {/* 2. Massive Centered Number */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-0">
              <div className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[8px] md:text-[10px] mb-2 mobile-landscape-hide">
                {isRolling ? 'Selecting...' : 'Latest Ball'}
              </div>
              
              <div className={`relative flex items-center justify-center w-28 h-28 md:w-64 md:h-64 mobile-landscape-num-size rounded-full border-2 md:border-4 border-violet-500/20 bg-slate-950/40 transition-transform duration-300 ${isAnimate ? 'scale-110' : ''}`}>
                <span className={`text-5xl md:text-[11rem] mobile-landscape-text-xl font-black neon-glow transition-all duration-200 
                  ${isRolling ? 'rolling-effect text-slate-700' : 'text-violet-400'}
                `}>
                  {isRolling ? rollingNumber : (gameState.currentNumber ?? '—')}
                </span>
              </div>

              {/* 3. Rhyme Display */}
              <div className="mt-2 md:mt-8 h-8 md:h-12 flex items-center justify-center px-4">
                {!isRolling && gameState.currentNumber && (
                  <div className="text-fuchsia-400 font-black text-xs md:text-3xl mobile-landscape-rhyme-text uppercase tracking-widest animate-pulse text-center leading-tight">
                    "{BINGO_RHYMES[gameState.currentNumber]}"
                  </div>
                )}
              </div>
            </div>

            {/* 4. Controls */}
            <div className="mt-auto flex gap-2 md:gap-3">
              <button onClick={undoLastDraw} disabled={gameState.drawnNumbers.length === 0 || isRolling} className="flex-1 py-3 md:py-5 bg-slate-800/60 hover:bg-slate-800 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black text-slate-400 border border-white/5 active:scale-95 transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
                <i className="fas fa-undo"></i> <span>UNDO</span>
              </button>
              <button onClick={resetGame} disabled={isRolling} className="flex-1 py-3 md:py-5 bg-slate-800/60 hover:bg-slate-800 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black text-red-400/70 border border-white/5 active:scale-95 transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
                <i className="fas fa-trash-alt"></i> <span>RESET</span>
              </button>
              <button onClick={shareApp} className="flex-1 py-3 md:py-5 bg-violet-600/20 hover:bg-violet-600/40 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black text-violet-400 border border-violet-500/20 active:scale-95 transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
                <i className="fas fa-share-alt"></i> <span>SHARE</span>
              </button>
            </div>
          </div>

          {/* History bar */}
          <div className="bg-slate-900/40 p-2 md:p-3 rounded-xl md:rounded-2xl border border-white/5 mobile-landscape-hide">
            <h3 className="text-[8px] md:text-[10px] text-slate-700 font-black uppercase tracking-widest mb-1">History</h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {gameState.drawnNumbers.slice(1, 15).map((num, i) => (
                <div key={i} className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-[10px] text-slate-500">
                  {num}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: The "Perfect" Grid Board (Restored) */}
        <div className="flex-1 flex flex-col bg-slate-900/30 rounded-xl md:rounded-3xl p-2 md:p-6 border border-white/5 min-h-0 overflow-hidden mobile-landscape-w-right mobile-landscape-p">
          <div className="flex items-center justify-between mb-1 md:mb-3">
            <h2 className="text-[8px] md:text-sm font-bold text-slate-500 uppercase tracking-widest">Master Board</h2>
            <div className="h-[1px] flex-1 mx-2 md:mx-4 bg-white/5"></div>
            <div className="text-[8px] md:text-[10px] text-slate-600 font-mono">1–90</div>
          </div>

          <div className="flex-1 min-h-0">
            <div className="bingo-grid h-full">
              {gameState.allNumbers.map((num) => {
                const isDrawn = gameState.drawnNumbers.includes(num);
                const isCurrent = gameState.currentNumber === num && !isRolling;
                return (
                  <div key={num} className={`flex items-center justify-center rounded transition-all duration-150 border text-[8px] md:text-sm font-black ${isCurrent ? 'bg-fuchsia-500 text-white border-fuchsia-300 scale-105 z-10 shadow-lg' : isDrawn ? 'bg-violet-500/30 text-violet-200 border-violet-500/40' : 'bg-slate-800/10 text-slate-800 border-transparent'}`}>
                    {num}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-white/5 flex-shrink-0 mobile-landscape-hide">
            <div className="h-1 md:h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

      </main>

      <footer className="text-center text-slate-800 text-[8px] flex-shrink-0 uppercase tracking-[0.4em] font-bold mobile-landscape-hide">
        Pallion Action Group BINGO! © 2026
      </footer>
    </div>
  );
};

export default App;
