import React, { useState, useEffect, useRef } from 'react';
import { LEVELS } from './constants';
import GameScene from './components/GameScene';
import { generateReflection } from './services/geminiService';
import { initAudio } from './services/audioService';

const App: React.FC = () => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'WIN' | 'REFLECTING'>('START');
  const [reflectionText, setReflectionText] = useState<string>('');
  const [isLoadingReflection, setIsLoadingReflection] = useState(false);
  
  // Music State
  const [isMusicOn, setIsMusicOn] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  const currentLevel = LEVELS[currentLevelIdx];

  // Initialize Music
  useEffect(() => {
    const audio = new Audio('music/the little hero.mp3');
    audio.loop = true;
    audio.volume = 0.3; 
    musicRef.current = audio;

    return () => {
      audio.pause();
      musicRef.current = null;
    };
  }, []);

  const toggleMusic = () => {
    if (!musicRef.current) return;
    
    if (isMusicOn) {
      musicRef.current.pause();
      setIsMusicOn(false);
    } else {
      musicRef.current.play().catch(e => console.error("Music play failed:", e));
      setIsMusicOn(true);
    }
  };

  const handleStart = () => {
    initAudio();
    setGameState('PLAYING');
    
    // Try to start music on interaction
    if (musicRef.current && !isMusicOn) {
      musicRef.current.play()
        .then(() => setIsMusicOn(true))
        .catch(e => console.log("Autoplay prevented:", e));
    }
  };

  const handleLevelComplete = () => {
    setGameState('WIN');
  };

  const handleNextLevel = () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
      setGameState('PLAYING');
    } else {
      // Loop back or show final screen
      setCurrentLevelIdx(0);
      setGameState('START');
    }
    setReflectionText('');
  };

  const handleRequestReflection = async () => {
    setIsLoadingReflection(true);
    setGameState('REFLECTING');
    const text = await generateReflection(currentLevel.id, currentLevel.title);
    setReflectionText(text);
    setIsLoadingReflection(false);
  };

  return (
    <div className="relative w-full h-full font-sans">
      
      {/* Game Layer */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${gameState === 'START' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
         {gameState !== 'START' && (
           <GameScene level={currentLevel} onWin={handleLevelComplete} />
         )}
      </div>

      {/* Persistent UI Level Indicator */}
      {gameState === 'PLAYING' && (
        <div className="absolute top-8 left-8 text-gray-700 pointer-events-none z-10">
          <h2 className="text-3xl font-thin tracking-[0.2em] uppercase">{currentLevel.title}</h2>
          <p className="text-sm font-light mt-2 tracking-widest opacity-60">Level {currentLevel.id} • {currentLevel.hint}</p>
          
          {/* Music Toggle Button */}
          <button 
            onClick={toggleMusic}
            className="mt-4 pointer-events-auto flex items-center gap-2 group cursor-pointer"
          >
            <div className={`w-2 h-2 rounded-full transition-colors ${isMusicOn ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 group-hover:opacity-100 transition-opacity">
              Music {isMusicOn ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      )}

      {/* Start Screen */}
      {gameState === 'START' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-pink-100 to-blue-100 z-50">
          <h1 className="text-6xl font-thin tracking-[0.3em] text-slate-700 mb-4 text-center">ASCENSION</h1>
          <p className="text-slate-500 font-light tracking-widest mb-12 uppercase text-xs">A React VR Experience</p>
          <button 
            onClick={handleStart}
            className="px-12 py-4 bg-red-400 text-white rounded-full font-light tracking-widest shadow-xl hover:bg-red-500 hover:scale-105 transition-all duration-300"
          >
            BEGIN JOURNEY
          </button>
        </div>
      )}

      {/* Win Modal */}
      {gameState === 'WIN' && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-40 flex items-center justify-center">
          <div className="bg-white/90 p-10 rounded-3xl shadow-2xl text-center max-w-md border border-white/50">
            <h2 className="text-2xl font-light tracking-[0.2em] mb-6 text-slate-800">LEVEL COMPLETE</h2>
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleRequestReflection}
                className="px-8 py-3 bg-purple-500 text-white rounded-full font-light tracking-wider hover:bg-purple-600 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <span>✨</span> SEEK REFLECTION
              </button>
              <button 
                onClick={handleNextLevel}
                className="px-8 py-3 bg-slate-700 text-white rounded-full font-light tracking-wider hover:bg-slate-800 transition-colors"
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reflection Modal (Gemini) */}
      {gameState === 'REFLECTING' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-6">
          <div className="max-w-xl w-full text-center">
            {isLoadingReflection ? (
               <div className="animate-pulse">
                 <div className="h-1 w-12 bg-white/50 rounded-full mx-auto mb-4"></div>
                 <p className="text-white/60 font-light tracking-widest">Consulting the stars...</p>
               </div>
            ) : (
              <div className="animate-in fade-in zoom-in duration-700">
                <div className="mb-8">
                   <span className="text-4xl">✨</span>
                </div>
                <p className="text-2xl md:text-3xl text-white font-thin leading-relaxed tracking-wide italic mb-12">
                  "{reflectionText}"
                </p>
                <button 
                  onClick={handleNextLevel}
                  className="px-10 py-3 border border-white/30 text-white hover:bg-white/10 rounded-full font-light tracking-widest transition-all"
                >
                  ASCEND
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay controls for mobile if needed, or simple footer */}
      <div className="absolute bottom-4 w-full text-center pointer-events-none">
        <p className="text-[10px] text-black/20 uppercase tracking-[0.3em]">V60 • React • Three.js • Gemini</p>
      </div>
    </div>
  );
};

export default App;