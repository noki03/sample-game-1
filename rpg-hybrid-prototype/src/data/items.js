// Database of possible items
const ITEM_DB = [
    // --- WEAPONS ---
    { id: 'w1', name: 'Rusty Dagger', type: 'weapon', bonus: 2, minLevel: 1, icon: '🗡️' },
    { id: 'w2', name: 'Iron Sword', type: 'weapon', bonus: 5, minLevel: 3, icon: '⚔️' },
    { id: 'w3', name: 'War Axe', type: 'weapon', bonus: 8, minLevel: 5, icon: '🪓' },
    { id: 'w_boss', name: 'Dragon Slayer', type: 'weapon', bonus: 15, minLevel: 10, icon: '🔥' },

    // --- ARMOR ---
    { id: 'a1', name: 'Tattered Shirt', type: 'armor', bonus: 1, minLevel: 1, icon: '👕' },
    { id: 'a2', name: 'Leather Vest', type: 'armor', bonus: 3, minLevel: 3, icon: '🦺' },
    { id: 'a3', name: 'Chainmail', type: 'armor', bonus: 6, minLevel: 6, icon: '🛡️' },
    { id: 'a_boss', name: 'Dragon Scale', type: 'armor', bonus: 10, minLevel: 10, icon: '🐲' },
];

export const generateLoot = (monsterLevel, isBoss) => {
    // 1. Boss Loot (Guaranteed High Tier)
    if (isBoss) {
        return { ...ITEM_DB.find(i => i.id === (Math.random() > 0.5 ? 'w_boss' : 'a_boss')), uid: Date.now() };
    }

    // 2. Normal Loot Chance (30%)
    if (Math.random() > 0.3) return null;

    // 3. Filter items appropriate for this level
    // We allow items up to MonsterLevel + 1 (chance for upgrades)
    const possibleItems = ITEM_DB.filter(i => i.minLevel <= monsterLevel + 1 && !i.id.includes('boss'));

    if (possibleItems.length === 0) return null;

    // 4. Pick Random Item
    const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];

    // Return item with a unique ID (uid) so we can have duplicates in bag
    return { ...item, uid: Date.now() + Math.random() };
};