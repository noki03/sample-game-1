export const BOSS_LEVEL_REQ = 5;

export const calculateHit = (attacker, defender) => {
    // 1. Calculate Raw Damage
    let rawDmg = 0;
    const attackerLevel = attacker.level || 1;

    if (attacker.isMonster || attacker.isBoss) {
        rawDmg = 5 + (attackerLevel * 3);
    } else {
        rawDmg = attacker.attack || 0;
    }

    // --- NEW: EVASION LOGIC (DODGE) ---
    // If defender has speed > 10, they get 2% dodge chance per point
    const defenderSpeed = defender.speed || 10;
    const dodgeChance = Math.max(0, (defenderSpeed - 10) * 0.02); // 20 Speed = 20% Dodge

    // Cap dodge at 50%
    if (Math.random() < Math.min(0.5, dodgeChance)) {
        return { damage: 0, isCrit: false, isMiss: true }; // NEW RETURN TYPE
    }
    // ----------------------------------

    // 2. Defense Mitigation
    const defense = defender.defense || 0;
    let actualDmg = Math.max(1, rawDmg - defense);

    // 3. Critical Hit Chance
    let isCrit = false;
    if (!attacker.isMonster && !attacker.isBoss) {
        const defenderLevel = defender.level || 1;
        if (attacker.attack > defenderLevel * 2) {
            if (Math.random() > 0.8) {
                actualDmg = Math.floor(actualDmg * 1.5);
                isCrit = true;
            }
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
        stats.maxHp += 20;
        stats.attack += 2;
        stats.defense += 1;
        stats.speed = (stats.speed || 10) + 1; // NEW: Speed increases on level up!

        stats.hp = stats.maxHp;
        stats.xp = stats.xp - stats.nextLevelXp;
        stats.nextLevelXp = Math.floor(stats.nextLevelXp * 1.5);
        leveledUp = true;
    }

    return { updatedStats: stats, leveledUp, level: stats.level };
};