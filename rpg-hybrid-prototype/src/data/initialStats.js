export const initialStats = {
    level: 1,
    floor: 1,
    hp: 100,
    maxHp: 100,
    xp: 0,
    nextLevelXp: 100,

    // REPLACED POTIONS WITH SKILL DATA
    // potions: 3, <--- Removed
    lastHealTime: 0, // Timestamp of last use
    healCooldown: 10000, // 10 Seconds (in ms)

    attack: 8,
    defense: 0,
    speed: 10,
    inventory: [],
    equipment: {
        weapon: null,
        armor: null
    }
};