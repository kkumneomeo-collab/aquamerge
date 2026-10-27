/**
 * Ocean Sea Creature Definitions & Aquadex Lore
 * 10 tiers of adorable living sea creatures
 */
export const MUSHROOM_TIERS = [
  {
    tier: 1,
    id: 'nudibranch',
    name: 'Sea Bunny Nudibranch',
    species: 'Jorunna parva',
    description: 'A tiny, fluffy yellow sea bunny with velvet rhinophores. Drifts gently over coral and wiggles with joy.',
    radius: 20,
    points: 2,
    color: '#FDE047',
    accentColor: '#38BDF8',
    imageSrc: 'assets/seacreatures/tier1_nudibranch.png',
    blinkSrc: 'assets/seacreatures/tier1_nudibranch_blink.png',
    features: {
      drawScale: 2.14,
      aspectX: 1.00,
      aspectY: 0.81,
      offsetX: 0,
      offsetY: 0,
      glow: null,
      radialProfile: [0.825, 0.915, 0.987, 0.994, 0.942, 0.872, 0.81, 0.771, 0.761, 0.772, 0.8, 0.841, 0.887, 0.937, 0.989, 1.023, 1.017, 0.977, 0.924, 0.874, 0.863, 0.887, 0.852, 0.729, 0.637, 0.644, 0.665, 0.639, 0.607, 0.616, 0.669, 0.744, 0.803, 0.814, 0.785, 0.773]
    }
  },
  {
    tier: 2,
    id: 'orange_fish',
    name: 'Chubby Goldfish',
    species: 'Piscis aureus',
    description: 'A plump and cheerful little round fish with a sunny smile and bouncy fluttering fins.',
    radius: 27,
    points: 4,
    color: '#FB923C',
    accentColor: '#FDBA74',
    imageSrc: 'assets/seacreatures/tier2_orange_fish.png',
    blinkSrc: 'assets/seacreatures/tier2_orange_fish_blink.png',
    features: {
      drawScale: 2.14,
      aspectX: 1.00,
      aspectY: 0.75,
      offsetX: 0,
      offsetY: 0,
      glow: null,
      radialProfile: [0.931, 0.963, 0.974, 0.925, 0.828, 0.782, 0.788, 0.773, 0.732, 0.705, 0.707, 0.728, 0.761, 0.809, 0.881, 0.957, 0.984, 0.954, 0.911, 0.875, 0.84, 0.799, 0.753, 0.708, 0.681, 0.684, 0.708, 0.727, 0.725, 0.701, 0.663, 0.626, 0.605, 0.609, 0.682, 0.828]
    }
  },
  {
    tier: 3,
    id: 'sea_urchin',
    name: 'Purple Sea Urchin',
    species: 'Echinoidea purpurea',
    description: 'A cuddly little spiky purple urchin with sparkling eyes and a soft gentle heart.',
    radius: 35,
    points: 8,
    color: '#8B5CF6',
    accentColor: '#C084FC',
    imageSrc: 'assets/seacreatures/tier3_sea_urchin.png',
    blinkSrc: 'assets/seacreatures/tier3_sea_urchin_blink.png',
    features: {
      drawScale: 2.08,
      aspectX: 1.00,
      aspectY: 0.94,
      offsetX: 0,
      offsetY: 0,
      glow: null,
      radialProfile: [0.937, 0.926, 0.907, 0.903, 0.915, 0.929, 0.924, 0.892, 0.856, 0.852, 0.879, 0.907, 0.923, 0.932, 0.928, 0.92, 0.924, 0.934, 0.939, 0.942, 0.939, 0.921, 0.889, 0.869, 0.87, 0.869, 0.858, 0.847, 0.841, 0.849, 0.861, 0.866, 0.872, 0.877, 0.891, 0.92]
    }
  },
  {
    tier: 4,
    id: 'lobster',
    name: 'Ruby Lobster',
    species: 'Homarus ruber',
    description: 'A cheerful crimson lobster with friendly waving claws and bouncy little legs.',
    radius: 44,
    points: 16,
    color: '#EF4444',
    accentColor: '#F87171',
    imageSrc: 'assets/seacreatures/tier4_lobster.png',
    blinkSrc: 'assets/seacreatures/tier4_lobster_blink.png',
    features: {
      drawScale: 2.12,
      aspectX: 1.00,
      aspectY: 0.74,
      offsetX: 0,
      offsetY: 0,
      glow: null,
      radialProfile: [0.872, 0.797, 0.743, 0.765, 0.808, 0.81, 0.773, 0.734, 0.711, 0.675, 0.63, 0.643, 0.717, 0.785, 0.855, 0.944, 0.959, 0.858, 0.735, 0.666, 0.642, 0.635, 0.657, 0.696, 0.687, 0.633, 0.604, 0.602, 0.601, 0.6, 0.6, 0.6, 0.6, 0.629, 0.729, 0.849]
    }
  },
  {
    tier: 5,
    id: 'nautilus',
    name: 'Spiral Nautilus',
    species: 'Nautilus pompilius',
    description: 'Ancient voyager of the deep with a caramel striped spiral shell and curious peeking eyes.',
    radius: 54,
    points: 32,
    color: '#EA580C',
    accentColor: '#FED7AA',
    imageSrc: 'assets/seacreatures/tier5_nautilus.png',
    blinkSrc: 'assets/seacreatures/tier5_nautilus_blink.png',
    features: {
      drawScale: 2.14,
      aspectX: 1.00,
      aspectY: 0.86,
      offsetX: 0,
      offsetY: 0,
      glow: null,
      radialProfile: [0.984, 0.984, 0.979, 0.969, 0.954, 0.932, 0.906, 0.881, 0.859, 0.84, 0.834, 0.851, 0.878, 0.901, 0.917, 0.927, 0.929, 0.891, 0.799, 0.712, 0.677, 0.674, 0.681, 0.697, 0.725, 0.758, 0.791, 0.824, 0.854, 0.881, 0.906, 0.932, 0.954, 0.968, 0.977, 0.981]
    }
  },
  {
    tier: 6,
    id: 'moray_eel',
    name: 'Ribbon Moray Eel',
    species: 'Gymnothorax viridis',
    description: 'A jolly coiled lime moray eel who loves peeking through coral caves and smiling bright.',
    radius: 65,
    points: 64,
    color: '#84CC16',
    accentColor: '#65A30D',
    imageSrc: 'assets/seacreatures/tier6_moray_eel.png',
    blinkSrc: 'assets/seacreatures/tier6_moray_eel_blink.png',
    features: {
      drawScale: 2.14,
      aspectX: 1.00,
      aspectY: 0.93,
      offsetX: 0,
      offsetY: 0,
      glow: null,
      radialProfile: [0.982, 0.99, 0.993, 0.993, 0.989, 0.976, 0.957, 0.938, 0.925, 0.917, 0.917, 0.923, 0.931, 0.938, 0.95, 0.931, 0.814, 0.689, 0.716, 0.844, 0.931, 0.952, 0.938, 0.911, 0.879, 0.858, 0.866, 0.89, 0.91, 0.923, 0.931, 0.938, 0.946, 0.955, 0.964, 0.973]
    }
  },
  {
    tier: 7,
    id: 'axolotl',
    name: 'Pink Axolotl',
    species: 'Ambystoma mexicanum',
    description: 'The beloved water dragon! Fluffy frilly pink gills, blushing cheeks, and infinite aquatic cheer.',
    radius: 77,
    points: 128,
    color: '#F472B6',
    accentColor: '#FDA4AF',
    imageSrc: 'assets/seacreatures/tier7_axolotl.png',
    blinkSrc: 'assets/seacreatures/tier7_axolotl_blink.png',
    features: {
      drawScale: 2.11,
      aspectX: 1.00,
      aspectY: 0.76,
      offsetX: 0,
      offsetY: 0,
      glow: '#F472B6',
      radialProfile: [0.783, 0.775, 0.871, 0.954, 0.937, 0.868, 0.801, 0.748, 0.706, 0.684, 0.687, 0.681, 0.645, 0.61, 0.6, 0.6, 0.603, 0.652, 0.767, 0.876, 0.943, 0.969, 0.919, 0.814, 0.733, 0.707, 0.703, 0.701, 0.7, 0.7, 0.722, 0.802, 0.911, 0.965, 0.94, 0.867]
    }
  },
  {
    tier: 8,
    id: 'sea_otter',
    name: 'Cozy Sea Otter',
    species: 'Enhydra lutris',
    description: 'Floating on its back while gently holding its favorite pink seashell. Irresistibly cuddly.',
    radius: 90,
    points: 256,
    color: '#92400E',
    accentColor: '#FDE047',
    imageSrc: 'assets/seacreatures/tier8_sea_otter.png',
    blinkSrc: 'assets/seacreatures/tier8_sea_otter_blink.png',
    features: {
      drawScale: 2.12,
      aspectX: 0.93,
      aspectY: 1.00,
      offsetX: 0,
      offsetY: 0,
      glow: '#F59E0B',
      radialProfile: [0.6, 0.626, 0.736, 0.906, 1.014, 1.02, 0.988, 0.968, 0.965, 0.966, 0.975, 1.007, 1.039, 1.05, 1.042, 1.007, 0.943, 0.885, 0.866, 0.892, 0.942, 0.996, 1.034, 1.033, 1.007, 0.982, 0.96, 0.933, 0.9, 0.878, 0.866, 0.825, 0.74, 0.656, 0.611, 0.6]
    }
  },
  {
    tier: 9,
    id: 'clam_pearl',
    name: 'Luminescent Pearl Clam',
    species: 'Tridacna margaritifera',
    description: 'A radiant open iridescent clam shell cradling an adorable glowing sentient pearl.',
    radius: 105,
    points: 512,
    color: '#FFF1F2',
    accentColor: '#38BDF8',
    imageSrc: 'assets/seacreatures/tier9_clam_pearl.png',
    blinkSrc: 'assets/seacreatures/tier9_clam_pearl_blink.png',
    features: {
      drawScale: 2.13,
      aspectX: 0.91,
      aspectY: 1.00,
      offsetX: 0,
      offsetY: 0,
      glow: '#38BDF8',
      radialProfile: [0.826, 0.768, 0.792, 0.909, 1.006, 1.027, 1.012, 0.993, 0.978, 0.975, 0.982, 0.998, 1.016, 1.03, 1.008, 0.91, 0.791, 0.765, 0.823, 0.872, 0.897, 0.916, 0.93, 0.938, 0.941, 0.943, 0.951, 0.957, 0.951, 0.944, 0.944, 0.942, 0.936, 0.924, 0.906, 0.879]
    }
  },
  {
    tier: 10,
    id: 'orca',
    name: 'Grand Apex Orca',
    species: 'Orcinus orca',
    description: 'The noble king of the ocean! Midnight coat with snowy markings, leaping gracefully into crystal waters.',
    radius: 122,
    points: 1024,
    color: '#0F172A',
    accentColor: '#38BDF8',
    imageSrc: 'assets/seacreatures/tier10_orca.png',
    blinkSrc: 'assets/seacreatures/tier10_orca_blink.png',
    features: {
      drawScale: 2.11,
      aspectX: 1.00,
      aspectY: 0.80,
      offsetX: 0,
      offsetY: 0,
      glow: '#38BDF8',
      radialProfile: [0.822, 0.738, 0.662, 0.635, 0.64, 0.679, 0.743, 0.776, 0.756, 0.727, 0.734, 0.772, 0.836, 0.932, 1.02, 1.046, 1.023, 0.977, 0.928, 0.877, 0.819, 0.752, 0.685, 0.637, 0.635, 0.674, 0.703, 0.672, 0.62, 0.6, 0.6, 0.6, 0.602, 0.639, 0.735, 0.825]
    }
  }
];

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
