import { useCallback } from 'react';
import { calculateCombatResult, processLevelUp } from '../utils/combatLogic';
// NEW: Import the loot generator
import { generateLoot } from '../data/items';

export const useCombat = (playerRef, positionRef, setPlayer, setGameState, removeMonster, visuals) => {

    const resolveCombat = useCallback((monster) => {
        const currentStats = playerRef.current;
        const playerPos = positionRef.current;

        // 1. Trigger Visual Encounter Log
        const monsterName = monster.isBoss ? '🐉 DRAGON' : `👹 Lvl ${monster.level} Monster`;
        visuals.addLog(`Encounter: ${monsterName}!`);

        // 2. Simulate Turn-Based Delay
        setTimeout(() => {
            // --- CALCULATION ---
            const result = calculateCombatResult(currentStats, monster);
            visuals.addLog(result.message);

            // --- VISUAL FEEDBACK ---
            visuals.triggerShake(monster.id);

            const isCrit = result.message.includes('ONE SHOT');
            visuals.showFloatText(
                monster.x,
                monster.y,
                isCrit ? 'CRIT!' : 'HIT!',
                isCrit ? '#f1c40f' : '#fff'
            );

            if (result.damageTaken > 0) {
                visuals.showFloatText(playerPos.x, playerPos.y, `-${result.damageTaken}`, '#e74c3c');
            }

            // --- OUTCOME HANDLING ---

            // A. Game Over
            if (result.outcome === 'GAME_OVER') {
                setGameState('GAME_OVER');
                setPlayer(prev => ({ ...prev, hp: 0 }));
                return;
            }

            // B. Flee
            if (result.outcome === 'FLED') {
                setGameState('EXPLORATION');
                setPlayer(prev => ({ ...prev, hp: result.newHp }));
                return;
            }

            // C. Victory
            setGameState('EXPLORATION'); // Continue playing (Endless mode)

            // XP Logic
            const xpGain = result.xpYield;

            if (result.outcome === 'VICTORY_BOSS') {
                visuals.addLog(`✨ Gained ${xpGain} XP!`);
                setTimeout(() => visuals.showFloatText(playerPos.x, playerPos.y, 'BOSS SLAIN!', '#9b59b6'), 400);
            } else {
                visuals.addLog(`+${xpGain} XP`);
                if (xpGain > 0) {
                    setTimeout(() => visuals.showFloatText(playerPos.x, playerPos.y, `+${xpGain} XP`, '#3498db'), 400);
                }
            }

            // --- NEW: LOOT GENERATION ---
            const droppedItem = generateLoot(monster.level, monster.isBoss);

            if (droppedItem) {
                visuals.addLog(`📦 Found: ${droppedItem.name}`);
                // Orange Text for Item Drops
                setTimeout(() => visuals.showFloatText(playerPos.x, playerPos.y, 'ITEM GET!', '#e67e22'), 600);
            }
            // ----------------------------

            // Process Stats Update (Level Up checks)
            let statsAfterXp = processLevelUp({ ...currentStats, hp: result.newHp }, xpGain);

            // Random Potion Drop (Separate from Equipment Loot)
            if (Math.random() > 0.7 || result.outcome === 'VICTORY_BOSS') {
                const lootAmount = result.outcome === 'VICTORY_BOSS' ? 3 : 1;
                statsAfterXp.updatedStats.potions += lootAmount;
                if (result.outcome !== 'VICTORY_BOSS') visuals.addLog("✨ Found a Potion!");
            }

            // --- NEW: ADD ITEM TO INVENTORY STATE ---
            if (droppedItem) {
                // Ensure inventory exists (fallback to empty array if undefined)
                const currentInventory = statsAfterXp.updatedStats.inventory || [];
                statsAfterXp.updatedStats.inventory = [...currentInventory, droppedItem];
            }
            // ----------------------------------------

            // Level Up Visuals
            if (statsAfterXp.leveledUp) {
                visuals.addLog(`🎉 LEVEL UP! Level ${statsAfterXp.updatedStats.level}.`);
                setTimeout(() => visuals.showFloatText(playerPos.x, playerPos.y, 'LEVEL UP!', '#f1c40f'), 800);
            }

            // Final State Commit
            setPlayer(statsAfterXp.updatedStats);
            removeMonster(monster.id);

        }, 600); // Combat Speed
    }, [playerRef, positionRef, setPlayer, setGameState, removeMonster, visuals]);

    return { resolveCombat };
};