import React, { useState, useEffect, useCallback } from 'react';
import { Star, Play, RefreshCw, Home, Volume2, VolumeX, Trophy, Circle, Square, Triangle, RectangleHorizontal, Heart } from 'lucide-react';

// --- Data ---
const SHAPE_DATA = [
  { id: 1, name: "Pizza Slice", emoji: "🍕", shape: "Triangle", icon: Triangle, color: "bg-orange-100" },
  { id: 2, name: "Clock", emoji: "⏰", shape: "Circle", icon: Circle, color: "bg-blue-100" },
  { id: 3, name: "Book", emoji: "📘", shape: "Rectangle", icon: RectangleHorizontal, color: "bg-blue-200" },
  { id: 4, name: "Window", emoji: "🪟", shape: "Square", icon: Square, color: "bg-cyan-100" },
  { id: 5, name: "Cookie", emoji: "🍪", shape: "Circle", icon: Circle, color: "bg-amber-100" },
  { id: 6, name: "Envelope", emoji: "✉️", shape: "Rectangle", icon: RectangleHorizontal, color: "bg-yellow-50" },
  { id: 7, name: "Watermelon", emoji: "🍉", shape: "Triangle", icon: Triangle, color: "bg-green-100" },
  { id: 8, name: "Dice", emoji: "🎲", shape: "Square", icon: Square, color: "bg-red-100" },
  { id: 9, name: "Wheel", emoji: "🛞", shape: "Circle", icon: Circle, color: "bg-gray-200" },
  { id: 10, name: "TV", emoji: "📺", shape: "Rectangle", icon: RectangleHorizontal, color: "bg-gray-300" },
  { id: 11, name: "Yield Sign", emoji: "🔻", shape: "Triangle", icon: Triangle, color: "bg-red-50" },
  { id: 12, name: "Present", emoji: "🎁", shape: "Square", icon: Square, color: "bg-purple-100" },
  { id: 13, name: "Love Letter", emoji: "💌", shape: "Heart", icon: Heart, color: "bg-pink-100" },
  { id: 14, name: "Donut", emoji: "🍩", shape: "Circle", icon: Circle, color: "bg-pink-200" },
  { id: 15, name: "Door", emoji: "🚪", shape: "Rectangle", icon: RectangleHorizontal, color: "bg-amber-50" },
];

const SHAPE_OPTIONS = [
  { name: "Circle", icon: Circle, color: "text-blue-500" },
  { name: "Square", icon: Square, color: "text-red-500" },
  { name: "Triangle", icon: Triangle, color: "text-green-500" },
  { name: "Rectangle", icon: RectangleHorizontal, color: "text-purple-500" },
  { name: "Heart", icon: Heart, color: "text-pink-500" },
];

const ENCOURAGEMENTS = ["You found it!", "Shape Master!", "That's the shape!", "Great eye!"];

// --- Helper: Shuffle ---
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
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

export default function ShapeDetective({ onBack }) {
  const [gameStarted, setGameStarted] = useState(false);
  
  // Level State
  const [levels, setLevels] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [options, setOptions] = useState([]);
  
  // Progress
  const [stars, setStars] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, success, won
  const [wrongShake, setWrongShake] = useState(null);
  const [soundOn, setSoundOn] = useState(true);

  const currentLevel = levels[currentIdx] || SHAPE_DATA[0];

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
  const setupLevel = (idx, allLevels) => {
    const level = allLevels[idx];
    
    // Get the correct shape object
    const correctShapeObj = SHAPE_OPTIONS.find(s => s.name === level.shape);
    
    // Get distractors (shapes that are NOT the correct one)
    const distractors = SHAPE_OPTIONS.filter(s => s.name !== level.shape);
    const randomDistractors = shuffleArray(distractors).slice(0, 2); // Pick 2 random distractors
    
    // Combine and shuffle
    const levelOptions = shuffleArray([correctShapeObj, ...randomDistractors]);
    
    setOptions(levelOptions);
    setGameState('playing');
    
    // Announce
    setTimeout(() => {
      speak(`What shape is the ${level.name}?`);
    }, 500);
  };

  const startGame = () => {
    const shuffled = shuffleArray(SHAPE_DATA);
    setLevels(shuffled);
    setCurrentIdx(0);
    setStars(0);
    setGameStarted(true);
    setupLevel(0, shuffled);
  };

  const handleAnswer = (selectedShapeName) => {
    if (gameState !== 'playing') return;

    if (selectedShapeName === currentLevel.shape) {
      // Correct
      setGameState('success');
      setStars(s => s + 1);
      
      const cheer = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
      speak(`${cheer} The ${currentLevel.name} is a ${currentLevel.shape}.`);

      setTimeout(() => {
        if (currentIdx + 1 >= 10) { // Limit to 10 rounds for a "session"
          setGameState('won');
          speak("You are a Shape Detective!");
        } else {
          setCurrentIdx(p => p + 1);
          setupLevel(currentIdx + 1, levels);
        }
      }, 2500);

    } else {
      // Wrong
      setWrongShake(selectedShapeName);
      speak(`Not a ${selectedShapeName}. Try again!`);
      setTimeout(() => setWrongShake(null), 500);
    }
  };

  const speakQuestion = () => {
    speak(`Look at the ${currentLevel.name}. What shape is it?`);
  };

  // --- Render ---

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-4 pt-20 relative font-sans">
        {onBack && (
            <button onClick={onBack} className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-purple-600 hover:bg-purple-100 transition">
                <Home className="w-6 h-6" />
            </button>
        )}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border-8 border-purple-200 text-center max-w-md w-full animate-fade-in-up">
          <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
             <Square className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-black text-purple-600 mb-2">Shape Detective</h1>
          <p className="text-gray-500 mb-8">What shape is the picture?</p>
          <button onClick={startGame} className="w-full bg-purple-500 hover:bg-purple-400 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:scale-105">
            <Play className="w-8 h-8 fill-current" /> Start Playing
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-4 pt-20 text-center relative font-sans">
         {onBack && (
            <button onClick={onBack} className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-purple-600 hover:bg-purple-100 transition">
                <Home className="w-6 h-6" />
            </button>
        )}
        <Trophy className="w-32 h-32 text-yellow-500 mb-6 animate-bounce mx-auto" />
        <h1 className="text-5xl font-black text-purple-600 mb-4">Shape Master!</h1>
        <p className="text-xl text-gray-500 mb-8">You know all your shapes!</p>
        <button onClick={startGame} className="bg-white text-purple-600 text-xl font-bold py-4 px-10 rounded-full shadow-lg flex items-center gap-2 mx-auto hover:bg-purple-50 transition">
          <RefreshCw className="w-6 h-6" /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col pt-20 select-none overflow-hidden font-sans relative">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 md:px-8 max-w-4xl mx-auto w-full mb-6">
        <div className="flex gap-2 items-center">
            {onBack && (
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-purple-600 border-2 border-purple-100">
                    <Home className="w-6 h-6" />
                </button>
            )}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border-2 border-purple-100">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-xl font-bold text-gray-600">{stars}</span>
            </div>
        </div>
        <button onClick={() => setSoundOn(!soundOn)} className="p-3 rounded-full bg-white border-2 border-purple-100 text-gray-400 hover:text-purple-500">
             {soundOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-2xl mx-auto w-full px-4 pb-8">
        
        {/* 1. The Object Container (The Mystery) */}
        <div 
            className={`
                w-full aspect-[4/3] bg-white rounded-[2rem] shadow-2xl border-8 ${gameState === 'success' ? 'border-green-400' : 'border-white'} 
                flex flex-col items-center justify-center relative overflow-hidden mb-8
                transition-all duration-500 ${currentLevel.color}
            `}
            onClick={speakQuestion}
        >   
            {/* The Object */}
            <div className={`text-[10rem] drop-shadow-lg transition-transform duration-500 ${gameState === 'success' ? 'scale-110 animate-bounce' : 'scale-100'}`}>
                {currentLevel.emoji}
            </div>
            
            {/* The Name (Only revealed on success or if hint is needed, but kept simple here) */}
            <div className={`mt-4 px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full font-bold text-2xl text-gray-700 shadow-sm`}>
                {currentLevel.name}
            </div>

            {/* Confetti on Win */}
            {gameState === 'success' && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(12)].map((_, i) => <Confetti key={i} color="#FFF" />)}
                </div>
            )}
        </div>

        {/* 2. The Shape Options */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 w-full">
            {options.map((opt, idx) => {
                const isSuccess = gameState === 'success';
                const isCorrectShape = opt.name === currentLevel.shape;
                const Icon = opt.icon;

                return (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(opt.name)}
                        disabled={isSuccess}
                        className={`
                            aspect-square rounded-2xl border-b-8 transition-all transform flex flex-col items-center justify-center relative
                            ${isSuccess && isCorrectShape 
                                ? `bg-green-500 border-green-700 text-white scale-110 shadow-none ring-4 ring-green-200` // Win State
                                : 'bg-white border-gray-200 text-gray-500 hover:-translate-y-1 active:translate-y-1 active:border-b-0 shadow-lg' // Default
                            }
                            ${wrongShake === opt.name ? 'animate-shake bg-red-50 border-red-200 text-red-400' : ''}
                        `}
                    >
                        <Icon className={`w-12 h-12 mb-2 ${isSuccess && isCorrectShape ? 'text-white' : opt.color}`} strokeWidth={2.5} />
                        <span className="font-bold text-sm md:text-lg">{opt.name}</span>
                    </button>
                );
            })}
        </div>

      </div>
    </div>
  );
}