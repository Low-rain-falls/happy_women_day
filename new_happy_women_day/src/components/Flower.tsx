import { useMemo, useRef } from 'react';
import { ShapeGeometry, Color, Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { generatePetalShape } from '../utils/flowerUtils';

interface FlowerProps {
  position: [number, number, number];
  scale?: number;
  petalCount?: number;
  rotation?: number;
  color?: string;
}

export const Flower: React.FC<FlowerProps> = ({
  position,
  scale = 1,
  petalCount = 5,
  rotation = 0,
  color = '#ff69b4',
}) => {
  const groupRef = useRef<Group>(null);
  const overlayRef = useRef<Group>(null);

  const petalGeometry = useMemo(() => {
    const shape = generatePetalShape();
    const geometry = new ShapeGeometry(shape);
    geometry.scale(0.7, 1.3, 1); // Make petals more slender and elongated
    return geometry;
  }, []);

  const flowerColor = useMemo(() => new Color(color), [color]);
  const glowColor = useMemo(() => {
    const c = new Color(color);
    c.addScalar(0.2); // Make glow slightly brighter
    return c;
  }, [color]);

  // Animate overlay petals
  useFrame(({ clock }) => {
    if (overlayRef.current) {
      overlayRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.02;
      overlayRef.current.scale.setScalar(0.65 + Math.sin(clock.getElapsedTime()) * 0.05);
    }
  });

  const petals = useMemo(() => {
    const items = [];
    const angleStep = (Math.PI * 2) / petalCount;

    for (let i = 0; i < petalCount; i++) {
      const angle = i * angleStep + rotation;
      // Main petal
      items.push(
        <mesh key={`petal-${i}`} rotation={[0, 0, angle]} geometry={petalGeometry}>
          <meshPhongMaterial
            color={flowerColor}
            emissive={glowColor}
            emissiveIntensity={0.3}
            shininess={100}
            transparent
            opacity={0.9}
            depthWrite={true}
          />
        </mesh>
      );
    }
    return items;
  }, [petalCount, rotation, petalGeometry, flowerColor, glowColor]);

  const overlayPetals = useMemo(() => {
    const items = [];
    const angleStep = (Math.PI * 2) / petalCount;

    for (let i = 0; i < petalCount; i++) {
      const angle = i * angleStep + rotation + Math.PI / petalCount; // Offset overlay petals
      items.push(
        <mesh
          key={`petal-overlay-${i}`}
          rotation={[0, 0, angle]}
          position={[0, 0, 0.01]}
          scale={[0.65, 0.65, 1]}
          geometry={petalGeometry}
        >
          <meshPhongMaterial
            color={flowerColor}
            emissive={glowColor}
            emissiveIntensity={0.4}
            shininess={100}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      );
    }
    return items;
  }, [petalCount, rotation, petalGeometry, flowerColor, glowColor]);

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      <group>{petals}</group>
      <group ref={overlayRef}>{overlayPetals}</group>
      {/* Center of the flower */}
      <mesh>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshPhongMaterial
          color="#ffeb3b"
          emissive="#ff9800"
          emissiveIntensity={0.3}
          shininess={100}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Inner glow sphere */}
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshPhongMaterial color="#fff" emissive="#ffeb3b" emissiveIntensity={0.5} transparent opacity={0.3} />
      </mesh>
      {/* Outer glow sphere */}
      <mesh scale={[1.3, 1.3, 1.3]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshPhongMaterial color={flowerColor} emissive={glowColor} emissiveIntensity={0.2} transparent opacity={0.1} />
      </mesh>
    </group>
  );
};
