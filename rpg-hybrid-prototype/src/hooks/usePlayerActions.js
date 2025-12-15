import { useCallback } from 'react';
import { generateDungeon, findRandomFloor } from '../utils/mapGenerator';

const MAP_WIDTH = 60;
const MAP_HEIGHT = 40;

export const usePlayerActions = (playerRef, positionRef, setPlayer, setPosition, setMap, setVisitedTiles, setMonsters, visuals, gameState) => {

    // --- HEAL SKILL ---
    const healPlayer = useCallback(() => {
        if (gameState !== 'EXPLORATION' && gameState !== 'COMBAT') return;

        const current = playerRef.current;
        const pos = positionRef.current;
        const currentTime = Date.now();

        // Check Cooldown
        const timeSinceLastHeal = currentTime - (current.lastHealTime || 0);
        const cooldown = current.healCooldown || 20000;

        if (timeSinceLastHeal < cooldown) {
            const secondsLeft = Math.ceil((cooldown - timeSinceLastHeal) / 1000);
            visuals.showFloatText(pos.x, pos.y, `${secondsLeft}s Wait`, '#95a5a6');
            return;
        }

        if (current.hp >= current.maxHp) {
            visuals.showFloatText(pos.x, pos.y, 'Full HP', '#fff');
            return;
        }

        // Perform Heal
        const healAmount = Math.floor(current.maxHp * 0.3);
        const newHp = Math.min(current.hp + healAmount, current.maxHp);
        const actualHeal = newHp - current.hp;

        setPlayer(prev => ({
            ...prev,
            hp: newHp,
            lastHealTime: currentTime
        }));

        visuals.showFloatText(pos.x, pos.y, `💚 +${actualHeal}`, '#2ecc71');
        visuals.addLog(`✨ Used Heal Skill. (+${actualHeal} HP)`);
    }, [gameState, visuals, playerRef, positionRef, setPlayer]);


    // --- STAIRS LOGIC ---
    const descendStairs = useCallback((currentMap) => {
        const currentPos = positionRef.current;

        if (currentMap[currentPos.y][currentPos.x] !== 3) {
            visuals.addLog("No stairs here.");
            return;
        }

        visuals.addLog("Descended to the next floor...");

        const newMap = generateDungeon(MAP_WIDTH, MAP_HEIGHT);
        setMap(newMap);
        setPlayer(prev => ({ ...prev, floor: (prev.floor || 1) + 1 }));

        const startPos = findRandomFloor(newMap);
        setPosition(startPos);
        setVisitedTiles(new Set([`${startPos.x},${startPos.y}`]));
        setMonsters([]); // Reset monsters for new floor

        visuals.showFloatText(startPos.x, startPos.y, "FLOOR " + ((playerRef.current.floor || 1) + 1), "#fff");

    }, [visuals, playerRef, positionRef, setMap, setPlayer, setPosition, setVisitedTiles, setMonsters]);

    return { healPlayer, descendStairs };
};