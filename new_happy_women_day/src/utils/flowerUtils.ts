import * as THREE from 'three';

// Generate petal shape based on petal count
export const generatePetalShape = (petalCount: number) => {
  const shape = new THREE.Shape();

  // Adjust petal shape based on petal count
  const width = 0.5;
  let height = 1.8;

  // Make petals less elongated for more petals
  if (petalCount > 3) {
    height = 1.5;
  }

  // Create petal shape - simplified from SVG path
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width, height / 3, width, (height * 2) / 3, 0, height);
  shape.bezierCurveTo(-width, (height * 2) / 3, -width, height / 3, 0, 0);

  return shape;
};

// Calculate optimal radius based on viewport
const calculateOptimalRadius = () => {
  return Math.min(window.innerWidth, window.innerHeight) * 0.02;
};

// Generate initial flower pattern
export const createInitialFlowerPattern = (maxFlowers: number) => {
  const flowers: any[] = [];
  const radius = calculateOptimalRadius();
  const points = algorithmPoly(7, radius);

  // Limit points for performance
  const limitedPoints = shuffleArray(points).slice(0, maxFlowers);

  limitedPoints.forEach((point) => {
    const n = 2 + Math.floor(Math.random() * 4); // 2-5 petals
    const baseScale = 0.2 + Math.random() * 0.8;
    const layerScale = point.layer ? (4 - point.layer) * 0.05 : 0.1;
    const scale = baseScale * layerScale;

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

    const color = colors[Math.floor(Math.random() * colors.length)];
    const rotation = Math.random() * Math.PI * 2;

    flowers.push({
      position: [point.x, point.y, 0],
      petalCount: n,
      scale: scale,
      rotation: rotation,
      color: color,
      key: `flower-init-${flowers.length}`,
    });
  });

  return flowers;
};

// Generate points in a polygon pattern with multiple layers
function algorithmPoly(gon: number, R: number) {
  const points: any[] = [];
  const centerX = 0;
  const centerY = 0;

  // Create more interesting patterns with multiple shape layers
  for (let layer = 1; layer <= 3; layer++) {
    const layerRadius = R * (layer * 0.33);
    const stepSize = 0.1 / layer; // More points in outer layers

    for (let a = 0; a < 2 * Math.PI; a += stepSize) {
      // Add some variation to make it less mechanical
      const variation = Math.sin(a * 5) * 0.1 * R;

      const r =
        ((layerRadius + variation) * Math.cos(Math.PI / gon)) / Math.cos((a % ((2 * Math.PI) / gon)) - Math.PI / gon);

      const x = centerX + r * Math.cos(a);
      const y = centerY + r * Math.sin(a);

      points.push({
        x: x,
        y: y,
        r: 5,
        layer: layer, // Store layer info for varied flower size
      });
    }
  }

  // Add some random flowers inside the pattern
  for (let i = 0; i < 20; i++) {
    points.push({
      x: centerX + (Math.random() - 0.5) * R * 0.8,
      y: centerY + (Math.random() - 0.5) * R * 0.8,
      r: 5,
      layer: Math.random() * 3,
    });
  }

  return points;
}

// Fisher-Yates shuffle algorithm for randomizing points
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
