import { useState, useCallback } from 'react';

export const useVisuals = () => {
    const [log, setLog] = useState(['Welcome to the Minimal RPG!', 'Use W, A, S, D to move.']);
    const [floatingTexts, setFloatingTexts] = useState([]);
    const [hitTargetId, setHitTargetId] = useState(null);

    // --- LOGGING ---
    const addLog = useCallback((message) => {
        setLog(prev => {
            const newLog = [...prev, `[${new Date().toLocaleTimeString()}] ${message}`];
            return newLog.slice(-10);
        });
    }, []);

    // --- FLOATING TEXT ---
    const showFloatText = useCallback((x, y, text, color) => {
        const id = Date.now() + Math.random();

        // Add text
        setFloatingTexts(prev => [...prev, { id, x, y, text, color }]);

        // Remove text after 2 SECONDS (Increased from 800ms/1000ms)
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
        }, 2000);

    }, []);

    // --- HIT ANIMATION ---
    const triggerShake = useCallback((targetId) => {
        setHitTargetId(targetId);
        setTimeout(() => setHitTargetId(null), 350);
    }, []);

    // --- RESET ---
    const resetVisuals = useCallback(() => {
        setLog(['Game Restarted.', 'Good luck! 🍀']);
        setFloatingTexts([]);
        setHitTargetId(null);
    }, []);

    return {
        log,
        floatingTexts,
        hitTargetId,
        addLog,
        showFloatText,
        triggerShake,
        resetVisuals
    };
};