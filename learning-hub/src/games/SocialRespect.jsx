import React, { useState, useEffect, useCallback } from 'react';
import { Star, Heart, Home, Volume2, VolumeX, Users, CheckCircle, XCircle, Trophy, RefreshCw } from 'lucide-react';

// --- Data ---
const SCENARIOS = [
  { 
    id: 1, 
    text: "Sharing Toys", 
    img: "/SocialRespect/sharing.webp", 
    isRespectful: true,
    feedback: "Sharing is caring!"
  },
  { 
    id: 2, 
    text: "Yelling", 
    img: "/SocialRespect/yelling.jpg", 
    isRespectful: false,
    feedback: "Yelling is not respectful. We use inside voices."
  },
  { 
    id: 3, 
    text: "Helping a Friend", 
    img: "/SocialRespect/helping.jpg", 
    isRespectful: true,
    feedback: "Helping others is very respectful."
  },
  { 
    id: 4, 
    text: "Fighting", 
    img: "/SocialRespect/fighting.jpg", 
    isRespectful: false,
    feedback: "Fighting hurts. We should use our words."
  },
  { 
    id: 5, 
    text: "Listening", 
    img: "/SocialRespect/listening.jpg", 
    isRespectful: true,
    feedback: "Listening shows you care."
  },
  { 
    id: 6, 
    text: "Pushing", 
    img: "/SocialRespect/pushing.webp", 
    isRespectful: false, 
    feedback: "Pushing is not nice. Keep hands to yourself."
  },
  { 
    id: 7, 
    text: "Cleaning Up", 
    img: "/SocialRespect/cleanup.jpg", 
    isRespectful: true,
    feedback: "Cleaning up your mess is respectful."
  },
  { 
    id: 8, 
    text: "Being Mean", 
    img: "/SocialRespect/being_mean.jpg", 
    isRespectful: false,
    feedback: "Being mean makes people sad."
  },
];

const ENCOURAGEMENTS = ["You know how to be kind!", "Great job finding respect!", "Kindness is a superpower!", "Excellent!"];

// --- Helper: Shuffle ---
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function SocialRespect({ onBack }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRoundCards, setCurrentRoundCards] = useState([]);
  const [foundCount, setFoundCount] = useState(0);
  const [totalRespectful, setTotalRespectful] = useState(0);
  const [stars, setStars] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [gameState, setGameState] = useState('playing'); // playing, won
  const [shakingId, setShakingId] = useState(null);
  const [round, setRound] = useState(0); // Track number of rounds played

  // --- Audio ---
  const speak = useCallback((text) => {
    if (!soundOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }, [soundOn]);

  // --- Game Logic ---
  const startRound = () => {
    // Pick 4 random cards for a round
    const shuffled = shuffleArray(SCENARIOS).slice(0, 4);
    setCurrentRoundCards(shuffled.map(card => ({ ...card, isFound: false }))); 
    
    const respectfulCount = shuffled.filter(c => c.isRespectful).length;
    setTotalRespectful(respectfulCount);
    setFoundCount(0);
    setGameState('playing');
    
    setTimeout(() => {
        speak(`Tap the pictures that show Respect and Kindness.`);
    }, 500);
  };

  const startGame = () => {
    setGameStarted(true);
    setStars(0);
    setRound(0);
    startRound();
  };

  const handleCardClick = (card) => {
    if (gameState !== 'playing' || card.isFound) return;

    if (card.isRespectful) {
        // Correct
        speak(card.feedback);
        setStars(s => s + 1);
        
        // Mark as found
        const updatedCards = currentRoundCards.map(c => 
            c.id === card.id ? { ...c, isFound: true } : c
        );
        setCurrentRoundCards(updatedCards);
        
        // Check if round complete
        const newFoundCount = foundCount + 1;
        setFoundCount(newFoundCount);

        if (newFoundCount >= totalRespectful) {
            const cheer = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
            setTimeout(() => speak(cheer), 1500);
            
            setTimeout(() => {
                if (round < 1) { // Play 2 rounds total (index 0 and 1)
                    setRound(r => r + 1);
                    startRound();
                } else {
                    setGameState('won');
                    speak("You are a Respect Super Star!");
                }
            }, 3500);
        }

    } else {
        // Incorrect
        setShakingId(card.id);
        speak(card.feedback);
        setTimeout(() => setShakingId(null), 500);
    }
  };

  // --- Render ---

  // 1. Start Screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-teal-50 flex flex-col items-center justify-center p-4 pt-20 relative font-sans">
        {onBack && (
            <button onClick={onBack} className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-teal-600 hover:bg-teal-200 transition">
                <Home className="w-6 h-6" />
            </button>
        )}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border-8 border-teal-200 text-center max-w-md w-full animate-fade-in-up">
          <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <Users className="w-10 h-10 text-teal-600" />
          </div>
          <h1 className="text-4xl font-black text-teal-600 mb-2">Respect Circle</h1>
          <p className="text-gray-500 mb-8">Find pictures that show kindness!</p>
          <button onClick={startGame} className="w-full bg-teal-500 hover:bg-teal-400 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:scale-105">
            <Heart className="w-8 h-8 fill-current" /> Start
          </button>
        </div>
      </div>
    );
  }

  // 2. Win Screen (Added)
  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-teal-50 flex flex-col items-center justify-center p-4 pt-20 text-center relative font-sans">
         {onBack && (
            <button onClick={onBack} className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md text-teal-600 hover:bg-teal-200 transition">
                <Home className="w-6 h-6" />
            </button>
        )}
        <Trophy className="w-32 h-32 text-yellow-500 mb-6 animate-bounce mx-auto" />
        <h1 className="text-5xl font-black text-teal-600 mb-4">Respect Hero!</h1>
        <p className="text-xl text-teal-700 mb-8">You found all the kind choices!</p>
        <button onClick={startGame} className="bg-white text-teal-600 text-xl font-bold py-4 px-10 rounded-full shadow-lg flex items-center gap-2 mx-auto hover:bg-teal-50 transition">
          <RefreshCw className="w-6 h-6" /> Play Again
        </button>
      </div>
    );
  }

  // 3. Game Screen
  return (
    <div className="min-h-screen bg-teal-50 flex flex-col pt-20 select-none overflow-hidden font-sans relative">
      
      {/* Header */}
      <div className="flex justify-between items-center px-4 md:px-8 max-w-4xl mx-auto w-full mb-4">
        <div className="flex gap-2 items-center">
            {onBack && (
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-teal-600 border-2 border-teal-200">
                    <Home className="w-6 h-6" />
                </button>
            )}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border-2 border-teal-200">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-xl font-bold text-gray-600">{stars}</span>
            </div>
        </div>
        <button onClick={() => setSoundOn(!soundOn)} className="p-3 rounded-full bg-white border-2 border-teal-200 text-gray-400 hover:text-teal-600">
             {soundOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      {/* Instruction */}
      <div className="text-center mb-6 px-4">
        <h2 className="text-2xl md:text-3xl font-black text-teal-700 drop-shadow-sm">
            Circle the <span className="text-pink-500">Good Choices</span>!
        </h2>
        <p className="text-teal-600 opacity-70 font-medium">Find {totalRespectful - foundCount} more</p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pb-10 px-4">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {currentRoundCards.map((card) => {
                return (
                    <button
                        key={card.id}
                        onClick={() => handleCardClick(card)}
                        className={`
                            relative aspect-[4/3] bg-white rounded-2xl shadow-lg overflow-hidden border-4 transition-all duration-300 group
                            ${card.isFound ? 'border-green-500 ring-4 ring-green-200 scale-95' : 'border-white hover:scale-105 hover:shadow-2xl'}
                            ${shakingId === card.id ? 'animate-shake border-red-400' : ''}
                        `}
                    >
                        {/* Image */}
                        <img 
                            src={card.img} 
                            alt={card.text}
                            className={`w-full h-full object-cover transition-opacity duration-500 ${card.isFound ? 'opacity-80' : 'opacity-100'}`}
                        />
                        
                        {/* Label Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 backdrop-blur-sm">
                            <span className="text-white font-bold text-lg md:text-xl">{card.text}</span>
                        </div>

                        {/* Success Circle Overlay */}
                        {card.isFound && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 animate-fade-in">
                                <div className="bg-green-500 text-white rounded-full p-3 shadow-lg animate-bounce">
                                    <CheckCircle className="w-12 h-12" />
                                </div>
                            </div>
                        )}

                        {/* Error Feedback Overlay */}
                        {shakingId === card.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                                <div className="bg-red-500 text-white rounded-full p-3 shadow-lg">
                                    <XCircle className="w-12 h-12" />
                                </div>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
      </div>

    </div>
  );
}