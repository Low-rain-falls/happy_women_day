import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generatePetalShape } from '../utils/flowerUtils';

interface FlowerProps {
  position: [number, number, number];
  petalCount: number;
  scale: number;
  rotation: number;
  color: string;
  opacity?: number;
}

export const Flower: React.FC<FlowerProps> = ({
  position,
  petalCount,
  scale = 1,
  rotation = 0,
  color = '#ba3763',
  opacity = 0.85,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Create animation effect when flower appears
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.scale.set(0.01, 0.01, 0.01);
      setTimeout(() => {
        if (groupRef.current) {
          groupRef.current.scale.set(scale, scale, scale);
        }
      }, 50);
    }
  }, [scale]);

  // Subtle animation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.0005;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, 0, rotation]} scale={[scale, scale, scale]}>
      {/* Create petals based on petalCount */}
      {Array.from({ length: petalCount }).map((_, i) => {
        const angle = i * (Math.PI / (petalCount / 2)) + Math.PI / petalCount;
        return <Petal key={i} rotation={angle} color={color} opacity={opacity} petalCount={petalCount} />;
      })}
    </group>
  );
};

interface PetalProps {
  rotation: number;
  color: string;
  opacity: number;
  petalCount: number;
}

const Petal: React.FC<PetalProps> = ({ rotation, color, opacity, petalCount }) => {
  const petalShape = generatePetalShape(petalCount);

  return (
    <mesh rotation={[0, 0, rotation]}>
      <shapeGeometry args={[petalShape]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        roughness={0.5}
        metalness={0.2}
      />
    </mesh>
  );
};
