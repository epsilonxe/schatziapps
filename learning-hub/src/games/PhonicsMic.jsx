import React, { useState, useEffect, useCallback } from 'react';
import { Star, Mic, Play, RefreshCw, Home, Volume2, VolumeX, Sparkles, Music } from 'lucide-react';

// Phonics Data (A-Z)
const PHONICS_DATA = [
  { letter: "A", word: "Apple", emoji: "🍎", color: "bg-red-500", light: "bg-red-100", border: "border-red-400" },
  { letter: "B", word: "Bear", emoji: "🐻", color: "bg-amber-600", light: "bg-amber-100", border: "border-amber-500" },
  { letter: "C", word: "Cat", emoji: "🐱", color: "bg-orange-500", light: "bg-orange-100", border: "border-orange-400" },
  { letter: "D", word: "Dog", emoji: "🐶", color: "bg-amber-700", light: "bg-amber-100", border: "border-amber-600" },
  { letter: "E", word: "Egg", emoji: "🥚", color: "bg-yellow-400", light: "bg-yellow-100", border: "border-yellow-300" },
  { letter: "F", word: "Fish", emoji: "🐠", color: "bg-cyan-500", light: "bg-cyan-100", border: "border-cyan-400" },
  { letter: "G", word: "Goat", emoji: "🐐", color: "bg-emerald-500", light: "bg-emerald-100", border: "border-emerald-400" },
  { letter: "H", word: "Hat", emoji: "👒", color: "bg-green-500", light: "bg-green-100", border: "border-green-400" },
  { letter: "I", word: "Igloo", emoji: "🏠", color: "bg-indigo-400", light: "bg-indigo-100", border: "border-indigo-300" },
  { letter: "J", word: "Jam", emoji: "🍯", color: "bg-purple-500", light: "bg-purple-100", border: "border-purple-400" },
  { letter: "K", word: "Kite", emoji: "🪁", color: "bg-rose-500", light: "bg-rose-100", border: "border-rose-400" },
  { letter: "L", word: "Lion", emoji: "🦁", color: "bg-yellow-500", light: "bg-yellow-100", border: "border-yellow-400" },
  { letter: "M", word: "Moon", emoji: "🌙", color: "bg-indigo-600", light: "bg-indigo-100", border: "border-indigo-500" },
  { letter: "N", word: "Nest", emoji: "🪺", color: "bg-stone-500", light: "bg-stone-100", border: "border-stone-400" },
  { letter: "O", word: "Octopus", emoji: "🐙", color: "bg-pink-500", light: "bg-pink-100", border: "border-pink-400" },
  { letter: "P", word: "Pig", emoji: "🐷", color: "bg-pink-400", light: "bg-pink-100", border: "border-pink-300" },
  { letter: "Q", word: "Queen", emoji: "👑", color: "bg-yellow-400", light: "bg-yellow-100", border: "border-yellow-300" },
  { letter: "R", word: "Rain", emoji: "🌧️", color: "bg-blue-500", light: "bg-blue-100", border: "border-blue-400" },
  { letter: "S", word: "Sun", emoji: "☀️", color: "bg-yellow-400", light: "bg-yellow-100", border: "border-yellow-300" },
  { letter: "T", word: "Turtle", emoji: "🐢", color: "bg-green-600", light: "bg-green-100", border: "border-green-500" },
  { letter: "U", word: "Umbrella", emoji: "☂️", color: "bg-purple-500", light: "bg-purple-100", border: "border-purple-400" },
  { letter: "V", word: "Van", emoji: "🚐", color: "bg-red-600", light: "bg-red-100", border: "border-red-500" },
  { letter: "W", word: "Web", emoji: "🕸️", color: "bg-slate-500", light: "bg-slate-100", border: "border-slate-400" },
  { letter: "X", word: "Box", emoji: "📦", color: "bg-amber-800", light: "bg-amber-100", border: "border-amber-700" }, 
  { letter: "Y", word: "Yo-yo", emoji: "🪀", color: "bg-red-500", light: "bg-red-100", border: "border-red-400" },
  { letter: "Z", word: "Zebra", emoji: "🦓", color: "bg-gray-800", light: "bg-gray-100", border: "border-gray-600" },
];

// --- Components ---
const Confetti = ({ color }) => (
  <div className="absolute w-3 h-3 rounded-full animate-ping opacity-0" 
       style={{
         left: '50%', top: '50%', backgroundColor: color,
         transform: `translate(${Math.random() * 300 - 150}px, ${Math.random() * 300 - 150}px)`,
         animationDelay: `${Math.random() * 0.2}s`
       }} 
  />
);

export default function PhonicsMic({ onBack }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameLevels, setGameLevels] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stars, setStars] = useState(0);
  
  // States: 'prompt' (Show Letter), 'listening' (Mic Animation), 'reveal' (Show Answer)
  const [stage, setStage] = useState('prompt'); 
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

  const startGame = () => {
    // NO SHUFFLE: Use original A-Z order
    setGameLevels(PHONICS_DATA);
    setCurrentIdx(0);
    setGameStarted(true);
    setStage('prompt');
    setStars(0);
    
    // Delay prompt slightly for UI load
    setTimeout(() => {
        speak(`What sound does little ${PHONICS_DATA[0].letter} make?`);
    }, 600);
  };

  const handleMicClick = () => {
    if (stage !== 'prompt') return;
    
    // 1. Enter listening mode
    setStage('listening');

    // 2. Simulate "Processing" then Reveal
    setTimeout(() => {
        handleReveal();
    }, 1500); // 1.5 seconds of "listening" animation
  };

  const handleReveal = () => {
    setStage('reveal');
    setStars(s => s + 1);
    
    const level = gameLevels[currentIdx];
    
    // Audio Feedback: "a says... Apple!"
    speak(`${level.letter} says... ${level.word}!`);

    // Auto-advance after 3.5 seconds
    setTimeout(() => {
        if (currentIdx + 1 >= gameLevels.length) {
            setStage('won');
            speak("You did all the sounds! Great job!");
        } else {
            setCurrentIdx(p => p + 1);
            setStage('prompt');
            speak(`What sound does little ${gameLevels[currentIdx + 1].letter} make?`);
        }
    }, 3500);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-4 pt-20 relative font-sans">
        {onBack && (
            <button 
                onClick={onBack}
                className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-indigo-600 hover:bg-indigo-100 transition"
            >
                <Home className="w-6 h-6" />
            </button>
        )}
        
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border-8 border-indigo-200 text-center max-w-md w-full animate-fade-in-up">
          <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
             <Mic className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-black text-indigo-600 mb-2">Phonics Mic</h1>
          <p className="text-gray-500 mb-8">Say the sound, then see the picture!</p>
          <button onClick={startGame} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:scale-105">
            <Play className="w-8 h-8 fill-current" /> Start
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'won') {
    return (
      <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-4 pt-20 text-center relative font-sans">
         {onBack && (
            <button 
                onClick={onBack}
                className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-indigo-600 hover:bg-indigo-100 transition"
            >
                <Home className="w-6 h-6" />
            </button>
        )}
        <Award className="w-32 h-32 text-yellow-500 mb-6 animate-bounce mx-auto" />
        <h1 className="text-5xl font-black text-indigo-600 mb-4">Super Speaker!</h1>
        <button onClick={startGame} className="bg-white text-indigo-600 text-xl font-bold py-4 px-10 rounded-full shadow-lg flex items-center gap-2 mx-auto hover:bg-indigo-50 transition">
          <RefreshCw className="w-6 h-6" /> Play Again
        </button>
      </div>
    );
  }

  const currentLevel = gameLevels[currentIdx];

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col pt-20 select-none overflow-hidden font-sans relative">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 md:px-8 max-w-4xl mx-auto w-full mb-8">
        <div className="flex gap-2 items-center">
            {onBack && (
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-indigo-600 border-2 border-indigo-100">
                    <Home className="w-6 h-6" />
                </button>
            )}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border-2 border-indigo-100">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-xl font-bold text-gray-600">{stars}</span>
            </div>
        </div>
        <button onClick={() => setSoundOn(!soundOn)} className="p-3 rounded-full bg-white border-2 border-gray-100 text-gray-400 hover:text-indigo-500">
             {soundOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-lg mx-auto w-full px-4 pb-12">
        
        {/* Main Card */}
        <div className={`
             relative w-full aspect-[4/5] max-h-[500px] bg-white rounded-[3rem] shadow-2xl border-8 flex flex-col items-center justify-center p-8 transition-all duration-500
             ${currentLevel.border}
             ${stage === 'listening' ? 'scale-105' : 'scale-100'}
        `}>
            {/* 1. Letter Display (Prompt Mode) */}
            <div className={`transition-all duration-500 ${stage === 'reveal' ? 'scale-50 -translate-y-24 opacity-50' : 'scale-100 translate-y-0 opacity-100'}`}>
                <h1 className={`text-[12rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-800 to-gray-500 drop-shadow-sm`}>
                    {/* LOWERCASE DISPLAY */}
                    {currentLevel.letter.toLowerCase()}
                </h1>
            </div>

            {/* 2. Reveal Display (Picture & Word) */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${stage === 'reveal' ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}>
                 <div className="text-[10rem] animate-bounce drop-shadow-md">{currentLevel.emoji}</div>
                 <h2 className={`text-5xl font-black ${currentLevel.color.replace('bg-', 'text-')} mt-4`}>{currentLevel.word}</h2>
                 {/* Sparkles */}
                 {[...Array(8)].map((_, i) => <Confetti key={i} color="#FFD700" />)}
            </div>

            {/* 3. Mic Button / Listening Indicator */}
            <div className="absolute bottom-12 w-full flex justify-center">
                {stage === 'prompt' && (
                    <button 
                        onClick={handleMicClick}
                        className={`
                            w-24 h-24 rounded-full ${currentLevel.color} text-white shadow-lg border-4 border-white flex items-center justify-center
                            animate-pulse hover:scale-110 active:scale-95 transition-all cursor-pointer group
                        `}
                    >
                        <Mic className="w-10 h-10 group-hover:animate-bounce" />
                    </button>
                )}

                {stage === 'listening' && (
                    <div className="flex flex-col items-center">
                        <div className="flex gap-2 items-center h-24">
                           <div className={`w-4 h-12 ${currentLevel.color} rounded-full animate-[bounce_0.5s_infinite]`} style={{animationDelay: '0s'}}></div>
                           <div className={`w-4 h-16 ${currentLevel.color} rounded-full animate-[bounce_0.5s_infinite]`} style={{animationDelay: '0.1s'}}></div>
                           <div className={`w-4 h-20 ${currentLevel.color} rounded-full animate-[bounce_0.5s_infinite]`} style={{animationDelay: '0.2s'}}></div>
                           <div className={`w-4 h-16 ${currentLevel.color} rounded-full animate-[bounce_0.5s_infinite]`} style={{animationDelay: '0.1s'}}></div>
                           <div className={`w-4 h-12 ${currentLevel.color} rounded-full animate-[bounce_0.5s_infinite]`} style={{animationDelay: '0s'}}></div>
                        </div>
                        <p className="text-gray-400 font-bold mt-2">Listening...</p>
                    </div>
                )}
                
                {stage === 'reveal' && (
                    <div className="bg-green-100 text-green-600 px-6 py-2 rounded-full font-bold shadow-sm flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Great Job!
                    </div>
                )}
            </div>

        </div>

        {/* Prompt Text */}
        <div className="mt-8 text-center h-8">
            {stage === 'prompt' && <p className="text-xl text-gray-500 font-bold animate-fade-in">Tap the mic and say the sound!</p>}
        </div>

      </div>
    </div>
  );
}