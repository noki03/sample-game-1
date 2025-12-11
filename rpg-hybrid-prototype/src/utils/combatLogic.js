export const BOSS_LEVEL_REQ = 5;

// Constants for Scaling
const BASE_XP = 20;
const BASE_DMG = 5;
const DMG_PER_LEVEL = 3;

export const calculateCombatResult = (player, monster) => {
    // --- 1. BOSS LOGIC ---
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
            // Boss Fight
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

    // --- 2. XP & LEVEL DIFF ---
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

    // --- 3. DAMAGE CALCULATION ---
    let rawMonsterDmg = BASE_DMG + (monster.level * DMG_PER_LEVEL);
    let actualDmg = Math.max(1, rawMonsterDmg - player.defense);

    // Attack "Overpower" Mechanic
    const overpowerThreshold = monster.level * 5;
    let isCrit = false;

    if (player.attack > overpowerThreshold) {
        if (Math.random() > 0.7) {
            actualDmg = 0;
            isCrit = true;
        }
    }

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

    let msg = `Victory vs Lvl ${monster.level}!`;
    if (isCrit) msg += ` 💥 ONE SHOT! (0 DMG)`;
    else msg += ` -${actualDmg} HP`;
    msg += penaltyMsg;

    return {
        outcome: 'VICTORY',
        newHp,
        damageTaken: actualDmg,
        xpYield: finalXp,
        message: msg
    };
};

export const processLevelUp = (currentStats, xpGain) => {
    // FIX: Clone the ENTIRE currentStats object first.
    // This preserves 'inventory', 'equipment', and any other fields we haven't touched.
    const stats = { ...currentStats };

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

    return {
        updatedStats: stats, // Returns the full object with updates
        leveledUp,
        level: stats.level
    };
};