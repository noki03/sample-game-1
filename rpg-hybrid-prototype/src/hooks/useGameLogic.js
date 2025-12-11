import { useState, useCallback } from 'react';
import { initialStats } from '../data/initialStats';
import { initialMap, findPlayerStart } from '../data/initialMap';

// Get initial player position
const initialPlayerPos = findPlayerStart(initialMap);

export const useGameLogic = () => {
    const [player, setPlayer] = useState(initialStats);
    const [position, setPosition] = useState(initialPlayerPos);
    const [map, setMap] = useState(initialMap); // Map state (can be modified later)
    const [log, setLog] = useState([
        'Welcome to the Minimal RPG!',
        'Use the W, A, S, D keys to move.'
    ]);
    const [gameState, setGameState] = useState('EXPLORATION');

    const addLog = useCallback((message) => {
        setLog(prevLog => {
            const newLog = [...prevLog, `[${new Date().toLocaleTimeString()}] ${message}`];
            // Keep only the last 10 messages
            return newLog.slice(-10);
        });
    }, []);

    const movePlayer = useCallback((dx, dy) => {
        // Only allow movement in EXPLORATION state
        if (gameState !== 'EXPLORATION') {
            addLog('Cannot move while in combat!');
            return;
        }

        const newX = position.x + dx;
        const newY = position.y + dy;

        // 1. Boundary Check
        if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) {
            addLog('Ouch! Hit the map boundary.');
            return;
        }

        const targetTile = map[newY][newX];

        // 2. Collision Check (Tile type 1 is a Wall)
        if (targetTile === 1) {
            addLog('A wall blocks your path.');
            return;
        }

        // Update position
        setPosition({ x: newX, y: newY });
        addLog(`Moved to (${newX}, ${newY}).`);

        // 3. Tile Interaction Check (Tile type 3 is a Monster)
        if (targetTile === 3) {
            addLog('A wild monster appears! Starting combat (simulated).');
            setGameState('COMBAT');

            // --- Simulated Combat Logic MVP ---
            setTimeout(() => {
                setGameState('EXPLORATION');
                addLog('You defeated the monster! Back to exploration.');

                // Simple stat update after 'combat'
                setPlayer(prev => ({
                    ...prev,
                    xp: prev.xp + 25,
                    hp: Math.max(prev.hp - 10, 0) // Take some damage
                }));
                addLog('Lost 10 HP, Gained 25 XP.');

                // Re-render the map to remove the monster tile (make it a floor tile)
                const newMap = map.map((row, r) =>
                    row.map((tile, c) => (r === newY && c === newX ? 0 : tile))
                );
                setMap(newMap);
            }, 1500);
        }

    }, [position, map, gameState, addLog]);


    // Effect to handle keyboard input
    const handleKeyDown = useCallback((e) => {
        switch (e.key.toUpperCase()) {
            case 'W': movePlayer(0, -1); break; // Up
            case 'S': movePlayer(0, 1); break;  // Down
            case 'A': movePlayer(-1, 0); break; // Left
            case 'D': movePlayer(1, 0); break;  // Right
            default: return;
        }
        e.preventDefault(); // Prevent default browser behavior (like scrolling)
    }, [movePlayer]);

    return {
        player,
        position,
        map,
        log,
        gameState,
        movePlayer,
        handleKeyDown,
    };
};