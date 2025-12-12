import { useState, useCallback, useEffect, useRef } from 'react';
import { initialStats } from '../data/initialStats';
import { generateDungeon, findRandomFloor } from '../utils/mapGenerator';
import { useMonsterManager } from './useMonsterManager';
import { useCheatCodes } from './useCheatCodes';
import { useVisuals } from './useVisuals';
import { useCombat } from './useCombat';
import { saveGameState, loadGameState, clearGameState } from '../db';

const HEAL_AMOUNT = 50;

// --- NEW MAP DIMENSIONS (Huge!) ---
const MAP_WIDTH = 60;
const MAP_HEIGHT = 40;

export const useGameLogic = () => {
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const [player, setPlayer] = useState(initialStats);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [map, setMap] = useState(() => generateDungeon(MAP_WIDTH, MAP_HEIGHT));

    const [gameState, setGameState] = useState('EXPLORATION');
    const [isFogEnabled, setIsFogEnabled] = useState(true);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [loadedMonsters, setLoadedMonsters] = useState(null);

    // --- 1. INITIAL LOAD ---
    useEffect(() => {
        const initGame = async () => {
            const savedData = await loadGameState();

            if (savedData) {
                console.log("Save found, loading...");
                const safePlayer = {
                    ...initialStats,
                    ...savedData.player,
                    inventory: savedData.player.inventory || [],
                    equipment: savedData.player.equipment || { weapon: null, armor: null }
                };

                setPlayer(safePlayer);
                setPosition(savedData.position);
                setGameState(savedData.gameState);
                setIsFogEnabled(savedData.isFogEnabled);
                setLoadedMonsters(savedData.monsters);

                if (savedData.map) {
                    setMap(savedData.map);
                }
            } else {
                console.log("No save found, setting up new game.");
                const newMap = generateDungeon(MAP_WIDTH, MAP_HEIGHT);
                setMap(newMap);
                setPosition(findRandomFloor(newMap));
            }

            setIsDataLoaded(true);
        };

        initGame();
    }, []);

    const playerRef = useRef(player);
    const positionRef = useRef(position);
    useEffect(() => {
        playerRef.current = player;
        positionRef.current = position;
    }, [player, position]);

    const visuals = useVisuals();

    const { monsters, setMonsters, removeMonster } = useMonsterManager(
        map, position, player.level, gameState, visuals.addLog, loadedMonsters
    );

    const { resolveCombat } = useCombat(playerRef, positionRef, setPlayer, setGameState, removeMonster, visuals);

    useCheatCodes(player, setPlayer, visuals.addLog);

    // --- AUTO-SAVE ---
    useEffect(() => {
        if (!isDataLoaded) return;

        const saveData = async () => {
            await saveGameState({
                player,
                position,
                monsters,
                gameState,
                isFogEnabled,
                map
            });
        };

        const timeoutId = setTimeout(saveData, 500);
        return () => clearTimeout(timeoutId);

    }, [player, position, monsters, gameState, isFogEnabled, map, isDataLoaded]);

    // --- ACTIONS ---
    const toggleFog = useCallback(() => setIsFogEnabled(p => !p), []);
    const toggleInventory = useCallback(() => setIsInventoryOpen(p => !p), []);

    const resetGame = useCallback(async () => {
        await clearGameState();

        // Generate fresh HUGE map
        const newMap = generateDungeon(MAP_WIDTH, MAP_HEIGHT);

        setMap(newMap);
        setPlayer(initialStats);
        setPosition(findRandomFloor(newMap));
        setGameState('EXPLORATION');
        setMonsters([]);
        visuals.resetVisuals();
    }, [setMonsters, visuals]);

    const equipItem = useCallback((item) => {
        setPlayer(prev => {
            const currentEquipment = prev.equipment || { weapon: null, armor: null };
            const currentInventory = prev.inventory || [];
            const type = item.type;
            const oldItem = currentEquipment[type];
            const newInventory = currentInventory.filter(i => i.uid !== item.uid);
            if (oldItem) newInventory.push(oldItem);

            let newAttack = prev.attack;
            let newDefense = prev.defense;

            if (type === 'weapon') {
                const oldBonus = oldItem?.bonus || 0;
                newAttack = (newAttack - oldBonus) + item.bonus;
            } else if (type === 'armor') {
                const oldBonus = oldItem?.bonus || 0;
                newDefense = (newDefense - oldBonus) + item.bonus;
            }

            return {
                ...prev,
                inventory: newInventory,
                equipment: { ...currentEquipment, [type]: item },
                attack: newAttack,
                defense: newDefense
            };
        });
    }, []);

    const unequipItem = useCallback((type) => {
        setPlayer(prev => {
            const currentEquipment = prev.equipment || { weapon: null, armor: null };
            const itemToUnequip = currentEquipment[type];
            if (!itemToUnequip) return prev;

            const newInventory = [...(prev.inventory || []), itemToUnequip];
            let newAttack = prev.attack;
            let newDefense = prev.defense;

            if (type === 'weapon') newAttack -= itemToUnequip.bonus;
            else if (type === 'armor') newDefense -= itemToUnequip.bonus;

            return {
                ...prev,
                inventory: newInventory,
                equipment: { ...currentEquipment, [type]: null },
                attack: newAttack,
                defense: newDefense
            };
        });
    }, []);

    const healPlayer = useCallback(() => {
        if (gameState !== 'EXPLORATION' && gameState !== 'COMBAT') return;
        const current = playerRef.current;
        const pos = positionRef.current;

        if (current.potions <= 0) {
            visuals.showFloatText(pos.x, pos.y, 'NO POTIONS!', '#e74c3c');
            visuals.addLog("No potions left!");
            return;
        }
        if (current.hp >= current.maxHp) {
            visuals.showFloatText(pos.x, pos.y, 'FULL HP', '#fff');
            visuals.addLog("HP is already full.");
            return;
        }

        const newHp = Math.min(current.hp + HEAL_AMOUNT, current.maxHp);
        const actualHeal = newHp - current.hp;

        visuals.showFloatText(pos.x, pos.y, `🧪 +${actualHeal}`, '#2ecc71');
        visuals.addLog(`🧪 Used potion. HP: ${newHp}/${current.maxHp}`);
        setPlayer(prev => ({ ...prev, hp: newHp, potions: prev.potions - 1 }));
    }, [gameState, visuals]);

    const movePlayer = useCallback((dx, dy) => {
        if (gameState !== 'EXPLORATION') return;

        const newX = position.x + dx;
        const newY = position.y + dy;

        if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) {
            // No log needed for map boundary in large maps usually, just don't move
            return;
        }

        // CHECK WALL COLLISION (1 = Wall)
        if (map[newY][newX] === 1) {
            return; // Just stop silently
        }

        const encounteredMonster = monsters.find(m => m.x === newX && m.y === newY);

        if (encounteredMonster) {
            setGameState('COMBAT');
            resolveCombat(encounteredMonster);
            return;
        }

        setPosition({ x: newX, y: newY });
    }, [position, map, gameState, monsters, resolveCombat, visuals]);

    const handleKeyDown = useCallback((e) => {
        if (gameState === 'GAME_OVER') {
            if (e.key.toUpperCase() === 'R') resetGame();
            return;
        }

        switch (e.key.toUpperCase()) {
            case 'W': if (!isInventoryOpen) movePlayer(0, -1); break;
            case 'S': if (!isInventoryOpen) movePlayer(0, 1); break;
            case 'A': if (!isInventoryOpen) movePlayer(-1, 0); break;
            case 'D': if (!isInventoryOpen) movePlayer(1, 0); break;
            case 'H': healPlayer(); break;
            case 'F': toggleFog(); break;
            case 'I': toggleInventory(); break;
            case 'ESCAPE': setIsInventoryOpen(false); break;
            default: return;
        }
        e.preventDefault();
    }, [movePlayer, healPlayer, toggleFog, toggleInventory, isInventoryOpen, gameState, resetGame]);

    if (!isDataLoaded) return { isLoading: true };

    return {
        isLoading: false,
        player, position, map, gameState, monsters, isFogEnabled,
        isInventoryOpen, toggleInventory, equipItem, unequipItem,
        toggleFog, handleKeyDown, resetGame,
        log: visuals.log, floatingTexts: visuals.floatingTexts, hitTargetId: visuals.hitTargetId
    };
};