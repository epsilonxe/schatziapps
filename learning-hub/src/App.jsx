import React, { useState, useEffect, useRef } from 'react';
import { Palette, Home, Type, Brush, Mic, Scissors, Calculator, Shapes, PaintBucket, MapPin, Baby, Users, Music, Volume2, VolumeX, ChevronLeft, ChevronRight, Languages } from 'lucide-react';

// Import all games
import LetterMatch from './games/LetterMatch';
import SoundColoring from './games/SoundColoring';
import VocabularyPaint from './games/VocabularyPaint';
import PhonicsMic from './games/PhonicsMic';
import PhonicsScissor from './games/PhonicsScissor';
import CountingGame from './games/CountingGame';
import ShapeDetective from './games/ShapeDetective';
import ColorCutPaste from './games/ColorCutPaste';
import AnimalHabitat from './games/AnimalHabitat';
import AnimalGrowth from './games/AnimalGrowth';
import SocialRespect from './games/SocialRespect';
import ThaiAlphabet from './games/ThaiAlphabet';

// Define music tracks for each section
const GAME_MUSIC = {
  menu: "/music/joy.mp3",
  match: "/music/november.mp3",
  color: "/music/cloud.mp3",
  vocab: "/music/sweet_talks.mp3",
  phonics: "/music/that_day.mp3",
  scissor: "/music/creamy.mp3",
  counting: "/music/november.mp3",
  shapes: "/music/cloud.mp3",
  colorpaste: "/music/sweet_talks.mp3",
  habitat: "/music/that_day.mp3",
  growth: "/music/creamy.mp3",
  social: "/music/november.mp3",
  thai: "/music/cloud.mp3"
};

// Game Configuration for Menu
const GAMES_LIST = [
  { id: 'match', title: "Letter Match", desc: "Match Mommy & Baby letters", icon: Type, color: "pink" },
  { id: 'color', title: "Color Sounds", desc: "Color the letter you hear", icon: Palette, color: "orange" },
  { id: 'vocab', title: "Vocabulary Paint", desc: "Find and paint the picture", icon: Brush, color: "green" },
  { id: 'phonics', title: "Phonics Mic", desc: "Say the sound of the letter", icon: Mic, color: "indigo" },
  { id: 'scissor', title: "Cut & Paste", desc: "Cut sound and paste to picture", icon: Scissors, color: "slate" },
  { id: 'counting', title: "Counting 1-2-3", desc: "Count the objects (0-5)", icon: Calculator, color: "cyan" },
  { id: 'shapes', title: "Shape Detective", desc: "What shape is the picture?", icon: Shapes, color: "purple" },
  { id: 'colorpaste', title: "Color Match", desc: "Cut & Paste to match color", icon: PaintBucket, color: "red" },
  { id: 'habitat', title: "Habitats", desc: "Where do animals live?", icon: MapPin, color: "emerald" },
  { id: 'growth', title: "Animal Growth", desc: "Match Mommy & Baby", icon: Baby, color: "pink" },
  { id: 'social', title: "Respect Circle", desc: "Circle good choices", icon: Users, color: "teal" },
  { id: 'thai', title: "Thai Alphabet", desc: "Learn ก to ด", icon: Languages, color: "orange" },
];

export default function App() {
  const [currentGame, setCurrentGame] = useState(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const audioRef = useRef(null);

  const targetMusic = currentGame ? GAME_MUSIC[currentGame] : GAME_MUSIC.menu;

  // --- Autoplay Logic ---
  useEffect(() => {
    const startAudio = async () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.15;
        try {
          await audioRef.current.play();
          console.log("Autoplay successful");
        } catch (err) {
          console.log("Autoplay blocked by browser. Waiting for interaction...");
          const handleFirstInteraction = () => {
            if (audioRef.current) {
              audioRef.current.play()
                .then(() => console.log("Audio started after interaction"))
                .catch(e => console.log("Still failed", e));
              document.removeEventListener('click', handleFirstInteraction);
              document.removeEventListener('keydown', handleFirstInteraction);
              document.removeEventListener('touchstart', handleFirstInteraction);
            }
          };
          document.addEventListener('click', handleFirstInteraction);
          document.addEventListener('keydown', handleFirstInteraction);
          document.addEventListener('touchstart', handleFirstInteraction);
        }
      }
    };
    startAudio();
  }, []);

  // --- Track Switching Logic ---
  useEffect(() => {
    if (audioRef.current) {
      if (audioRef.current.getAttribute('src') !== targetMusic) {
        audioRef.current.src = targetMusic;
        if (isMusicPlaying) {
          audioRef.current.play().catch(e => console.log("Track switch play failed", e));
        }
      }
    }
  }, [targetMusic, isMusicPlaying]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current.play().catch(e => console.log("Manual play failed", e));
        setIsMusicPlaying(true);
      }
    }
  };

  const handleGameSelect = (gameId) => {
    setCurrentGame(gameId);
  };

  const goHome = () => setCurrentGame(null);

  const GlobalMusicControl = () => (
    <button 
      onClick={toggleMusic}
      className={`
        fixed bottom-4 right-4 z-[100] p-3 rounded-full shadow-2xl border-4 transition-all transform hover:scale-110
        ${isMusicPlaying ? 'bg-white border-pink-300 text-pink-500' : 'bg-gray-100 border-gray-300 text-gray-400'}
      `}
      title={isMusicPlaying ? "Pause Music" : "Play Music"}
    >
      {isMusicPlaying ? <Music className="w-6 h-6 animate-pulse" /> : <VolumeX className="w-6 h-6" />}
    </button>
  );

  const HomeButton = () => (
    <button 
      onClick={goHome} 
      className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-lg border-2 border-gray-200 hover:bg-gray-100 text-gray-600 font-bold flex items-center gap-2 transition-transform hover:scale-105"
    >
      <Home className="w-5 h-5" /> 
      <span className="hidden md:inline">Menu</span>
    </button>
  );

  const renderContent = () => {
    switch (currentGame) {
      case 'match': return <><HomeButton /><LetterMatch /></>;
      case 'color': return <><HomeButton /><SoundColoring /></>;
      case 'vocab': return <VocabularyPaint onBack={goHome} />;
      case 'phonics': return <PhonicsMic onBack={goHome} />;
      case 'scissor': return <PhonicsScissor onBack={goHome} />;
      case 'counting': return <CountingGame onBack={goHome} />;
      case 'shapes': return <ShapeDetective onBack={goHome} />;
      case 'colorpaste': return <ColorCutPaste onBack={goHome} />;
      case 'habitat': return <AnimalHabitat onBack={goHome} />;
      case 'growth': return <AnimalGrowth onBack={goHome} />;
      case 'social': return <SocialRespect onBack={goHome} />;
      case 'thai': return <ThaiAlphabet onBack={goHome} />;
      default: return <MainMenu onSelect={handleGameSelect} />;
    }
  };

  return (
    <div className="font-sans text-gray-800">
      <audio ref={audioRef} loop>
        <source src={GAME_MUSIC.menu} type="audio/mpeg" />
      </audio>
      <GlobalMusicControl />
      {renderContent()}
    </div>
  );
}

function MainMenu({ onSelect }) {
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 6;

  const totalPages = Math.ceil(GAMES_LIST.length / ITEMS_PER_PAGE);
  
  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(p => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(p => p - 1);
  };

  const displayedGames = GAMES_LIST.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4">
      
      <div className="text-center mb-8 animate-fade-in-up">
        <h1 className="text-5xl md:text-6xl font-black text-purple-600 mb-2 drop-shadow-sm">Learning Hub</h1>
        <p className="text-xl text-gray-500">Choose a game to play!</p>
      </div>

      <div className="relative w-full max-w-6xl">
        
        {currentPage > 0 && (
          <button 
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-12 z-10 p-3 rounded-full bg-white shadow-lg border-2 border-purple-200 transition-all hover:scale-110 hover:bg-purple-50 text-purple-600"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4 pb-10 min-h-[500px] content-start">
          {displayedGames.map((game) => (
            <MenuCard 
              key={game.id}
              onClick={() => onSelect(game.id)} 
              title={game.title} 
              desc={game.desc} 
              icon={game.icon} 
              color={game.color} 
            />
          ))}
        </div>

        {currentPage < totalPages - 1 && (
          <button 
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-12 z-10 p-3 rounded-full bg-white shadow-lg border-2 border-purple-200 transition-all hover:scale-110 hover:bg-purple-50 text-purple-600"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

      </div>
      
      <div className="flex gap-2 mt-4">
        {[...Array(totalPages)].map((_, i) => (
          <div 
            key={i} 
            className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentPage ? 'bg-purple-500 scale-125' : 'bg-purple-200'}`} 
          />
        ))}
      </div>

      <div className="mt-8 text-gray-400 text-sm">
        Preschool Learning Pack
      </div>
    </div>
  );
}

function MenuCard({ onClick, title, desc, icon: Icon, color }) {
  const colorClasses = {
    pink: { bg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-500' },
    orange: { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-500' },
    green: { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-500' },
    indigo: { bg: 'bg-indigo-100', border: 'border-indigo-200', text: 'text-indigo-500' },
    slate: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-500' },
    cyan: { bg: 'bg-cyan-100', border: 'border-cyan-200', text: 'text-cyan-500' },
    purple: { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-500' },
    red: { bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-500' },
    emerald: { bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-500' },
    teal: { bg: 'bg-teal-100', border: 'border-teal-200', text: 'text-teal-600' },
  };

  const theme = colorClasses[color] || colorClasses.pink;

  return (
    <button 
      onClick={onClick}
      className={`bg-white p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-b-8 ${theme.border} group flex flex-col items-center h-full`}
    >
      <div className={`${theme.bg} w-20 h-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-10 h-10 ${theme.text}`} />
      </div>
      <h2 className="text-2xl font-bold text-gray-700">{title}</h2>
      <p className="text-sm text-gray-400 mt-2 text-center">{desc}</p>
    </button>
  );
}