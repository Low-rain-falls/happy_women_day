const SVG_NS = 'http://www.w3.org/2000/svg';
const SVG_XLINK = 'http://www.w3.org/1999/xlink';
let rid = null;
let gon = 7;
let flowersDrawn = 0;
const MAX_FLOWERS = 300; // Maximum number of flowers for performance optimization

// Enhanced color palette with more variety
const colors = [
  '#ba3763', // Dark pink
  '#d34076', // Medium pink
  '#dbb0cc', // Light pink
  '#fddafa', // Very light pink
  '#fef2fe', // White pink
  '#eec0db', // Pastel pink
  '#ca809a', // Dusty pink
  '#e9d8e8', // Light lavender
  '#ff94c2', // Bright pink
  '#ff6699', // Hot pink
  '#ffe6f2', // Baby pink
  '#c95d8b', // Rose pink
];

// Store user preferences in localStorage
const USER_PREFS = {
  musicPlaying: true,
  getPrefs: function () {
    const savedPrefs = localStorage.getItem('flowerAppPrefs');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      this.musicPlaying = prefs.musicPlaying;
    }
  },
  savePrefs: function () {
    localStorage.setItem(
      'flowerAppPrefs',
      JSON.stringify({
        musicPlaying: this.musicPlaying,
      })
    );
  },
};

let m = { x: 0, y: 0 };
let previous = { x: 0, y: 0 };
let scale = 2;
let bool = true;

class Flower {
  constructor(n, pos, scale, parent) {
    this.n = n;
    this.scale = scale;
    this.pos = pos;
    this.width = 40;
    this.height = 40;
    this.color = colors[~~(Math.random() * colors.length)];
    this.parent = parent;
    this.rotation = ~~(Math.random() * 360); // Enhanced rotation for more natural appearance
    this.opacity = 0.7 + Math.random() * 0.3; // Add slight transparency variation

    this.markup();
    flowersDrawn++;
  }

  markup() {
    this.G = document.createElementNS(SVG_NS, 'g');
    this.G.setAttribute('style', `--scale:${this.scale};`);

    // Enhanced styling with opacity
    this.G.setAttributeNS(null, 'transform', `translate(${this.pos.x},${this.pos.y}) rotate(${this.rotation})`);
    this.G.setAttributeNS(null, 'fill', this.color);
    this.G.setAttributeNS(null, 'opacity', this.opacity);
    let ga = document.createElementNS(SVG_NS, 'g');
    ga.setAttribute('class', 'a');

    for (let i = 0; i < 2; i++) {
      // left, right
      let g = document.createElementNS(SVG_NS, 'g');
      for (let j = 0; j < this.n; j++) {
        let use = document.createElementNS(SVG_NS, 'use');
        use.setAttributeNS(SVG_XLINK, 'xlink:href', `#petal${this.n}`);
        use.setAttributeNS(null, 'width', this.width);
        use.setAttributeNS(null, 'height', this.height);

        g.appendChild(use);
      }
      ga.appendChild(g);
    }
    this.G.appendChild(ga);

    this.parent.appendChild(this.G);
  }
}

// Function to add a single flower based on mouse position
function addFlower(pos, customScale = null) {
  // Check if we've reached maximum flower count for performance
  if (flowersDrawn > MAX_FLOWERS) {
    // Remove oldest flower if we hit our limit
    const oldestFlower = svg.firstChild;
    if (oldestFlower) {
      svg.removeChild(oldestFlower);
      flowersDrawn--;
    }
  }

  // number of petals (2-5)
  let n = 2 + ~~(Math.random() * 4);
  // set the scale
  let flowerScale = customScale !== null ? customScale : 0.5 + Math.random() * 2;

  let flower = new Flower(n, { x: pos.x, y: pos.y }, flowerScale, svg);
  setTimeout(() => {
    flower.G.setAttribute('class', `_${flower.n}`);
  }, 50);
}

svg.addEventListener('mousedown', (e) => {
  // Start drawing without clearing existing flowers
  bool = true;
  const mousePos = oMousePosSVG(e);
  addFlower(mousePos, 1.5); // Add a flower on initial click

  previous.x = mousePos.x;
  previous.y = mousePos.y;
});

svg.addEventListener('mouseup', (e) => {
  previous = {};
});

svg.addEventListener('mousemove', (e) => {
  if (bool) {
    m = oMousePosSVG(e);

    // Throttle flower creation based on distance to improve performance
    if (previous.x) {
      let d = dist(m, previous);
      // Only create a new flower if we've moved enough distance
      if (d > 10) {
        scale = Math.min(d / 20, 3); // Cap the scale for consistent appearance
        addFlower(m, scale);
        previous.x = m.x;
        previous.y = m.y;
      }
    } else {
      previous.x = m.x;
      previous.y = m.y;
    }
  }
});

// Double-click to clear canvas
svg.addEventListener('dblclick', (e) => {
  // Only clear user-drawn flowers, keep the initial pattern
  while (svg.lastChild) {
    svg.removeChild(svg.lastChild);
  }
  flowersDrawn = 0;
  // Regenerate the initial pattern
  createInitialFlowerPattern();
});

function oMousePosSVG(e) {
  var p = svg.createSVGPoint();
  p.x = e.clientX;
  p.y = e.clientY;
  var ctm = svg.getScreenCTM().inverse();
  var p = p.matrixTransform(ctm);
  return p;
}

function dist(p1, p2) {
  let dx = p2.x - p1.x;
  let dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function algorithmPoly(gon, R) {
  let points = [];
  // Create more interesting patterns with multiple shape layers
  for (let layer = 1; layer <= 3; layer++) {
    const layerRadius = R * (layer * 0.33);
    const stepSize = 0.1 / layer; // More points in outer layers

    for (let a = 0; a < 2 * Math.PI; a += stepSize) {
      // Add some variation to make it less mechanical
      let variation = Math.sin(a * 5) * 0.1 * R;

      let r =
        ((layerRadius + variation) * Math.cos(Math.PI / gon)) / Math.cos((a % ((2 * Math.PI) / gon)) - Math.PI / gon);

      // Center in the viewport instead of at 5000,5000
      let centerX = window.innerWidth / 2;
      let centerY = window.innerHeight / 2;

      let x = centerX + r * Math.cos(a);
      let y = centerY + r * Math.sin(a);

      // Only add points within the visible area
      if (x >= 0 && x <= window.innerWidth && y >= 0 && y <= window.innerHeight) {
        points.push({
          x: x,
          y: y,
          r: 5,
          layer: layer, // Store layer info for varied flower size
        });
      }
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

// Properly size the polygon based on viewport
function calculateOptimalRadius() {
  return Math.min(window.innerWidth, window.innerHeight) * 0.4;
}

// Create the initial flower pattern with improved aesthetics
function createInitialFlowerPattern() {
  let points = algorithmPoly(gon, calculateOptimalRadius());

  // Shuffle points to create a more random-looking pattern
  points = shuffleArray(points);

  // Limit points for performance
  const maxInitialFlowers = 100;
  points = points.slice(0, maxInitialFlowers);

  let frames = 0;
  function Frame() {
    rid = window.requestAnimationFrame(Frame);

    if (frames >= points.length) {
      window.cancelAnimationFrame(rid);
      rid = null;
      return;
    }

    // Process a batch of points for better performance
    const batchSize = 3;
    for (let i = 0; i < batchSize && frames + i < points.length; i++) {
      const point = points[frames + i];
      const n = 2 + ~~(Math.random() * 4); // 2-5 petals

      // Vary scale based on layer for more visual interest
      const baseScale = 2 + ~~(Math.random() * 8);
      const layerScale = point.layer ? (4 - point.layer) * 0.5 : 1;
      scale = baseScale * layerScale;

      let flower = new Flower(n, { x: point.x, y: point.y }, scale, svg);
      setTimeout(() => {
        flower.G.setAttribute('class', `_${flower.n}`);
      }, 50);
    }

    frames += batchSize;
  }

  // Start the animation
  frames = 0;
  rid = requestAnimationFrame(Frame);
}

// Fisher-Yates shuffle algorithm for randomizing points
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Handle window resize for responsive design
window.addEventListener(
  'resize',
  debounce(() => {
    // Only recreate pattern if not in drawing mode
    if (!bool) {
      // Clear all flowers
      while (svg.lastChild) {
        svg.removeChild(svg.lastChild);
      }
      flowersDrawn = 0;
      createInitialFlowerPattern();
    }
  }, 250)
);

// Utility function to limit the rate at which a function can fire
function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    const context = this,
      args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

const audio = document.getElementById('bg-music');
const musicButton = document.getElementById('toggle-music');

// Initialize audio settings from localStorage
document.addEventListener('DOMContentLoaded', () => {
  // Load saved preferences
  USER_PREFS.getPrefs();

  // Initialize audio state based on saved preference
  updateMusicState(USER_PREFS.musicPlaying);
});

function updateMusicState(shouldPlay) {
  USER_PREFS.musicPlaying = shouldPlay;

  if (shouldPlay) {
    audio.play().catch((e) => {
      console.error('Autoplay failed:', e);
      USER_PREFS.musicPlaying = false;
    });
    musicButton.textContent = 'Pause Music';
  } else {
    audio.pause();
    musicButton.textContent = 'Play Music';
  }

  // Save the updated preference
  USER_PREFS.savePrefs();
}

audio.oncanplaythrough = () => {
  musicButton.disabled = false;

  // Apply saved preference once audio is ready
  if (USER_PREFS.musicPlaying) {
    updateMusicState(true);
  }
};

musicButton.addEventListener('click', () => {
  updateMusicState(audio.paused);
});
