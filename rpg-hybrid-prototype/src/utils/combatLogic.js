export const BOSS_LEVEL_REQ = 5;

export const calculateHit = (attacker, defender) => {
    let rawDmg = 0;
    const attackerLevel = attacker.level || 1;

    // --- 1. BASE DAMAGE CALCULATION ---
    if (attacker.isMonster || attacker.isBoss) {
        // MONSTER ATTACK
        rawDmg = 4 + (attackerLevel * 2);
        if (attacker.isBoss) rawDmg = Math.floor(rawDmg * 1.5);
    } else {
        // PLAYER ATTACK
        rawDmg = attacker.attack || 0;
    }

    // --- 2. EVASION (Speed Check) ---
    const defenderSpeed = defender.speed || 10;
    const attackerSpeed = attacker.speed || 10;

    // Only dodge if faster
    if (defenderSpeed > attackerSpeed) {
        const speedDiff = defenderSpeed - attackerSpeed;

        // Cap dodge chance at 40%
        const dodgeChance = Math.min(0.40, speedDiff * 0.02);

        if (Math.random() < dodgeChance) {
            return { damage: 0, isCrit: false, isMiss: true };
        }
    }

    // --- 3. DEFENSE REDUCTION ---
    const defense = defender.defense || 0;

    // Ensure at least 10% of raw damage goes through (Chip damage)
    const minDmg = Math.max(1, Math.floor(rawDmg * 0.1));
    let finalDmg = Math.max(minDmg, rawDmg - defense);

    // --- 4. DAMAGE VARIANCE (The "Juice") ---
    // Randomize damage by ±15% (Multiplier between 0.85 and 1.15)
    // Example: 100 dmg -> becomes 85 to 115
    const variance = (Math.random() * 0.3) + 0.85;
    finalDmg = Math.floor(finalDmg * variance);

    // Ensure it doesn't drop to 0 after variance if it was supposed to do damage
    if (finalDmg < 1) finalDmg = 1;

    // --- 5. CRITICAL HITS ---
    let isCrit = false;
    if (!attacker.isMonster && !attacker.isBoss) {
        // 10% base crit chance
        if (Math.random() < 0.1) {
            finalDmg = Math.floor(finalDmg * 1.5);
            isCrit = true;
        }
    }

    return { damage: finalDmg, isCrit, isMiss: false };
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

        // Growth Stats
        stats.maxHp += 15;
        stats.attack += 3;
        stats.defense += 0.5;
        stats.speed = (stats.speed || 10) + 0.5;

        stats.hp = stats.maxHp; // Full Heal

        stats.xp = stats.xp - stats.nextLevelXp;
        stats.nextLevelXp = Math.floor(stats.nextLevelXp * 1.25); // 1.25x Curve

        leveledUp = true;
    }

    stats.defense = Math.floor(stats.defense);
    stats.speed = Math.floor(stats.speed);

    return { updatedStats: stats, leveledUp, level: stats.level };
};