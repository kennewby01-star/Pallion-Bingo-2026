
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
    const rollDuration = 300; 
    const rollInterval = 40; 
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
    if (rollIntervalRef.current) {
      clearInterval(rollIntervalRef.current);
      rollIntervalRef.current = null;
    }
    
    setIsRolling(false);
    setIsAnimate(false);
    setRollingNumber(null);
    
    setGameState({
      allNumbers: Array.from({ length: 90 }, (_, i) => i + 1),
      drawnNumbers: [],
      currentNumber: null,
      remainingNumbers: Array.from({ length: 90 }, (_, i) => i + 1),
    });
  }, []);

  const progress = useMemo(() => {
    return (gameState.drawnNumbers.length / 90) * 100;
  }, [gameState.drawnNumbers]);

  return (
    <div className="h-screen w-screen flex flex-col p-2 md:p-4 gap-2 md:gap-4 overflow-hidden bg-slate-950">
      {/* Compact Header */}
      <header className="flex items-center justify-between px-2 h-8 md:h-10 flex-shrink-0">
        <div className="flex items-baseline gap-3">
          <h1 className="text-sm md:text-2xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent truncate max-w-[200px] md:max-w-none">
            Pallion Action Group BINGO!
          </h1>
          <span className="hidden lg:inline text-[10px] font-bold text-slate-600 tracking-widest uppercase">Community Caller</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4 bg-slate-900/80 px-3 py-0.5 md:py-1 rounded-full border border-white/5">
          <div className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Drawn</div>
          <div className="text-xs md:text-lg font-black text-slate-200">{gameState.drawnNumbers.length} <span className="text-slate-600 text-[8px] md:text-[10px]">/ 90</span></div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="flex-1 min-h-0 flex flex-col md:flex-row landscape-row gap-2 md:gap-4 overflow-hidden">
        
        {/* Left Side: Call Area & History */}
        <div className="md:w-[45%] landscape-w-left flex flex-col gap-2 md:gap-4 flex-shrink-0 min-h-0">
          <div className="gradient-border rounded-2xl md:rounded-3xl flex-1 flex flex-row items-center justify-between p-3 md:p-8 relative overflow-hidden gap-2 md:gap-4 landscape-p">
            
            {/* Left Part: The Number Display */}
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[8px] md:text-[10px] mb-2 md:mb-4">
                {isRolling ? 'Picking...' : 'Current Call'}
              </div>
              
              <div className={`relative flex items-center justify-center w-24 h-24 md:w-48 md:h-48 landscape-num-size rounded-full border-2 md:border-4 border-violet-500/20 bg-slate-950 shadow-[inset_0_0_30px_rgba(139,92,246,0.1)] transition-transform duration-150 ${isAnimate ? 'scale-105' : ''}`}>
                <span className={`text-4xl md:text-8xl font-black neon-glow transition-all duration-200 
                  ${isRolling ? 'rolling-effect text-slate-500' : (isAnimate ? 'text-fuchsia-400 scale-105' : 'text-violet-400')}
                `}>
                  {isRolling ? rollingNumber : (gameState.currentNumber ?? '—')}
                </span>
              </div>

              <div className="mt-2 md:mt-4 h-4 md:h-6 text-center">
                {!isRolling && gameState.currentNumber && (
                  <div className={`text-fuchsia-400 font-bold text-[10px] md:text-sm uppercase tracking-widest transition-all duration-200 landscape-compact-text ${isAnimate ? 'opacity-0' : 'opacity-100'}`}>
                    "{BINGO_RHYMES[gameState.currentNumber]}"
                  </div>
                )}
              </div>
            </div>

            {/* Right Part: Controls */}
            <div className="flex flex-col gap-2 md:gap-3 w-32 md:w-56 flex-shrink-0">
              <button
                onClick={drawNumber}
                disabled={gameState.remainingNumbers.length === 0 || isRolling}
                className="w-full py-4 md:py-8 px-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-black text-sm md:text-2xl shadow-xl shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.95] transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1 border border-white/10"
              >
                <i className={`fas ${isRolling ? 'fa-spinner fa-spin' : 'fa-bolt'} text-xs md:text-xl`}></i>
                <span className="landscape-compact-text">{isRolling ? '...' : 'DRAW'}</span>
              </button>
              
              <div className="flex gap-1 md:gap-2 h-8 md:h-12">
                <button
                  onClick={undoLastDraw}
                  disabled={gameState.drawnNumbers.length === 0 || isRolling}
                  className="flex-1 rounded-lg md:rounded-xl bg-slate-800 text-slate-300 font-bold text-[8px] md:text-xs border border-white/5 hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-1 disabled:opacity-20 active:scale-95"
                >
                  <i className="fas fa-arrow-left"></i>
                  <span className="landscape-hide">UNDO</span>
                </button>
                <button
                  onClick={resetGame}
                  disabled={isRolling}
                  className="flex-1 rounded-lg md:rounded-xl bg-slate-800 text-slate-300 font-bold text-[8px] md:text-xs border border-white/5 hover:bg-red-900/40 hover:text-red-200 transition-all flex items-center justify-center gap-1 disabled:opacity-20 active:scale-95"
                >
                  <i className="fas fa-sync-alt"></i>
                  <span className="landscape-hide">RESET</span>
                </button>
              </div>
            </div>

          </div>

          {/* History Bar */}
          <div className="bg-slate-900/40 rounded-xl md:rounded-2xl p-2 md:p-3 border border-white/5 flex-shrink-0 landscape-p">
            <h3 className="text-slate-600 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mb-1 md:mb-2">History</h3>
            <div className="flex gap-1 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {gameState.drawnNumbers.slice(1, 12).map((num, i) => (
                <div key={i} className="flex-shrink-0 w-6 h-6 md:w-10 md:h-10 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-[8px] md:text-xs text-slate-400">
                  {num}
                </div>
              ))}
              {gameState.drawnNumbers.length < 2 && (
                <div className="text-slate-700 italic text-[8px] md:text-[10px] py-1">...</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Grid Area */}
        <div className="flex-1 md:w-[55%] landscape-w-right flex flex-col bg-slate-900/30 rounded-2xl md:rounded-3xl p-2 md:p-6 border border-white/5 min-h-0 overflow-hidden landscape-p">
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
                  <div
                    key={num}
                    className={`
                      flex items-center justify-center rounded transition-all duration-150 border
                      ${isCurrent 
                        ? 'bg-fuchsia-500 text-white scale-105 z-10 shadow-lg border-fuchsia-300' 
                        : isDrawn 
                        ? 'bg-violet-500/30 text-violet-200 border-violet-500/40' 
                        : 'bg-slate-800/10 text-slate-800 border-transparent'}
                    `}
                  >
                    <span className="text-[8px] md:text-sm font-black landscape-grid-text">{num}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compact Progress Bar */}
          <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-white/5 flex-shrink-0 landscape-hide">
            <div className="h-1 md:h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-slate-800 text-[8px] flex-shrink-0 h-3 landscape-hide">
        Pallion Action Group BINGO!
      </footer>
    </div>
  );
};

export default App;
