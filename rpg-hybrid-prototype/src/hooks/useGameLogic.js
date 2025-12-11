import { useState, useCallback, useEffect, useRef } from 'react';
import { initialStats } from '../data/initialStats';
import { initialMap, findPlayerStart } from '../data/initialMap';
import { useMonsterManager } from './useMonsterManager';
import { calculateCombatResult, processLevelUp } from '../utils/combatLogic';
import { useCheatCodes } from './useCheatCodes';

const HEAL_AMOUNT = 50;
const initialPlayerPos = findPlayerStart(initialMap);

export const useGameLogic = () => {
    // --- STATE ---
    const [player, setPlayer] = useState(initialStats);
    const [position, setPosition] = useState(initialPlayerPos);
    const [map] = useState(initialMap);
    const [log, setLog] = useState([
        'Welcome to the Minimal RPG!',
        'Monsters now have random Levels!',
        'Reach Level 5 to defeat the Dragon! 🐉',
        'Use W, A, S, D to move.',
        'Dev Mode: Shift+L (Lvl Up), Shift+P (Potions)'
    ]);
    const [gameState, setGameState] = useState('EXPLORATION');
    const [isFogEnabled, setIsFogEnabled] = useState(true);

    // --- ACTIONS ---
    const addLog = useCallback((message) => {
        setLog(prevLog => {
            const newLog = [...prevLog, `[${new Date().toLocaleTimeString()}] ${message}`];
            return newLog.slice(-10);
        });
    }, []);

    // --- SUB-HOOK: MONSTER MANAGEMENT ---
    // Updated: Now passing player.level
    const { monsters, setMonsters, removeMonster } = useMonsterManager(map, position, player.level, gameState, addLog);

    // 2. ACTIVATE CHEAT CODES
    useCheatCodes(player, setPlayer, addLog);

    // --- REFS ---
    const playerRef = useRef(player);
    useEffect(() => { playerRef.current = player; }, [player]);

    // --- GAMEPLAY ACTIONS ---
    const toggleFog = useCallback(() => setIsFogEnabled(p => !p), []);

    const healPlayer = useCallback(() => {
        if (gameState !== 'EXPLORATION' && gameState !== 'COMBAT') return;
        const current = playerRef.current;

        if (current.potions <= 0) { addLog("No potions left!"); return; }
        if (current.hp >= current.maxHp) { addLog("HP is already full."); return; }

        const newHp = Math.min(current.hp + HEAL_AMOUNT, current.maxHp);
        addLog(`🧪 Used potion. HP: ${newHp}/${current.maxHp}`);
        setPlayer(prev => ({ ...prev, hp: newHp, potions: prev.potions - 1 }));
    }, [gameState, addLog]);

    // --- RESET LOGIC ---
    const resetGame = useCallback(() => {
        setPlayer(initialStats);
        setPosition(findPlayerStart(initialMap));
        setGameState('EXPLORATION');
        setLog(['Game Restarted.', 'Good luck! 🍀']);
        setMonsters([]);
    }, [setMonsters]);

    // --- CORE MOVEMENT & COMBAT ORCHESTRATION ---
    const movePlayer = useCallback((dx, dy) => {
        if (gameState !== 'EXPLORATION') return;

        const newX = position.x + dx;
        const newY = position.y + dy;

        if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) {
            addLog('Ouch! Hit the map boundary.');
            return;
        }

        const encounteredMonster = monsters.find(m => m.x === newX && m.y === newY);

        if (encounteredMonster) {
            setGameState('COMBAT');

            const monsterName = encounteredMonster.isBoss
                ? '🐉 DRAGON'
                : `👹 Lvl ${encounteredMonster.level} Monster`;

            addLog(`Encounter: ${monsterName}!`);

            setTimeout(() => {
                const currentStats = playerRef.current;

                // A. Calculate Outcome
                const result = calculateCombatResult(currentStats, encounteredMonster);
                addLog(result.message);

                // B. Handle Game Over
                if (result.outcome === 'GAME_OVER') {
                    setGameState('GAME_OVER');
                    setPlayer(prev => ({ ...prev, hp: 0 }));
                    return;
                }

                // C. Handle Fleeing
                if (result.outcome === 'FLED') {
                    setGameState('EXPLORATION');
                    setPlayer(prev => ({ ...prev, hp: result.newHp }));
                    return;
                }

                // D. Handle Victory
                setGameState('EXPLORATION');

                // Use the dynamic XP calculated in utility
                let xpGain = result.xpYield;

                if (result.outcome === 'VICTORY_BOSS') {
                    addLog(`✨ Gained ${xpGain} XP and 3 Potions!`);
                } else {
                    addLog(`+${xpGain} XP`);
                }

                let statsAfterXp = processLevelUp({ ...currentStats, hp: result.newHp }, xpGain);

                // Loot logic
                if (Math.random() > 0.7 || result.outcome === 'VICTORY_BOSS') {
                    const lootAmount = result.outcome === 'VICTORY_BOSS' ? 3 : 1;
                    statsAfterXp.updatedStats.potions += lootAmount;
                    if (result.outcome !== 'VICTORY_BOSS') addLog("✨ Found a Potion!");
                }

                if (statsAfterXp.leveledUp) {
                    addLog(`🎉 LEVEL UP! Level ${statsAfterXp.updatedStats.level}.`);
                }

                setPlayer(statsAfterXp.updatedStats);
                removeMonster(encounteredMonster.id);

            }, 1000);
            return;
        }

        setPosition({ x: newX, y: newY });
    }, [position, map, gameState, addLog, monsters, removeMonster]);

    // --- INPUT HANDLING ---
    const handleKeyDown = useCallback((e) => {
        if (gameState === 'GAME_OVER') {
            if (e.key.toUpperCase() === 'R') resetGame();
            return;
        }

        switch (e.key.toUpperCase()) {
            case 'W': movePlayer(0, -1); break;
            case 'S': movePlayer(0, 1); break;
            case 'A': movePlayer(-1, 0); break;
            case 'D': movePlayer(1, 0); break;
            case 'H': healPlayer(); break;
            case 'F': toggleFog(); break;
            default: return;
        }
        e.preventDefault();
    }, [movePlayer, healPlayer, toggleFog, gameState, resetGame]);

    return {
        player, position, map, log, gameState, monsters,
        isFogEnabled, toggleFog, handleKeyDown, resetGame
    };
};