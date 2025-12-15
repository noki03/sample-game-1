// Configuration for Rarity Tiers
const RARITY_TIERS = [
    { name: 'Broken', color: '#7f8c8d', mult: 0.5, weight: 100 },
    { name: 'Rusty', color: '#95a5a6', mult: 0.8, weight: 80 },
    { name: 'Common', color: '#ecf0f1', mult: 1.0, weight: 60 },
    { name: 'Sharpened', color: '#2ecc71', mult: 1.2, weight: 40 },
    { name: 'Hardened', color: '#3498db', mult: 1.5, weight: 25 },
    { name: 'Magical', color: '#9b59b6', mult: 2.5, weight: 10 },
    { name: 'Legendary', color: '#f1c40f', mult: 3.0, weight: 2 }
];

// --- BOSS ARTIFACTS (MYTHIC) ---
// BALANCED: Multipliers reduced from ~6.0 to ~4.0
// This makes them roughly 30-40% stronger than Legendary, rather than 200% stronger.
const BOSS_ARTIFACTS = [
    { name: "Dragon Slayer", type: "weapon", icon: "🗡️🔥", mult: 4.0 },
    { name: "Void Cleaver", type: "weapon", icon: "🌌", mult: 4.5 },
    { name: "Mjolnir's Echo", type: "weapon", icon: "🔨⚡", mult: 4.2 },
    { name: "Aegis Shield", type: "armor", icon: "🛡️✨", mult: 3.5 }, // Def scales harder, keep lower
    { name: "Dragon Scale", type: "armor", icon: "🐲", mult: 3.8 },
    { name: "God King's Plate", type: "armor", icon: "👑", mult: 4.0 }
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
    const levelFactor = Math.min(level, 50);

    const pool = RARITY_TIERS.map(tier => {
        let w = tier.weight;
        if (tier.mult < 1.0) w = Math.max(0, w - (levelFactor * 2));
        if (tier.mult > 1.5) w = w + (levelFactor * 0.5);
        return { ...tier, currentWeight: w };
    });

    const totalWeight = pool.reduce((sum, tier) => sum + tier.currentWeight, 0);
    let random = Math.random() * totalWeight;

    for (const tier of pool) {
        if (random < tier.currentWeight) return tier;
        random -= tier.currentWeight;
    }
    return pool[0];
};

// --- STANDARD LOOT ---
export const generateLoot = (level) => {
    if (Math.random() < 0.25) {
        return {
            uid: Date.now() + Math.random(),
            name: 'Health Potion', type: 'potion', bonus: 25 + Math.floor(level * 5),
            icon: '🍷', color: '#e74c3c', rarity: 'common', value: 15 + level
        };
    }

    const rarity = pickRarity(level);
    const type = Math.random() > 0.5 ? 'weapon' : 'armor';
    const baseItem = BASE_TYPES[type][Math.floor(Math.random() * BASE_TYPES[type].length)];

    const basePower = baseItem.baseStat + level;
    const variance = (Math.random() * 0.2) + 0.9;

    let finalBonus = Math.floor(basePower * rarity.mult * variance);
    if (finalBonus < 1) finalBonus = 1;

    const priceMult = 1 + (RARITY_TIERS.indexOf(rarity) * 0.5);
    const value = Math.floor(finalBonus * 10 * priceMult);

    return {
        uid: Date.now() + Math.random(),
        name: `${rarity.name} ${baseItem.name}`,
        type: type, bonus: finalBonus, icon: baseItem.icon,
        color: rarity.color, rarity: rarity.name.toLowerCase(), value: value
    };
};

// --- BOSS LOOT (MYTHIC) ---
export const generateBossLoot = (level) => {
    const artifact = BOSS_ARTIFACTS[Math.floor(Math.random() * BOSS_ARTIFACTS.length)];

    // BALANCED: Reduced base stat bonus from 15 to 10.
    const basePower = 10 + level;

    // Multipliers are now ~4.0 instead of ~6.0
    const finalBonus = Math.floor(basePower * artifact.mult);

    // Adjusted value calculation to match new stats
    const value = finalBonus * 40;

    return {
        uid: Date.now() + Math.random(),
        name: artifact.name,
        type: artifact.type,
        bonus: finalBonus,
        icon: artifact.icon,
        color: '#ff3333', // Crimson Red
        rarity: 'mythic',
        value: value
    };
};

// --- CHEAT LOOT ---
export const generateSpecificLoot = (level, type, rarityName) => {
    if (type === 'potion') {
        return { uid: Date.now() + Math.random(), name: 'Health Potion', type: 'potion', bonus: 25 + (level * 5), icon: '🍷', color: '#e74c3c', rarity: 'common', value: 15 };
    }

    if (rarityName.toLowerCase() === 'mythic') {
        return generateBossLoot(level);
    }

    const rarity = RARITY_TIERS.find(r => r.name.toLowerCase() === rarityName.toLowerCase()) || RARITY_TIERS[2];
    const baseList = BASE_TYPES[type] || BASE_TYPES['weapon'];
    const baseItem = baseList[Math.floor(Math.random() * baseList.length)];
    const basePower = baseItem.baseStat + level;
    const finalBonus = Math.floor(basePower * rarity.mult);
    const rarityIndex = RARITY_TIERS.indexOf(rarity);
    const priceMult = 1 + (rarityIndex * 0.5);
    const value = Math.floor(finalBonus * 10 * priceMult);

    return {
        uid: Date.now() + Math.random(),
        name: `${rarity.name} ${baseItem.name}`,
        type: type, bonus: finalBonus, icon: baseItem.icon, color: rarity.color, rarity: rarity.name.toLowerCase(), value: value
    };
};