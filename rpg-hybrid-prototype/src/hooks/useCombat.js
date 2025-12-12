import { useCallback } from 'react';
import { calculateHit, processLevelUp } from '../utils/combatLogic';
import { generateLoot } from '../data/items';

export const useCombat = (playerRef, positionRef, setPlayer, setGameState, removeMonster, updateMonster, visuals) => {

    const resolveCombat = useCallback((monster) => {
        const player = playerRef.current;
        const playerPos = positionRef.current;

        // --- PHASE 1: PLAYER ATTACKS MONSTER ---
        const playerHit = calculateHit(player, monster);

        // Calculate new Monster HP (Fallback to maxHp if missing)
        const currentMonsterHp = (monster.hp !== undefined) ? monster.hp : monster.maxHp;
        const newMonsterHp = currentMonsterHp - playerHit.damage;

        const updatedMonster = { ...monster, hp: newMonsterHp };

        // Visuals (Hit Monster)
        visuals.triggerShake(monster.id);
        visuals.showFloatText(
            monster.x, monster.y,
            playerHit.isCrit ? `CRIT ${playerHit.damage}` : `${playerHit.damage}`,
            playerHit.isCrit ? '#f1c40f' : '#fff'
        );

        // --- CHECK: DID MONSTER DIE? ---
        if (newMonsterHp <= 0) {
            // --- VICTORY ---
            const xpGain = monster.isBoss ? 500 : (monster.level * 20);

            visuals.addLog(`⚔️ Defeated Lvl ${monster.level} enemy! (+${xpGain} XP)`);

            // Loot
            const droppedItem = generateLoot(monster.level, monster.isBoss);
            if (droppedItem) {
                visuals.addLog(`📦 Found: ${droppedItem.name}`);
                setTimeout(() => visuals.showFloatText(playerPos.x, playerPos.y, 'ITEM GET!', '#e67e22'), 600);
            }

            // Stats & Level Up
            let statsAfterXp = processLevelUp(player, xpGain);

            if (droppedItem) {
                const currentInventory = statsAfterXp.updatedStats.inventory || [];
                statsAfterXp.updatedStats.inventory = [...currentInventory, droppedItem];
            }

            if (statsAfterXp.leveledUp) {
                visuals.addLog(`🎉 LEVEL UP! Level ${statsAfterXp.updatedStats.level}.`);
                setTimeout(() => visuals.showFloatText(playerPos.x, playerPos.y, 'LEVEL UP!', '#f1c40f'), 800);
            }

            setPlayer(statsAfterXp.updatedStats);
            removeMonster(monster.id);

            // Unlock state so player can move after kill
            setGameState('EXPLORATION');
            return;
        }

        // --- PHASE 2: MONSTER SURVIVED -> COUNTER ATTACK ---
        updateMonster(updatedMonster); // Save monster's new HP

        const monsterHit = calculateHit(monster, player);
        const newPlayerHp = player.hp - monsterHit.damage;

        // Visuals (Hit Player)
        if (monsterHit.damage > 0) {
            visuals.showFloatText(playerPos.x, playerPos.y, `-${monsterHit.damage}`, '#e74c3c');
            visuals.addLog(`👹 Enemy hits you for ${monsterHit.damage} dmg.`);
        } else {
            visuals.showFloatText(playerPos.x, playerPos.y, `BLOCK`, '#3498db');
            visuals.addLog(`🛡️ You blocked the enemy attack!`);
        }

        // --- CHECK: DID PLAYER DIE? ---
        if (newPlayerHp <= 0) {
            setPlayer(prev => ({ ...prev, hp: 0 }));
            setGameState('GAME_OVER');
            visuals.addLog("💀 You have been defeated!");
        } else {
            // Player lives
            setPlayer(prev => ({ ...prev, hp: newPlayerHp }));

            // --- CRITICAL FIX: UNLOCK STATE ---
            // We switch back to EXPLORATION so the player can input the next command.
            // If they press the arrow key towards the monster again, it triggers another combat round.
            // If they press away, they flee.
            setGameState('EXPLORATION');
        }

    }, [playerRef, positionRef, setPlayer, setGameState, removeMonster, updateMonster, visuals]);

    return { resolveCombat };
};