import React, { useState, useEffect, useCallback } from 'react';
import { Star, Home, Volume2, VolumeX, Award, RefreshCw, Languages, AlertCircle } from 'lucide-react';

// --- Custom Icons ---

const ChingIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-sm">
    <path d="M50,5 L50,35" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="5" r="3" fill="#DC2626" />
    <path d="M20,45 Q50,10 80,45 L75,50 Q50,20 25,50 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="3" />
    <path d="M20,65 Q50,100 80,65 L75,60 Q50,90 25,60 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
  </svg>
);

const ThanIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-sm">
    <rect x="25" y="30" width="50" height="10" rx="2" fill="#D97706" stroke="#92400E" strokeWidth="2" />
    <rect x="15" y="40" width="70" height="15" rx="2" fill="#B45309" stroke="#78350F" strokeWidth="2" />
    <rect x="5" y="55" width="90" height="20" rx="2" fill="#92400E" stroke="#451A03" strokeWidth="2" />
    <line x1="30" y1="45" x2="70" y2="45" stroke="#FCD34D" strokeWidth="2" opacity="0.5" />
    <line x1="20" y1="65" x2="80" y2="65" stroke="#FCD34D" strokeWidth="2" opacity="0.5" />
  </svg>
);

const NenIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-sm">
    {/* Robe Body */}
    <path d="M20,90 Q50,70 80,90 L80,100 L20,100 Z" fill="#EA580C" /> 
    <path d="M20,90 Q30,60 50,65 Q70,60 80,90" fill="#F97316" />
    {/* Head (Shaven) */}
    <circle cx="50" cy="45" r="25" fill="#FDBA74" />
    {/* Ears */}
    <circle cx="26" cy="45" r="5" fill="#FDBA74" />
    <circle cx="74" cy="45" r="5" fill="#FDBA74" />
    {/* Face */}
    <path d="M40,55 Q50,60 60,55" stroke="#9A3412" strokeWidth="2" fill="none" /> {/* Smile */}
    <circle cx="40" cy="40" r="2" fill="#431407" />
    <circle cx="60" cy="40" r="2" fill="#431407" />
    <path d="M35,32 Q50,30 65,32" stroke="#9A3412" strokeWidth="1" fill="none" opacity="0.3" /> {/* Hairline hint */}
  </svg>
);

const ChadaIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-sm">
    {/* Base band */}
    <path d="M25,80 Q50,90 75,80 L75,70 Q50,80 25,70 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
    {/* Tier 1 */}
    <path d="M30,70 L70,70 L65,55 L35,55 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
    {/* Tier 2 */}
    <path d="M35,55 L65,55 L60,40 L40,40 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
    {/* Tier 3 */}
    <path d="M40,40 L60,40 L55,25 L45,25 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
    {/* Spire Tip */}
    <path d="M45,25 L55,25 L50,5 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
    {/* Gem */}
    <circle cx="50" cy="75" r="3" fill="#EF4444" />
  </svg>
);

const PatakIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-sm">
    {/* Staff */}
    <rect x="47" y="20" width="6" height="75" rx="2" fill="#78350F" stroke="#451A03" strokeWidth="1" />
    {/* Metal Tip/Spearhead */}
    <path d="M44,20 L56,20 L50,5 Z" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
    {/* The Hook (Distinctive feature of Patak) */}
    <path d="M53,25 Q70,30 65,15" fill="none" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
    <path d="M65,15 L60,18 L68,18 Z" fill="#94A3B8" />
  </svg>
);


// --- Data (ก to ด) ---
const THAI_DATA = [
  { letter: "ก", name: "Gor Kai", thaiWord: "ไก่", meaning: "Chicken", emoji: "🐔", color: "bg-red-100", border: "border-red-400", text: "text-red-600" },
  { letter: "ข", name: "Khor Khai", thaiWord: "ไข่", meaning: "Egg", emoji: "🥚", color: "bg-yellow-100", border: "border-yellow-400", text: "text-yellow-600" },
  { letter: "ฃ", name: "Khor Khuad", thaiWord: "ขวด", meaning: "Bottle", emoji: "🏺", color: "bg-green-100", border: "border-green-400", text: "text-green-600" },
  { letter: "ค", name: "Khor Khwai", thaiWord: "ควาย", meaning: "Buffalo", emoji: "🐃", color: "bg-gray-100", border: "border-gray-400", text: "text-gray-600" },
  { letter: "ฅ", name: "Khor Khon", thaiWord: "คน", meaning: "Person", emoji: "🧑", color: "bg-orange-100", border: "border-orange-400", text: "text-orange-600" },
  { letter: "ฆ", name: "Khor Ra-khang", thaiWord: "ระฆัง", meaning: "Bell", emoji: "🔔", color: "bg-yellow-100", border: "border-yellow-500", text: "text-yellow-700" },
  { letter: "ง", name: "Ngor Ngu", thaiWord: "งู", meaning: "Snake", emoji: "🐍", color: "bg-emerald-100", border: "border-emerald-400", text: "text-emerald-600" },
  { letter: "จ", name: "Jor Jan", thaiWord: "จาน", meaning: "Plate", emoji: "🍽️", color: "bg-blue-100", border: "border-blue-400", text: "text-blue-600" },
  { letter: "ฉ", name: "Chor Ching", thaiWord: "ฉิ่ง", meaning: "Cymbals", emoji: <ChingIcon />, color: "bg-amber-100", border: "border-amber-400", text: "text-amber-600" },
  { letter: "ช", name: "Chor Chang", thaiWord: "ช้าง", meaning: "Elephant", emoji: "🐘", color: "bg-cyan-100", border: "border-cyan-400", text: "text-cyan-600" },
  { letter: "ซ", name: "Sor So", thaiWord: "โซ่", meaning: "Chain", emoji: "⛓️", color: "bg-zinc-100", border: "border-zinc-400", text: "text-zinc-600" },
  { letter: "ฌ", name: "Chor Cher", thaiWord: "เฌอ", meaning: "Tree", emoji: "🌳", color: "bg-green-100", border: "border-green-500", text: "text-green-700" },
  { letter: "ญ", name: "Yor Ying", thaiWord: "หญิง", meaning: "Woman", emoji: "👩", color: "bg-pink-100", border: "border-pink-400", text: "text-pink-600" },
  { letter: "ฎ", name: "Dor Cha-da", thaiWord: "ชฎา", meaning: "Headdress", emoji: <ChadaIcon />, color: "bg-purple-100", border: "border-purple-400", text: "text-purple-600" }, // Custom Chada
  { letter: "ฏ", name: "Tor Pa-tak", thaiWord: "ปฏัก", meaning: "Goad", emoji: <PatakIcon />, color: "bg-slate-100", border: "border-slate-400", text: "text-slate-600" }, // Custom Patak
  { letter: "ฐ", name: "Thor Than", thaiWord: "ฐาน", meaning: "Pedestal", emoji: <ThanIcon />, color: "bg-rose-100", border: "border-rose-400", text: "text-rose-600" },
  { letter: "ฑ", name: "Thor Mon-tho", thaiWord: "มณโฑ", meaning: "Queen", emoji: "👸", color: "bg-violet-100", border: "border-violet-400", text: "text-violet-600" },
  { letter: "ฒ", name: "Thor Phu-thao", thaiWord: "ผู้เฒ่า", meaning: "Elder", emoji: "👴", color: "bg-teal-100", border: "border-teal-400", text: "text-teal-600" },
  { letter: "ณ", name: "Nor Nen", thaiWord: "เณร", meaning: "Novice Monk", emoji: <NenIcon />, color: "bg-orange-50", border: "border-orange-300", text: "text-orange-700" }, // Custom Nen
  { letter: "ด", name: "Dor Dek", thaiWord: "เด็ก", meaning: "Child", emoji: "👶", color: "bg-lime-100", border: "border-lime-400", text: "text-lime-600" },
];

const ENCOURAGEMENTS = ["Correct!", "Good job!", "Very good!", "Thai expert!"];

// --- Helper: Shuffle ---
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function ThaiAlphabet({ onBack }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [options, setOptions] = useState([]);
  const [stars, setStars] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [wrongShake, setWrongShake] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [hasThaiVoice, setHasThaiVoice] = useState(true); 

  const currentItem = THAI_DATA[currentIdx];

  useEffect(() => {
    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const thaiVoice = voices.find(v => v.lang.includes('th'));
      setHasThaiVoice(!!thaiVoice);
    };
    window.speechSynthesis.onvoiceschanged = checkVoices;
    checkVoices();
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const speak = useCallback((item, isFullPhrase = false) => {
    if (!soundOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    const thaiVoice = voices.find(v => v.lang === 'th-TH') || voices.find(v => v.lang.includes('th'));

    if (!thaiVoice) {
        const utterance = new SpeechSynthesisUtterance(isFullPhrase ? item.name : item.name.split(' ')[0]); 
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        return;
    }

    const letterSound = item.letter; 
    const wordSound = item.thaiWord; 

    const utter1 = new SpeechSynthesisUtterance(letterSound);
    utter1.voice = thaiVoice;
    utter1.lang = 'th-TH';
    utter1.rate = 0.7; 

    const utter2 = new SpeechSynthesisUtterance(wordSound);
    utter2.voice = thaiVoice;
    utter2.lang = 'th-TH';
    utter2.rate = 0.8;

    window.speechSynthesis.speak(utter1);
    if (isFullPhrase) {
        window.speechSynthesis.speak(utter2);
    }

  }, [soundOn]);

  const setupLevel = (idx) => {
    const target = THAI_DATA[idx];
    const distractors = THAI_DATA.filter(d => d.letter !== target.letter);
    const randomDistractors = shuffleArray(distractors).slice(0, 2);
    const levelOptions = shuffleArray([target, ...randomDistractors]);
    setOptions(levelOptions);
    setGameState('playing');
    setTimeout(() => {
      speak(target, false); 
    }, 500);
  };

  const startGame = () => {
    setCurrentIdx(0);
    setStars(0);
    setGameStarted(true);
    setupLevel(0);
  };

  const handleAnswer = (selected) => {
    if (gameState !== 'playing') return;

    if (selected.letter === currentItem.letter) {
      setGameState('success');
      setStars(s => s + 1);
      speak(currentItem, true);
      setTimeout(() => {
        if (currentIdx + 1 >= THAI_DATA.length) {
          setGameState('won');
        } else {
          setCurrentIdx(p => p + 1);
          setupLevel(currentIdx + 1);
        }
      }, 2000);
    } else {
      setWrongShake(selected.letter);
      const utter = new SpeechSynthesisUtterance("Try again");
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
      setTimeout(() => setWrongShake(null), 500);
    }
  };

  const replaySound = () => {
      speak(currentItem, true);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4 pt-20 relative font-sans">
        {onBack && (
            <button onClick={onBack} className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-orange-600 hover:bg-orange-200 transition">
                <Home className="w-6 h-6" />
            </button>
        )}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border-8 border-orange-200 text-center max-w-md w-full animate-fade-in-up">
          <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <Languages className="w-10 h-10 text-orange-600" />
          </div>
          <h1 className="text-4xl font-black text-orange-600 mb-2">Thai Alphabet</h1>
          <p className="text-gray-500 mb-4">Review ก to ด</p>
          
          {!hasThaiVoice && (
             <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm mb-6 flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>Thai voice not detected on this device. <br/>Using standard pronunciation.</span>
             </div>
          )}

          <button onClick={startGame} className="w-full bg-orange-500 hover:bg-orange-400 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:scale-105">
            <Award className="w-8 h-8 fill-current" /> Start
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4 pt-20 text-center relative font-sans">
         {onBack && (
            <button onClick={onBack} className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-orange-600 hover:bg-orange-100 transition">
                <Home className="w-6 h-6" />
            </button>
        )}
        <Award className="w-32 h-32 text-yellow-500 mb-6 animate-bounce mx-auto" />
        <h1 className="text-5xl font-black text-orange-600 mb-4">Thai Master!</h1>
        <p className="text-xl text-orange-700 mb-8">You know ก to ด!</p>
        <button onClick={startGame} className="bg-white text-orange-600 text-xl font-bold py-4 px-10 rounded-full shadow-lg flex items-center gap-2 mx-auto hover:bg-orange-50 transition">
          <RefreshCw className="w-6 h-6" /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col pt-20 select-none overflow-hidden font-sans relative">
      
      {/* Header */}
      <div className="flex justify-between items-center px-4 md:px-8 max-w-4xl mx-auto w-full mb-4">
        <div className="flex gap-2 items-center">
            {onBack && (
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-orange-700 border-2 border-orange-200">
                    <Home className="w-6 h-6" />
                </button>
            )}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border-2 border-orange-200">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-xl font-bold text-gray-600">{stars}</span>
            </div>
        </div>
        <button onClick={() => setSoundOn(!soundOn)} className="p-3 rounded-full bg-white border-2 border-orange-200 text-orange-400 hover:text-orange-600">
             {soundOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-2xl mx-auto w-full px-4 pb-8">
        
        <div 
            className={`
                w-full aspect-[3/2] bg-white rounded-[2rem] shadow-2xl border-8 flex flex-col items-center justify-center relative overflow-hidden mb-8 transition-all duration-500 cursor-pointer
                ${currentItem.border} ${currentItem.color}
                ${gameState === 'success' ? 'scale-105' : 'scale-100'}
            `}
            onClick={replaySound}
        >   
            <div className={`text-[10rem] md:text-[12rem] font-black drop-shadow-md ${currentItem.text} transition-transform`}>
                {currentItem.letter}
            </div>
            <div className="absolute top-4 right-4 opacity-30">
                <Volume2 className="w-8 h-8" />
            </div>
            <div className="absolute bottom-4 opacity-40 font-bold text-lg text-gray-600">
                Tap to hear
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4 md:gap-8 w-full">
            {options.map((opt, idx) => {
                const isSuccess = gameState === 'success';
                const isCorrect = opt.letter === currentItem.letter;
                const isEmojiString = typeof opt.emoji === 'string';

                return (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(opt)}
                        disabled={isSuccess}
                        className={`
                            aspect-square rounded-2xl border-b-8 transition-all transform flex flex-col items-center justify-center relative p-2
                            ${isSuccess && isCorrect 
                                ? `bg-green-500 border-green-700 text-white scale-110 shadow-none ring-4 ring-green-200` 
                                : 'bg-white border-gray-200 text-gray-700 hover:-translate-y-1 active:translate-y-1 active:border-b-0 shadow-lg'
                            }
                            ${wrongShake === opt.letter ? 'animate-shake bg-red-50 border-red-200' : ''}
                        `}
                    >
                        {isEmojiString ? (
                           <span className="text-5xl md:text-6xl mb-1">{opt.emoji}</span>
                        ) : (
                           <div className="mb-1">{opt.emoji}</div>
                        )}
                        
                        <span className={`text-xs md:text-sm font-bold ${isSuccess && isCorrect ? 'text-white' : 'text-gray-400'}`}>
                            {opt.meaning}
                        </span>
                    </button>
                );
            })}
        </div>
      </div>
    </div>
  );
}