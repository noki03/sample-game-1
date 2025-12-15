export const initialStats = {
    level: 1,
    floor: 1,
    hp: 100,
    maxHp: 100,
    xp: 0,
    nextLevelXp: 100,
    lastHealTime: 0,
    healCooldown: 10000,
    attack: 8,
    defense: 0,
    speed: 10,

    // --- CHEAT FLAGS ---
    isGodMode: false,     // Invulnerability
    isGhostMode: false,   // No Aggro
    isOneHitKill: false,  // Massive Damage

    inventory: [],
    equipment: {
        weapon: null,
        armor: null
    }
};