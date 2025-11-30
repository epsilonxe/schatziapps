import React, { useState, useEffect, useCallback } from 'react';
import { Star, Calculator, Play, RefreshCw, Home, Volume2, VolumeX, Trophy } from 'lucide-react';

// --- Assets ---
const ITEMS = [
  { name: "apples", emoji: "🍎", color: "bg-red-500", border: "border-red-200" },
  { name: "cars", emoji: "🚗", color: "bg-blue-500", border: "border-blue-200" },
  { name: "stars", emoji: "⭐", color: "bg-yellow-400", border: "border-yellow-200" },
  { name: "fish", emoji: "🐠", color: "bg-cyan-400", border: "border-cyan-200" },
  { name: "bears", emoji: "🐻", color: "bg-amber-600", border: "border-amber-200" },
  { name: "balls", emoji: "⚽", color: "bg-green-500", border: "border-green-200" },
  { name: "cats", emoji: "🐱", color: "bg-orange-400", border: "border-orange-200" },
  { name: "flowers", emoji: "🌸", color: "bg-pink-400", border: "border-pink-200" },
];

const ENCOURAGEMENTS = ["That's right!", "Good counting!", "You got it!", "Perfect!"];

// --- Helper Functions ---
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Generate random distractors unique from the answer
const getOptions = (answer) => {
  const nums = [0, 1, 2, 3, 4, 5].filter(n => n !== answer);
  const shuffled = shuffleArray(nums);
  return shuffleArray([answer, shuffled[0], shuffled[1]]);
};

// --- Components ---
const Confetti = ({ color }) => (
  <div className="absolute w-3 h-3 rounded-full animate-ping opacity-0" 
       style={{
         left: '50%', top: '50%', backgroundColor: color,
         transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px)`,
         animationDelay: `${Math.random() * 0.2}s`
       }} 
  />
);

export default function CountingGame({ onBack }) {
  const [gameStarted, setGameStarted] = useState(false);
  
  // Level State
  const [currentCount, setCurrentCount] = useState(0);
  const [currentItem, setCurrentItem] = useState(ITEMS[0]);
  const [options, setOptions] = useState([]);
  
  // Game Progress
  const [round, setRound] = useState(0); // Track 10 rounds
  const [stars, setStars] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, success, won
  const [wrongShake, setWrongShake] = useState(null);
  const [soundOn, setSoundOn] = useState(true);

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

  // --- Game Logic ---
  const generateLevel = () => {
    const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const randomCount = Math.floor(Math.random() * 6); // 0 to 5
    
    setCurrentItem(randomItem);
    setCurrentCount(randomCount);
    setOptions(getOptions(randomCount));
    setGameState('playing');
    
    setTimeout(() => {
      if (randomCount === 0) {
        speak(`How many ${randomItem.name} are in the box?`);
      } else {
        speak(`Count the ${randomItem.name}. How many?`);
      }
    }, 500);
  };

  const startGame = () => {
    setGameStarted(true);
    setStars(0);
    setRound(0);
    generateLevel();
  };

  const handleAnswer = (number) => {
    if (gameState !== 'playing') return;

    if (number === currentCount) {
      // Correct
      setGameState('success');
      setStars(s => s + 1);
      
      const cheer = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
      const numberWord = number === 0 ? "Zero" : number;
      speak(`${cheer} There are ${numberWord} ${currentItem.name}.`);

      setTimeout(() => {
        if (round >= 9) { // Play 10 rounds
          setGameState('won');
          speak("You are a counting champion!");
        } else {
          setRound(r => r + 1);
          generateLevel();
        }
      }, 2500);

    } else {
      // Wrong
      setWrongShake(number);
      speak(`Not ${number}. Try again!`);
      setTimeout(() => setWrongShake(null), 500);
    }
  };

  const speakQuestion = () => {
    speak(`How many ${currentItem.name}?`);
  };

  // --- Render ---

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-cyan-50 flex flex-col items-center justify-center p-4 pt-20 relative font-sans">
        {onBack && (
            <button onClick={onBack} className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-cyan-600 hover:bg-cyan-100 transition">
                <Home className="w-6 h-6" />
            </button>
        )}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border-8 border-cyan-200 text-center max-w-md w-full animate-fade-in-up">
          <div className="bg-cyan-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
             <Calculator className="w-10 h-10 text-cyan-600" />
          </div>
          <h1 className="text-4xl font-black text-cyan-600 mb-2">Counting 1-2-3</h1>
          <p className="text-gray-500 mb-8">Count the objects (0 to 5)!</p>
          <button onClick={startGame} className="w-full bg-cyan-500 hover:bg-cyan-400 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:scale-105">
            <Play className="w-8 h-8 fill-current" /> Start Counting
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-cyan-50 flex flex-col items-center justify-center p-4 pt-20 text-center relative font-sans">
         {onBack && (
            <button onClick={onBack} className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-cyan-600 hover:bg-cyan-100 transition">
                <Home className="w-6 h-6" />
            </button>
        )}
        <Trophy className="w-32 h-32 text-yellow-500 mb-6 animate-bounce mx-auto" />
        <h1 className="text-5xl font-black text-cyan-600 mb-4">Super Counter!</h1>
        <p className="text-xl text-gray-500 mb-8">You counted everything!</p>
        <button onClick={startGame} className="bg-white text-cyan-600 text-xl font-bold py-4 px-10 rounded-full shadow-lg flex items-center gap-2 mx-auto hover:bg-cyan-50 transition">
          <RefreshCw className="w-6 h-6" /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyan-50 flex flex-col pt-20 select-none overflow-hidden font-sans relative">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 md:px-8 max-w-4xl mx-auto w-full mb-6">
        <div className="flex gap-2 items-center">
            {onBack && (
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-cyan-600 border-2 border-cyan-100">
                    <Home className="w-6 h-6" />
                </button>
            )}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border-2 border-cyan-100">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-xl font-bold text-gray-600">{stars}</span>
            </div>
        </div>
        <button onClick={() => setSoundOn(!soundOn)} className="p-3 rounded-full bg-white border-2 border-cyan-100 text-gray-400 hover:text-cyan-500">
             {soundOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-2xl mx-auto w-full px-4 pb-8">
        
        {/* 1. The Object Container */}
        <div 
            className={`
                w-full aspect-video bg-white rounded-[2rem] shadow-lg border-4 ${currentItem.border} 
                flex items-center justify-center relative overflow-hidden mb-8
                transition-transform duration-300 ${gameState === 'success' ? 'scale-105' : 'scale-100'}
            `}
            onClick={speakQuestion}
        >   
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"></div>

            {/* Zero Case */}
            {currentCount === 0 ? (
                <div className="text-center opacity-50">
                    <div className="w-32 h-32 border-4 border-dashed border-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-4xl text-gray-300">?</span>
                    </div>
                    <p className="font-bold text-gray-400">Empty</p>
                </div>
            ) : (
                /* Objects Grid */
                <div className="flex flex-wrap justify-center gap-4 p-4 z-10">
                    {[...Array(currentCount)].map((_, i) => (
                        <div key={i} className={`text-6xl md:text-8xl animate-bounce`} style={{animationDelay: `${i * 0.1}s`}}>
                            {currentItem.emoji}
                        </div>
                    ))}
                </div>
            )}

            {/* Confetti on Win */}
            {gameState === 'success' && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(10)].map((_, i) => <Confetti key={i} color={currentItem.color.replace('bg-', 'text-')} />)}
                </div>
            )}
        </div>

        {/* 2. The Options (Number Boxes) */}
        <div className="grid grid-cols-3 gap-6 w-full">
            {options.map((num, idx) => {
                const isSuccess = gameState === 'success';
                const isCorrectNum = num === currentCount;

                return (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(num)}
                        disabled={isSuccess}
                        className={`
                            h-32 rounded-2xl border-b-8 transition-all transform flex items-center justify-center relative
                            ${isSuccess && isCorrectNum 
                                ? `${currentItem.color} border-white text-white scale-110 shadow-none` // Win State
                                : 'bg-white border-gray-200 text-gray-700 hover:-translate-y-1 active:translate-y-1 active:border-b-0 shadow-xl' // Default
                            }
                            ${wrongShake === num ? 'animate-shake bg-red-50 border-red-200' : ''}
                        `}
                    >
                        <span className="text-7xl font-black drop-shadow-sm">{num}</span>
                        
                        {/* "Coloring" fill effect */}
                        {isSuccess && isCorrectNum && (
                             <div className="absolute inset-0 bg-white opacity-20 animate-pulse rounded-xl"></div>
                        )}
                    </button>
                );
            })}
        </div>

      </div>
    </div>
  );
}