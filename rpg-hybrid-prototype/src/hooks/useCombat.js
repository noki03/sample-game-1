import { useCallback } from 'react';
import { calculateHit, processLevelUp } from '../utils/combatLogic';

export const useCombat = (playerRef, positionRef, setPlayer, setGameState, removeMonster, updateMonster, visuals) => {

    const resolveCombat = useCallback((monster) => {
        const player = playerRef.current;

        // 1. PLAYER ATTACKS MONSTER
        const hitResult = calculateHit(player, monster);
        let damage = hitResult.damage;

        // --- CHEAT CHECK: ONE HIT KILL ---
        if (player.isOneHitKill) {
            damage = 99999;
        }

        // Visuals
        if (hitResult.isMiss && !player.isOneHitKill) {
            visuals.showFloatText(monster.x, monster.y, "MISS", "#ccc");
            visuals.addLog(`You missed the ${monster.isBoss ? 'Dragon' : 'Monster'}.`);
        } else {
            const critText = hitResult.isCrit ? "CRIT! " : "";
            visuals.showFloatText(monster.x, monster.y, `${critText}${damage}`, hitResult.isCrit ? '#f1c40f' : '#fff');
            visuals.addLog(`You hit ${monster.isBoss ? 'Dragon' : 'Monster'} for ${damage} damage.`);
        }

        // 2. APPLY DAMAGE TO MONSTER
        const newMonsterHp = monster.hp - damage;

        if (newMonsterHp <= 0) {
            // MONSTER DIES
            removeMonster(monster.id);
            visuals.addLog(`💀 You killed the ${monster.isBoss ? 'Dragon' : 'Monster'}!`);

            const xpGain = monster.level * 10 * (monster.isBoss ? 5 : 1);
            const statsAfterXp = processLevelUp(player, xpGain);

            if (statsAfterXp.leveledUp) {
                visuals.showFloatText(positionRef.current.x, positionRef.current.y, "LEVEL UP!", "#f1c40f");
                visuals.addLog(`🎉 Level Up! You are now Level ${statsAfterXp.level}.`);
            } else {
                visuals.showFloatText(positionRef.current.x, positionRef.current.y, `+${xpGain} XP`, "#f1c40f");
            }

            setPlayer(prev => ({ ...prev, ...statsAfterXp.updatedStats }));

            if (monster.isBoss) {
                setGameState('WON');
            }

        } else {
            // MONSTER SURVIVES
            updateMonster({ ...monster, hp: newMonsterHp });
        }

    }, [playerRef, positionRef, setPlayer, setGameState, removeMonster, updateMonster, visuals]);

    return { resolveCombat };
};