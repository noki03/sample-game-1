export const BOSS_LEVEL_REQ = 5;

export const calculateHit = (attacker, defender) => {
    let rawDmg = 0;
    const attackerLevel = attacker.level || 1;

    // --- DAMAGE FORMULAS ---
    if (attacker.isMonster || attacker.isBoss) {
        // MONSTER ATTACK
        // Base 4 + (2 per level).
        // Lvl 1 = 6 dmg. Lvl 5 = 14 dmg.
        rawDmg = 4 + (attackerLevel * 2);

        // Boss hits 2x harder
        if (attacker.isBoss) rawDmg = Math.floor(rawDmg * 1.5);
    } else {
        // PLAYER ATTACK
        // Uses the 'attack' stat directly.
        // We will buff the initial attack stat to 8.
        rawDmg = attacker.attack || 0;
    }

    // --- EVASION (Speed Check) ---
    const defenderSpeed = defender.speed || 10;
    const attackerSpeed = attacker.speed || 10;

    // You only dodge if you are FASTER than the attacker
    if (defenderSpeed > attackerSpeed) {
        const speedDiff = defenderSpeed - attackerSpeed;
        const dodgeChance = Math.min(0.5, speedDiff * 0.03); // 3% per speed point diff

        if (Math.random() < dodgeChance) {
            return { damage: 0, isCrit: false, isMiss: true };
        }
    }

    // --- DEFENSE ---
    const defense = defender.defense || 0;
    // Minimum 1 damage always goes through (unless dodged)
    let actualDmg = Math.max(1, rawDmg - defense);

    // --- CRITS ---
    let isCrit = false;
    if (!attacker.isMonster && !attacker.isBoss) {
        // 10% base crit chance + bonus if high level
        const critChance = 0.1;
        if (Math.random() < critChance) {
            actualDmg = Math.floor(actualDmg * 1.5);
            isCrit = true;
        }
    }

    if (isNaN(actualDmg)) actualDmg = 0;

    return { damage: actualDmg, isCrit, isMiss: false };
};

export const processLevelUp = (currentStats, xpGain) => {
    const stats = { ...currentStats };

    stats.xp += xpGain;
    let leveledUp = false;

    if (!stats.nextLevelXp || isNaN(stats.nextLevelXp)) {
        stats.nextLevelXp = 100;
    }

    while (stats.xp >= stats.nextLevelXp) {
        stats.level += 1;
        stats.maxHp += 15; // +15 HP per level
        stats.attack += 2; // +2 ATK per level
        stats.defense += 0.5; // +0.5 DEF (alternates every 2 levels)
        stats.speed = (stats.speed || 10) + 0.5; // Slow speed growth

        // Full heal on level up!
        stats.hp = stats.maxHp;

        stats.xp = stats.xp - stats.nextLevelXp;
        stats.nextLevelXp = Math.floor(stats.nextLevelXp * 1.4); // 40% harder each time
        leveledUp = true;
    }

    // Round floors
    stats.defense = Math.floor(stats.defense);
    stats.speed = Math.floor(stats.speed);

    return { updatedStats: stats, leveledUp, level: stats.level };
};