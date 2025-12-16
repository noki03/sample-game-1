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
    // 0. TOP-LEVEL STATE
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // --- 1. CORE STATE: useDungeonState ---
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

    // Game Tick (Original useEffect for non-movement cooldowns)
    const [, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- Monster Attack Logic (Callback) ---
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
    const { monsters: currentMonsters, setMonsters: managerSetMonsters, removeMonster, updateMonster } = useMonsterManager(
        map, position, player, gameState, visuals.addLog, loadedMonsters,
        handleMonsterAttack
    );

    const { resolveCombat } = useCombat(
        playerRef, positionRef, setPlayer, setGameState, removeMonster, updateMonster, visuals
    );

    const { equipItem, unequipItem, consumeItem, sellItem } = useInventoryLogic(player, setPlayer, visuals);

    // NOTE: descendStairs is defined here and used below in actions
    const { healPlayer, descendStairs } = usePlayerActions(
        playerRef, positionRef, setPlayer, setPosition, setMap, setVisitedTiles, managerSetMonsters, visuals, gameState
    );

    useCheatCodes(player, setPlayer, visuals.addLog);


    // --- 4. ACTIONS (Defined early for useInputHandler) ---
    const toggleFog = useCallback(() => setIsFogEnabled(p => !p), [setIsFogEnabled]);
    const toggleInventory = useCallback(() => setIsInventoryOpen(p => !p), [setIsInventoryOpen]);

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

    const cheatNextFloor = useCallback(() => {
        const newMap = generateDungeon(MAP_WIDTH, MAP_HEIGHT);
        const startPos = findRandomFloor(newMap);

        setMap(newMap);
        setPosition(startPos);
        setVisitedTiles(new Set([`${startPos.x},${startPos.y}`]));
        managerSetMonsters([]);
        setMoveQueue([]);

        setPlayer(prev => ({ ...prev, floor: (prev.floor || 1) + 1 }));

        visuals.addLog("⏩ CHEAT: Warped to next floor.");
        visuals.showFloatText(startPos.x, startPos.y, "WARP", "#8e44ad");
    }, [setMap, setPosition, setPlayer, managerSetMonsters, setVisitedTiles, visuals, setMoveQueue]);


    // --- 5. MOVEMENT SYSTEM SETUP ---

    // INPUT HANDLER: Gets the state of held keys
    const { keysHeldRef } = useInputHandler(gameState, player, isInventoryOpen, {
        resetGame: () => console.warn("Reset not ready"),
        healPlayer, toggleFog, toggleInventory, setIsInventoryOpen,
        descendStairs: () => descendStairs(map)
    });

    // MOVEMENT LOGIC: Consumes state and executes movement
    const movementState = {
        map, position, player, gameState, monsters: currentMonsters, resolveCombat, moveQueue,
        keysHeldRef: keysHeldRef || { current: {} } // Defensive initialization
    };
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

    // --- INPUT WRAPPER (Used for immediate actions, like stopping the queue) ---
    const movePlayer = useCallback((dx, dy) => {
        if (moveQueue.length > 0) {
            stopAutoMove();
        }
        // Execute the single move (speed check is now inside moveSingleStep)
        moveSingleStep(dx, dy);
    }, [stopAutoMove, moveSingleStep, moveQueue]);


    // --- 6. PERSISTENCE & FINAL SETUP ---
    // Persistence hook MUST run after all data has been initialized
    const { resetGame } = useDataPersistence(
        { player, position, monsters: currentMonsters, gameState, isFogEnabled, map, visitedTiles },
        { setPlayer, setPosition, setMap, setVisitedTiles, setGameState, setIsFogEnabled, setLoadedMonsters, setMonsters: managerSetMonsters, setMoveQueue, visuals },
        setIsDataLoaded
    );

    // --- VISIBILITY ---
    useEffect(() => { if (isDataLoaded) updateVisited(position); }, [position, isDataLoaded, updateVisited]);


    if (!isDataLoaded) return { isLoading: true };

    return {
        isLoading: false,
        player, position, map, gameState, monsters: currentMonsters, isFogEnabled,
        isInventoryOpen, toggleInventory, equipItem, unequipItem, consumeItem, sellItem,
        toggleFog,
        handleKeyDown: () => { }, // Input handler is internal now
        resetGame, respawnPlayer,
        handleTileClick, stopAutoMove,
        visitedTiles,
        log: visuals.log, floatingTexts: visuals.floatingTexts, hitTargetId: visuals.hitTargetId,
        setPlayer,
        addLog: visuals.addLog,
        cheatNextFloor
    };
};