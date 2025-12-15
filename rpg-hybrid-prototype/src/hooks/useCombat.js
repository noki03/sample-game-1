import { useCallback } from 'react';
import { calculateHit, processLevelUp } from '../utils/combatLogic';
import { generateLoot, generateBossLoot } from '../utils/itemGenerator';
import { addToInventory } from '../utils/inventoryUtils'; // <-- IMPORT THIS

export const useCombat = (playerRef, positionRef, setPlayer, setGameState, removeMonster, updateMonster, visuals) => {

    const resolveCombat = useCallback((monster) => {
        const player = playerRef.current;

        // --- 1. ATTACK CALCULATION ---
        const hitResult = calculateHit(player, monster);
        let damage = hitResult.damage;
        if (player.isOneHitKill) damage = 99999;

        // Visuals
        if (hitResult.isMiss && !player.isOneHitKill) {
            visuals.showFloatText(monster.x, monster.y, "MISS", "#ccc");
            visuals.addLog(`You missed the ${monster.isBoss ? 'Dragon' : 'Monster'}.`);
        } else {
            const critText = hitResult.isCrit ? "CRIT! " : "";
            visuals.showFloatText(monster.x, monster.y, `${critText}${damage}`, hitResult.isCrit ? '#f1c40f' : '#fff');
            visuals.addLog(`You hit ${monster.isBoss ? 'Dragon' : 'Monster'} for ${damage} damage.`);
        }

        // --- 2. DAMAGE ---
        const newMonsterHp = monster.hp - damage;

        if (newMonsterHp <= 0) {
            // ====== DEATH ======
            removeMonster(monster.id);

            if (monster.isBoss) {
                visuals.addLog(`🔥 LEGENDARY VICTORY! The ${monster.name} has fallen!`);
                visuals.showFloatText(monster.x, monster.y, "BOSS SLAIN", "#e74c3c");
            } else {
                visuals.addLog(`💀 You killed the Monster!`);
            }

            // --- A. XP LOGIC ---
            const baseXp = monster.level * 10;
            const diff = player.level - monster.level;
            let multiplier = 1.0;
            if (diff > 0) {
                if (diff <= 2) multiplier = 1.0; else if (diff <= 4) multiplier = 0.5; else multiplier = 0.1;
            } else if (diff < 0) {
                const absDiff = Math.abs(diff);
                if (absDiff <= 3) multiplier = 1.1; else if (absDiff <= 5) multiplier = 1.2; else multiplier = 0.5;
            }
            const xpVariance = Math.floor(Math.random() * (baseXp * 0.2)) - (baseXp * 0.1);
            let xpGain = Math.floor((baseXp + xpVariance) * multiplier);
            if (monster.isBoss) xpGain = xpGain * 10;
            if (xpGain < 1) xpGain = 1;
            visuals.addLog(`✨ Gained +${xpGain} XP`);

            // --- B. GOLD DROP ---
            let goldDrop = (monster.level * 5) + Math.floor(Math.random() * 10);
            if (monster.isBoss) goldDrop *= 20;
            visuals.addLog(`🥮 Found ${goldDrop} Gold`);
            visuals.showFloatText(monster.x, monster.y, `+${goldDrop} G`, '#f1c40f');

            // --- C. LOOT DROP (Stacks) ---
            let droppedItem = null;
            if (monster.isBoss) {
                droppedItem = generateBossLoot(monster.level);
                visuals.addLog(`🎁 BOSS DROP: ${droppedItem.name}`);
                visuals.showFloatText(monster.x, monster.y, "MYTHIC!", droppedItem.color);
            } else if (Math.random() < 0.3) {
                droppedItem = generateLoot(monster.level);
                visuals.addLog(`🎁 Looted: ${droppedItem.name}`);
                visuals.showFloatText(monster.x, monster.y, "ITEM!", droppedItem.color);
            }

            // --- D. LEVEL UP ---
            const statsAfterXp = processLevelUp(player, xpGain);
            if (statsAfterXp.leveledUp) {
                visuals.showFloatText(positionRef.current.x, positionRef.current.y, "LEVEL UP!", "#f1c40f");
                visuals.addLog(`🎉 Level Up! You are now Level ${statsAfterXp.level}.`);
            } else {
                visuals.showFloatText(positionRef.current.x, positionRef.current.y, `+${xpGain} XP`, "#3498db");
            }

            // --- E. UPDATE STATE ---
            setPlayer(prev => {
                const newState = { ...prev, ...statsAfterXp.updatedStats };
                newState.gold = (prev.gold || 0) + goldDrop;

                if (droppedItem) {
                    // STACKING LOGIC APPLIED HERE
                    newState.inventory = addToInventory((prev.inventory || []), droppedItem);
                }
                return newState;
            });

        } else {
            updateMonster({ ...monster, hp: newMonsterHp });
        }

    }, [playerRef, positionRef, setPlayer, setGameState, removeMonster, updateMonster, visuals]);

    return { resolveCombat };
};