import { useCallback } from 'react';
import { calculateHit, processLevelUp } from '../utils/combatLogic';
import { generateLoot } from '../utils/itemGenerator';

export const useCombat = (playerRef, positionRef, setPlayer, setGameState, removeMonster, updateMonster, visuals) => {

    const resolveCombat = useCallback((monster) => {
        const player = playerRef.current;

        // --- 1. ATTACK CALCULATION ---
        // (Assumes calculateHit already handles damage variance/randomness)
        const hitResult = calculateHit(player, monster);
        let damage = hitResult.damage;

        // Cheat check
        if (player.isOneHitKill) damage = 99999;

        // Visual Feedback
        if (hitResult.isMiss && !player.isOneHitKill) {
            visuals.showFloatText(monster.x, monster.y, "MISS", "#ccc");
            visuals.addLog(`You missed the ${monster.isBoss ? 'Dragon' : 'Monster'}.`);
        } else {
            const critText = hitResult.isCrit ? "CRIT! " : "";
            visuals.showFloatText(monster.x, monster.y, `${critText}${damage}`, hitResult.isCrit ? '#f1c40f' : '#fff');
            visuals.addLog(`You hit ${monster.isBoss ? 'Dragon' : 'Monster'} for ${damage} damage.`);
        }

        // --- 2. APPLY DAMAGE ---
        const newMonsterHp = monster.hp - damage;

        if (newMonsterHp <= 0) {
            // ====== MONSTER DEATH ======
            removeMonster(monster.id);
            visuals.addLog(`💀 You killed the ${monster.isBoss ? 'Dragon' : 'Monster'}!`);

            // --- A. XP LOGIC (With Level Gaps) ---
            const baseXp = monster.level * 10;
            const diff = player.level - monster.level;
            let multiplier = 1.0;

            // Calculate Multiplier based on Level Gap
            if (diff > 0) {
                // Player is stronger
                if (diff <= 2) multiplier = 1.0;
                else if (diff <= 4) multiplier = 0.5;
                else multiplier = 0.1;
            } else if (diff < 0) {
                // Player is weaker
                const absDiff = Math.abs(diff);
                if (absDiff <= 3) multiplier = 1.1;
                else if (absDiff <= 5) multiplier = 1.2;
                else multiplier = 0.5; // Anti-Exploit cap
            }

            const variance = Math.floor(Math.random() * (baseXp * 0.2)) - (baseXp * 0.1);
            let xpGain = Math.floor((baseXp + variance) * multiplier);
            if (monster.isBoss) xpGain = xpGain * 5;
            if (xpGain < 1) xpGain = 1;

            visuals.addLog(`✨ Gained +${xpGain} XP`);

            // --- B. LOOT DROP LOGIC ---
            let droppedItem = null;
            // Boss always drops, Normal mobs 30% chance
            if (monster.isBoss || Math.random() < 0.3) {
                droppedItem = generateLoot(monster.level);
                visuals.addLog(`🎁 Looted: ${droppedItem.name}`);
                visuals.showFloatText(monster.x, monster.y, "ITEM!", droppedItem.color);
            }

            // --- C. PROCESS LEVEL UP ---
            const statsAfterXp = processLevelUp(player, xpGain);

            if (statsAfterXp.leveledUp) {
                visuals.showFloatText(positionRef.current.x, positionRef.current.y, "LEVEL UP!", "#f1c40f");
                visuals.addLog(`🎉 Level Up! You are now Level ${statsAfterXp.level}.`);
            } else {
                visuals.showFloatText(positionRef.current.x, positionRef.current.y, `+${xpGain} XP`, "#f1c40f");
            }

            // --- D. UPDATE PLAYER STATE (SAFE MERGE) ---
            setPlayer(prev => {
                // 1. Get the new stats (HP, Level, XP)
                const newState = { ...prev, ...statsAfterXp.updatedStats };

                // 2. Add the item if one dropped
                if (droppedItem) {
                    // Ensure we use the latest inventory from 'prev'
                    newState.inventory = [...(prev.inventory || []), droppedItem];
                }

                return newState;
            });

            // --- E. WIN CONDITION ---
            if (monster.isBoss) {
                setGameState('WON');
            }

        } else {
            // ====== MONSTER SURVIVED ======
            updateMonster({ ...monster, hp: newMonsterHp });
        }

    }, [playerRef, positionRef, setPlayer, setGameState, removeMonster, updateMonster, visuals]);

    return { resolveCombat };
};