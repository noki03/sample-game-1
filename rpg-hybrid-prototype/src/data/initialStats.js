export const initialStats = {
    level: 1,
    hp: 100,
    maxHp: 100,
    xp: 0,
    nextLevelXp: 100,
    potions: 3,
    attack: 5,
    defense: 0,
    speed: 10, // NEW STAT (Controls Turn Delay & Evasion)
    inventory: [],
    equipment: {
        weapon: null,
        armor: null
    }
};