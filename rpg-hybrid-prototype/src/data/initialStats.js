export const initialStats = {
    level: 1,
    hp: 100,
    maxHp: 100,
    xp: 0,
    nextLevelXp: 100,
    potions: 3,
    attack: 5,
    defense: 0,
    // --- NEW FIELDS ---
    inventory: [], // Array of item objects
    equipment: {
        weapon: null, // Holds the equipped weapon object
        armor: null   // Holds the equipped armor object
    }
};