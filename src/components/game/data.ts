/**
 * Galactic Archive dataset.
 *
 * All entries are derived from publicly available astronomical catalogs and are
 * used here purely as design inspiration for level themes and NPC (enemy) ship
 * archetypes. No proprietary data is used.
 *
 * Sources (public domain / openly licensed):
 * - NASA Exoplanet Archive: https://exoplanetarchive.ipac.caltech.edu/
 * - NASA JPL Small-Body Database: https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html
 * - Messier Catalog (deep-sky objects): public domain astronomy catalog
 */

export type CelestialBody = {
  id: string;
  name: string;
  designation: string; // catalog name (e.g. "TRAPPIST-1 e")
  type: "exoplanet" | "asteroid" | "deep-sky";
  distanceLy: number; // light years from Earth
  sizeKm: number; // characteristic diameter
  description: string;
  // Game design attributes derived from the real-world properties
  themeColor: string; // hex for level background tint
  hazardLevel: 1 | 2 | 3 | 4 | 5;
};

export const CELESTIAL_BODIES: CelestialBody[] = [
  // --- Exoplanets (NASA Exoplanet Archive) ---
  {
    id: "proxima-centauri-b",
    name: "Proxima Centauri b",
    designation: "Proxima Cen b",
    type: "exoplanet",
    distanceLy: 4.2,
    sizeKm: 13900,
    description:
      "Closest known exoplanet to Earth, orbiting our nearest stellar neighbor. Rocky and tidally locked.",
    themeColor: "#7c3aed",
    hazardLevel: 2,
  },
  {
    id: "trappist-1-e",
    name: "TRAPPIST-1 e",
    designation: "TRAPPIST-1 e",
    type: "exoplanet",
    distanceLy: 39.6,
    sizeKm: 11900,
    description:
      "Temperate, rocky world in the habitable zone of an ultra-cool dwarf star, 39 light years away.",
    themeColor: "#22d3ee",
    hazardLevel: 3,
  },
  {
    id: "kepler-186-f",
    name: "Kepler-186 f",
    designation: "Kepler-186 f",
    type: "exoplanet",
    distanceLy: 582,
    sizeKm: 14700,
    description:
      "First Earth-sized planet discovered in the habitable zone of another star.",
    themeColor: "#34d399",
    hazardLevel: 3,
  },
  {
    id: "hd-209458-b",
    name: "HD 209458 b (Osiris)",
    designation: "HD 209458 b",
    type: "exoplanet",
    distanceLy: 159,
    sizeKm: 197000,
    description:
      "A hot Jupiter whose atmosphere is being stripped away by its star.",
    themeColor: "#fbbf24",
    hazardLevel: 4,
  },
  {
    id: "wasp-12-b",
    name: "WASP-12 b",
    designation: "WASP-12 b",
    type: "exoplanet",
    distanceLy: 1400,
    sizeKm: 272000,
    description:
      "An ultra-hot gas giant being tidally distorted and consumed by its host star.",
    themeColor: "#f87171",
    hazardLevel: 5,
  },
  {
    id: "lhs-3844-b",
    name: "LHS 3844 b",
    designation: "LHS 3844 b",
    type: "exoplanet",
    distanceLy: 48.6,
    sizeKm: 15100,
    description: "Hot rocky planet likely without a substantial atmosphere.",
    themeColor: "#94a3b8",
    hazardLevel: 2,
  },

  // --- Asteroids / small bodies (NASA JPL Small-Body Database) ---
  {
    id: "ceres",
    name: "Ceres",
    designation: "1 Ceres",
    type: "asteroid",
    distanceLy: 0.000026, // ~2.8 AU
    sizeKm: 940,
    description:
      "Largest object in the asteroid belt and a dwarf planet; contains more fresh water than Earth.",
    themeColor: "#a78bfa",
    hazardLevel: 2,
  },
  {
    id: "vesta",
    name: "Vesta",
    designation: "4 Vesta",
    type: "asteroid",
    distanceLy: 0.000027,
    sizeKm: 525,
    description:
      "Protoplanet with a basaltic surface; one of the largest asteroids in the belt.",
    themeColor: "#f472b6",
    hazardLevel: 2,
  },
  {
    id: "pallas",
    name: "Pallas",
    designation: "2 Pallas",
    type: "asteroid",
    distanceLy: 0.000027,
    sizeKm: 512,
    description:
      "Highly inclined, heavily cratered asteroid; a remnant of a shattered protoplanet.",
    themeColor: "#86efac",
    hazardLevel: 3,
  },
  {
    id: "hygiea",
    name: "Hygiea",
    designation: "10 Hygiea",
    type: "asteroid",
    distanceLy: 0.00003,
    sizeKm: 434,
    description:
      "Fourth-largest asteroid; nearly spherical and possibly a dwarf planet candidate.",
    themeColor: "#67e8f9",
    hazardLevel: 3,
  },
  {
    id: "itokawa",
    name: "Itokawa",
    designation: "25143 Itokawa",
    type: "asteroid",
    distanceLy: 0.000011,
    sizeKm: 0.535,
    description:
      "Peanut-shaped near-Earth asteroid sampled by JAXA's Hayabusa mission.",
    themeColor: "#fcd34d",
    hazardLevel: 1,
  },
  {
    id: "bennu",
    name: "Bennu",
    designation: "101955 Bennu",
    type: "asteroid",
    distanceLy: 0.000011,
    sizeKm: 0.49,
    description:
      "Carbonaceous near-Earth asteroid sampled by NASA's OSIRIS-REx mission.",
    themeColor: "#fb923c",
    hazardLevel: 2,
  },
  {
    id: "ryugu",
    name: "Ryugu",
    designation: "162173 Ryugu",
    type: "asteroid",
    distanceLy: 0.000012,
    sizeKm: 0.87,
    description:
      "Spinning-top shaped asteroid returned samples to Earth via Hayabusa2.",
    themeColor: "#f43f5e",
    hazardLevel: 2,
  },
  {
    id: "eros",
    name: "Eros",
    designation: "433 Eros",
    type: "asteroid",
    distanceLy: 0.000016,
    sizeKm: 34,
    description:
      "Sizable near-Earth asteroid first orbited by NASA's NEAR Shoemaker spacecraft.",
    themeColor: "#a1a1aa",
    hazardLevel: 3,
  },

  // --- Deep-sky objects (Messier / NGC catalogs) ---
  {
    id: "m31-andromeda",
    name: "Andromeda Galaxy",
    designation: "M31 / NGC 224",
    type: "deep-sky",
    distanceLy: 2500000,
    sizeKm: 220000000000, // 220,000 light years across (shown as scale proxy)
    description:
      "Nearest major galaxy to the Milky Way, on a collision course with our galaxy.",
    themeColor: "#a78bfa",
    hazardLevel: 4,
  },
  {
    id: "m42-orion",
    name: "Orion Nebula",
    designation: "M42 / NGC 1976",
    type: "deep-sky",
    distanceLy: 1344,
    sizeKm: 39000000000000, // ~24 light years
    description:
      "Vast stellar nursery where new stars are being born, visible to the naked eye.",
    themeColor: "#34d399",
    hazardLevel: 2,
  },
  {
    id: "m45-pleiades",
    name: "Pleiades",
    designation: "M45 / NGC 1432",
    type: "deep-sky",
    distanceLy: 444,
    sizeKm: 65000000000000, // ~43 light years
    description:
      "Bright open cluster of hot, young blue stars also known as the Seven Sisters.",
    themeColor: "#22d3ee",
    hazardLevel: 1,
  },
  {
    id: "m57-ring",
    name: "Ring Nebula",
    designation: "M57 / NGC 6720",
    type: "deep-sky",
    distanceLy: 2565,
    sizeKm: 6500000000000, // ~1 light year
    description:
      "Planetary nebula — the glowing remains of a Sun-like star's outer layers.",
    themeColor: "#f472b6",
    hazardLevel: 2,
  },
  {
    id: "m1-crab",
    name: "Crab Nebula",
    designation: "M1 / NGC 1952",
    type: "deep-sky",
    distanceLy: 6523,
    sizeKm: 11000000000000, // ~11 light years
    description:
      "Supernova remnant containing a rapidly spinning pulsar at its heart.",
    themeColor: "#fbbf24",
    hazardLevel: 4,
  },
  {
    id: "m13-hercules",
    name: "Hercules Cluster",
    designation: "M13 / NGC 6205",
    type: "deep-sky",
    distanceLy: 22200,
    sizeKm: 130000000000000, // ~145 light years
    description:
      "Globular cluster of several hundred thousand ancient stars.",
    themeColor: "#f43f5e",
    hazardLevel: 3,
  },
];

export type NpcArchetype = {
  id: string;
  name: string;
  basedOn: string; // dataset entry id
  role: "drone" | "interceptor" | "harvester" | "capital";
  hull: number;
  shield: number;
  speed: number; // pixels per frame
  fireRate: number; // frames between shots
  bulletSpeed: number;
  bulletDamage: number;
  color: string;
  size: number; // radius
  scoreValue: number;
  description: string;
};

// NPC ship archetypes designed from the dataset above.
export const NPC_ARCHETYPES: NpcArchetype[] = [
  {
    id: "proxima-drifter",
    name: "Proxima Drifter",
    basedOn: "proxima-centauri-b",
    role: "drone",
    hull: 20,
    shield: 0,
    speed: 1.6,
    fireRate: 90,
    bulletSpeed: 5,
    bulletDamage: 8,
    color: "#7c3aed",
    size: 10,
    scoreValue: 50,
    description:
      "Patrol drone from the nearest star system. Simple AI, weak armor.",
  },
  {
    id: "trappist-sentinel",
    name: "TRAPPIST Sentinel",
    basedOn: "trappist-1-e",
    role: "interceptor",
    hull: 30,
    shield: 15,
    speed: 2.4,
    fireRate: 60,
    bulletSpeed: 7,
    bulletDamage: 10,
    color: "#22d3ee",
    size: 11,
    scoreValue: 80,
    description:
      "Fast interceptor guarding temperate-zone outposts.",
  },
  {
    id: "kepler-warden",
    name: "Kepler Warden",
    basedOn: "kepler-186-f",
    role: "interceptor",
    hull: 40,
    shield: 25,
    speed: 1.9,
    fireRate: 50,
    bulletSpeed: 7,
    bulletDamage: 12,
    color: "#34d399",
    size: 12,
    scoreValue: 100,
    description: "Heavily shielded border warden.",
  },
  {
    id: "osiris-harvester",
    name: "Osiris Harvester",
    basedOn: "hd-209458-b",
    role: "harvester",
    hull: 80,
    shield: 40,
    speed: 1.1,
    fireRate: 80,
    bulletSpeed: 6,
    bulletDamage: 14,
    color: "#fbbf24",
    size: 16,
    scoreValue: 150,
    description:
      "Atmosphere-siphoning capital support ship. Durable and dangerous.",
  },
  {
    id: "wasp-reaver",
    name: "WASP Reaver",
    basedOn: "wasp-12-b",
    role: "capital",
    hull: 150,
    shield: 80,
    speed: 0.8,
    fireRate: 40,
    bulletSpeed: 8,
    bulletDamage: 20,
    color: "#f87171",
    size: 22,
    scoreValue: 300,
    description: "Capital-class reaver from an ultra-hot system.",
  },
  {
    id: "ceres-miner",
    name: "Ceres Miner",
    basedOn: "ceres",
    role: "drone",
    hull: 25,
    shield: 5,
    speed: 1.2,
    fireRate: 100,
    bulletSpeed: 5,
    bulletDamage: 9,
    color: "#a78bfa",
    size: 13,
    scoreValue: 60,
    description: "Automated mining drone from the asteroid belt.",
  },
  {
    id: "vesta-raider",
    name: "Vesta Raider",
    basedOn: "vesta",
    role: "interceptor",
    hull: 35,
    shield: 10,
    speed: 2.1,
    fireRate: 55,
    bulletSpeed: 7,
    bulletDamage: 11,
    color: "#f472b6",
    size: 11,
    scoreValue: 85,
    description: "Basalt-armored raider ship.",
  },
  {
    id: "bennu-swarm",
    name: "Bennu Swarm",
    basedOn: "bennu",
    role: "drone",
    hull: 15,
    shield: 0,
    speed: 2.8,
    fireRate: 110,
    bulletSpeed: 5,
    bulletDamage: 6,
    color: "#fb923c",
    size: 8,
    scoreValue: 40,
    description: "Nimble carbonaceous swarm drone.",
  },
  {
    id: "crab-pulsar",
    name: "Crab Pulsar",
    basedOn: "m1-crab",
    role: "capital",
    hull: 200,
    shield: 100,
    speed: 0.6,
    fireRate: 30,
    bulletSpeed: 9,
    bulletDamage: 24,
    color: "#fbbf24",
    size: 26,
    scoreValue: 400,
    description: "Dreadnought powered by pulsar energy.",
  },
];

export type WaveTheme = {
  wave: number;
  basedOn: string;
  enemyIds: string[];
  spawnCount: number;
  background: string;
  description: string;
};

export const WAVE_THEMES: WaveTheme[] = [
  {
    wave: 1,
    basedOn: "m45-pleiades",
    enemyIds: ["bennu-swarm"],
    spawnCount: 5,
    background: "#0f172a",
    description: "Pleiades Cluster — rookie swarm drones.",
  },
  {
    wave: 2,
    basedOn: "ceres",
    enemyIds: ["ceres-miner", "proxima-drifter"],
    spawnCount: 7,
    background: "#1e1b4b",
    description: "Asteroid Belt — mining drones and drifters.",
  },
  {
    wave: 3,
    basedOn: "trappist-1-e",
    enemyIds: ["trappist-sentinel", "vesta-raider"],
    spawnCount: 8,
    background: "#064e3b",
    description: "TRAPPIST-1 system — fast interceptors.",
  },
  {
    wave: 4,
    basedOn: "kepler-186-f",
    enemyIds: ["kepler-warden", "proxima-drifter"],
    spawnCount: 9,
    background: "#1e3a8a",
    description: "Kepler-186 — shielded wardens.",
  },
  {
    wave: 5,
    basedOn: "hd-209458-b",
    enemyIds: ["osiris-harvester", "trappist-sentinel"],
    spawnCount: 6,
    background: "#7c2d12",
    description: "Osiris — atmosphere harvesters.",
  },
  {
    wave: 6,
    basedOn: "m1-crab",
    enemyIds: ["crab-pulsar", "wasp-reaver"],
    spawnCount: 4,
    background: "#451a03",
    description: "Crab Nebula — capital dreadnoughts.",
  },
  {
    wave: 7,
    basedOn: "wasp-12-b",
    enemyIds: ["wasp-reaver", "crab-pulsar"],
    spawnCount: 5,
    background: "#450a0a",
    description: "WASP-12 — final reaver assault.",
  },
];

export function getCelestialById(id: string) {
  return CELESTIAL_BODIES.find((b) => b.id === id);
}

export function getNpcById(id: string) {
  return NPC_ARCHETYPES.find((n) => n.id === id);
}

export function searchArchive(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return [
    ...CELESTIAL_BODIES.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.designation.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q),
    ),
    ...NPC_ARCHETYPES.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q),
    ),
  ];
}
