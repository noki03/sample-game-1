import { useState, useCallback, useEffect, useRef } from 'react';
import { initialStats } from '../data/initialStats';
import { initialMap, findPlayerStart } from '../data/initialMap';
import { useMonsterManager } from './useMonsterManager';
import { useCheatCodes } from './useCheatCodes';
import { useVisuals } from './useVisuals';
import { useCombat } from './useCombat';
import { saveGameState, loadGameState, clearGameState } from '../db';

const HEAL_AMOUNT = 50;
const initialPlayerPos = findPlayerStart(initialMap);

export const useGameLogic = () => {
    // --- LOADING STATE ---
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // --- CORE STATE ---
    const [player, setPlayer] = useState(initialStats);
    const [position, setPosition] = useState(initialPlayerPos);
    const [map] = useState(initialMap);
    const [gameState, setGameState] = useState('EXPLORATION');
    const [isFogEnabled, setIsFogEnabled] = useState(true);

    // --- INVENTORY STATE ---
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);

    const [loadedMonsters, setLoadedMonsters] = useState(null);

    // --- 1. INITIAL LOAD EFFECT ---
    useEffect(() => {
        const initGame = async () => {
            const savedData = await loadGameState();

            if (savedData) {
                console.log("Save found, loading...");
                // MIGRATION SAFEGUARD
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
            } else {
                console.log("No save found, starting new game.");
            }

            setIsDataLoaded(true);
        };

        initGame();
    }, []);

    // --- 2. REFS ---
    const playerRef = useRef(player);
    const positionRef = useRef(position);
    useEffect(() => {
        playerRef.current = player;
        positionRef.current = position;
    }, [player, position]);

    // --- 3. SUB-HOOKS ---
    const visuals = useVisuals();

    const { monsters, setMonsters, removeMonster } = useMonsterManager(
        map,
        position,
        player.level,
        gameState,
        visuals.addLog,
        loadedMonsters
    );

    const { resolveCombat } = useCombat(playerRef, positionRef, setPlayer, setGameState, removeMonster, visuals);

    useCheatCodes(player, setPlayer, visuals.addLog);

    // --- 4. AUTO-SAVE EFFECT ---
    useEffect(() => {
        if (!isDataLoaded) return;

        const saveData = async () => {
            await saveGameState({
                player,
                position,
                monsters,
                gameState,
                isFogEnabled
            });
        };

        const timeoutId = setTimeout(saveData, 500);
        return () => clearTimeout(timeoutId);

    }, [player, position, monsters, gameState, isFogEnabled, isDataLoaded]);


    // --- ACTIONS ---

    const toggleFog = useCallback(() => setIsFogEnabled(p => !p), []);
    const toggleInventory = useCallback(() => setIsInventoryOpen(p => !p), []);

    const resetGame = useCallback(async () => {
        await clearGameState();
        setPlayer(initialStats);
        setPosition(findPlayerStart(initialMap));
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
            if (oldItem) {
                newInventory.push(oldItem);
            }

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
                equipment: {
                    ...currentEquipment,
                    [type]: item
                },
                attack: newAttack,
                defense: newDefense
            };
        });
    }, []);

    // --- NEW: UNEQUIP ITEM LOGIC ---
    const unequipItem = useCallback((type) => { // type = 'weapon' or 'armor'
        setPlayer(prev => {
            const currentEquipment = prev.equipment || { weapon: null, armor: null };
            const itemToUnequip = currentEquipment[type];

            if (!itemToUnequip) return prev; // Nothing to unequip

            // 1. Add back to inventory
            const newInventory = [...(prev.inventory || []), itemToUnequip];

            // 2. Remove stats
            let newAttack = prev.attack;
            let newDefense = prev.defense;

            if (type === 'weapon') {
                newAttack -= itemToUnequip.bonus;
            } else if (type === 'armor') {
                newDefense -= itemToUnequip.bonus;
            }

            return {
                ...prev,
                inventory: newInventory,
                equipment: {
                    ...currentEquipment,
                    [type]: null // Clear slot
                },
                attack: newAttack,
                defense: newDefense
            };
        });
    }, []);
    // ------------------------------

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
            visuals.addLog('Ouch! Hit the map boundary.');
            return;
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

    if (!isDataLoaded) {
        return { isLoading: true };
    }

    return {
        isLoading: false,
        player,
        position,
        map,
        gameState,
        monsters,
        isFogEnabled,
        // Inventory Exports
        isInventoryOpen,
        toggleInventory,
        equipItem,
        unequipItem, // <-- NEW EXPORT

        toggleFog,
        handleKeyDown,
        resetGame,

        log: visuals.log,
        floatingTexts: visuals.floatingTexts,
        hitTargetId: visuals.hitTargetId
    };
};