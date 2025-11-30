import React, { useState, useEffect, useCallback } from 'react';
import { Star, RotateCcw, Volume2, VolumeX, Heart, Trophy } from 'lucide-react';

const Firework = ({ color }) => {
  const style = {
    left: '50%',
    top: '50%',
    backgroundColor: color,
    transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px)`,
    opacity: 0,
  };
  return <div className="absolute w-2 h-2 rounded-full animate-ping" style={style} />;
};

const ALPHABET = [
  { upper: 'A', lower: 'a', color: 'text-pink-500', bg: 'bg-pink-100', border: 'border-pink-400' },
  { upper: 'B', lower: 'b', color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-400' },
  { upper: 'C', lower: 'c', color: 'text-purple-500', bg: 'bg-purple-100', border: 'border-purple-400' },
  { upper: 'D', lower: 'd', color: 'text-green-500', bg: 'bg-green-100', border: 'border-green-400' },
  { upper: 'E', lower: 'e', color: 'text-yellow-500', bg: 'bg-yellow-100', border: 'border-yellow-400' },
  { upper: 'F', lower: 'f', color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-400' },
  { upper: 'G', lower: 'g', color: 'text-teal-500', bg: 'bg-teal-100', border: 'border-teal-400' },
  { upper: 'H', lower: 'h', color: 'text-indigo-500', bg: 'bg-indigo-100', border: 'border-indigo-400' },
  { upper: 'I', lower: 'i', color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-400' },
  { upper: 'J', lower: 'j', color: 'text-cyan-500', bg: 'bg-cyan-100', border: 'border-cyan-400' },
  { upper: 'K', lower: 'k', color: 'text-rose-500', bg: 'bg-rose-100', border: 'border-rose-400' },
  { upper: 'L', lower: 'l', color: 'text-emerald-500', bg: 'bg-emerald-100', border: 'border-emerald-400' },
  { upper: 'M', lower: 'm', color: 'text-violet-500', bg: 'bg-violet-100', border: 'border-violet-400' },
  { upper: 'N', lower: 'n', color: 'text-lime-500', bg: 'bg-lime-100', border: 'border-lime-400' },
  { upper: 'O', lower: 'o', color: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-400' },
  { upper: 'P', lower: 'p', color: 'text-fuchsia-500', bg: 'bg-fuchsia-100', border: 'border-fuchsia-400' },
  { upper: 'Q', lower: 'q', color: 'text-sky-500', bg: 'bg-sky-100', border: 'border-sky-400' },
  { upper: 'R', lower: 'r', color: 'text-pink-600', bg: 'bg-pink-200', border: 'border-pink-500' },
  { upper: 'S', lower: 's', color: 'text-blue-600', bg: 'bg-blue-200', border: 'border-blue-500' },
  { upper: 'T', lower: 't', color: 'text-purple-600', bg: 'bg-purple-200', border: 'border-purple-500' },
  { upper: 'U', lower: 'u', color: 'text-green-600', bg: 'bg-green-200', border: 'border-green-500' },
  { upper: 'V', lower: 'v', color: 'text-yellow-600', bg: 'bg-yellow-200', border: 'border-yellow-500' },
  { upper: 'W', lower: 'w', color: 'text-orange-600', bg: 'bg-orange-200', border: 'border-orange-500' },
  { upper: 'X', lower: 'x', color: 'text-teal-600', bg: 'bg-teal-200', border: 'border-teal-500' },
  { upper: 'Y', lower: 'y', color: 'text-indigo-600', bg: 'bg-indigo-200', border: 'border-indigo-500' },
  { upper: 'Z', lower: 'z', color: 'text-red-600', bg: 'bg-red-200', border: 'border-red-500' },
];

const ENCOURAGEMENTS = ["Great job!", "You did it!", "Super star!", "Awesome!", "Correct!"];

export default function LetterMatch() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [shaking, setShaking] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameWon, setGameWon] = useState(false);

  const speak = useCallback((text) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
  }, [soundEnabled]);

  const setupRound = useCallback((index) => {
    const currentLetter = ALPHABET[index];
    let distractors = [];
    while (distractors.length < 2) {
      const r = Math.floor(Math.random() * ALPHABET.length);
      if (r !== index && !distractors.includes(ALPHABET[r])) {
        distractors.push(ALPHABET[r]);
      }
    }
    const roundOptions = [currentLetter, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(roundOptions);
    setFeedback(null);
    setTimeout(() => {
      speak(`Find the little ${currentLetter.upper}`);
    }, 500);
  }, [speak]);

  useEffect(() => {
    setupRound(0);
  }, []);

  const handleOptionClick = (selectedLetter) => {
    if (feedback === 'correct') return;
    const target = ALPHABET[currentIndex];

    if (selectedLetter.lower === target.lower) {
      setFeedback('correct');
      setStars(s => s + 1);
      speak(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);

      setTimeout(() => {
        if (currentIndex >= ALPHABET.length - 1) {
          setGameWon(true);
          speak("You finished the whole alphabet!");
        } else {
          setScore(s => s + 1);
          setCurrentIndex(prev => prev + 1);
          setupRound(currentIndex + 1);
        }
      }, 2000);
    } else {
      setShaking(selectedLetter.lower);
      speak("Oops, try again!");
      setTimeout(() => setShaking(null), 500);
    }
  };

  const restartGame = () => {
    setGameWon(false);
    setCurrentIndex(0);
    setScore(0);
    setStars(0);
    setupRound(0);
  };

  const currentLetter = ALPHABET[currentIndex];

  if (gameWon) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-200 to-pink-200 flex flex-col items-center justify-center p-4 pt-20 font-sans">
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md w-full mx-auto animate-bounce">
          <Trophy className="w-32 h-32 text-yellow-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-purple-600 mb-4">You Won!</h1>
          <button onClick={restartGame} className="bg-pink-500 text-white text-2xl font-bold py-4 px-10 rounded-full shadow-xl flex items-center justify-center gap-3 mx-auto">
            <RotateCcw className="w-8 h-8" /> Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 select-none font-sans overflow-hidden relative pt-20">
      <div className="flex justify-between items-center p-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
          <Star className="w-6 h-6 text-yellow-400 fill-current" />
          <span className="text-2xl font-bold text-gray-700">{stars}</span>
        </div>
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="bg-white p-3 rounded-full shadow-md text-purple-500">
          {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center mt-4 px-4">
        <div className="relative mb-12 group">
          <div className={`w-48 h-48 md:w-64 md:h-64 flex items-center justify-center rounded-3xl shadow-2xl transition-all duration-500 ${currentLetter.bg} ${currentLetter.border} border-b-8 ${feedback === 'correct' ? 'animate-bounce scale-110' : ''}`}>
            <span className={`text-9xl font-black ${currentLetter.color}`}>{currentLetter.upper}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 md:gap-12 max-w-2xl w-full place-items-center">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-white border-4 shadow-lg flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 ${shaking === option.lower ? 'animate-shake bg-red-50 border-red-300' : 'border-white'} ${feedback === 'correct' && option.lower === currentLetter.lower ? 'bg-green-100 border-green-400 scale-110' : ''}`}
            >
              <span className={`text-6xl md:text-7xl font-bold ${option.color}`}>{option.lower}</span>
            </button>
          ))}
        </div>

        <div className="h-16 mt-8 flex items-center justify-center">
          {feedback === 'correct' && (
            <div className="flex items-center gap-2 animate-fade-in-up">
              <Heart className="w-8 h-8 text-pink-500 fill-current animate-ping" />
              <span className="text-3xl font-bold text-pink-500">Matched!</span>
              {[...Array(10)].map((_, i) => <Firework key={i} color={currentLetter.color.replace('text-', 'bg-')} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}