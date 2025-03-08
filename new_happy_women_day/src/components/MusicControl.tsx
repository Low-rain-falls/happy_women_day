import React, { useRef, useEffect } from 'react';

interface MusicControlProps {
  playing: boolean;
  togglePlaying: () => void;
}

export const MusicControl: React.FC<MusicControlProps> = ({ playing, togglePlaying }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/assets/sounds/music.mp3');
      audioRef.current.loop = true;
    }

    if (playing) {
      audioRef.current.play().catch((e) => console.error('Audio playback failed:', e));
    } else {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [playing]);

  return (
    <button
      onClick={togglePlaying}
      className={`fixed bottom-5 left-5 z-20 flex items-center justify-center px-5 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${
        playing ? 'bg-purple-700 text-white' : 'bg-pink-500 text-white hover:bg-pink-600'
      }`}
      aria-label={playing ? 'Pause Music' : 'Play Music'}
    >
      <span className="mr-2 text-lg">♪</span>
      {playing ? 'Pause Music' : 'Play Music'}
    </button>
  );
};
