import { useCallback } from 'react';
import { calculateCombatResult, processLevelUp } from '../utils/combatLogic';
import { generateLoot } from '../data/items';

export const useCombat = (playerRef, positionRef, setPlayer, setGameState, removeMonster, visuals) => {

    const resolveCombat = useCallback((monster) => {
        const player = playerRef.current;
        const playerPos = positionRef.current;

        // Log
        const monsterName = monster.isBoss ? '🐉 DRAGON' : `👹 Lvl ${monster.level} Monster`;
        visuals.addLog(`Encounter: ${monsterName}!`);

        setTimeout(() => {
            // 1. Calculate Result (Instant)
            const result = calculateCombatResult(player, monster);
            visuals.addLog(result.message);

            // Visuals
            visuals.triggerShake(monster.id);
            if (result.damageTaken > 0) {
                visuals.showFloatText(playerPos.x, playerPos.y, `-${result.damageTaken}`, '#e74c3c');
            }

            // 2. Handle Outcomes
            if (result.outcome === 'GAME_OVER') {
                setGameState('GAME_OVER');
                setPlayer(prev => ({ ...prev, hp: 0 }));
                return;
            }

            if (result.outcome === 'FLED') {
                setGameState('EXPLORATION');
                setPlayer(prev => ({ ...prev, hp: result.newHp }));
                return;
            }

            // VICTORY
            setGameState('EXPLORATION');
            const xpGain = result.xpYield;

            // Loot
            const droppedItem = generateLoot(monster.level, monster.isBoss);
            if (droppedItem) {
                visuals.addLog(`📦 Found: ${droppedItem.name}`);
                setTimeout(() => visuals.showFloatText(playerPos.x, playerPos.y, 'ITEM GET!', '#e67e22'), 600);
            }

            // XP & Stats
            if (result.outcome === 'VICTORY_BOSS') {
                setTimeout(() => visuals.showFloatText(playerPos.x, playerPos.y, 'BOSS SLAIN!', '#9b59b6'), 400);
            } else if (xpGain > 0) {
                setTimeout(() => visuals.showFloatText(playerPos.x, playerPos.y, `+${xpGain} XP`, '#3498db'), 400);
            }

            let statsAfterXp = processLevelUp({ ...player, hp: result.newHp }, xpGain);

            if (droppedItem) {
                const currentInventory = statsAfterXp.updatedStats.inventory || [];
                statsAfterXp.updatedStats.inventory = [...currentInventory, droppedItem];
            }

            // Potion Chance
            if (Math.random() > 0.7 || result.outcome === 'VICTORY_BOSS') {
                statsAfterXp.updatedStats.potions += (result.outcome === 'VICTORY_BOSS' ? 3 : 1);
                if (result.outcome !== 'VICTORY_BOSS') visuals.addLog("✨ Found a Potion!");
            }

            if (statsAfterXp.leveledUp) {
                visuals.addLog(`🎉 LEVEL UP! Level ${statsAfterXp.updatedStats.level}.`);
                setTimeout(() => visuals.showFloatText(playerPos.x, playerPos.y, 'LEVEL UP!', '#f1c40f'), 800);
            }

            setPlayer(statsAfterXp.updatedStats);
            removeMonster(monster.id);

        }, 600);
    }, [playerRef, positionRef, setPlayer, setGameState, removeMonster, visuals]);

    return { resolveCombat };
};