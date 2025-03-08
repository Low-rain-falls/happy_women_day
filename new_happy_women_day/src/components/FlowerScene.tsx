import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, OrbitControls, EffectComposer, Bloom } from '@react-three/drei';
import * as THREE from 'three';
import { Flower } from './Flower';
import { createInitialFlowerPattern } from '../utils/flowerUtils';

export const FlowerScene = () => {
  const { viewport, camera } = useThree();
  const [flowers, setFlowers] = useState<FlowerProps[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosition = useRef<{ x: number; y: number } | null>(null);
  const flowersDrawn = useRef(0);
  const MAX_FLOWERS = 300;

  // Set camera position
  useEffect(() => {
    camera.position.z = 15;
  }, [camera]);

  // Create initial flower pattern
  useEffect(() => {
    const initialFlowers = createInitialFlowerPattern(100);
    setFlowers(initialFlowers);
    flowersDrawn.current = initialFlowers.length;
  }, []);

  // Handle resizing
  useEffect(() => {
    const handleResize = () => {
      if (!isDrawing) {
        const initialFlowers = createInitialFlowerPattern(100);
        setFlowers(initialFlowers);
        flowersDrawn.current = initialFlowers.length;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDrawing]);

  // Convert screen coordinates to world coordinates
  const screenToWorld = (screenX: number, screenY: number) => {
    const vector = new THREE.Vector3();
    vector.set((screenX / window.innerWidth) * 2 - 1, -(screenY / window.innerHeight) * 2 + 1, 0.5);
    vector.unproject(camera);
    const direction = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / direction.z;
    return camera.position.clone().add(direction.multiplyScalar(distance));
  };

  // Add a new flower at specified position
  const addFlower = (worldPos: THREE.Vector3, scale = 1) => {
    if (flowersDrawn.current >= MAX_FLOWERS) {
      // Remove oldest flower if we hit the limit
      setFlowers((prev) => {
        const newFlowers = [...prev];
        newFlowers.shift();
        return newFlowers;
      });
      flowersDrawn.current--;
    }

    const petalCount = 2 + Math.floor(Math.random() * 4); // 2-5 petals
    const flowerScale = scale || 0.5 + Math.random() * 2;
    const rotation = Math.random() * Math.PI * 2;
    const color = getRandomColor();

    setFlowers((prev) => [
      ...prev,
      {
        position: [worldPos.x, worldPos.y, worldPos.z],
        petalCount,
        scale: flowerScale,
        rotation,
        color,
        key: `flower-${Date.now()}-${Math.random()}`,
      },
    ]);

    flowersDrawn.current++;
  };

  // Random color selection from palette
  const getRandomColor = () => {
    const colors = [
      '#ba3763',
      '#d34076',
      '#dbb0cc',
      '#fddafa',
      '#fef2fe',
      '#eec0db',
      '#ca809a',
      '#e9d8e8',
      '#ff94c2',
      '#ff6699',
      '#ffe6f2',
      '#c95d8b',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Double click handler to clear canvas
  const handleDoubleClick = () => {
    const initialFlowers = createInitialFlowerPattern(100);
    setFlowers(initialFlowers);
    flowersDrawn.current = initialFlowers.length;
  };

  // Mouse event handlers for drawing flowers
  const handlePointerDown = (e: any) => {
    if (e.button === 0) {
      // Left click only
      setIsDrawing(true);
      const worldPos = screenToWorld(e.clientX, e.clientY);
      addFlower(worldPos, 1.5);
      lastPosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    lastPosition.current = null;
  };

  const handlePointerMove = (e: any) => {
    if (isDrawing && lastPosition.current) {
      const { x: prevX, y: prevY } = lastPosition.current;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 10) {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        const scale = Math.min(distance / 20, 3);
        addFlower(worldPos, scale);
        lastPosition.current = { x: e.clientX, y: e.clientY };
      }
    }
  };

  return (
    <>
      <AdaptiveDpr pixelated />
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 10]} intensity={1} />

      {/* Event handling plane */}
      <mesh
        position={[0, 0, -0.1]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onDoubleClick={handleDoubleClick}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Render all flowers */}
      {flowers.map((flower) => (
        <Flower
          key={flower.key}
          position={flower.position}
          petalCount={flower.petalCount}
          scale={flower.scale}
          rotation={flower.rotation}
          color={flower.color}
        />
      ))}
    </>
  );
};

interface FlowerProps {
  position: [number, number, number];
  petalCount: number;
  scale: number;
  rotation: number;
  color: string;
  key: string;
}
