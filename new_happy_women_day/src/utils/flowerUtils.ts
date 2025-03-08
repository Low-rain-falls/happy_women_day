import * as THREE from 'three';

export interface FlowerPattern {
  position: [number, number, number];
  scale: number;
  petalCount: number;
  rotation: number;
  color: string;
  key: string;
}

interface Point {
  x: number;
  y: number;
  r: number;
  layer: number;
}

export const generatePetalShape = (): THREE.Shape => {
  const shape = new THREE.Shape();
  const petalWidth = 0.5;
  const petalLength = 1;
  const tipNarrowingFactor = 0.3; // How much the tip narrows
  const baseCurvature = 0.2; // How much the base curves inward

  // Start from the base of the petal
  shape.moveTo(0, 0);

  // Right side of the petal
  shape.bezierCurveTo(
    petalWidth * 0.5,
    petalLength * 0.2, // Control point 1
    petalWidth,
    petalLength * 0.5, // Control point 2
    petalWidth * tipNarrowingFactor,
    petalLength // End point
  );

  // Petal tip
  shape.bezierCurveTo(
    petalWidth * tipNarrowingFactor * 0.8,
    petalLength * 1.05, // Control point 1
    -petalWidth * tipNarrowingFactor * 0.8,
    petalLength * 1.05, // Control point 2
    -petalWidth * tipNarrowingFactor,
    petalLength // End point
  );

  // Left side of the petal
  shape.bezierCurveTo(
    -petalWidth,
    petalLength * 0.5, // Control point 1
    -petalWidth * 0.5,
    petalLength * 0.2, // Control point 2
    0,
    0 // End point
  );

  // Add a slight curve at the base
  shape.bezierCurveTo(
    -petalWidth * baseCurvature,
    petalLength * 0.1, // Control point 1
    petalWidth * baseCurvature,
    petalLength * 0.1, // Control point 2
    0,
    0 // End point
  );

  return shape;
};

const calculateOptimalRadius = (): number => {
  return Math.min(window.innerWidth, window.innerHeight) * 0.4;
};

const algorithmPoly = (gon: number, R: number): Point[] => {
  const points: Point[] = [];
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // Create pattern with multiple layers
  for (let layer = 1; layer <= 3; layer++) {
    const layerRadius = R * (layer * 0.33);
    const stepSize = 0.1 / layer;

    for (let a = 0; a < 2 * Math.PI; a += stepSize) {
      const variation = Math.sin(a * 5) * 0.1 * R;
      const r = layerRadius + variation;
      const x = centerX + r * Math.cos(a);
      const y = centerY + r * Math.sin(a);

      points.push({
        x,
        y,
        r: r / R, // Normalized radius for scaling
        layer,
      });
    }
  }

  return points;
};

const getRandomColor = (): string => {
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

export const createInitialFlowerPattern = (count: number): FlowerPattern[] => {
  const R = calculateOptimalRadius();
  const points = algorithmPoly(6, R);
  const flowers: FlowerPattern[] = [];

  // Select random points and create flowers
  for (let i = 0; i < count; i++) {
    const point = points[Math.floor(Math.random() * points.length)];
    const scale = 0.5 + Math.random() * 0.5 * (1 / point.layer); // Smaller flowers in outer layers
    const petalCount = 3 + Math.floor(Math.random() * 3); // 3-5 petals

    flowers.push({
      position: [(point.x - window.innerWidth / 2) / 100, -(point.y - window.innerHeight / 2) / 100, 0],
      scale,
      petalCount,
      rotation: Math.random() * Math.PI * 2,
      color: getRandomColor(),
      key: `flower-${i}-${Date.now()}`,
    });
  }

  return flowers;
};
