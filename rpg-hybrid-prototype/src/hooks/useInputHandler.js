import { useCallback, useRef, useEffect } from 'react';

// External object to track held keys. Used by reference across components.
const keysHeld = {};

export const useInputHandler = (
    gameState, player, isInventoryOpen, actions
) => {
    // Reference to the external keysHeld object, which will be read by useMovementLogic.
    const keysHeldRef = useRef(keysHeld);

    // --- Key Tracker Functions ---
    const updateKeys = (key, isDown) => {
        const keyMap = {
            'W': 'w', 'S': 's', 'A': 'a', 'D': 'd',
            'ARROWUP': 'w', 'ARROWDOWN': 's', 'ARROWLEFT': 'a', 'ARROWRIGHT': 'd'
        };
        const directionalKey = keyMap[key.toUpperCase()];
        if (directionalKey) {
            keysHeld[directionalKey] = isDown;
        }
    };

    // --- Primary Key Down Handler (Registers key hold and handles non-movement actions) ---
    const handleKeyDown = useCallback((e) => {
        const key = e.key.toUpperCase();

        // 1. Update Directional Key State
        updateKeys(key, true);

        // 2. Handle Game Flow/Actions (Non-Movement)
        if (gameState === 'GAME_OVER') {
            if (key === 'R') actions.resetGame();
            return;
        }

        // Handle global control keys first
        if (key === 'ESCAPE') { actions.setIsInventoryOpen(false); e.preventDefault(); return; }
        if (key === 'I') { actions.toggleInventory(); e.preventDefault(); return; }

        if (isInventoryOpen) return; // Block all other input if inventory is open

        let actionTaken = false;

        // Check for non-movement actions
        switch (key) {
            case 'H': actions.healPlayer(); actionTaken = true; break;
            case 'F': actions.toggleFog(); actionTaken = true; break;
            case ' ':
            case 'ENTER': actions.descendStairs(); actionTaken = true; break;
            default: break;
        }

        if (actionTaken) {
            e.preventDefault();
        } else if (keysHeldRef.current['w'] || keysHeldRef.current['s'] || keysHeldRef.current['a'] || keysHeldRef.current['d']) {
            // If any directional key is held, prevent default to stop scrolling
            e.preventDefault();
        }

    }, [gameState, isInventoryOpen, actions]);

    // --- Key Up Handler (Clears key state) ---
    const handleKeyUp = useCallback((e) => {
        const key = e.key.toUpperCase();
        updateKeys(key, false);
    }, []);


    // --- Global Listener Setup ---
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            // Clean up keysHeld when component unmounts
            Object.keys(keysHeld).forEach(k => delete keysHeld[k]);
        };
    }, [handleKeyDown, handleKeyUp]);


    return { keysHeldRef };
};