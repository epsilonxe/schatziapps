import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Star, Music, Volume2, VolumeX, Play, RefreshCw, Palette, Award, Brush, MousePointer2, Megaphone } from 'lucide-react';

const LEVELS = [
  { id: 1, word: "Apple", emoji: "🍎", answer: "a", color: "bg-red-400", options: ["a", "b", "s"] },
  { id: 2, word: "Bear", emoji: "🐻", answer: "b", color: "bg-amber-600", options: ["t", "b", "p"] },
  { id: 3, word: "Cat", emoji: "🐱", answer: "c", color: "bg-orange-300", options: ["c", "m", "d"] },
  { id: 4, word: "Dog", emoji: "🐶", answer: "d", color: "bg-amber-700", options: ["f", "a", "d"] },
  { id: 5, word: "Elephant", emoji: "🐘", answer: "e", color: "bg-slate-400", options: ["e", "l", "h"] },
  { id: 6, word: "Fish", emoji: "🐠", answer: "f", color: "bg-cyan-400", options: ["p", "f", "b"] },
  { id: 7, word: "Grapes", emoji: "🍇", answer: "g", color: "bg-purple-500", options: ["j", "g", "c"] },
  { id: 8, word: "House", emoji: "🏠", answer: "h", color: "bg-blue-400", options: ["h", "m", "r"] },
  { id: 9, word: "Ice Cream", emoji: "🍦", answer: "i", color: "bg-pink-300", options: ["i", "l", "s"] },
  { id: 10, word: "Jellyfish", emoji: "🪼", answer: "j", color: "bg-purple-400", options: ["k", "j", "g"] },
  { id: 11, word: "Kite", emoji: "🪁", answer: "k", color: "bg-red-500", options: ["c", "k", "t"] },
  { id: 12, word: "Lion", emoji: "🦁", answer: "l", color: "bg-yellow-500", options: ["l", "r", "b"] },
  { id: 13, word: "Monkey", emoji: "🐵", answer: "m", color: "bg-amber-800", options: ["n", "w", "m"] },
  { id: 14, word: "Nest", emoji: "🪺", answer: "n", color: "bg-stone-500", options: ["m", "n", "u"] },
  { id: 15, word: "Octopus", emoji: "🐙", answer: "o", color: "bg-rose-400", options: ["o", "a", "q"] },
  { id: 16, word: "Pig", emoji: "🐷", answer: "p", color: "bg-pink-400", options: ["b", "p", "d"] },
  { id: 17, word: "Queen", emoji: "👸", answer: "q", color: "bg-yellow-400", options: ["k", "q", "o"] },
  { id: 18, word: "Rainbow", emoji: "🌈", answer: "r", color: "bg-sky-400", options: ["r", "w", "m"] },
  { id: 19, word: "Sun", emoji: "☀️", answer: "s", color: "bg-yellow-300", options: ["c", "s", "o"] },
  { id: 20, word: "Turtle", emoji: "🐢", answer: "t", color: "bg-green-500", options: ["t", "l", "f"] },
];

const PAINT_COLORS = [
  { id: 'pink', bg: 'bg-pink-400', ring: 'ring-pink-200' },
  { id: 'blue', bg: 'bg-blue-400', ring: 'ring-blue-200' },
  { id: 'green', bg: 'bg-green-400', ring: 'ring-green-200' },
];

const ENCOURAGEMENTS = ["You colored it!", "Beautiful!", "That matches!", "Perfect!", "Good thinking!"];

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Sparkle = ({ color }) => {
  const style = {
    left: '50%',
    top: '50%',
    backgroundColor: color,
    transform: `translate(${Math.random() * 300 - 150}px, ${Math.random() * 300 - 150}px)`,
    animationDelay: `${Math.random() * 0.2}s`
  };
  return <div className="absolute w-3 h-3 rounded-full animate-ping opacity-0" style={style} />;
};

const PaintBlob = ({ x, y, color }) => (
  <div className={`absolute w-8 h-8 rounded-full ${color} pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-fade-in`} style={{ left: x, top: y }} />
);

export default function SoundColoring() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameLevels, setGameLevels] = useState(LEVELS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [wrongShake, setWrongShake] = useState(null);
  const [interactionMode, setInteractionMode] = useState('brush');
  const [activeBrush, setActiveBrush] = useState(PAINT_COLORS[0]);
  const [paintedColor, setPaintedColor] = useState(null);
  const [strokes, setStrokes] = useState({});
  const coveredCells = useRef({});
  const [soundOn, setSoundOn] = useState(true);
  
  const currentLevel = gameLevels[currentIdx] || LEVELS[0];

  const speak = useCallback((text) => {
    if (!soundOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }, [soundOn]);

  const startGame = () => {
    const shuffled = shuffleArray(LEVELS);
    setGameLevels(shuffled);
    setCurrentIdx(0);
    setGameStarted(true);
    speak(`Let's color! What is the first sound of ${shuffled[0].word}?`);
  };

  const toggleInteractionMode = () => {
    setStrokes({});
    coveredCells.current = {};
    setInteractionMode(prev => prev === 'brush' ? 'click' : 'brush');
  };

  const speakCurrentWord = () => speak(currentLevel.word);

  const handleClickMode = (letter) => {
    if (gameState !== 'playing' || interactionMode !== 'click') return;
    letter === currentLevel.answer ? handleCorrectAnswer(letter) : handleWrongAnswer(letter);
  };

  const handlePaintMove = (e, letter) => {
    if (gameState !== 'playing' || interactionMode !== 'brush') return;
    const isTouch = e.type.includes('touch');
    if (!isTouch && e.buttons !== 1) return;
    if (isTouch) e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setStrokes(prev => {
      const currentStrokes = prev[letter] || [];
      const lastStroke = currentStrokes[currentStrokes.length - 1];
      if (lastStroke && Math.abs(lastStroke.x - x) < 8 && Math.abs(lastStroke.y - y) < 8) return prev;
      return { ...prev, [letter]: [...currentStrokes, { x, y, id: Date.now() }] };
    });

    if (!coveredCells.current[letter]) coveredCells.current[letter] = new Set();
    
    const GRID_SIZE = 15;
    const col = Math.floor((x / rect.width) * GRID_SIZE);
    const row = Math.floor((y / rect.height) * GRID_SIZE);

    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) coveredCells.current[letter].add(`${r}-${c}`);
      }
    }
    
    const coveragePercent = (coveredCells.current[letter].size / (GRID_SIZE * GRID_SIZE)) * 100;
    checkPaintThreshold(letter, coveragePercent);
  };

  const checkPaintThreshold = (letter, coveragePercent) => {
    if (letter === currentLevel.answer) {
      if (coveragePercent >= 90) handleCorrectAnswer(letter);
    } else {
      if (coveragePercent > 15) handleWrongAnswer(letter);
    }
  };

  const handleCorrectAnswer = (letter) => {
    setGameState('success');
    setStars(s => s + 1);
    setPaintedColor(activeBrush.bg);
    setStrokes({});
    const cheer = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    speak(`${cheer} ${currentLevel.answer} is for ${currentLevel.word}.`);
    setTimeout(() => {
      if (currentIdx + 1 >= gameLevels.length) {
        setGameState('won');
        speak("You are a coloring champion!");
      } else {
        coveredCells.current = {};
        setStrokes({});
        setPaintedColor(null);
        setCurrentIdx(prev => prev + 1);
        setGameState('playing');
        speak(`What starts like... ${gameLevels[currentIdx + 1].word}?`);
      }
    }, 2500);
  };

  const handleWrongAnswer = (letter) => {
    setWrongShake(letter);
    setStrokes(prev => ({ ...prev, [letter]: [] }));
    coveredCells.current[letter] = new Set();
    speak(`Not ${letter}. Try again!`);
    setTimeout(() => setWrongShake(null), 500);
  };

  const resetGame = () => {
    const shuffled = shuffleArray(LEVELS);
    setGameLevels(shuffled);
    setStars(0);
    setCurrentIdx(0);
    setGameState('playing');
    setPaintedColor(null);
    setStrokes({});
    coveredCells.current = {};
    speak(`Let's play again! What is the first sound of ${shuffled[0].word}?`);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden pt-20">
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border-8 border-orange-200 text-center max-w-md w-full z-10 relative">
          <Palette className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-orange-500 mb-2">Color the Sound</h1>
          <button onClick={startGame} className="w-full bg-orange-500 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg mt-8 flex items-center justify-center gap-3">
            <Play className="w-8 h-8 fill-current" /> Start
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-200 flex flex-col items-center justify-center p-4 pt-20 font-sans text-center">
        <Award className="w-32 h-32 text-orange-500 mb-6 animate-bounce mx-auto" />
        <h1 className="text-5xl font-black text-orange-600 mb-4">Amazing!</h1>
        <button onClick={resetGame} className="bg-white text-orange-500 text-xl font-bold py-4 px-10 rounded-full shadow-lg flex items-center gap-2 mx-auto">
          <RefreshCw className="w-6 h-6" /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col font-sans select-none overflow-hidden relative pt-20">
      <div className="flex justify-between items-center p-4 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-orange-100 shadow-sm">
          <Star className="w-6 h-6 text-yellow-400 fill-current" />
          <span className="text-xl font-bold text-gray-600">{stars}</span>
        </div>
        <div className="flex gap-2">
           <button onClick={speakCurrentWord} className="p-3 rounded-full shadow-sm border-2 bg-white text-gray-600">
             <Megaphone className="w-6 h-6" />
           </button>
           <button onClick={toggleInteractionMode} className={`p-3 rounded-full shadow-sm border-2 ${interactionMode === 'brush' ? 'bg-orange-100 border-orange-300 text-orange-600' : 'bg-blue-100 border-blue-300 text-blue-600'}`}>
             {interactionMode === 'brush' ? <Brush className="w-6 h-6" /> : <MousePointer2 className="w-6 h-6" />}
           </button>
           <button onClick={() => setSoundOn(!soundOn)} className="p-3 rounded-full bg-blue-100 text-blue-500">
             {soundOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full px-4 -mt-4">
        <div className="relative mb-8 flex flex-col items-center">
           <div className="w-56 h-56 md:w-64 md:h-64 bg-white rounded-[2rem] shadow-xl border-4 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
              <span className="text-9xl z-10 drop-shadow-md">{currentLevel.emoji}</span>
              <div className={`absolute inset-0 transition-all duration-1000 ease-in-out origin-bottom ${gameState === 'success' ? `${currentLevel.color} opacity-30 scale-y-100` : 'scale-y-0 opacity-0'}`} />
           </div>
        </div>

        {interactionMode === 'brush' && (
          <div className="flex items-center gap-4 mb-8 bg-white p-3 rounded-full shadow-md border border-gray-100 animate-fade-in-up">
            <Brush className="w-6 h-6 text-gray-400 ml-2" />
            <div className="flex gap-3">
              {PAINT_COLORS.map((color) => (
                <button key={color.id} onClick={() => setActiveBrush(color)} className={`w-10 h-10 rounded-full ${color.bg} border-4 transition-all transform ${activeBrush.id === color.id ? `scale-125 border-gray-600 shadow-lg` : 'border-white scale-100 opacity-70 hover:opacity-100'}`} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6 w-full">
          {currentLevel.options.map((letter, idx) => {
             const isCorrect = letter === currentLevel.answer;
             const isSuccessState = gameState === 'success';
             const letterStrokes = strokes[letter] || [];
             return (
              <div
                key={`${currentIdx}-${idx}`}
                onClick={() => handleClickMode(letter)}
                onPointerDown={(e) => handlePaintMove(e, letter)}
                onPointerMove={(e) => handlePaintMove(e, letter)}
                onTouchMove={(e) => handlePaintMove(e, letter)} 
                className={`relative h-32 rounded-2xl border-4 transition-all duration-300 transform flex items-center justify-center group touch-none select-none ${isSuccessState && isCorrect ? `${paintedColor || activeBrush.bg} border-transparent shadow-none scale-110` : 'bg-white border-gray-300 border-dashed'} ${wrongShake === letter ? 'animate-shake bg-red-50 border-red-200' : ''}`}
              >
                <span className={`text-6xl font-black transition-colors duration-300 z-10 pointer-events-none ${isSuccessState && isCorrect ? 'text-white' : 'text-gray-400'}`}>{letter}</span>
                {interactionMode === 'brush' && !isSuccessState && letterStrokes.map((stroke, i) => <PaintBlob key={i} x={stroke.x} y={stroke.y} color={activeBrush.bg} />)}
                {isSuccessState && isCorrect && <div className="absolute inset-0 overflow-hidden rounded-xl z-20 pointer-events-none"><div className="absolute w-full h-full bg-white opacity-20 animate-pulse"></div>{[...Array(8)].map((_, i) => <Sparkle key={i} color="#FFF" />)}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}