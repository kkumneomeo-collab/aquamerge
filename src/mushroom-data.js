/**
 * Cozy Plushie Toybox Definitions & Plushdex Lore
 * 10 tiers of adorable living plushies + timed spark bomb item
 */
export const MUSHROOM_TIERS = [
  {
    tier: 1,
    id: 'berry',
    name: 'Sweet Berry Plushie',
    species: 'Fragaria Amabilis',
    description: 'A darling little felt strawberry with velvet leafy sprouts and stitched blushing cheeks. Always sweet and cuddly.',
    radius: 20,
    points: 2,
    color: '#F43F5E',
    accentColor: '#FDA4AF',
    imageSrc: 'assets/plushies/tier1_strawberry.png',
    blinkSrc: 'assets/plushies/tier1_strawberry_blink.png',
    features: {
      drawScale: 2.22,
      aspectX: 1.00,
      aspectY: 1.00,
      offsetX: 0,
      offsetY: 0,
      glow: null,
      radialProfile: [0.873, 0.878, 0.89, 0.913, 0.949, 0.994, 1.046, 1.087, 1.104, 1.106, 1.101, 1.081, 1.038, 0.988, 0.945, 0.911, 0.889, 0.878, 0.872, 0.871, 0.873, 0.892, 0.93, 0.943, 0.925, 0.898, 0.934, 0.986, 0.931, 0.893, 0.923, 0.938, 0.919, 0.884, 0.871, 0.872]
    }
  },
  {
    tier: 2,
    id: 'chick',
    name: 'Sunny Chick Plushie',
    species: 'Pip Calidus',
    description: 'A fluffy, sunny chick plushie with warm golden fuzz, tiny fluttering wings, and a happy little beak.',
    radius: 29,
    points: 4,
    color: '#FBBF24',
    accentColor: '#FEF08A',
    imageSrc: 'assets/plushies/tier2_chick.png',
    blinkSrc: 'assets/plushies/tier2_chick_blink.png',
    features: {
      drawScale: 2.22,
      aspectX: 1.00,
      aspectY: 1.00,
      offsetX: 0,
      offsetY: 0,
      glow: null,
      radialProfile: [0.849, 0.944, 0.939, 0.887, 0.881, 0.901, 0.946, 1.016, 0.996, 0.947, 0.993, 1.012, 0.945, 0.901, 0.88, 0.887, 0.943, 0.948, 0.853, 0.752, 0.724, 0.74, 0.756, 0.773, 0.789, 0.832, 0.92, 0.964, 0.903, 0.825, 0.794, 0.778, 0.758, 0.74, 0.72, 0.744]
    }
  },
  {
    tier: 3,
    id: 'bat',
    name: 'Fluffy Bat Plushie',
    species: 'Noctis Flufficus',
    description: 'A soft midnight lavender bat plushie with velvety wings and perky little stitched ears. Loves nocturnal cuddles.',
    radius: 39,
    points: 8,
    color: '#A855F7',
    accentColor: '#E9D5FF',
    imageSrc: 'assets/plushies/tier3_bat.png',
    blinkSrc: 'assets/plushies/tier3_bat_blink.png',
    features: {
      drawScale: 2.22,
      aspectX: 1.00,
      aspectY: 1.00,
      offsetX: 0,
      offsetY: 0,
      glow: null,
      radialProfile: [0.804, 0.973, 0.98, 0.854, 0.759, 0.777, 0.85, 0.891, 0.87, 0.847, 0.869, 0.891, 0.852, 0.779, 0.76, 0.854, 0.981, 0.975, 0.805, 0.674, 0.733, 0.869, 0.985, 1.023, 0.876, 0.663, 0.58, 0.58, 0.58, 0.66, 0.869, 1.018, 0.981, 0.866, 0.732, 0.674]
    }
  },
  {
    tier: 4,
    id: 'alien',
    name: 'Cosmic Pip Plushie',
    species: 'Stella Trioculus',
    description: 'A three-eyed cosmic plushie from a starry galaxy! Inquisitive, pastel blue, and out-of-this-world adorable.',
    radius: 50,
    points: 16,
    color: '#38BDF8',
    accentColor: '#BAE6FD',
    imageSrc: 'assets/plushies/tier4_alien.png',
    blinkSrc: 'assets/plushies/tier4_alien_blink.png',
    features: {
      drawScale: 2.22,
      aspectX: 1.00,
      aspectY: 1.00,
      offsetX: 0,
      offsetY: 0,
      glow: null,
      radialProfile: [0.727, 0.845, 0.966, 0.983, 0.952, 0.995, 1.07, 1.062, 0.999, 0.969, 0.999, 1.063, 1.072, 0.998, 0.954, 0.986, 0.97, 0.85, 0.731, 0.689, 0.688, 0.696, 0.709, 0.815, 1.001, 1.0, 0.826, 0.742, 0.827, 1.0, 0.997, 0.81, 0.705, 0.69, 0.681, 0.684]
    }
  },
  {
    tier: 5,
    id: 'penguin',
    name: 'Scarfie Penguin Plushie',
    species: 'Spheniscus Comfy',
    description: 'A snuggly little penguin plushie wearing its favorite knitted winter scarf. Ready for cozy snowy adventures.',
    radius: 62,
    points: 32,
    color: '#6366F1',
    accentColor: '#C7D2FE',
    imageSrc: 'assets/plushies/tier5_penguin.png',
    blinkSrc: 'assets/plushies/tier5_penguin_blink.png',
    features: {
      drawScale: 2.22,
      aspectX: 1.00,
      aspectY: 1.00,
      offsetX: 0,
      offsetY: 0,
      glow: null,
      radialProfile: [0.781, 0.9, 0.957, 0.917, 0.924, 1.002, 1.067, 1.047, 0.98, 0.952, 0.979, 1.05, 1.072, 1.01, 0.935, 0.93, 0.967, 0.908, 0.791, 0.738, 0.742, 0.779, 0.84, 0.903, 0.952, 0.984, 1.002, 1.006, 0.999, 0.979, 0.943, 0.889, 0.824, 0.764, 0.731, 0.729]
    }
  },
  {
    tier: 6,
    id: 'bunny',
    name: 'Moonlight Bunny Plushie',
    species: 'Oryctolagus Lunaris',
    description: 'A dreamy lilac bunny plushie with giant floppy ears and the softest cotton belly in the toybox.',
    radius: 76,
    points: 64,
    color: '#EC4899',
    accentColor: '#FBCFE8',
    imageSrc: 'assets/plushies/tier6_bunny.png',
    blinkSrc: 'assets/plushies/tier6_bunny_blink.png',
    features: {
      drawScale: 2.22,
      aspectX: 1.00,
      aspectY: 1.00,
      offsetX: 0,
      offsetY: 0,
      glow: null,
      radialProfile: [0.984, 1.043, 1.065, 0.984, 0.9, 0.967, 1.035, 0.982, 0.909, 0.883, 0.906, 0.976, 1.036, 0.973, 0.902, 0.985, 1.069, 1.048, 0.991, 0.932, 0.896, 0.892, 0.919, 0.966, 1.004, 0.997, 0.963, 0.946, 0.961, 0.996, 1.002, 0.961, 0.913, 0.887, 0.892, 0.927]
    }
  },
  {
    tier: 7,
    id: 'butterfly',
    name: 'Dreamy Flutter Plushie',
    species: 'Papilio Somnium',
    description: 'A gentle butterfly plushie with pastel patchwork wings and velvet antennae, fluttering with pure joy.',
    radius: 91,
    points: 128,
    color: '#FB7185',
    accentColor: '#FECDD3',
    imageSrc: 'assets/plushies/tier7_butterfly.png',
    blinkSrc: 'assets/plushies/tier7_butterfly_blink.png',
    features: {
      drawScale: 2.22,
      aspectX: 1.00,
      aspectY: 1.00,
      offsetX: 0,
      offsetY: 0,
      glow: '#FB7185',
      radialProfile: [1.022, 0.938, 0.888, 0.968, 1.052, 1.035, 0.914, 0.793, 0.803, 0.843, 0.803, 0.795, 0.917, 1.039, 1.053, 0.968, 0.888, 0.938, 1.02, 1.071, 1.147, 1.217, 1.169, 1.002, 0.899, 0.837, 0.696, 0.609, 0.696, 0.841, 0.906, 1.006, 1.169, 1.216, 1.146, 1.072]
    }
  },
  {
    tier: 8,
    id: 'lion',
    name: 'Golden Lion Plushie',
    species: 'Leo Aureus',
    description: 'A majestic golden lion plushie crowned with a petal-soft mane, embroidered paw pads, and a heart of sunshine.',
    radius: 107,
    points: 256,
    color: '#F59E0B',
    accentColor: '#FDE68A',
    imageSrc: 'assets/plushies/tier8_lion.png',
    blinkSrc: 'assets/plushies/tier8_lion_blink.png',
    features: {
      drawScale: 2.22,
      aspectX: 1.00,
      aspectY: 1.00,
      offsetX: 0,
      offsetY: 0,
      glow: '#F59E0B',
      radialProfile: [0.816, 0.775, 0.745, 0.783, 0.865, 0.952, 1.084, 1.129, 1.065, 1.032, 1.065, 1.133, 1.095, 0.964, 0.884, 0.808, 0.762, 0.788, 0.832, 0.889, 0.926, 0.954, 0.993, 1.019, 1.042, 1.048, 1.054, 1.068, 1.055, 1.048, 1.039, 1.014, 0.988, 0.948, 0.916, 0.875]
    }
  },
  {
    tier: 9,
    id: 'dragon',
    name: 'Baby Sky Drake Plushie',
    species: 'Draco Caelestis',
    description: 'A mythical baby sky drake plushie with tiny horns, lavender dragon wings, and gentle sparkling eyes.',
    radius: 124,
    points: 512,
    color: '#0EA5E9',
    accentColor: '#7DD3FC',
    imageSrc: 'assets/plushies/tier9_dragon.png',
    blinkSrc: 'assets/plushies/tier9_dragon_blink.png',
    features: {
      drawScale: 2.22,
      aspectX: 1.00,
      aspectY: 1.00,
      offsetX: 0,
      offsetY: 0,
      glow: '#0EA5E9',
      radialProfile: [0.794, 0.842, 0.749, 0.634, 0.737, 1.011, 1.14, 1.076, 0.986, 0.952, 0.992, 1.087, 1.14, 1.095, 1.022, 0.93, 0.852, 0.846, 0.799, 0.684, 0.688, 0.877, 1.02, 1.015, 1.0, 0.973, 0.964, 0.986, 0.965, 0.971, 0.997, 1.015, 1.014, 0.868, 0.687, 0.684]
    }
  },
  {
    tier: 10,
    id: 'axolotl',
    name: 'Celestial Axolotl Plushie',
    species: 'Ambystoma Divina',
    description: 'The legendary celestial axolotl plushie! Shimmering pastel frills and a magical spiral tail of pure wonder.',
    radius: 142,
    points: 1024,
    color: '#F472B6',
    accentColor: '#FBCFE8',
    imageSrc: 'assets/plushies/tier10_axolotl.png',
    blinkSrc: 'assets/plushies/tier10_axolotl_blink.png',
    features: {
      drawScale: 2.22,
      aspectX: 1.00,
      aspectY: 1.00,
      offsetX: 0,
      offsetY: 0,
      glow: '#F472B6',
      radialProfile: [0.846, 0.803, 0.975, 1.119, 1.112, 1.065, 0.987, 0.931, 0.895, 0.872, 0.895, 0.864, 0.725, 0.618, 0.595, 0.587, 0.58, 0.676, 0.85, 0.963, 1.035, 1.088, 1.117, 1.036, 0.87, 0.804, 0.812, 0.814, 0.812, 0.802, 0.866, 1.024, 1.099, 1.073, 1.023, 0.955]
    }
  }
];

export const BOMB_ITEM = {
  tier: 99,
  id: 'plush_bomb',
  isBomb: true,
  name: 'Plushie Star Bomb',
  species: 'Bombus Sparkle',
  description: 'A cheerful pink felt toy bomb with a starry spark fuse! Detonates 3 seconds after dropping and blasts surrounding plushies.',
  radius: 36,
  points: 50,
  color: '#F43F5E',
  accentColor: '#FBBF24',
  imageSrc: 'assets/plushies/bomb_clean.png',
  blinkSrc: null,
  features: {
    drawScale: 2.22,
    aspectX: 1.00,
    aspectY: 1.00,
    offsetX: 0,
    offsetY: 0,
    glow: '#F43F5E',
    radialProfile: [0.676, 0.726, 0.785, 0.849, 0.909, 0.964, 1.013, 1.051, 1.075, 1.09, 1.105, 1.114, 1.109, 1.086, 1.05, 1.006, 0.95, 0.889, 0.831, 0.775, 0.723, 0.676, 0.633, 0.6, 0.584, 0.58, 0.608, 0.668, 0.758, 0.943, 1.139, 1.052, 0.738, 0.585, 0.603, 0.635]
  }
};

export const DROP_CANDIDATE_TIERS = [1, 2, 3, 4];
export const DROP_WEIGHTS = [0.48, 0.34, 0.14, 0.04];

export function getRandomDropTier() {
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < DROP_CANDIDATE_TIERS.length; i++) {
    cumulative += DROP_WEIGHTS[i];
    if (rand <= cumulative) {
      return DROP_CANDIDATE_TIERS[i];
    }
  }
  return DROP_CANDIDATE_TIERS[0];
}
