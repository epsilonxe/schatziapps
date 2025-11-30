import React, { useState, useEffect, useCallback } from 'react';
import { Star, Scissors, Home, Volume2, VolumeX, Clipboard, MapPin, Trophy, RefreshCw } from 'lucide-react';

// --- Data ---
const HABITAT_LEVELS = [
  { 
    id: 'farm', 
    name: "Farm", 
    photoUrl: "/AnimalHabitat/farm.jpg", // Green farm with barn
    correct: { name: "Cow", emoji: "🐮" }, 
    distractors: [{ name: "Shark", emoji: "🦈" }, { name: "Lion", emoji: "🦁" }] 
  },
  { 
    id: 'ocean', 
    name: "Ocean", 
    photoUrl: "/AnimalHabitat/ocean.jpg", // Clear blue ocean
    correct: { name: "Whale", emoji: "🐳" }, 
    distractors: [{ name: "Chicken", emoji: "🐔" }, { name: "Camel", emoji: "🐫" }] 
  },
  { 
    id: 'forest', 
    name: "Forest", 
    photoUrl: "/AnimalHabitat/forest.jpg", // Lush green forest
    correct: { name: "Bear", emoji: "🐻" }, 
    distractors: [{ name: "Octopus", emoji: "🐙" }, { name: "Zebra", emoji: "🦓" }] 
  },
  { 
    id: 'desert', 
    name: "Desert", 
    photoUrl: "/AnimalHabitat/desert.jpg", // Sand dunes
    correct: { name: "Camel", emoji: "🐫" }, 
    distractors: [{ name: "Penguin", emoji: "🐧" }, { name: "Fish", emoji: "🐠" }] 
  },
  { 
    id: 'polar', 
    name: "Snow", 
    photoUrl: "/AnimalHabitat/polar.jpg", // Snowy landscape
    correct: { name: "Penguin", emoji: "🐧" }, 
    distractors: [{ name: "Elephant", emoji: "🐘" }, { name: "Snake", emoji: "🐍" }] 
  },
  { 
    id: 'jungle', 
    name: "Jungle", 
    photoUrl: "/AnimalHabitat/jungle.webp", // Dense jungle
    correct: { name: "Monkey", emoji: "🐵" }, 
    distractors: [{ name: "Cow", emoji: "🐮" }, { name: "Polar Bear", emoji: "🐻‍❄️" }] 
  },
];

const ENCOURAGEMENTS = ["Welcome home!", "Great job!", "That's where they live!", "Habitat Hero!"];

// --- Helper: Shuffle ---
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function AnimalHabitat({ onBack }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [levels, setLevels] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  
  // Game State
  const [options, setOptions] = useState([]); 
  const [holding, setHolding] = useState(null); 
  const [pastedItem, setPastedItem] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shakeTarget, setShakeTarget] = useState(false);
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'won'

  // Cursor Tracking
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const currentLevel = levels[currentIdx] || HABITAT_LEVELS[0];

  // --- Audio ---
  const speak = useCallback((text) => {
    if (!soundOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }, [soundOn]);

  // --- Init ---
  const setupLevel = (level) => {
    const opts = shuffleArray([level.correct, ...level.distractors]);
    setOptions(opts);
    setHolding(null);
    setPastedItem(null);
    setIsCorrect(false);
    
    setTimeout(() => {
        speak(`Who lives in the ${level.name}? Paste the animal here.`);
    }, 500);
  };

  const startGame = () => {
    const shuffled = shuffleArray(HABITAT_LEVELS);
    setLevels(shuffled);
    setCurrentIdx(0);
    setStars(0);
    setGameStarted(true);
    setGameState('playing');
    setupLevel(shuffled[0]);
  };

  // --- Interaction ---
  useEffect(() => {
    const handleMove = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    const handleTouch = (e) => setCursorPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleTouch);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleTouch);
    };
  }, []);

  const handlePickup = (item) => {
    if (isCorrect) return;
    if (holding === item) {
        setHolding(null);
    } else {
        setHolding(item);
        speak(item.name);
    }
  };

  const handlePaste = () => {
    if (!holding || isCorrect) return;

    if (holding.name === currentLevel.correct.name) {
        // Correct
        setPastedItem(holding);
        setHolding(null);
        setIsCorrect(true);
        setStars(s => s + 1);
        
        const cheer = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
        speak(`${cheer} The ${currentLevel.correct.name} lives in the ${currentLevel.name}.`);

        setTimeout(() => {
            if (currentIdx + 1 >= levels.length) {
                setGameState('won');
                speak("You are a Habitat Hero! You matched all the animals!");
            } else {
                setCurrentIdx(p => p + 1);
                setupLevel(levels[currentIdx + 1]);
            }
        }, 3000);

    } else {
        // Wrong
        setShakeTarget(true);
        speak(`The ${holding.name} doesn't live here. Try again!`);
        setTimeout(() => setShakeTarget(false), 500);
        setHolding(null);
    }
  };

  // --- Render ---

  // 1. Start Screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4 pt-20 relative font-sans">
        {onBack && (
            <button onClick={onBack} className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-emerald-600 hover:bg-emerald-200 transition">
                <Home className="w-6 h-6" />
            </button>
        )}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border-8 border-emerald-200 text-center max-w-md w-full animate-fade-in-up">
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <MapPin className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-black text-emerald-700 mb-2">Animal Habitat</h1>
          <p className="text-gray-500 mb-8">Where does the animal live?</p>
          <button onClick={startGame} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:scale-105">
            <Scissors className="w-8 h-8 fill-current" /> Start Pasting
          </button>
        </div>
      </div>
    );
  }

  // 2. Win Screen (Added)
  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4 pt-20 text-center relative font-sans">
         {onBack && (
            <button onClick={onBack} className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-emerald-600 hover:bg-emerald-200 transition">
                <Home className="w-6 h-6" />
            </button>
        )}
        <Trophy className="w-32 h-32 text-yellow-500 mb-6 animate-bounce mx-auto" />
        <h1 className="text-5xl font-black text-emerald-600 mb-4">Habitat Hero!</h1>
        <p className="text-xl text-emerald-700 mb-8">You found homes for all the animals!</p>
        <button onClick={startGame} className="bg-white text-emerald-600 text-xl font-bold py-4 px-10 rounded-full shadow-lg flex items-center gap-2 mx-auto hover:bg-emerald-50 transition">
          <RefreshCw className="w-6 h-6" /> Play Again
        </button>
      </div>
    );
  }

  // 3. Game Screen
  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col pt-20 select-none overflow-hidden font-sans relative cursor-none-if-holding">
      
      {/* Floating Cursor Item */}
      {holding && (
        <div 
            className="fixed pointer-events-none z-50 w-20 h-20 bg-white border-2 border-dashed border-slate-400 flex items-center justify-center text-5xl shadow-2xl rounded-xl transform -translate-x-1/2 -translate-y-1/2 rotate-6"
            style={{ left: cursorPos.x, top: cursorPos.y }}
        >
            {holding.emoji}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center px-4 md:px-8 max-w-4xl mx-auto w-full mb-4">
        <div className="flex gap-2 items-center">
            {onBack && (
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-emerald-700 border-2 border-emerald-200">
                    <Home className="w-6 h-6" />
                </button>
            )}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border-2 border-emerald-200">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-xl font-bold text-gray-600">{stars}</span>
            </div>
        </div>
        <button onClick={() => setSoundOn(!soundOn)} className="p-3 rounded-full bg-white border-2 border-emerald-200 text-emerald-400 hover:text-emerald-600">
             {soundOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full px-4">
        
        {/* WORKSPACE: Habitat Scene */}
        <div className={`
            w-full bg-white rounded-3xl shadow-xl overflow-hidden relative flex flex-col items-center justify-center gap-6 min-h-[400px] border-4 border-white
        `}>
            {/* Photo Background */}
            <img 
              src={currentLevel.photoUrl} 
              alt={currentLevel.name} 
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            />
            
            {/* Dark Overlay for contrast */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Title */}
            <h2 className="relative z-10 text-4xl md:text-5xl font-black drop-shadow-lg uppercase tracking-widest text-white">
                {currentLevel.name}
            </h2>

            {/* The Paste Target Area */}
            <div 
                onClick={handlePaste}
                className={`
                    relative w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-dashed flex items-center justify-center transition-all duration-300 z-10 backdrop-blur-md
                    ${shakeTarget ? 'animate-shake border-red-400 bg-red-100/70' : 'border-white/70 bg-white/50'}
                    ${holding && !isCorrect ? 'scale-110 cursor-pointer border-white bg-white/70' : 'scale-100'}
                    ${isCorrect ? 'border-transparent shadow-2xl bg-white/90' : ''}
                `}
            >   
                {isCorrect ? (
                    <span className="text-[8rem] drop-shadow-2xl animate-bounce">
                        {pastedItem?.emoji || currentLevel.correct.emoji}
                    </span>
                ) : (
                    <div className="text-center pointer-events-none">
                        {holding ? (
                            <Clipboard className="w-12 h-12 mx-auto animate-bounce text-gray-700" />
                        ) : (
                            <div className="flex flex-col items-center">
                                <MapPin className="w-12 h-12 text-gray-700 mb-2 opacity-70" />
                                <span className="text-sm font-bold uppercase tracking-wide text-gray-800">Who lives here?</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* CUTTING STRIP */}
        <div className="mt-6 w-full bg-slate-100 p-4 rounded-t-3xl border-t-4 border-dashed border-slate-300 relative pb-10 z-10">
            
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-full border-2 border-slate-300 shadow-sm">
                <Scissors className="w-6 h-6 text-slate-500" />
            </div>

            <div className="flex justify-center gap-6 mt-4">
                {options.map((item, idx) => {
                    const isHidden = holding === item; 
                    
                    return (
                        <button
                            key={idx}
                            onClick={() => handlePickup(item)}
                            disabled={isCorrect || isHidden}
                            className={`
                                w-24 h-28 bg-white shadow-md flex flex-col items-center justify-center gap-2
                                border-2 border-dashed border-slate-300 rounded-lg
                                hover:-translate-y-2 transition-transform active:scale-95
                                ${isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                            `}
                        >
                            <span className="text-5xl">{item.emoji}</span>
                        </button>
                    )
                })}
            </div>
        </div>

      </div>
    </div>
  );
}