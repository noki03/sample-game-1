export const BOSS_LEVEL_REQ = 5;

// Constants for Scaling
const BASE_XP = 20;
const BASE_DMG = 5;
const DMG_PER_LEVEL = 3;

export const calculateCombatResult = (player, monster) => {
    // --- 1. BOSS LOGIC (Unchanged) ---
    if (monster.isBoss) {
        if (player.level < BOSS_LEVEL_REQ) {
            const fleeDmg = 50;
            const newHp = Math.max(player.hp - fleeDmg, 0);
            return {
                outcome: newHp === 0 ? 'GAME_OVER' : 'FLED',
                newHp,
                damageTaken: fleeDmg,
                xpYield: 0,
                message: newHp === 0 ? "💀 The Dragon incinerated you!" : `🛡️ Too weak! Fled and took ${fleeDmg} DMG.`
            };
        } else {
            // Boss Victory
            const bossDmg = 80;
            const newHp = Math.max(player.hp - bossDmg, 0);
            return {
                outcome: newHp === 0 ? 'GAME_OVER' : 'VICTORY_BOSS',
                newHp,
                damageTaken: bossDmg,
                xpYield: 500, // Boss gives fixed high XP
                message: newHp === 0 ? "💀 The Dragon defeated you!" : "⚔️ DRAGON SLAIN!"
            };
        }
    }

    // --- 2. CALCULATE XP WITH DIMINISHING RETURNS ---
    const rawXp = BASE_XP * monster.level;
    const levelDiff = player.level - monster.level;
    let multiplier = 1.0;
    let penaltyMsg = "";

    if (levelDiff >= 5) {
        multiplier = 0.1; // Trivial (Grey)
        penaltyMsg = " (Trivial)";
    } else if (levelDiff >= 3) {
        multiplier = 0.5; // Easy (Green)
        penaltyMsg = " (Low Yield)";
    } else if (levelDiff >= 2) {
        multiplier = 0.8; // Moderate
    }
    // If difference is 0, 1, or negative (monster is stronger), 100% XP.

    const finalXp = Math.floor(rawXp * multiplier);

    // --- 3. CALCULATE DAMAGE ---
    // Damage logic remains: Base + (MobLevel * 3)
    const monsterDmg = BASE_DMG + (monster.level * DMG_PER_LEVEL);
    const newHp = Math.max(player.hp - monsterDmg, 0);

    if (newHp === 0) {
        return {
            outcome: 'GAME_OVER',
            newHp,
            damageTaken: monsterDmg,
            xpYield: 0,
            message: `💀 Lvl ${monster.level} Monster killed you!`
        };
    }

    return {
        outcome: 'VICTORY',
        newHp,
        damageTaken: monsterDmg,
        xpYield: finalXp,
        // We append the penalty message to the log
        message: `Victory vs Lvl ${monster.level}! -${monsterDmg} HP${penaltyMsg}`
    };
};

export const processLevelUp = (currentStats, xpGain) => {
    let { level, hp, maxHp, xp, nextLevelXp, potions } = currentStats;
    xp += xpGain;
    let leveledUp = false;
    while (xp >= nextLevelXp) {
        level += 1;
        maxHp += 20;
        hp = maxHp;
        xp = xp - nextLevelXp;
        nextLevelXp = Math.floor(nextLevelXp * 1.5);
        leveledUp = true;
    }
    return { updatedStats: { level, hp, maxHp, xp, nextLevelXp, potions }, leveledUp, level };
};