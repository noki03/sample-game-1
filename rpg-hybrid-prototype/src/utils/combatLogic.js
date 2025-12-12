export const BOSS_LEVEL_REQ = 5;

// NEW: Calculates a single swing of damage (One Turn)
export const calculateHit = (attacker, defender) => {
    // 1. Calculate Raw Damage
    let rawDmg = 0;

    // SAFETY: Default level to 1 if missing to prevent NaN
    const attackerLevel = attacker.level || 1;

    if (attacker.isMonster || attacker.isBoss) {
        // Monster Damage Logic: Base 5 + (Level * 3)
        rawDmg = 5 + (attackerLevel * 3);
    } else {
        // Player Damage Logic: Uses Attack Stat (which includes items)
        // SAFETY: Default attack to 0 if missing
        rawDmg = attacker.attack || 0;
    }

    // 2. Defense Mitigation
    // SAFETY: Default defense to 0 if missing
    const defense = defender.defense || 0;

    // Prevent negative damage (minimum 1)
    let actualDmg = Math.max(1, rawDmg - defense);

    // 3. Critical Hit Chance (Only for Player)
    let isCrit = false;
    if (!attacker.isMonster && !attacker.isBoss) {
        const defenderLevel = defender.level || 1;
        // If Player ATK > 2x Enemy Level, 20% chance to Crit
        if (attacker.attack > defenderLevel * 2) {
            if (Math.random() > 0.8) {
                actualDmg = Math.floor(actualDmg * 1.5);
                isCrit = true;
            }
        }
    }

    // FINAL SAFETY: If math somehow still failed, return 0 damage
    if (isNaN(actualDmg)) {
        console.warn("Damage calculation resulted in NaN, defaulting to 0");
        actualDmg = 0;
    }

    return { damage: actualDmg, isCrit };
};

export const processLevelUp = (currentStats, xpGain) => {
    // IMPORTANT: Clone everything to preserve inventory/equipment
    const stats = { ...currentStats };

    stats.xp += xpGain;
    let leveledUp = false;

    // Ensure nextLevelXp is valid
    if (!stats.nextLevelXp || isNaN(stats.nextLevelXp)) {
        stats.nextLevelXp = 100;
    }

    while (stats.xp >= stats.nextLevelXp) {
        stats.level += 1;
        stats.maxHp += 20;
        stats.attack += 2;
        stats.defense += 1;

        stats.hp = stats.maxHp;
        stats.xp = stats.xp - stats.nextLevelXp;
        stats.nextLevelXp = Math.floor(stats.nextLevelXp * 1.5);
        leveledUp = true;
    }

    return {
        updatedStats: stats,
        leveledUp,
        level: stats.level
    };
};