import { useCallback, useRef } from 'react';

export const useInputHandler = (
    gameState, player, isInventoryOpen, actions
) => {
    const lastActionTimeRef = useRef(0);

    const handleKeyDown = useCallback((e) => {
        const {
            resetGame, movePlayer, healPlayer, toggleFog,
            toggleInventory, setIsInventoryOpen, descendStairs
        } = actions;

        if (gameState === 'GAME_OVER') {
            if (e.key.toUpperCase() === 'R') resetGame();
            return;
        }

        // --- SPEED CALCULATION ---
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
    }, [gameState, player.speed, isInventoryOpen, actions]);

    return { handleKeyDown, lastActionTimeRef };
};