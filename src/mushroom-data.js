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
      drawScale: 2.38,
      aspectX: 1.10,
      aspectY: 0.90,
      offsetX: 0,
      offsetY: 0,
      glow: null
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
      drawScale: 2.45,
      aspectX: 1.14,
      aspectY: 0.86,
      offsetX: 0,
      offsetY: 0,
      glow: null
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
      drawScale: 2.14,
      aspectX: 1.02,
      aspectY: 0.98,
      offsetX: 0,
      offsetY: 0,
      glow: null
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
      drawScale: 2.43,
      aspectX: 1.15,
      aspectY: 0.85,
      offsetX: 0,
      offsetY: 0,
      glow: null
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
      drawScale: 2.31,
      aspectX: 1.08,
      aspectY: 0.92,
      offsetX: 0,
      offsetY: 0,
      glow: null
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
      drawScale: 2.21,
      aspectX: 1.03,
      aspectY: 0.97,
      offsetX: 0,
      offsetY: 0,
      glow: null
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
      drawScale: 2.40,
      aspectX: 1.14,
      aspectY: 0.86,
      offsetX: 0,
      offsetY: 0,
      glow: '#F472B6'
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
      drawScale: 2.20,
      aspectX: 0.96,
      aspectY: 1.04,
      offsetX: 0,
      offsetY: 0,
      glow: '#F59E0B'
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
      drawScale: 2.23,
      aspectX: 0.95,
      aspectY: 1.05,
      offsetX: 0,
      offsetY: 0,
      glow: '#38BDF8'
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
      drawScale: 2.35,
      aspectX: 1.11,
      aspectY: 0.89,
      offsetX: 0,
      offsetY: 0,
      glow: '#38BDF8'
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
