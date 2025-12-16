export const initialStats = {
    level: 1,
    floor: 1,
    hp: 100,
    maxHp: 100,
    xp: 0,
    nextLevelXp: 100,
    gold: 0, // <--- NEW

    // ... rest of stats
    lastHealTime: 0,
    healCooldown: 20000,
    attack: 8,
    defense: 0,
    speed: 10,

    isGodMode: false,
    isGhostMode: false,
    isOneHitKill: false,

    inventory: [],
    equipment: { weapon: null, armor: null }
};