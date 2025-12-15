import { useState, useCallback, useEffect, useRef } from 'react';
import { initialStats } from '../data/initialStats';
import { generateDungeon, findRandomFloor } from '../utils/mapGenerator';
import { useMonsterManager } from './useMonsterManager';
import { useCheatCodes } from './useCheatCodes';
import { useVisuals } from './useVisuals';
import { useCombat } from './useCombat';
import { saveGameState, loadGameState, clearGameState } from '../db';

const MAP_WIDTH = 60;
const MAP_HEIGHT = 40;
const VISIBILITY_RADIUS = 8;

export const useGameLogic = () => {
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // --- GAME STATE ---
    const [player, setPlayer] = useState(initialStats);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [map, setMap] = useState(() => generateDungeon(MAP_WIDTH, MAP_HEIGHT));
    const [visitedTiles, setVisitedTiles] = useState(new Set());

    const [gameState, setGameState] = useState('EXPLORATION'); // 'EXPLORATION', 'COMBAT', 'GAME_OVER'
    const [isFogEnabled, setIsFogEnabled] = useState(true);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [loadedMonsters, setLoadedMonsters] = useState(null);

    // Input throttling ref
    const lastActionTimeRef = useRef(0);

    // Force update for UI timers (like Heal Cooldown)
    const [, setTick] = useState(0);

    // --- 1. INITIAL LOAD & SAVE SYSTEM ---
    useEffect(() => {
        const initGame = async () => {
            const savedData = await loadGameState();

            if (savedData) {
                console.log("Save found, loading...");
                const safePlayer = {
                    ...initialStats,
                    ...savedData.player,
                    // Ensure compatibility with old saves
                    speed: savedData.player.speed || initialStats.speed,
                    floor: savedData.player.floor || 1,
                    lastHealTime: savedData.player.lastHealTime || 0,
                    healCooldown: savedData.player.healCooldown || 20000,
                    inventory: savedData.player.inventory || [],
                    equipment: savedData.player.equipment || { weapon: null, armor: null }
                };

                setPlayer(safePlayer);
                setPosition(savedData.position);
                setGameState(savedData.gameState);
                setIsFogEnabled(savedData.isFogEnabled);
                setLoadedMonsters(savedData.monsters);

                if (savedData.map) setMap(savedData.map);
                if (savedData.visitedTiles) setVisitedTiles(new Set(savedData.visitedTiles));
            } else {
                console.log("No save found, setting up new game.");
                const newMap = generateDungeon(MAP_WIDTH, MAP_HEIGHT);
                setMap(newMap);
                const startPos = findRandomFloor(newMap);
                setPosition(startPos);
                setVisitedTiles(new Set([`${startPos.x},${startPos.y}`]));
            }

            setIsDataLoaded(true);
        };

        initGame();
    }, []);

    // Timer loop for UI updates
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Refs for callbacks
    const playerRef = useRef(player);
    const positionRef = useRef(position);
    useEffect(() => {
        playerRef.current = player;
        positionRef.current = position;
    }, [player, position]);

    // --- 2. VISITED TILES LOGIC ---
    const updateVisited = useCallback((pos) => {
        setVisitedTiles(prev => {
            const newSet = new Set(prev);
            for (let y = pos.y - VISIBILITY_RADIUS; y <= pos.y + VISIBILITY_RADIUS; y++) {
                for (let x = pos.x - VISIBILITY_RADIUS; x <= pos.x + VISIBILITY_RADIUS; x++) {
                    const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                    if (dist < VISIBILITY_RADIUS) {
                        newSet.add(`${x},${y}`);
                    }
                }
            }
            return newSet;
        });
    }, []);

    useEffect(() => {
        if (isDataLoaded) updateVisited(position);
    }, [position, isDataLoaded, updateVisited]);

    const visuals = useVisuals();

    // --- 3. MONSTERS & COMBAT ---
    const { monsters, setMonsters, removeMonster, updateMonster } = useMonsterManager(
        map,
        position,
        player.level,
        player.floor, // Pass floor for scaling
        gameState,
        visuals.addLog,
        loadedMonsters
    );

    const { resolveCombat } = useCombat(
        playerRef,
        positionRef,
        setPlayer,
        setGameState,
        removeMonster,
        updateMonster,
        visuals
    );

    useCheatCodes(player, setPlayer, visuals.addLog);

    // --- 4. AUTO-SAVE ---
    useEffect(() => {
        if (!isDataLoaded) return;

        const saveData = async () => {
            await saveGameState({
                player, position, monsters, gameState, isFogEnabled, map,
                visitedTiles: Array.from(visitedTiles)
            });
        };

        const timeoutId = setTimeout(saveData, 500);
        return () => clearTimeout(timeoutId);

    }, [player, position, monsters, gameState, isFogEnabled, map, visitedTiles, isDataLoaded]);

    // --- 5. CORE ACTIONS ---
    const toggleFog = useCallback(() => setIsFogEnabled(p => !p), []);
    const toggleInventory = useCallback(() => setIsInventoryOpen(p => !p), []);

    const resetGame = useCallback(async () => {
        await clearGameState();

        const newMap = generateDungeon(MAP_WIDTH, MAP_HEIGHT);
        const startPos = findRandomFloor(newMap);

        setMap(newMap);
        setPlayer(initialStats);
        setPosition(startPos);
        setGameState('EXPLORATION');
        setMonsters([]);
        setVisitedTiles(new Set([`${startPos.x},${startPos.y}`]));
        visuals.resetVisuals();
        lastActionTimeRef.current = 0;
    }, [setMonsters, visuals]);

    // --- STAIRS: DESCEND LOGIC ---
    const descendStairs = useCallback(() => {
        const currentPos = positionRef.current;
        // Check if player is on Stairs (Type 3)
        if (map[currentPos.y][currentPos.x] !== 3) {
            visuals.addLog("No stairs here.");
            return;
        }

        visuals.addLog("Descended to the next floor...");

        // 1. Generate New Map
        const newMap = generateDungeon(MAP_WIDTH, MAP_HEIGHT);
        setMap(newMap);

        // 2. Increment Floor
        setPlayer(prev => ({ ...prev, floor: (prev.floor || 1) + 1 }));

        // 3. Reset Position
        const startPos = findRandomFloor(newMap);
        setPosition(startPos);

        // 4. Reset Visited Memory
        setVisitedTiles(new Set([`${startPos.x},${startPos.y}`]));

        // 5. Clear Monsters (Manager will auto-spawn new ones based on new level/floor)
        setMonsters([]);

        visuals.showFloatText(startPos.x, startPos.y, "FLOOR " + ((player.floor || 1) + 1), "#fff");

    }, [map, player.floor, setMonsters, visuals]);

    // --- EQUIPMENT LOGIC ---
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
            let newSpeed = prev.speed;
            const getItemBonus = (itm) => itm ? itm.bonus : 0;

            if (type === 'weapon') {
                newAttack = (newAttack - getItemBonus(oldItem)) + item.bonus;
            } else if (type === 'armor') {
                newDefense = (newDefense - getItemBonus(oldItem)) + item.bonus;
            }

            return {
                ...prev,
                inventory: newInventory,
                equipment: { ...currentEquipment, [type]: item },
                attack: newAttack,
                defense: newDefense,
                speed: newSpeed
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

    // --- HEAL SKILL LOGIC (COOLDOWN BASED) ---
    const healPlayer = useCallback(() => {
        if (gameState !== 'EXPLORATION' && gameState !== 'COMBAT') return;

        const current = playerRef.current;
        const pos = positionRef.current;
        const currentTime = Date.now();

        // 1. Check Cooldown
        const timeSinceLastHeal = currentTime - (current.lastHealTime || 0);
        const cooldown = current.healCooldown || 20000;

        if (timeSinceLastHeal < cooldown) {
            const secondsLeft = Math.ceil((cooldown - timeSinceLastHeal) / 1000);
            visuals.showFloatText(pos.x, pos.y, `${secondsLeft}s Wait`, '#95a5a6');
            return;
        }

        // 2. Check Full HP
        if (current.hp >= current.maxHp) {
            visuals.showFloatText(pos.x, pos.y, 'Full HP', '#fff');
            return;
        }

        // 3. Perform Heal (30% Max HP)
        const healAmount = Math.floor(current.maxHp * 0.3);
        const newHp = Math.min(current.hp + healAmount, current.maxHp);
        const actualHeal = newHp - current.hp;

        setPlayer(prev => ({
            ...prev,
            hp: newHp,
            lastHealTime: currentTime // Reset cooldown
        }));

        visuals.showFloatText(pos.x, pos.y, `💚 +${actualHeal}`, '#2ecc71');
        visuals.addLog(`✨ Used Heal Skill. (+${actualHeal} HP)`);
    }, [gameState, visuals]);

    const movePlayer = useCallback((dx, dy) => {
        if (gameState !== 'EXPLORATION') return;

        const newX = position.x + dx;
        const newY = position.y + dy;

        if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) return;
        if (map[newY][newX] === 1) return; // Wall collision

        const encounteredMonster = monsters.find(m => m.x === newX && m.y === newY);

        if (encounteredMonster) {
            setGameState('COMBAT');
            resolveCombat(encounteredMonster);
            return;
        }

        // Check for Stairs Feedback (Does not descend automatically)
        if (map[newY][newX] === 3) {
            visuals.addLog("You see stairs going down. Press [SPACE] to descend.");
        }

        setPosition({ x: newX, y: newY });
    }, [position, map, gameState, monsters, resolveCombat, visuals]);

    // --- 6. INPUT HANDLING ---
    const handleKeyDown = useCallback((e) => {
        if (gameState === 'GAME_OVER') {
            if (e.key.toUpperCase() === 'R') resetGame();
            return;
        }

        // --- TUNED SPEED CALCULATION ---
        // Start snappy: 160ms base 
        // Scale: -5ms per speed point
        // Cap: Minimum 40ms
        const currentSpeed = player.speed || 10;
        const turnDelay = Math.max(40, 160 - (currentSpeed * 5));

        const now = Date.now();
        if (now - lastActionTimeRef.current < turnDelay) {
            return;
        }

        let actionTaken = false;

        switch (e.key.toUpperCase()) {
            case 'W': if (!isInventoryOpen) { movePlayer(0, -1); actionTaken = true; } break;
            case 'S': if (!isInventoryOpen) { movePlayer(0, 1); actionTaken = true; } break;
            case 'A': if (!isInventoryOpen) { movePlayer(-1, 0); actionTaken = true; } break;
            case 'D': if (!isInventoryOpen) { movePlayer(1, 0); actionTaken = true; } break;

            case 'H': healPlayer(); actionTaken = true; break;
            case 'F': toggleFog(); actionTaken = true; break;
            case 'I': toggleInventory(); actionTaken = true; break;
            case 'ESCAPE': setIsInventoryOpen(false); actionTaken = true; break;

            // NEW: Spacebar for Stairs
            case ' ':
            case 'ENTER':
                descendStairs();
                actionTaken = true;
                break;

            default: return;
        }

        if (actionTaken) {
            lastActionTimeRef.current = now;
            e.preventDefault();
        }
    }, [movePlayer, healPlayer, toggleFog, toggleInventory, descendStairs, isInventoryOpen, gameState, resetGame, player.speed]);

    if (!isDataLoaded) return { isLoading: true };

    return {
        isLoading: false,
        player, position, map, gameState, monsters, isFogEnabled,
        isInventoryOpen, toggleInventory, equipItem, unequipItem,
        toggleFog, handleKeyDown, resetGame,
        visitedTiles,
        log: visuals.log, floatingTexts: visuals.floatingTexts, hitTargetId: visuals.hitTargetId
    };
};