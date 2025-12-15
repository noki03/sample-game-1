import { useState, useCallback, useEffect, useRef } from 'react';
import { initialStats } from '../data/initialStats';
import { generateDungeon, findRandomFloor } from '../utils/mapGenerator';
import { saveGameState, loadGameState, clearGameState } from '../db';
import { findPath } from '../utils/pathfinding';
import { calculateHit } from '../utils/combatLogic';

// --- CUSTOM HOOKS ---
import { useMonsterManager } from './useMonsterManager';
import { useCheatCodes } from './useCheatCodes';
import { useVisuals } from './useVisuals';
import { useCombat } from './useCombat';
import { useInventoryLogic } from './useInventoryLogic';
import { usePlayerActions } from './usePlayerActions';
import { useInputHandler } from './useInputHandler';

const MAP_WIDTH = 60;
const MAP_HEIGHT = 40;
const VISIBILITY_RADIUS = 8;

export const useGameLogic = () => {
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // --- CORE STATE ---
    const [player, setPlayer] = useState(initialStats);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [map, setMap] = useState(() => generateDungeon(MAP_WIDTH, MAP_HEIGHT));
    const [visitedTiles, setVisitedTiles] = useState(new Set());
    const [gameState, setGameState] = useState('EXPLORATION');
    const [isFogEnabled, setIsFogEnabled] = useState(true);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [loadedMonsters, setLoadedMonsters] = useState(null);

    // Movement Queue for Auto-Walking
    const [moveQueue, setMoveQueue] = useState([]);

    // Refs for callbacks
    const playerRef = useRef(player);
    const positionRef = useRef(position);
    useEffect(() => {
        playerRef.current = player;
        positionRef.current = position;
    }, [player, position]);

    // UI Tick for cooldowns
    const [, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- HOOK INTEGRATION ---
    const visuals = useVisuals();

    // --- HANDLE MONSTER ATTACK (REAL-TIME) ---
    const handleMonsterAttack = useCallback((monster) => {
        if (gameState === 'GAME_OVER') return;

        // Calculate Damage (Defense/Dodge applied)
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

    // Pass handleMonsterAttack to manager
    const { monsters, setMonsters, removeMonster, updateMonster } = useMonsterManager(
        map, position, player.level, player.floor, gameState, visuals.addLog, loadedMonsters,
        handleMonsterAttack
    );

    const { resolveCombat } = useCombat(
        playerRef, positionRef, setPlayer, setGameState, removeMonster, updateMonster, visuals
    );

    const { equipItem, unequipItem } = useInventoryLogic(setPlayer);

    const { healPlayer, descendStairs } = usePlayerActions(
        playerRef, positionRef, setPlayer, setPosition, setMap, setVisitedTiles, setMonsters, visuals, gameState
    );

    useCheatCodes(player, setPlayer, visuals.addLog);


    // --- LOCAL ACTIONS ---
    const toggleFog = useCallback(() => setIsFogEnabled(p => !p), []);
    const toggleInventory = useCallback(() => setIsInventoryOpen(p => !p), []);

    const movePlayer = useCallback((dx, dy) => {
        // FIX: Ensure we are in EXPLORATION mode to move/attack
        if (gameState !== 'EXPLORATION') return;

        const newX = position.x + dx;
        const newY = position.y + dy;

        if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) return;
        if (map[newY][newX] === 1) {
            setMoveQueue([]);
            return;
        }

        const encounteredMonster = monsters.find(m => m.x === newX && m.y === newY);

        if (encounteredMonster) {
            setMoveQueue([]); // Stop moving

            // FIX: Do NOT switch to 'COMBAT' state. 
            // Staying in 'EXPLORATION' allows Real-Time Combat to continue.
            // setGameState('COMBAT'); <--- REMOVED

            resolveCombat(encounteredMonster); // Player hits monster
            return;
        }

        if (map[newY][newX] === 3) {
            visuals.addLog("You see stairs going down. Press [SPACE] to descend.");
            setMoveQueue([]);
        }

        setPosition({ x: newX, y: newY });
    }, [position, map, gameState, monsters, resolveCombat, visuals]);

    // Respawn Logic
    const respawnPlayer = useCallback(() => {
        setPlayer(prev => ({ ...prev, hp: Math.floor(prev.maxHp * 0.3) }));
        const safePos = findRandomFloor(map);
        setPosition(safePos);
        setGameState('EXPLORATION');
        setMoveQueue([]);
        visuals.addLog("🩹 You woke up dazed and injured...");
        visuals.showFloatText(safePos.x, safePos.y, "Revived", "#e67e22");
        setVisitedTiles(prev => new Set(prev).add(`${safePos.x},${safePos.y}`));
    }, [map, visuals]);

    // Reset Logic
    const resetGame = useCallback(async () => {
        await clearGameState();
        const newMap = generateDungeon(MAP_WIDTH, MAP_HEIGHT);
        const startPos = findRandomFloor(newMap);
        setMap(newMap);
        setPlayer(initialStats);
        setPosition(startPos);
        setGameState('EXPLORATION');
        setMonsters([]);
        setMoveQueue([]);
        setVisitedTiles(new Set([`${startPos.x},${startPos.y}`]));
        visuals.resetVisuals();
    }, [setMonsters, visuals]);


    // --- AUTO MOVEMENT LOOP ---
    useEffect(() => {
        if (moveQueue.length === 0) return;

        const currentSpeed = player.speed || 10;
        const stepDelay = Math.max(40, 160 - (currentSpeed * 5));

        const timer = setTimeout(() => {
            const nextStep = moveQueue[0];
            const dx = nextStep.x - position.x;
            const dy = nextStep.y - position.y;
            movePlayer(dx, dy);
            setMoveQueue(prev => prev.slice(1));
        }, stepDelay);

        return () => clearTimeout(timer);
    }, [moveQueue, position, player.speed, movePlayer]);


    // --- CLICK TO MOVE ---
    const handleTileClick = useCallback((targetX, targetY) => {
        if (gameState !== 'EXPLORATION') return;
        if (map[targetY][targetX] === 1) {
            visuals.showFloatText(targetX, targetY, "Blocked", "#95a5a6");
            return;
        }

        const path = findPath(position, { x: targetX, y: targetY }, map);
        if (path.length > 0) {
            setMoveQueue(path);
            visuals.showFloatText(targetX, targetY, "📍", "#fff");
        } else {
            visuals.addLog("No path.");
        }
    }, [map, position, gameState, visuals]);

    const stopAutoMove = useCallback(() => {
        if (moveQueue.length > 0) setMoveQueue([]);
    }, [moveQueue]);


    // --- INPUT HANDLING ---
    const { handleKeyDown } = useInputHandler(gameState, player, isInventoryOpen, {
        resetGame,
        movePlayer: (dx, dy) => { stopAutoMove(); movePlayer(dx, dy); },
        healPlayer, toggleFog,
        toggleInventory, setIsInventoryOpen,
        descendStairs: () => descendStairs(map)
    });


    // --- LOAD & SAVE ---
    useEffect(() => {
        const initGame = async () => {
            const savedData = await loadGameState();
            if (savedData) {
                console.log("Save found, loading...");
                setPlayer({
                    ...initialStats, ...savedData.player,
                    speed: savedData.player.speed || initialStats.speed,
                    floor: savedData.player.floor || 1,
                    lastHealTime: savedData.player.lastHealTime || 0,
                    healCooldown: savedData.player.healCooldown || 20000,
                    inventory: savedData.player.inventory || [],
                    equipment: savedData.player.equipment || { weapon: null, armor: null }
                });
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

    const updateVisited = useCallback((pos) => {
        setVisitedTiles(prev => {
            const newSet = new Set(prev);
            for (let y = pos.y - VISIBILITY_RADIUS; y <= pos.y + VISIBILITY_RADIUS; y++) {
                for (let x = pos.x - VISIBILITY_RADIUS; x <= pos.x + VISIBILITY_RADIUS; x++) {
                    const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                    if (dist < VISIBILITY_RADIUS) { newSet.add(`${x},${y}`); }
                }
            }
            return newSet;
        });
    }, []);

    useEffect(() => { if (isDataLoaded) updateVisited(position); }, [position, isDataLoaded, updateVisited]);

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


    if (!isDataLoaded) return { isLoading: true };

    return {
        isLoading: false,
        player, position, map, gameState, monsters, isFogEnabled,
        isInventoryOpen, toggleInventory, equipItem, unequipItem,
        toggleFog, handleKeyDown, resetGame, respawnPlayer,
        handleTileClick, stopAutoMove,
        visitedTiles,
        log: visuals.log, floatingTexts: visuals.floatingTexts, hitTargetId: visuals.hitTargetId
    };
};