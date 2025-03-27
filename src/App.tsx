import React, { useState, useEffect, useCallback } from 'react';
import { Anchor, Baby, Banana, Bird, Bomb, Book, Brain, Camera, Car, Cat, Clock, Coffee, Crown, Diamond, Dog, Fish, Heart, Music, Palette, Plane as Plant, Radio, Rainbow, Star, Sun, Rocket, Trophy, Timer, Volume2, VolumeX, RotateCcw, Settings, Github, Linkedin, Brain as Logo } from 'lucide-react';
import confetti from 'canvas-confetti';
import useSound from 'use-sound';

type GameState = 'landing' | 'difficulty' | 'playing' | 'won';
type Difficulty = 'easy' | 'medium' | 'hard';

type Card = {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const DIFFICULTY_CONFIG = {
  easy: { grid: 4, pairs: 8, label: 'Easy (4x4)', description: 'Perfect for beginners' },
  medium: { grid: 5, pairs: 12, label: 'Medium (5x5)', description: 'A balanced challenge' },
  hard: { grid: 6, pairs: 18, label: 'Hard (6x6)', description: 'For memory masters' }
};

const ALL_ICONS = [
  'Anchor', 'Baby', 'Banana', 'Bird', 'Bomb', 'Book', 'Brain', 'Camera',
  'Car', 'Cat', 'Clock', 'Coffee', 'Crown', 'Diamond', 'Dog', 'Fish',
  'Heart', 'Music', 'Palette', 'Plant', 'Radio', 'Rainbow', 'Star',
  'Sun', 'Rocket'
];

const IconComponent: { [key: string]: React.FC<{ className?: string }> } = {
  Anchor, Baby, Banana, Bird, Bomb, Book, Brain, Camera,
  Car, Cat, Clock, Coffee, Crown, Diamond, Dog, Fish,
  Heart, Music, Palette, Plant, Radio, Rainbow, Star,
  Sun, Rocket
};

function App() {
  const [gameState, setGameState] = useState<GameState>('landing');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [bestTimes, setBestTimes] = useState<Record<Difficulty, number | null>>({
    easy: null,
    medium: null,
    hard: null
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Sound effects
  const [playFlip] = useSound('/flip.mp3', { volume: 0.5, soundEnabled });
  const [playMatch] = useSound('/match.mp3', { volume: 0.5, soundEnabled });
  const [playWin] = useSound('/win.mp3', { volume: 0.5, soundEnabled });

  const initializeGame = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const selectedIcons = ALL_ICONS.slice(0, config.pairs);
    const shuffledIcons = [...selectedIcons, ...selectedIcons]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledIcons);
    setFlippedCards([]);
    setMoves(0);
    setTime(0);
    setGameState('playing');
  }, [difficulty]);

  const handleCardClick = (id: number) => {
    if (
      gameState !== 'playing' ||
      flippedCards.length === 2 ||
      flippedCards.includes(id) ||
      cards[id].isMatched
    ) {
      return;
    }

    playFlip();

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);
    setCards(prev =>
      prev.map(card =>
        card.id === id ? { ...card, isFlipped: true } : card
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      const [firstCard, secondCard] = newFlippedCards;
      
      if (cards[firstCard].icon === cards[secondCard].icon) {
        playMatch();
        setCards(prev =>
          prev.map(card =>
            card.id === firstCard || card.id === secondCard
              ? { ...card, isMatched: true }
              : card
          )
        );
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === firstCard || card.id === secondCard
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const triggerWinAnimation = useCallback(() => {
    playWin();
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: number = window.setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }, [playWin]);

  useEffect(() => {
    if (gameState === 'playing') {
      const allMatched = cards.every(card => card.isMatched);
      if (allMatched && cards.length > 0) {
        setGameState('won');
        triggerWinAnimation();
        setBestTimes(prev => ({
          ...prev,
          [difficulty]: !prev[difficulty] || time < prev[difficulty]! 
            ? time 
            : prev[difficulty]
        }));
      }
    }
  }, [cards, gameState, time, difficulty, triggerWinAnimation]);

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing') {
      timer = window.setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8 flex justify-center">
            <Logo className="w-24 h-24 text-white animate-float" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
            Memory Match
          </h1>
          <p className="text-xl text-white/90 mb-12 animate-fade-in-delay">
            Test your memory with this fun and challenging card matching game!
          </p>
          <button
            onClick={() => setGameState('difficulty')}
            className="px-8 py-4 bg-white text-indigo-600 rounded-xl text-xl font-bold 
                     shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all
                     duration-300 animate-bounce-slow"
          >
            Start Playing
          </button>
          <div className="mt-12 text-white/80">
            <p>Created with ❤️ by Adarsh Priydarshi</p>
            <div className="flex justify-center gap-4 mt-4">
              <a
                href="https://github.com/adarsh-priydarshi-5646"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/adarsh-priydarshi-536430316/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'difficulty') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center animate-fade-in">
            Choose Your Difficulty
          </h2>
          <div className="grid gap-4 md:grid-cols-3 animate-fade-in-delay">
            {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG.easy][]).map(([level, config]) => (
              <button
                key={level}
                onClick={() => {
                  setDifficulty(level);
                  initializeGame();
                }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-white border-2 border-white/20
                         hover:bg-white/20 hover:border-white/40 transition-all duration-300
                         transform hover:scale-105"
              >
                <h3 className="text-xl font-bold mb-2">{config.label}</h3>
                <p className="text-white/80 text-sm">{config.description}</p>
                {bestTimes[level] !== null && (
                  <p className="mt-4 text-sm text-white/60">
                    Best Time: {formatTime(bestTimes[level]!)}
                  </p>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setGameState('landing')}
            className="mt-8 px-6 py-3 bg-white/10 text-white rounded-lg mx-auto block
                     hover:bg-white/20 transition-all duration-300"
          >
            Back to Main Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8">
          <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-4 md:gap-8">
              <div className="flex items-center gap-2">
                <Timer className="text-indigo-600" />
                <span className="text-xl md:text-2xl font-bold">{formatTime(time)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="text-yellow-500" />
                <span className="text-xl md:text-2xl font-bold">
                  {bestTimes[difficulty] !== null ? formatTime(bestTimes[difficulty]!) : '--:--'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl md:text-2xl font-bold text-gray-700">
                Moves: {moves}
              </span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
              >
                {soundEnabled ? (
                  <Volume2 className="text-indigo-600" />
                ) : (
                  <VolumeX className="text-gray-400" />
                )}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Settings"
              >
                <Settings className="text-indigo-600" />
              </button>
              <button
                onClick={initializeGame}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Restart game"
              >
                <RotateCcw className="text-indigo-600" />
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="mb-8 p-4 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Difficulty Level</h3>
              <div className="flex gap-4">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setDifficulty(level);
                      setShowSettings(false);
                      initializeGame();
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      difficulty === level
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'won' && (
            <div className="text-center mb-8 bg-green-100 p-8 rounded-xl">
              <h2 className="text-4xl font-bold text-green-700 mb-4">
                Congratulations! 🎉
              </h2>
              <p className="text-xl text-green-600 mb-6">
                You won in {moves} moves and {formatTime(time)}!
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={initializeGame}
                  className="bg-green-600 text-white px-8 py-4 rounded-xl text-xl 
                           font-bold hover:bg-green-700 transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={() => setGameState('difficulty')}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-xl 
                           font-bold hover:bg-indigo-700 transition-colors"
                >
                  Change Difficulty
                </button>
              </div>
            </div>
          )}

          <div 
            className={`grid gap-4 ${
              difficulty === 'easy'
                ? 'grid-cols-2 sm:grid-cols-4'
                : difficulty === 'medium'
                ? 'grid-cols-3 sm:grid-cols-5'
                : 'grid-cols-3 sm:grid-cols-6'
            }`}
          >
            {cards.map(card => {
              const Icon = IconComponent[card.icon];
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`aspect-square rounded-xl p-4 transition-all duration-300 transform ${
                    card.isFlipped || card.isMatched
                      ? 'bg-white border-2 border-indigo-600 rotate-0'
                      : 'bg-indigo-600 rotate-y-180'
                  } ${
                    !card.isMatched && gameState === 'playing'
                      ? 'hover:scale-105 active:scale-95'
                      : ''
                  }`}
                  disabled={card.isMatched || gameState !== 'playing'}
                >
                  {(card.isFlipped || card.isMatched) && (
                    <Icon
                      className={`w-full h-full ${
                        card.isMatched ? 'text-green-500' : 'text-indigo-600'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;