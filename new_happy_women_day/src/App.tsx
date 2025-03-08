import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect } from 'react';
import { FlowerScene } from './components/FlowerScene';
import { MessageOverlay } from './components/MessageOverlay';
import { MusicControl } from './components/MusicControl';
import './index.css';

const App = () => {
  const [musicPlaying, setMusicPlaying] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedPrefs = localStorage.getItem('flowerAppPrefs');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      setMusicPlaying(prefs.musicPlaying);
    }
  }, []);

  useEffect(() => {
    // Save preferences when changed
    localStorage.setItem(
      'flowerAppPrefs',
      JSON.stringify({
        musicPlaying,
      })
    );
  }, [musicPlaying]);

  return (
    <div className="relative bg-gradient-to-br from-pink-50 to-purple-100 w-full h-screen overflow-hidden">
      {/* Three.js Canvas */}
      <Canvas className="top-0 right-0 bottom-0 left-0 absolute" dpr={[1, 2]}>
        <Suspense fallback={null}>
          <FlowerScene />
        </Suspense>
      </Canvas>

      {/* Text Overlay */}
      <MessageOverlay />

      {/* Music Control */}
      <MusicControl playing={musicPlaying} togglePlaying={() => setMusicPlaying(!musicPlaying)} />
    </div>
  );
};

export default App;
