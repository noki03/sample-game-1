import { useState, useCallback, useEffect } from 'react';
import { findPath } from '../../utils/pathfinding';

export const useMovementLogic = (
    state, // { map, position, player, gameState, monsters, resolveCombat, moveQueue }
    setters, // { setPosition, setMoveQueue }
    visuals,
    MAP_WIDTH, MAP_HEIGHT
) => {
    // --- Destructure State/Setters ---
    const { map, position, player, gameState, monsters, resolveCombat, moveQueue } = state;
    const { setPosition, setMoveQueue } = setters;

    // --- 1. MOVEMENT CORE LOGIC (Extracted movePlayer) ---
    const moveSingleStep = useCallback((dx, dy) => {
        if (gameState !== 'EXPLORATION') return;

        const newX = position.x + dx;
        const newY = position.y + dy;

        // Boundary/Wall Check
        if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length || map[newY][newX] === 1) {
            setMoveQueue([]);
            return;
        }

        // Monster Check (Combat)
        const encounteredMonster = monsters.find(m => m.x === newX && m.y === newY);
        if (encounteredMonster) {
            setMoveQueue([]);
            resolveCombat(encounteredMonster);
            return;
        }

        // Stairs Check
        if (map[newY][newX] === 3) {
            visuals.addLog("You see stairs going down. Press [SPACE] to descend.");
            setMoveQueue([]);
        }

        // Valid Move: Update global position
        setPosition({ x: newX, y: newY });
    }, [position, map, gameState, monsters, resolveCombat, visuals, setPosition, setMoveQueue]);


    // --- 2. AUTO MOVEMENT LOOP (Extracted useEffect) ---
    useEffect(() => {
        if (moveQueue.length === 0) return;

        const currentSpeed = player.speed || 10;
        const stepDelay = Math.max(40, 160 - (currentSpeed * 5));

        const timer = setTimeout(() => {
            const nextStep = moveQueue[0];
            const dx = nextStep.x - position.x;
            const dy = nextStep.y - position.y;

            // Execute the movement
            moveSingleStep(dx, dy);

            // Remove the step from the queue, regardless of whether movement occurred
            setMoveQueue(prev => prev.slice(1));
        }, stepDelay);

        return () => clearTimeout(timer);
    }, [moveQueue, position, player.speed, moveSingleStep, setMoveQueue]);


    // --- 3. PATHFINDING / CLICK-TO-MOVE (Extracted handleTileClick) ---
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


    // --- 4. STOP MOVEMENT (Extracted stopAutoMove) ---
    const stopAutoMove = useCallback(() => {
        if (moveQueue.length > 0) setMoveQueue([]);
    }, [moveQueue, setMoveQueue]);


    return {
        movePlayer: moveSingleStep, // Renamed to movePlayer in the module export for clarity in useGameLogic wrapper
        handleTileClick,
        stopAutoMove,
        moveQueue
    };
};