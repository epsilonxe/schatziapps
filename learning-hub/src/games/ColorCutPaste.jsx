import React, { useState, useEffect, useCallback } from 'react';
import { Star, Scissors, Home, Volume2, VolumeX, Clipboard, Palette } from 'lucide-react';

// --- Data ---
const COLOR_LEVELS = [
  { id: 'red', colorName: "Red", bg: "bg-red-500", border: "border-red-200", text: "text-red-600", correct: { name: "Apple", emoji: "🍎" }, distractors: [{ name: "Leaf", emoji: "🍃" }, { name: "Ocean", emoji: "🌊" }] },
  { id: 'blue', colorName: "Blue", bg: "bg-blue-500", border: "border-blue-200", text: "text-blue-600", correct: { name: "Blueberry", emoji: "🫐" }, distractors: [{ name: "Sun", emoji: "☀️" }, { name: "Pig", emoji: "🐷" }] },
  { id: 'green', colorName: "Green", bg: "bg-green-500", border: "border-green-200", text: "text-green-600", correct: { name: "Frog", emoji: "🐸" }, distractors: [{ name: "Fire", emoji: "🔥" }, { name: "Snow", emoji: "⛄" }] },
  { id: 'yellow', colorName: "Yellow", bg: "bg-yellow-400", border: "border-yellow-200", text: "text-yellow-600", correct: { name: "Duck", emoji: "🐥" }, distractors: [{ name: "Grape", emoji: "🍇" }, { name: "Car", emoji: "🚗" }] },
  { id: 'purple', colorName: "Purple", bg: "bg-purple-500", border: "border-purple-200", text: "text-purple-600", correct: { name: "Grapes", emoji: "🍇" }, distractors: [{ name: "Lemon", emoji: "🍋" }, { name: "Grass", emoji: "🌿" }] },
  { id: 'orange', colorName: "Orange", bg: "bg-orange-500", border: "border-orange-200", text: "text-orange-600", correct: { name: "Pumpkin", emoji: "🎃" }, distractors: [{ name: "Cloud", emoji: "☁️" }, { name: "Night", emoji: "🌑" }] },
  { id: 'pink', colorName: "Pink", bg: "bg-pink-400", border: "border-pink-200", text: "text-pink-600", correct: { name: "Pig", emoji: "🐷" }, distractors: [{ name: "Frog", emoji: "🐸" }, { name: "Banana", emoji: "🍌" }] },
  { id: 'black', colorName: "Black", bg: "bg-gray-900", border: "border-gray-400", text: "text-gray-800", correct: { name: "Bat", emoji: "🦇" }, distractors: [{ name: "Egg", emoji: "🥚" }, { name: "Flower", emoji: "🌸" }] },
  { id: 'white', colorName: "White", bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-500", correct: { name: "Snowman", emoji: "⛄" }, distractors: [{ name: "Coal", emoji: "🪨" }, { name: "Ladybug", emoji: "🐞" }] },
];

const ENCOURAGEMENTS = ["Perfect match!", "You found the color!", "Nice cutting!", "Color Expert!"];

// --- Helper: Shuffle ---
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function ColorCutPaste({ onBack }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [levels, setLevels] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  
  // Game State
  const [options, setOptions] = useState([]); 
  const [holding, setHolding] = useState(null); // { name, emoji }
  const [pastedItem, setPastedItem] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shakeTarget, setShakeTarget] = useState(false);

  // Cursor Tracking
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const currentLevel = levels[currentIdx] || COLOR_LEVELS[0];

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
    // Combine correct + distractors and shuffle
    const opts = shuffleArray([level.correct, ...level.distractors]);
    setOptions(opts);
    setHolding(null);
    setPastedItem(null);
    setIsCorrect(false);
    
    setTimeout(() => {
        speak(`What is ${level.colorName}? Cut the picture and paste it.`);
    }, 500);
  };

  const startGame = () => {
    const shuffled = shuffleArray(COLOR_LEVELS);
    setLevels(shuffled);
    setCurrentIdx(0);
    setStars(0);
    setGameStarted(true);
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
        speak(`${cheer} The ${currentLevel.correct.name} is ${currentLevel.colorName}.`);

        setTimeout(() => {
            if (currentIdx + 1 >= levels.length) {
                speak("You matched all the colors!");
                startGame();
            } else {
                setCurrentIdx(p => p + 1);
                setupLevel(levels[currentIdx + 1]);
            }
        }, 3000);

    } else {
        // Wrong
        setShakeTarget(true);
        speak(`That's not ${currentLevel.colorName}. Try again!`);
        setTimeout(() => setShakeTarget(false), 500);
        setHolding(null);
    }
  };

  // --- Render ---

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 pt-20 relative font-sans">
        {onBack && (
            <button onClick={onBack} className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-slate-600 hover:bg-slate-200 transition">
                <Home className="w-6 h-6" />
            </button>
        )}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border-8 border-slate-200 text-center max-w-md w-full animate-fade-in-up">
          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 -rotate-12">
             <Scissors className="w-10 h-10 text-slate-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-700 mb-2">Color Cut & Paste</h1>
          <p className="text-gray-500 mb-8">Cut the picture, match the color!</p>
          <button onClick={startGame} className="w-full bg-slate-700 hover:bg-slate-600 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:scale-105">
            <Palette className="w-8 h-8 fill-current" /> Start Sorting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-20 select-none overflow-hidden font-sans relative cursor-none-if-holding">
      
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
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-slate-700 border-2 border-slate-200">
                    <Home className="w-6 h-6" />
                </button>
            )}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border-2 border-slate-200">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-xl font-bold text-gray-600">{stars}</span>
            </div>
        </div>
        <button onClick={() => setSoundOn(!soundOn)} className="p-3 rounded-full bg-white border-2 border-slate-200 text-slate-400 hover:text-slate-600">
             {soundOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full px-4">
        
        {/* WORKSPACE */}
        <div className="w-full bg-white rounded-3xl shadow-xl p-4 md:p-8 flex flex-col items-center justify-center gap-8 min-h-[350px] relative overflow-hidden border-4 border-white">
            
            {/* 1. The Paint Bucket / Splash Target */}
            <div 
                onClick={handlePaste}
                className={`
                    relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center transition-all duration-500
                    ${shakeTarget ? 'animate-shake' : ''}
                    ${holding && !isCorrect ? 'scale-110 cursor-pointer' : 'scale-100'}
                `}
            >   
                {/* Paint Splash Background (CSS Shapes) */}
                <div className={`absolute inset-0 rounded-full blur-sm opacity-80 ${currentLevel.bg} animate-[pulse_3s_infinite]`}></div>
                <div className={`absolute top-[-10%] right-[-10%] w-2/3 h-2/3 rounded-full blur-sm opacity-70 ${currentLevel.bg}`}></div>
                <div className={`absolute bottom-[-5%] left-[5%] w-1/2 h-1/2 rounded-full blur-sm opacity-90 ${currentLevel.bg}`}></div>
                
                {/* Label */}
                <h2 className={`relative z-10 text-4xl font-black text-white drop-shadow-md uppercase tracking-widest ${isCorrect ? 'opacity-0' : 'opacity-100'}`}>
                    {currentLevel.colorName}
                </h2>

                {/* The Pasted Item (Success) */}
                <div className={`absolute inset-0 flex items-center justify-center z-20 transition-all duration-500 ${isCorrect ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                    <span className="text-[8rem] drop-shadow-2xl filter brightness-110 animate-bounce">
                        {pastedItem?.emoji || currentLevel.correct.emoji}
                    </span>
                </div>
            </div>

            {/* Hint Text */}
            <div className={`font-bold text-xl ${currentLevel.text} transition-opacity ${isCorrect ? 'opacity-100' : 'opacity-50'}`}>
                {isCorrect ? currentLevel.correct.name : "Paste matching picture here!"}
            </div>

        </div>

        {/* CUTTING STRIP */}
        <div className="mt-6 w-full bg-slate-200 p-4 rounded-t-3xl border-t-4 border-dashed border-slate-400 relative pb-10">
            
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-full border-2 border-slate-300 shadow-sm">
                <Scissors className="w-6 h-6 text-slate-500" />
            </div>

            <div className="flex justify-center gap-6 mt-4">
                {options.map((item, idx) => {
                    const isHidden = holding === item; // Don't show if holding
                    
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
                            {/* Optional: Show name below for extra reading practice */}
                            {/* <span className="text-xs font-bold text-slate-400">{item.name}</span> */}
                        </button>
                    )
                })}
            </div>
        </div>

      </div>
    </div>
  );
}