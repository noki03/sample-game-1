export const initialStats = {
    level: 1,
    floor: 1, // NEW: Tracks dungeon depth
    hp: 100,
    maxHp: 100,
    xp: 0,
    nextLevelXp: 100,
    potions: 3,
    attack: 5,
    defense: 0,
    speed: 10,
    inventory: [],
    equipment: {
        weapon: null,
        armor: null
    }
};