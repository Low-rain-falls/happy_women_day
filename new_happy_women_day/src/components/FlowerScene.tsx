import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, OrbitControls } from '@react-three/drei';
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import * as THREE from 'three';
import { Flower } from './Flower';
import { createInitialFlowerPattern } from '../utils/flowerUtils';

export const FlowerScene = () => {
  const { camera, gl, scene } = useThree();
  const [flowers, setFlowers] = useState<FlowerProps[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosition = useRef<{ x: number; y: number } | null>(null);
  const flowersDrawn = useRef(0);
  const composerRef = useRef<EffectComposer | null>(null);
  const frameRef = useRef(0);
  const MAX_FLOWERS = 500; // Increased max flowers for denser patterns

  // Set up postprocessing
  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new EffectPass(
        camera,
        new BloomEffect({
          luminanceThreshold: 0.2,
          luminanceSmoothing: 0.9,
          intensity: 2.0,
        })
      )
    );
    composerRef.current = composer;

    return () => {
      composer.dispose();
    };
  }, [camera, gl, scene]);

  // Custom render loop with enhanced animation
  useFrame(({ clock }) => {
    frameRef.current = clock.getElapsedTime();

    if (composerRef.current) {
      composerRef.current.render();
    }

    setFlowers((prev) =>
      prev.map((flower, index) => ({
        ...flower,
        bloomScale: Math.min(1, (flower.bloomScale || 0) + 0.015),
        scale:
          flower.scale *
          (0.95 +
            Math.sin(frameRef.current * 0.5 + flower.position[0] * 2 + index * 0.1) * 0.03 + // X oscillation
            Math.cos(frameRef.current * 0.5 + flower.position[1] * 2 + index * 0.1) * 0.03), // Y oscillation
      }))
    );
  });

  // Set camera position
  useEffect(() => {
    camera.position.z = 15;
  }, [camera]);

  // Create initial flower pattern
  useEffect(() => {
    const initialFlowers = createInitialFlowerPattern(200).map((flower) => ({
      ...flower,
      scale: flower.scale * 0.25, // Even smaller initial flowers
      bloomScale: 0,
    }));
    setFlowers(initialFlowers);
    flowersDrawn.current = initialFlowers.length;
  }, []);

  // Handle resizing
  useEffect(() => {
    const handleResize = () => {
      if (!isDrawing) {
        const initialFlowers = createInitialFlowerPattern(200).map((flower) => ({
          ...flower,
          scale: flower.scale * 0.25,
          bloomScale: 1,
        }));
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
      setFlowers((prev) => {
        const newFlowers = [...prev];
        newFlowers.shift();
        return newFlowers;
      });
      flowersDrawn.current--;
    }

    const petalCount = 3 + Math.floor(Math.random() * 3); // 3-5 petals
    const flowerScale = (scale || 0.5 + Math.random() * 2) * 0.25; // Even smaller scale
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
        bloomScale: 0,
        key: `flower-${Date.now()}-${Math.random()}`,
      },
    ]);

    flowersDrawn.current++;
  };

  // Random color selection from palette with more vibrant colors
  const getRandomColor = () => {
    const colors = [
      '#ff3366',
      '#ff66b2',
      '#ff99cc',
      '#ff80bf',
      '#ff1a75',
      '#ff0066',
      '#ff99ff',
      '#ff66ff',
      '#ff33ff',
      '#ff00ff',
      '#cc00cc',
      '#ff3399',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Mouse event handlers
  const handleDoubleClick = () => {
    const initialFlowers = createInitialFlowerPattern(200).map((flower) => ({
      ...flower,
      scale: flower.scale * 0.25,
      bloomScale: 0,
    }));
    setFlowers(initialFlowers);
    flowersDrawn.current = initialFlowers.length;
  };

  type PointerEvent = React.PointerEvent<THREE.Mesh>;

  const handlePointerDown = (e: PointerEvent) => {
    if (e.button === 0) {
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

  const handlePointerMove = (e: PointerEvent) => {
    if (isDrawing && lastPosition.current) {
      const { x: prevX, y: prevY } = lastPosition.current;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 6) {
        // More frequent flower placement
        const worldPos = screenToWorld(e.clientX, e.clientY);
        const scale = Math.min(distance / 30, 2); // Adjusted scale ratio
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
      <pointLight position={[-10, -10, -10]} color="#ff69b4" intensity={0.5} />

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
          scale={flower.scale * (flower.bloomScale || 1)}
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
  bloomScale?: number;
}
