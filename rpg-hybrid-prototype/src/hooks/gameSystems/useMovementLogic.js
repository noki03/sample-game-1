import { useState, useCallback, useEffect, useRef } from 'react';
import { findPath } from '../../utils/pathfinding';

// Use a very fast check interval to ensure responsiveness (e.g., 60 FPS update rate)
const CONTINUOUS_MOVE_CHECK_INTERVAL = 16;

export const useMovementLogic = (
    state, // { map, position, player, gameState, monsters, resolveCombat, moveQueue, keysHeldRef }
    setters, // { setPosition, setMoveQueue }
    visuals,
    MAP_WIDTH, MAP_HEIGHT
) => {
    // --- Destructure State/Setters ---
    const { map, position, player, gameState, monsters, resolveCombat, moveQueue, keysHeldRef } = state;
    const { setPosition, setMoveQueue } = setters;

    // CRITICAL: Ref to track the last successful turn time to control speed.
    const lastTurnTimeRef = useRef(0);

    // --- 1. MOVEMENT CORE LOGIC (moveSingleStep) ---
    const moveSingleStep = useCallback((dx, dy) => {
        if (gameState !== 'EXPLORATION') return false;

        // --- 1. Turn Resolution Check ---
        const now = Date.now();
        // Calculate the player's current speed-based delay
        const turnDelay = Math.max(40, 160 - ((player.speed || 10) * 5));

        if (now - lastTurnTimeRef.current < turnDelay) {
            return false; // Turn not ready
        }

        const newX = position.x + dx;
        const newY = position.y + dy;

        // Boundary/Wall Check
        if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length || map[newY][newX] === 1) {
            setMoveQueue([]);
            return false;
        }

        // Monster Check (Combat)
        const encounteredMonster = monsters.find(m => m.x === newX && m.y === newY);
        if (encounteredMonster) {
            setMoveQueue([]);
            resolveCombat(encounteredMonster);
            return false;
        }

        // Stairs Check
        if (map[newY][newX] === 3) {
            visuals.addLog("You see stairs going down. Press [SPACE] to descend.");
            setMoveQueue([]);
        }

        // Valid Move: Update global position and record turn time
        setPosition({ x: newX, y: newY });
        lastTurnTimeRef.current = now; // SUCCESS: Record the actual time the turn happened
        return true;

    }, [position, map, gameState, monsters, resolveCombat, visuals, setPosition, setMoveQueue, player.speed]);


    // --- 2. AUTO MOVEMENT LOOP (For pathfinding queue) ---
    useEffect(() => {
        if (moveQueue.length === 0) return;

        const stepDelay = Math.max(40, 160 - ((player.speed || 10) * 5));

        const timer = setTimeout(() => {
            const nextStep = moveQueue[0];
            const dx = nextStep.x - position.x;
            const dy = nextStep.y - position.y;

            // Only slice the queue if the move was successful
            if (moveSingleStep(dx, dy)) {
                setMoveQueue(prev => prev.slice(1));
            }
        }, stepDelay);

        return () => clearTimeout(timer);
    }, [moveQueue, position, player.speed, moveSingleStep, setMoveQueue]);


    // --- 3. CONTINUOUS KEY MOVEMENT LOOP (Diagonal/Smooth Fix) ---
    useEffect(() => {
        const checkMovement = () => {
            // CRITICAL FIX: Guard clause for unstable keysHeldRef
            if (!keysHeldRef || !keysHeldRef.current) return;
            if (gameState !== 'EXPLORATION' || moveQueue.length > 0) return;

            const held = keysHeldRef.current;
            let dx = 0;
            let dy = 0;

            // Calculate movement vector (Allows W+A for diagonal)
            if (held['w']) dy = -1;
            else if (held['s']) dy = 1;

            if (held['a']) dx = -1;
            else if (held['d']) dx = 1;

            // Simultaneous opposite movement should cancel
            if (held['w'] && held['s']) dy = 0;
            if (held['a'] && held['d']) dx = 0;

            if (dx !== 0 || dy !== 0) {
                // Execute move; moveSingleStep will handle the speed check
                moveSingleStep(dx, dy);
            }
        };

        // Run the checker frequently (16ms ≈ 60 FPS) to ensure input feels instantaneous
        const timer = setInterval(checkMovement, CONTINUOUS_MOVE_CHECK_INTERVAL);
        return () => clearInterval(timer);

    }, [gameState, moveQueue.length, moveSingleStep, keysHeldRef]);


    // --- 4. UTILITIES ---
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
    }, [map, position, gameState, visuals, setMoveQueue]);


    const stopAutoMove = useCallback(() => {
        if (moveQueue.length > 0) setMoveQueue([]);
    }, [moveQueue, setMoveQueue]);


    return {
        movePlayer: moveSingleStep,
        handleTileClick,
        stopAutoMove,
        moveQueue
    };
};