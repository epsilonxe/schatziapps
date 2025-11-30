import React, { useState, useEffect, useCallback } from 'react';
import { Star, Heart, Home, Volume2, VolumeX, Baby, Sparkles } from 'lucide-react';

// --- Data with Real Photos ---
const ANIMAL_PAIRS = [
  { 
    id: 1, 
    adultName: "Hen", 
    adultImg: "/AnimalGrowth/hen.png", 
    babyName: "Chick", 
    babyImg: "/AnimalGrowth/chick.png",
    color: "bg-yellow-100", accent: "text-yellow-700", border: "border-yellow-300"
  },
  { 
    id: 2, 
    adultName: "Dog", 
    adultImg: "/AnimalGrowth/dog.png", 
    babyName: "Puppy", 
    babyImg: "/AnimalGrowth/puppy.png",
    color: "bg-orange-100", accent: "text-orange-800", border: "border-orange-300"
  },
  { 
    id: 3, 
    adultName: "Cat", 
    adultImg: "/AnimalGrowth/cat.png", 
    babyName: "Kitten", 
    babyImg: "/AnimalGrowth/kitten.png",
    color: "bg-stone-100", accent: "text-stone-700", border: "border-stone-300"
  },
  { 
    id: 4, 
    adultName: "Cow", 
    adultImg: "/AnimalGrowth/cow.png", 
    babyName: "Calf", 
    babyImg: "/AnimalGrowth/calf.png",
    color: "bg-green-50", accent: "text-green-800", border: "border-green-200"
  },
  { 
    id: 5, 
    adultName: "Lion", 
    adultImg: "/AnimalGrowth/lion.png", 
    babyName: "Cub", 
    babyImg: "/AnimalGrowth/cub.png", 
    color: "bg-amber-100", accent: "text-amber-800", border: "border-amber-300"
  },
  { 
    id: 6, 
    adultName: "Pig", 
    adultImg: "/AnimalGrowth/pig.png", 
    babyName: "Piglet", 
    babyImg: "/AnimalGrowth/piglet.png",
    color: "bg-pink-100", accent: "text-pink-700", border: "border-pink-300"
  },
  { 
    id: 7, 
    adultName: "Duck", 
    adultImg: "/AnimalGrowth/duck.png", 
    babyName: "Duckling", 
    babyImg: "/AnimalGrowth/duckling.png",
    color: "bg-yellow-50", accent: "text-yellow-700", border: "border-yellow-200"
  },
  { 
    id: 8, 
    adultName: "Sheep", 
    adultImg: "/AnimalGrowth/sheep.png",
    babyName: "Lamb", 
    babyImg: "/AnimalGrowth/lamb.png",
    color: "bg-slate-100", accent: "text-slate-700", border: "border-slate-300"
  },
];

const ENCOURAGEMENTS = ["Growing up strong!", "You found the baby!", "That's the little one!", "Family reunited!"];

// --- Helper: Shuffle ---
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function AnimalGrowth({ onBack }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [levels, setLevels] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  
  // Game State
  const [options, setOptions] = useState([]); 
  const [gameState, setGameState] = useState('playing'); // playing, success, won
  const [wrongShake, setWrongShake] = useState(null);

  const currentLevel = levels[currentIdx] || ANIMAL_PAIRS[0];

  // --- Audio ---
  const speak = useCallback((text) => {
    if (!soundOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.2; // Higher pitch for cuteness
    window.speechSynthesis.speak(utterance);
  }, [soundOn]);

  // --- Game Logic ---
  const setupLevel = (level) => {
    // Get distractors (other babies)
    const otherLevels = ANIMAL_PAIRS.filter(l => l.id !== level.id);
    const randomDistractors = shuffleArray(otherLevels).slice(0, 2);
    
    // Combine correct baby + 2 distractors
    const levelOptions = [
      { 
        id: level.id, 
        name: level.babyName, 
        img: level.babyImg, 
        isCorrect: true
      },
      ...randomDistractors.map(d => ({ 
        id: d.id, 
        name: d.babyName, 
        img: d.babyImg, 
        isCorrect: false
      }))
    ];

    setOptions(shuffleArray(levelOptions));
    setGameState('playing');
    
    setTimeout(() => {
        speak(`This is the Mommy ${level.adultName}. Can you find her baby ${level.babyName}?`);
    }, 500);
  };

  const startGame = () => {
    const shuffled = shuffleArray(ANIMAL_PAIRS);
    setLevels(shuffled);
    setCurrentIdx(0);
    setStars(0);
    setGameStarted(true);
    setupLevel(shuffled[0]);
  };

  const handleAnswer = (option) => {
    if (gameState !== 'playing') return;

    if (option.isCorrect) {
        // Correct
        setGameState('success');
        setStars(s => s + 1);
        
        const cheer = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
        speak(`${cheer} The baby ${currentLevel.adultName} is called a ${currentLevel.babyName}.`);

        setTimeout(() => {
            if (currentIdx + 1 >= levels.length) {
                speak("You matched all the families!");
                startGame(); // Loop or show win screen
            } else {
                setCurrentIdx(p => p + 1);
                setupLevel(levels[currentIdx + 1]);
            }
        }, 3000);

    } else {
        // Wrong
        setWrongShake(option.id);
        speak(`That's a baby ${option.name}. Try again!`);
        setTimeout(() => setWrongShake(null), 500);
    }
  };

  // --- Render ---

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4 pt-20 relative font-sans">
        {onBack && (
            <button onClick={onBack} className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-pink-600 hover:bg-pink-200 transition">
                <Home className="w-6 h-6" />
            </button>
        )}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border-8 border-pink-200 text-center max-w-md w-full animate-fade-in-up">
          <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <Baby className="w-10 h-10 text-pink-600" />
          </div>
          <h1 className="text-4xl font-black text-pink-600 mb-2">Animal Growth</h1>
          <p className="text-gray-500 mb-8">Match the Mommy & Baby!</p>
          <button onClick={startGame} className="w-full bg-pink-500 hover:bg-pink-400 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:scale-105">
            <Baby className="w-8 h-8 fill-current" /> Play
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col pt-20 select-none overflow-hidden font-sans relative">
      
      {/* Header */}
      <div className="flex justify-between items-center px-4 md:px-8 max-w-4xl mx-auto w-full mb-4">
        <div className="flex gap-2 items-center">
            {onBack && (
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-pink-600 border-2 border-pink-200">
                    <Home className="w-6 h-6" />
                </button>
            )}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border-2 border-pink-200">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-xl font-bold text-gray-600">{stars}</span>
            </div>
        </div>
        <button onClick={() => setSoundOn(!soundOn)} className="p-3 rounded-full bg-white border-2 border-pink-200 text-gray-400 hover:text-pink-600">
             {soundOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full px-4">
        
        {/* ADULT ANIMAL (Parent) - Large Photo */}
        <div className={`
            w-full bg-white rounded-3xl shadow-xl p-4 flex flex-col items-center justify-center gap-4 min-h-[300px] relative overflow-hidden border-8 transition-colors duration-500
            ${currentLevel.color} ${currentLevel.border}
        `}>
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-lg relative group">
                <img 
                    src={currentLevel.adultImg} 
                    alt={currentLevel.adultName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            </div>

            <h2 className={`text-4xl md:text-5xl font-black uppercase tracking-widest drop-shadow-sm ${currentLevel.accent}`}>
                {currentLevel.adultName}
            </h2>

            {/* Connector Line */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-16 bg-white/80 rounded-full"></div>
        </div>

        {/* INSTRUCTION */}
        <div className="my-6 text-center">
            <p className="text-gray-500 font-bold text-lg animate-pulse">Tap the baby to color it!</p>
        </div>

        {/* BABY OPTIONS - Photos */}
        <div className="flex justify-center gap-4 md:gap-8 w-full">
            {options.map((opt, idx) => {
                const isSuccess = gameState === 'success';
                const isTarget = opt.isCorrect;
                const isSelected = isSuccess && isTarget;

                return (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(opt)}
                        disabled={isSuccess}
                        className={`
                            relative w-28 h-28 md:w-40 md:h-40 bg-white rounded-2xl shadow-md flex flex-col items-center justify-center overflow-hidden
                            border-4 transition-all duration-500 transform
                            ${wrongShake === opt.id ? 'animate-shake border-red-300' : 'border-gray-200'}
                            ${isSelected ? `scale-110 -translate-y-2 z-10 border-green-400 ring-4 ring-green-100` : 'hover:border-pink-200 active:scale-95'}
                            ${isSuccess && !isTarget ? 'opacity-40 scale-90' : ''}
                        `}
                    >
                        {/* The Baby Image */}
                        <img 
                            src={opt.img} 
                            alt={opt.name}
                            className={`
                                w-full h-full object-cover transition-all duration-1000
                                ${isSelected ? 'filter-none' : 'filter grayscale contrast-125'}
                            `}
                        />

                        {/* Confetti / Hearts on Success */}
                        {isSelected && (
                            <>
                                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm animate-bounce">
                                    <Heart className="w-6 h-6 text-pink-500 fill-current" />
                                </div>
                                <div className="absolute inset-0 bg-white mix-blend-overlay opacity-20 animate-pulse"></div>
                            </>
                        )}
                    </button>
                )
            })}
        </div>

      </div>
    </div>
  );
}