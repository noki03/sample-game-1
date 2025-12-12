export const BOSS_LEVEL_REQ = 5;
const BASE_XP = 20;
const BASE_DMG = 5;
const DMG_PER_LEVEL = 3;

// REVERTED: Instant Combat Logic
export const calculateCombatResult = (player, monster) => {
    // Boss Logic
    if (monster.isBoss) {
        if (player.level < BOSS_LEVEL_REQ) {
            const fleeDmg = Math.max(10, 50 - player.defense);
            const newHp = Math.max(player.hp - fleeDmg, 0);
            return {
                outcome: newHp === 0 ? 'GAME_OVER' : 'FLED',
                newHp,
                damageTaken: fleeDmg,
                xpYield: 0,
                message: newHp === 0 ? "💀 The Dragon incinerated you!" : `🛡️ Too weak! Fled taking ${fleeDmg} DMG.`
            };
        } else {
            const bossDmg = Math.max(10, 80 - player.defense);
            const newHp = Math.max(player.hp - bossDmg, 0);
            return {
                outcome: newHp === 0 ? 'GAME_OVER' : 'VICTORY_BOSS',
                newHp,
                damageTaken: bossDmg,
                xpYield: 500,
                message: newHp === 0 ? "💀 The Dragon defeated you!" : "⚔️ DRAGON SLAIN!"
            };
        }
    }

    // Normal Logic
    const rawXp = BASE_XP * monster.level;
    const levelDiff = player.level - monster.level;
    let multiplier = 1.0;
    let penaltyMsg = "";

    if (levelDiff >= 5) {
        multiplier = 0.1;
        penaltyMsg = " (Trivial)";
    } else if (levelDiff >= 3) {
        multiplier = 0.5;
        penaltyMsg = " (Low Yield)";
    }
    const finalXp = Math.floor(rawXp * multiplier);

    // Damage Math
    let rawMonsterDmg = BASE_DMG + (monster.level * DMG_PER_LEVEL);
    let actualDmg = Math.max(1, rawMonsterDmg - player.defense);

    const newHp = Math.max(player.hp - actualDmg, 0);

    if (newHp === 0) {
        return {
            outcome: 'GAME_OVER',
            newHp,
            damageTaken: actualDmg,
            xpYield: 0,
            message: `💀 Lvl ${monster.level} Monster killed you!`
        };
    }

    return {
        outcome: 'VICTORY',
        newHp,
        damageTaken: actualDmg,
        xpYield: finalXp,
        message: `Victory vs Lvl ${monster.level}! -${actualDmg} HP${penaltyMsg}`
    };
};

export const processLevelUp = (currentStats, xpGain) => {
    const stats = { ...currentStats }; // Clone to preserve inventory/equip
    stats.xp += xpGain;
    let leveledUp = false;

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

    return { updatedStats: stats, leveledUp, level: stats.level };
};