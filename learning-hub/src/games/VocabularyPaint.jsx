import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Star, Music, Volume2, VolumeX, Play, RefreshCw, Palette, Award, Brush, MousePointer2, Mic, Home, Megaphone } from 'lucide-react';

// Vocabulary Data
const VOCAB_DATA = [
  { letter: "A", word: "Ant", emoji: "🐜", color: "bg-red-500", dist: ["🐝", "🐛"] },
  { letter: "B", word: "Balloon", emoji: "🎈", color: "bg-blue-500", dist: ["🪁", "🎁"] },
  { letter: "C", word: "Car", emoji: "🚗", color: "bg-orange-500", dist: ["✈️", "🚂"] },
  { letter: "D", word: "Drum", emoji: "🥁", color: "bg-amber-600", dist: ["🎸", "🎺"] },
  { letter: "E", word: "Egg", emoji: "🥚", color: "bg-yellow-200", dist: ["🍞", "🧀"] },
  { letter: "F", word: "Flower", emoji: "🌸", color: "bg-pink-400", dist: ["🌲", "🌵"] },
  { letter: "G", word: "Gift", emoji: "🎁", color: "bg-purple-500", dist: ["🎈", "🕯️"] },
  { letter: "H", word: "Hat", emoji: "👒", color: "bg-green-400", dist: ["👓", "👞"] },
  { letter: "I", word: "Ice Cream", emoji: "🍦", color: "bg-cyan-200", dist: ["🧁", "🍪"] },
  { letter: "J", word: "Juice", emoji: "🧃", color: "bg-orange-400", dist: ["🥛", "☕"] },
  { letter: "K", word: "Key", emoji: "🔑", color: "bg-yellow-400", dist: ["🔒", "🚪"] },
  { letter: "L", word: "Leaf", emoji: "🍃", color: "bg-green-500", dist: ["🍂", "🍁"] },
  { letter: "M", word: "Moon", emoji: "🌙", color: "bg-indigo-300", dist: ["☀️", "⭐"] },
  { letter: "N", word: "Nose", emoji: "👃", color: "bg-rose-300", dist: ["👀", "👂"] },
  { letter: "O", word: "Owl", emoji: "🦉", color: "bg-stone-400", dist: ["🦅", "🦆"] },
  { letter: "P", word: "Pizza", emoji: "🍕", color: "bg-yellow-500", dist: ["🍔", "🌭"] },
  { letter: "Q", word: "Queen", emoji: "👑", color: "bg-yellow-400", dist: ["💍", "💎"] },
  { letter: "R", word: "Robot", emoji: "🤖", color: "bg-gray-400", dist: ["👾", "👽"] },
  { letter: "S", word: "Snake", emoji: "🐍", color: "bg-green-500", dist: ["🐢", "🦎"] },
  { letter: "T", word: "Tree", emoji: "🌳", color: "bg-green-600", dist: ["🍄", "💐"] },
  { letter: "U", word: "Umbrella", emoji: "☂️", color: "bg-purple-500", dist: ["🌧️", "☀️"] },
  { letter: "V", word: "Volcano", emoji: "🌋", color: "bg-red-600", dist: ["🏔️", "⛰️"] },
  { letter: "W", word: "Whale", emoji: "🐳", color: "bg-blue-400", dist: ["🐬", "🦈"] },
  { letter: "X", word: "X-ray", emoji: "🦴", color: "bg-slate-800", dist: ["🦷", "💀"] },
  { letter: "Y", word: "Yo-yo", emoji: "🪀", color: "bg-red-400", dist: ["⚽", "🏀"] },
  { letter: "Z", word: "Zebra", emoji: "🦓", color: "bg-slate-200", dist: ["🐎", "🦒"] },
];

const PAINT_COLORS = [
  { id: 'red', bg: 'bg-red-400' },
  { id: 'blue', bg: 'bg-blue-400' },
  { id: 'green', bg: 'bg-green-400' },
  { id: 'yellow', bg: 'bg-yellow-400' },
];

const ENCOURAGEMENTS = ["You found it!", "That's the one!", "Good coloring!", "Vocabulary Star!"];

// --- Helper Functions ---
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- Components ---
const Sparkle = ({ color }) => (
  <div className="absolute w-3 h-3 rounded-full animate-ping opacity-0" 
       style={{
         left: '50%', top: '50%', backgroundColor: color,
         transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px)`,
         animationDelay: `${Math.random() * 0.2}s`
       }} 
  />
);

const PaintBlob = ({ x, y, color }) => (
  <div className={`absolute w-6 h-6 rounded-full ${color} pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-fade-in`} style={{ left: x, top: y }} />
);

export default function VocabularyPaint({ onBack }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameLevels, setGameLevels] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, success, won
  const [wrongShake, setWrongShake] = useState(null);
  
  // Game Logic State
  const [options, setOptions] = useState([]); // The 3 picture options for current level
  const [interactionMode, setInteractionMode] = useState('brush'); // brush | click
  const [activeBrush, setActiveBrush] = useState(PAINT_COLORS[0]);
  const [strokes, setStrokes] = useState({}); // { 0: [{x,y}], 1: ... }
  
  // Audio
  const [soundOn, setSoundOn] = useState(true);
  const coveredCells = useRef({});

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

  // --- Level Setup ---
  const setupLevel = (levelIndex, levelsArray) => {
    const level = levelsArray[levelIndex];
    
    // Create options: 1 Correct + 2 Distractors
    const currentOptions = [
      { id: 'correct', emoji: level.emoji, word: level.word, isCorrect: true },
      { id: 'dist1', emoji: level.dist[0], word: 'Not ' + level.word, isCorrect: false },
      { id: 'dist2', emoji: level.dist[1], word: 'Not ' + level.word, isCorrect: false },
    ];
    
    setOptions(shuffleArray(currentOptions));
    setStrokes({});
    coveredCells.current = {};
    setGameState('playing');
    
    // Initial Instruction
    setTimeout(() => {
        speak(`Color the picture that starts with ${level.letter}. ${level.letter} is for... ?`);
    }, 500);
  };

  const startGame = () => {
    const shuffled = shuffleArray(VOCAB_DATA);
    setGameLevels(shuffled);
    setCurrentIdx(0);
    setGameStarted(true);
    setupLevel(0, shuffled);
  };

  // --- Interaction Handlers ---

  const handlePaintMove = (e, optionId, isCorrect) => {
    if (gameState !== 'playing' || interactionMode !== 'brush') return;
    const isTouch = e.type.includes('touch');
    if (!isTouch && e.buttons !== 1) return;
    if (isTouch) e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Visual blobs
    setStrokes(prev => {
      const currentStrokes = prev[optionId] || [];
      // Throttle blobs
      const lastStroke = currentStrokes[currentStrokes.length - 1];
      if (lastStroke && Math.abs(lastStroke.x - x) < 8 && Math.abs(lastStroke.y - y) < 8) return prev;
      return { ...prev, [optionId]: [...currentStrokes, { x, y, id: Date.now() }] };
    });

    // Coverage Logic
    if (!coveredCells.current[optionId]) coveredCells.current[optionId] = new Set();
    const GRID_SIZE = 10; // Smaller grid for emojis
    const col = Math.floor((x / rect.width) * GRID_SIZE);
    const row = Math.floor((y / rect.height) * GRID_SIZE);
    
    // Mark 3x3 area
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r>=0 && r<GRID_SIZE && c>=0 && c<GRID_SIZE) coveredCells.current[optionId].add(`${r}-${c}`);
      }
    }

    const percent = (coveredCells.current[optionId].size / (GRID_SIZE*GRID_SIZE)) * 100;
    
    if (isCorrect) {
      if (percent > 80) handleCorrect();
    } else {
      if (percent > 20) handleWrong(optionId);
    }
  };

  const handleClick = (optionId, isCorrect) => {
    // Only allow clicking if in 'click' mode
    if (gameState !== 'playing' || interactionMode !== 'click') return;
    isCorrect ? handleCorrect() : handleWrong(optionId);
  };

  const toggleMode = () => {
      // Switch mode and clear any current paint to prevent confusion
      setInteractionMode(prev => prev === 'brush' ? 'click' : 'brush');
      setStrokes({});
      coveredCells.current = {};
  };

  const handleCorrect = () => {
    setGameState('success');
    setStars(s => s + 1);
    setStrokes({}); // Clear paint for full reveal
    
    const level = gameLevels[currentIdx];
    const cheer = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    speak(`${cheer} ${level.letter} is for ${level.word}. Say, ${level.word}!`);

    setTimeout(() => {
      if (currentIdx + 1 >= gameLevels.length) {
        setGameState('won');
        speak("You are a vocabulary superstar!");
      } else {
        setCurrentIdx(p => p + 1);
        setupLevel(currentIdx + 1, gameLevels);
      }
    }, 3500); 
  };

  const handleWrong = (optionId) => {
    setWrongShake(optionId);
    setStrokes(prev => ({ ...prev, [optionId]: [] })); // Wipe paint
    coveredCells.current[optionId] = new Set();
    speak("Oops, not that one. Try again!");
    setTimeout(() => setWrongShake(null), 500);
  };

  const speakCurrentQuestion = () => {
    const level = gameLevels[currentIdx];
    speak(`${level.letter} is for... ?`);
  };

  // --- Render ---
  
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4 pt-20 relative">
        {onBack && (
            <button 
                onClick={onBack}
                className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-green-600 hover:bg-green-100 transition"
            >
                <Home className="w-6 h-6" />
            </button>
        )}
        
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border-8 border-green-200 text-center max-w-md w-full animate-fade-in-up">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <Brush className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-black text-green-600 mb-2">Vocabulary Paint</h1>
          <p className="text-gray-500 mb-8">Find the picture and paint it!</p>
          <button onClick={startGame} className="w-full bg-green-500 hover:bg-green-400 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:scale-105">
            <Play className="w-8 h-8 fill-current" /> Play
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4 pt-20 text-center relative">
         {onBack && (
            <button 
                onClick={onBack}
                className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-green-600 hover:bg-green-100 transition"
            >
                <Home className="w-6 h-6" />
            </button>
        )}
        <Award className="w-32 h-32 text-yellow-500 mb-6 animate-bounce mx-auto" />
        <h1 className="text-5xl font-black text-green-600 mb-4">You Did It!</h1>
        <button onClick={startGame} className="bg-white text-green-600 text-xl font-bold py-4 px-10 rounded-full shadow-lg flex items-center gap-2 mx-auto hover:bg-green-50">
          <RefreshCw className="w-6 h-6" /> Play Again
        </button>
      </div>
    );
  }

  const currentLevel = gameLevels[currentIdx];

  return (
    <div className="min-h-screen bg-green-50 flex flex-col pt-20 select-none overflow-hidden font-sans relative">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 md:px-8 max-w-4xl mx-auto w-full mb-4">
        
        {/* Left Side: Home & Stars */}
        <div className="flex gap-2 items-center">
            {onBack && (
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-green-600 border-2 border-green-100">
                    <Home className="w-6 h-6" />
                </button>
            )}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border-2 border-green-100">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-xl font-bold text-gray-600">{stars}</span>
            </div>
        </div>
        
        {/* Right Side: Tools */}
        <div className="flex gap-2">
           <button onClick={speakCurrentQuestion} className="p-3 rounded-full shadow-sm border-2 bg-white text-gray-600 hover:text-green-500 hover:border-green-200">
             <Megaphone className="w-6 h-6" />
           </button>

           <button onClick={toggleMode} className={`p-3 rounded-full shadow-sm border-2 transition-colors ${interactionMode === 'brush' ? 'bg-green-100 border-green-300 text-green-600' : 'bg-blue-100 border-blue-300 text-blue-600'}`}>
             {interactionMode === 'brush' ? <Brush className="w-6 h-6" /> : <MousePointer2 className="w-6 h-6" />}
           </button>
           <button onClick={() => setSoundOn(!soundOn)} className="p-3 rounded-full bg-white border-2 border-gray-100 text-gray-400 hover:text-green-500">
             {soundOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-2xl mx-auto w-full px-4">
        
        {/* The Question (Letter) */}
        <div className="mb-8 text-center animate-fade-in relative group" onClick={speakCurrentQuestion}>
           <div className="text-8xl md:text-9xl font-black text-green-600 drop-shadow-sm mb-2 cursor-pointer transition-transform active:scale-95">
             {currentLevel.letter}<span className="text-6xl text-green-400">{currentLevel.letter.toLowerCase()}</span>
           </div>
           <div className="bg-white px-6 py-2 rounded-full inline-flex items-center gap-2 shadow-sm">
              <Mic className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500 font-medium">Find the picture!</span>
           </div>
        </div>

        {/* Brush Palette - HIDDEN IN CLICK MODE */}
        {interactionMode === 'brush' && (
          <div className="flex gap-4 mb-8 bg-white p-3 rounded-full shadow-md animate-fade-in-up">
            {PAINT_COLORS.map(c => (
              <button 
                key={c.id} 
                onClick={() => setActiveBrush(c)}
                className={`w-10 h-10 rounded-full ${c.bg} border-4 transition-transform ${activeBrush.id === c.id ? 'scale-125 border-gray-600' : 'border-white hover:scale-110'}`} 
              />
            ))}
          </div>
        )}

        {/* Height Spacer for Click Mode to prevent layout jump when palette hides */}
        {interactionMode === 'click' && <div className="h-20 mb-8" />}

        {/* Options (Pictures) */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 w-full">
           {options.map((opt) => {
             const isSuccess = gameState === 'success';
             const isTarget = opt.isCorrect;
             
             return (
               <div 
                 key={opt.id}
                 onClick={() => handleClick(opt.id, opt.isCorrect)}
                 onPointerDown={(e) => handlePaintMove(e, opt.id, opt.isCorrect)}
                 onPointerMove={(e) => handlePaintMove(e, opt.id, opt.isCorrect)}
                 onTouchMove={(e) => handlePaintMove(e, opt.id, opt.isCorrect)}
                 className={`
                    relative aspect-square bg-white rounded-2xl shadow-lg border-4 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden touch-none
                    ${wrongShake === opt.id ? 'animate-shake border-red-300 bg-red-50' : 'border-white'}
                    ${isSuccess && isTarget ? `${activeBrush.bg} scale-110 border-green-200 z-10` : 'hover:border-green-100'}
                    ${isSuccess && !isTarget ? 'opacity-30 scale-90 grayscale' : ''}
                    ${interactionMode === 'click' && !isSuccess ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-crosshair'}
                 `}
               >
                  {/* Emoji Content - Grayscale until painted/won */}
                  <span className={`text-6xl md:text-7xl transition-all duration-500 ${isSuccess && isTarget ? 'scale-125 filter-none' : 'filter grayscale opacity-60'}`}>
                    {opt.emoji}
                  </span>

                  {/* Paint Blobs */}
                  {!isSuccess && strokes[opt.id]?.map((s, i) => (
                    <PaintBlob key={i} x={s.x} y={s.y} color={activeBrush.bg} />
                  ))}

                  {/* Win Effects */}
                  {isSuccess && isTarget && (
                    <>
                      <div className="absolute inset-0 flex items-end justify-center pb-2 bg-gradient-to-t from-black/20 to-transparent">
                        <span className="text-white font-bold text-lg drop-shadow-md animate-bounce">{currentLevel.word}</span>
                      </div>
                      {[...Array(6)].map((_, i) => <Sparkle key={i} color="#FFF" />)}
                    </>
                  )}
               </div>
             )
           })}
        </div>
      </div>
    </div>
  );
}