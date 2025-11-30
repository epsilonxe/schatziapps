import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Star, Scissors, Home, Volume2, VolumeX, Clipboard, Check } from 'lucide-react';

// --- Data ---
const SCISSOR_DATA = [
  { id: 1, word: "sun", emoji: "☀️", letter: "s", color: "bg-yellow-400", distractors: ["b", "m"] },
  { id: 2, word: "pig", emoji: "🐷", letter: "p", color: "bg-pink-400", distractors: ["d", "g"] },
  { id: 3, word: "cat", emoji: "🐱", letter: "c", color: "bg-orange-400", distractors: ["k", "t"] },
  { id: 4, word: "dog", emoji: "🐶", letter: "d", color: "bg-amber-700", distractors: ["b", "p"] },
  { id: 5, word: "fish", emoji: "🐠", letter: "f", color: "bg-cyan-400", distractors: ["v", "s"] },
  { id: 6, word: "hat", emoji: "👒", letter: "h", color: "bg-green-400", distractors: ["f", "a"] },
  { id: 7, word: "jar", emoji: "🫙", letter: "j", color: "bg-purple-400", distractors: ["g", "i"] },
  { id: 8, word: "lion", emoji: "🦁", letter: "l", color: "bg-yellow-600", distractors: ["r", "i"] },
  { id: 9, word: "map", emoji: "🗺️", letter: "m", color: "bg-blue-300", distractors: ["n", "w"] },
  { id: 10, word: "net", emoji: "🕸️", letter: "n", color: "bg-gray-400", distractors: ["m", "z"] },
];

const ENCOURAGEMENTS = ["Good pasting!", "Stuck on tight!", "Perfect fit!", "You did it!"];

// --- Helper: Shuffle ---
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function PhonicsScissor({ onBack }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [levels, setLevels] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  
  // Game State
  const [options, setOptions] = useState([]); // The letters in the "Cut" strip
  const [holding, setHolding] = useState(null); // Which letter is currently picked up?
  const [pastedLetter, setPastedLetter] = useState(null); // What is in the box?
  const [isCorrect, setIsCorrect] = useState(false); // Did they win the round?
  const [shakeBox, setShakeBox] = useState(false); // Animation trigger

  // Mouse tracking for the "Floating Letter"
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const currentLevel = levels[currentIdx] || SCISSOR_DATA[0];

  // --- Audio ---
  const speak = useCallback((text) => {
    if (!soundOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en'));
    if (enVoice) utterance.voice = enVoice;
    window.speechSynthesis.speak(utterance);
  }, [soundOn]);

  // --- Init ---
  const setupLevel = (level) => {
    const opts = shuffleArray([level.letter, ...level.distractors]);
    setOptions(opts);
    setHolding(null);
    setPastedLetter(null);
    setIsCorrect(false);
    speak(`Cut and paste the first sound for ${level.word}.`);
  };

  const startGame = () => {
    const shuffled = shuffleArray(SCISSOR_DATA);
    setLevels(shuffled);
    setCurrentIdx(0);
    setStars(0);
    setGameStarted(true);
    setupLevel(shuffled[0]);
  };

  // --- Interaction ---
  
  // Track mouse for the floating element
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    const handleTouchMove = (e) => {
      setCursorPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const handlePickup = (letter) => {
    if (isCorrect) return; // Game locked while animating win
    if (holding === letter) {
        setHolding(null); // Drop it if clicking again
    } else {
        setHolding(letter);
        speak(letter);
    }
  };

  const handlePaste = () => {
    if (!holding || isCorrect) return;

    if (holding === currentLevel.letter) {
        // Correct!
        setPastedLetter(holding);
        setHolding(null);
        setIsCorrect(true);
        setStars(s => s + 1);
        
        const cheer = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
        speak(`${cheer} ${currentLevel.word} starts with ${currentLevel.letter}.`);

        setTimeout(() => {
            if (currentIdx + 1 >= levels.length) {
                speak("You finished the scissor book!");
                startGame(); 
            } else {
                setCurrentIdx(p => p + 1);
                setupLevel(levels[currentIdx + 1]);
            }
        }, 3000);

    } else {
        // Wrong
        setShakeBox(true);
        speak(`Not ${holding}. Try another one!`);
        setTimeout(() => setShakeBox(false), 500);
        setHolding(null); // Drop wrong letter
    }
  };

  // --- Render ---

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 pt-20 relative">
        {onBack && (
            <button onClick={onBack} className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-slate-600 hover:bg-slate-200 transition">
                <Home className="w-6 h-6" />
            </button>
        )}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border-8 border-slate-300 text-center max-w-md w-full animate-fade-in-up">
          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 rotate-12">
             <Scissors className="w-10 h-10 text-slate-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-600 mb-2">Cut & Paste</h1>
          <p className="text-gray-500 mb-8">Match the letter, then color the picture!</p>
          <button onClick={startGame} className="w-full bg-slate-600 hover:bg-slate-500 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:scale-105">
            <Scissors className="w-8 h-8 fill-current" /> Start Cutting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pt-20 select-none overflow-hidden font-sans relative cursor-none-if-holding">
      
      {/* Custom Cursor Follower */}
      {holding && (
        <div 
            className="fixed pointer-events-none z-50 w-16 h-16 bg-white border-2 border-dashed border-gray-400 flex items-center justify-center text-4xl font-bold shadow-2xl rounded-lg transform -translate-x-1/2 -translate-y-1/2 rotate-6"
            style={{ left: cursorPos.x, top: cursorPos.y }}
        >
            {holding}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center px-4 md:px-8 max-w-4xl mx-auto w-full mb-4">
        <div className="flex gap-2 items-center">
            {onBack && (
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-slate-600 border-2 border-slate-200">
                    <Home className="w-6 h-6" />
                </button>
            )}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border-2 border-slate-200">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-xl font-bold text-gray-600">{stars}</span>
            </div>
        </div>
        <button onClick={() => setSoundOn(!soundOn)} className="p-3 rounded-full bg-white border-2 border-slate-200 text-gray-400 hover:text-slate-600">
             {soundOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full px-4">
        
        {/* WORKSPACE: Picture + Glue Box */}
        <div className="w-full bg-white rounded-3xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 min-h-[300px]">
            
            {/* 1. The Picture & Word Hint */}
            <div className="flex flex-col items-center">
                <div className={`
                    text-[10rem] transition-all duration-1000 transform
                    ${isCorrect ? 'grayscale-0 scale-110 rotate-3' : 'grayscale opacity-50 scale-100'}
                `}>
                    {currentLevel.emoji}
                </div>
                
                {/* Word Display: _un or sun */}
                <div className={`mt-4 px-6 py-3 rounded-2xl font-black text-4xl tracking-wider border-2 border-dashed border-slate-200 bg-slate-50 flex items-center gap-1 ${isCorrect ? currentLevel.color + ' text-white border-transparent shadow-md animate-bounce' : 'text-slate-400'}`}>
                    {isCorrect ? (
                        <span>{currentLevel.word}</span>
                    ) : (
                        <>
                            <span className="text-blue-300">_</span>
                            <span>{currentLevel.word.slice(1)}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Arrow (Desktop only) */}
            <div className="hidden md:block text-gray-300 text-4xl">
                ➔
            </div>

            {/* 2. The Paste Box */}
            <div 
                onClick={handlePaste}
                className={`
                    w-32 h-32 md:w-40 md:h-40 rounded-xl border-4 border-dashed flex items-center justify-center transition-all
                    ${shakeBox ? 'animate-shake border-red-400 bg-red-50' : ''}
                    ${isCorrect ? `${currentLevel.color} border-transparent shadow-lg` : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
                    ${holding && !isCorrect ? 'scale-110 border-blue-400 bg-blue-50 cursor-pointer' : ''}
                `}
            >
                {isCorrect ? (
                    <span className="text-6xl font-black text-white drop-shadow-md animate-fade-in">
                        {currentLevel.letter}
                    </span>
                ) : (
                    <div className="text-center pointer-events-none">
                        {holding ? (
                            <Clipboard className="w-8 h-8 text-blue-400 animate-bounce mx-auto" />
                        ) : (
                            <span className="text-gray-300 font-bold text-xl">GLUE</span>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* CUTTING STRIP */}
        <div className="mt-8 w-full bg-slate-200 p-4 rounded-2xl border-t-4 border-dashed border-slate-400 relative">
            {/* Scissor Icon Decor */}
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-full border-2 border-slate-300">
                <Scissors className="w-6 h-6 text-slate-500" />
            </div>

            <div className="flex justify-center gap-4 md:gap-8 mt-2">
                {options.map((letter, idx) => {
                    // Hide the letter from the strip if it is currently being held
                    const isHidden = holding === letter;

                    return (
                        <button
                            key={idx}
                            onClick={() => handlePickup(letter)}
                            disabled={isCorrect || isHidden}
                            className={`
                                w-20 h-24 bg-white shadow-md flex items-center justify-center text-4xl font-black text-gray-700
                                border-l-4 border-r-4 border-dotted border-gray-300
                                hover:-translate-y-2 transition-transform active:scale-95
                                ${isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                            `}
                            style={{
                                clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)' // Slight paper cut look
                            }}
                        >
                            {letter}
                        </button>
                    )
                })}
            </div>
            
            <div className="text-center mt-4 text-slate-500 font-bold text-sm">
                {holding ? "Tap the Glue Box!" : "Tap a letter to cut it out"}
            </div>
        </div>

      </div>
    </div>
  );
}