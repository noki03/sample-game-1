import { useState, useCallback, useEffect, useRef } from 'react';
import { initialStats } from '../data/initialStats';
import { generateDungeon, findRandomFloor } from '../utils/mapGenerator';
import { findPath } from '../utils/pathfinding';
import { calculateHit } from '../utils/combatLogic';

// --- GAME SYSTEMS ---
import { useDungeonState } from './gameSystems/useDungeonState';
import { useDataPersistence } from './gameSystems/useDataPersistence';
import { useMovementLogic } from './gameSystems/useMovementLogic';

// --- CORE HOOKS ---
import { useMonsterManager } from './useMonsterManager';
import { useCheatCodes } from './useCheatCodes';
import { useVisuals } from './useVisuals';
import { useCombat } from './useCombat';
import { useInventoryLogic } from './useInventoryLogic';
import { usePlayerActions } from './usePlayerActions';
import { useInputHandler } from './useInputHandler';

export const useGameLogic = () => {
    // 0. TOP-LEVEL STATE (Required for persistence flag)
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // --- 1. CORE STATE: Extracted to useDungeonState ---
    const {
        player, setPlayer, position, setPosition, map, setMap,
        visitedTiles, setVisitedTiles, updateVisited,
        gameState, setGameState, isFogEnabled, setIsFogEnabled,
        isInventoryOpen, setIsInventoryOpen,
        monsters, setMonsters, loadedMonsters, setLoadedMonsters,
        moveQueue, setMoveQueue,
        MAP_WIDTH, MAP_HEIGHT, VISIBILITY_RADIUS
    } = useDungeonState();

    // --- Refs ---
    const playerRef = useRef(player);
    const positionRef = useRef(position);
    useEffect(() => {
        playerRef.current = player;
        positionRef.current = position;
    }, [player, position]);

    // --- 2. BASE SYSTEMS ---
    const visuals = useVisuals();

    // Game Tick (Original useEffect)
    const [, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- Monster Attack Logic (Remains here as the central damage callback) ---
    const handleMonsterAttack = useCallback((monster) => {
        if (gameState === 'GAME_OVER') return;

        if (playerRef.current.isGodMode) {
            visuals.showFloatText(positionRef.current.x, positionRef.current.y, "BLOCKED", "#3498db");
            return;
        }

        const hitResult = calculateHit(monster, playerRef.current);

        if (hitResult.isMiss) {
            visuals.showFloatText(positionRef.current.x, positionRef.current.y, "DODGE!", "#2ecc71");
        } else {
            const damage = hitResult.damage;
            visuals.showFloatText(positionRef.current.x, positionRef.current.y, `-${damage}`, '#e74c3c');
            visuals.addLog(`👹 ${monster.isBoss ? 'Dragon' : 'Monster'} hits you for ${damage} dmg!`);

            setPlayer(prev => {
                const newHp = prev.hp - damage;
                if (newHp <= 0) {
                    setGameState('GAME_OVER');
                    return { ...prev, hp: 0 };
                }
                return { ...prev, hp: newHp };
            });
        }
    }, [gameState, visuals]);


    // --- 3. MANAGERS ---

    // useMonsterManager
    const { monsters: currentMonsters, setMonsters: managerSetMonsters, removeMonster, updateMonster } = useMonsterManager(
        map, position, player, gameState, visuals.addLog, loadedMonsters,
        handleMonsterAttack
    );

    const { resolveCombat } = useCombat(
        playerRef, positionRef, setPlayer, setGameState, removeMonster, updateMonster, visuals
    );

    const { equipItem, unequipItem, consumeItem, sellItem } = useInventoryLogic(player, setPlayer, visuals);

    const { healPlayer, descendStairs } = usePlayerActions(
        playerRef, positionRef, setPlayer, setPosition, setMap, setVisitedTiles, managerSetMonsters, visuals, gameState
    );

    useCheatCodes(player, setPlayer, visuals.addLog);


    // --- MOVEMENT SYSTEM (NEWLY EXTRACTED) ---
    const movementState = { map, position, player, gameState, monsters: currentMonsters, resolveCombat, moveQueue };
    const movementSetters = { setPosition, setMoveQueue };

    const {
        movePlayer: moveSingleStep,
        handleTileClick,
        stopAutoMove
    } = useMovementLogic(
        movementState,
        movementSetters,
        visuals,
        MAP_WIDTH, MAP_HEIGHT
    );

    // --- INPUT WRAPPER (To maintain stopAutoMove functionality for WASD) ---
    const movePlayer = useCallback((dx, dy) => {
        // Fix for heavy feeling: only call stopAutoMove if the queue is actually active
        if (moveQueue.length > 0) {
            stopAutoMove();
        }
        moveSingleStep(dx, dy);
    }, [stopAutoMove, moveSingleStep, moveQueue]);


    // --- RESPITE ACTIONS (Original implementation retained) ---
    const respawnPlayer = useCallback(() => {
        setPlayer(prev => ({ ...prev, hp: Math.floor(prev.maxHp * 0.3) }));
        const safePos = findRandomFloor(map);
        setPosition(safePos);
        setGameState('EXPLORATION');
        setMoveQueue([]);
        visuals.addLog("🩹 You woke up dazed and injured...");
        visuals.showFloatText(safePos.x, safePos.y, "Revived", "#e67e22");
        setVisitedTiles(prev => new Set(prev).add(`${safePos.x},${safePos.y}`));
    }, [map, visuals, setPlayer, setPosition, setGameState, setMoveQueue, setVisitedTiles]);


    // --- LOAD & SAVE (Extracted to Persistence Hook) ---
    const { resetGame } = useDataPersistence(
        { player, position, monsters: currentMonsters, gameState, isFogEnabled, map, visitedTiles },
        { setPlayer, setPosition, setMap, setVisitedTiles, setGameState, setIsFogEnabled, setLoadedMonsters, setMonsters: managerSetMonsters, setMoveQueue, visuals },
        setIsDataLoaded
    );

    // --- CHEATS & ACTIONS (Original implementation retained) ---
    const toggleFog = useCallback(() => setIsFogEnabled(p => !p), [setIsFogEnabled]);
    const toggleInventory = useCallback(() => setIsInventoryOpen(p => !p), [setIsInventoryOpen]);

    const cheatNextFloor = useCallback(() => {
        const newMap = generateDungeon(MAP_WIDTH, MAP_HEIGHT);
        const startPos = findRandomFloor(newMap);

        setMap(newMap);
        setPosition(startPos);
        setVisitedTiles(new Set([`${startPos.x},${startPos.y}`]));
        managerSetMonsters([]); // Use manager setter
        setMoveQueue([]);

        setPlayer(prev => ({ ...prev, floor: (prev.floor || 1) + 1 }));

        visuals.addLog("⏩ CHEAT: Warped to next floor.");
        visuals.showFloatText(startPos.x, startPos.y, "WARP", "#8e44ad");
    }, [setMap, setPosition, setPlayer, managerSetMonsters, setVisitedTiles, visuals, setMoveQueue]);

    // --- VISIBILITY (Original useEffect) ---
    useEffect(() => { if (isDataLoaded) updateVisited(position); }, [position, isDataLoaded, updateVisited]);


    // --- INPUT HANDLING ---
    const { handleKeyDown } = useInputHandler(gameState, player, isInventoryOpen, {
        resetGame,
        movePlayer: (dx, dy) => { stopAutoMove(); movePlayer(dx, dy); }, // Calls the new wrapper
        healPlayer, toggleFog,
        toggleInventory, setIsInventoryOpen,
        descendStairs: () => descendStairs(map)
    });


    if (!isDataLoaded) return { isLoading: true };

    return {
        isLoading: false,
        player, position, map, gameState, monsters: currentMonsters, isFogEnabled,
        isInventoryOpen, toggleInventory, equipItem, unequipItem, consumeItem, sellItem,
        toggleFog, handleKeyDown, resetGame, respawnPlayer,
        handleTileClick, stopAutoMove,
        visitedTiles,
        log: visuals.log, floatingTexts: visuals.floatingTexts, hitTargetId: visuals.hitTargetId,
        setPlayer,
        addLog: visuals.addLog,
        cheatNextFloor
    };
};