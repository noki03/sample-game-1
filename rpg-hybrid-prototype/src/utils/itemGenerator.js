// Configuration for Rarity Tiers
// weight: Higher number = more common.
// mult: Stat multiplier.
const RARITY_TIERS = [
    { name: 'Broken', color: '#7f8c8d', mult: 0.5, weight: 100 }, // Very Common, Weak
    { name: 'Rusty', color: '#95a5a6', mult: 0.8, weight: 80 },
    { name: 'Common', color: '#ecf0f1', mult: 1.0, weight: 60 },  // Standard
    { name: 'Sharpened', color: '#2ecc71', mult: 1.2, weight: 40 },
    { name: 'Hardened', color: '#3498db', mult: 1.5, weight: 25 },
    { name: 'Magical', color: '#9b59b6', mult: 2.0, weight: 10 },  // Rare, Strong
    { name: 'Legendary', color: '#f1c40f', mult: 3.0, weight: 2 }   // Ultra Rare, OP
];

const BASE_TYPES = {
    weapon: [
        { name: 'Dagger', icon: '🗡️', baseStat: 3 },
        { name: 'Sword', icon: '⚔️', baseStat: 5 },
        { name: 'Axe', icon: '🪓', baseStat: 7 },
        { name: 'Mace', icon: '🔨', baseStat: 6 }
    ],
    armor: [
        { name: 'Rags', icon: '👕', baseStat: 1 },
        { name: 'Leather Vest', icon: '🦺', baseStat: 3 },
        { name: 'Chainmail', icon: '⛓️', baseStat: 6 },
        { name: 'Plate Armor', icon: '🛡️', baseStat: 10 }
    ]
};

// Helper: Pick a rarity based on weights and player level
const pickRarity = (level) => {
    // 1. Adjust weights based on level
    // At higher levels, bad items become less likely, good items slightly more likely.
    const levelFactor = Math.min(level, 50); // Cap influence at level 50

    // Create a temporary weight pool
    const pool = RARITY_TIERS.map(tier => {
        let w = tier.weight;

        // Reduce weight of garbage tiers as you level up
        if (tier.mult < 1.0) w = Math.max(0, w - (levelFactor * 2));

        // Increase weight of high tiers slightly
        if (tier.mult > 1.5) w = w + (levelFactor * 0.5);

        return { ...tier, currentWeight: w };
    });

    // 2. Calculate Total Weight
    const totalWeight = pool.reduce((sum, tier) => sum + tier.currentWeight, 0);

    // 3. Roll
    let random = Math.random() * totalWeight;

    // 4. Find selection
    for (const tier of pool) {
        if (random < tier.currentWeight) return tier;
        random -= tier.currentWeight;
    }

    return pool[0]; // Fallback
};

export const generateLoot = (level) => {
    // --- POTIONS (25% Chance) ---
    // Potions don't use rarity tiers in the same way, simpler logic
    if (Math.random() < 0.25) {
        return {
            uid: Date.now() + Math.random(),
            name: 'Health Potion',
            type: 'potion',
            bonus: 25 + Math.floor(level * 5), // Heals 25 + 5 per level
            icon: '🍷',
            color: '#e74c3c', // Red
            rarity: 'common'
        };
    }

    // --- EQUIPMENT GENERATION ---

    // 1. Pick Rarity (Weighted)
    const rarity = pickRarity(level);

    // 2. Pick Type
    const type = Math.random() > 0.5 ? 'weapon' : 'armor';
    const baseItem = BASE_TYPES[type][Math.floor(Math.random() * BASE_TYPES[type].length)];

    // 3. Calculate Stats
    // Formula: (ItemBase + Level) * RarityMultiplier
    // Example Lvl 10 Sword: (5 + 10) = 15.
    // Broken: 15 * 0.5 = 7 dmg
    // Common: 15 * 1.0 = 15 dmg
    // Legendary: 15 * 3.0 = 45 dmg!

    // Add small variance (+/- 10%) so not every "Common Sword" is identical
    const basePower = baseItem.baseStat + level;
    const variance = (Math.random() * 0.2) + 0.9; // 0.9 to 1.1

    let finalBonus = Math.floor(basePower * rarity.mult * variance);
    if (finalBonus < 1) finalBonus = 1; // Minimum 1

    return {
        uid: Date.now() + Math.random(),
        name: `${rarity.name} ${baseItem.name}`,
        type: type,
        bonus: finalBonus,
        icon: baseItem.icon,
        color: rarity.color,
        rarity: rarity.name.toLowerCase()
    };
};

// --- NEW FUNCTION: Force specific generation ---
export const generateSpecificLoot = (level, type, rarityName) => {
    // 1. Handle Potion
    if (type === 'potion') {
        return {
            uid: Date.now() + Math.random(),
            name: 'Health Potion',
            type: 'potion',
            bonus: 25 + (level * 5),
            icon: '🍷',
            color: '#e74c3c',
            rarity: 'common'
        };
    }

    // 2. Find Rarity Info
    // Default to Common if not found
    const rarity = RARITY_TIERS.find(r => r.name.toLowerCase() === rarityName.toLowerCase())
        || RARITY_TIERS[2];

    // 3. Pick Random Base for that Type (e.g. Random Sword/Axe if type is 'weapon')
    const baseList = BASE_TYPES[type] || BASE_TYPES['weapon'];
    const baseItem = baseList[Math.floor(Math.random() * baseList.length)];

    // 4. Calculate Stats (Standard Formula)
    const basePower = baseItem.baseStat + level;
    // No variance for cheats, give max potential
    const finalBonus = Math.floor(basePower * rarity.mult);

    return {
        uid: Date.now() + Math.random(),
        name: `${rarity.name} ${baseItem.name}`,
        type: type,
        bonus: finalBonus,
        icon: baseItem.icon,
        color: rarity.color,
        rarity: rarity.name.toLowerCase()
    };
};