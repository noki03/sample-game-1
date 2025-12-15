import { useEffect } from 'react';
import { processLevelUp } from '../utils/combatLogic';

export const useCheatCodes = (player, setPlayer, addLog) => {
    useEffect(() => {
        const handleCheatInput = (e) => {
            // IGNORE if typing in an input field (if you add chat later)
            if (e.target.tagName === 'INPUT') return;
            if (!e.shiftKey) return; // All cheats require Shift

            const key = e.key.toUpperCase();

            // --- 1. FULL HEAL (Shift + H) ---
            if (key === 'H') {
                setPlayer(prev => ({
                    ...prev,
                    hp: prev.maxHp,
                    lastHealTime: 0 // Resets cooldown instantly
                }));
                addLog("🛠️ CHEAT: Full Heal & Cooldown Reset!");
            }

            // --- 2. GOD MODE (Shift + G) ---
            if (key === 'G') {
                setPlayer(prev => {
                    const newVal = !prev.isGodMode;
                    addLog(`🛠️ CHEAT: God Mode ${newVal ? 'ON' : 'OFF'}`);
                    return { ...prev, isGodMode: newVal };
                });
            }

            // --- 3. ONE HIT KILL (Shift + K) ---
            if (key === 'K') {
                setPlayer(prev => {
                    const newVal = !prev.isOneHitKill;
                    addLog(`🛠️ CHEAT: One-Hit Kill ${newVal ? 'ON' : 'OFF'}`);
                    return { ...prev, isOneHitKill: newVal };
                });
            }

            // --- 4. GHOST MODE / NO AGGRO (Shift + I) ---
            if (key === 'I') {
                setPlayer(prev => {
                    const newVal = !prev.isGhostMode;
                    addLog(`🛠️ CHEAT: Ghost Mode ${newVal ? 'ON' : 'OFF'}`);
                    return { ...prev, isGhostMode: newVal };
                });
            }

            // --- 5. SUPER SPEED (Shift + S) ---
            if (key === 'S') {
                setPlayer(prev => {
                    const isFast = prev.speed > 20;
                    addLog(`🛠️ CHEAT: Speed ${isFast ? 'Normal' : 'Boosted'}`);
                    return { ...prev, speed: isFast ? 10 : 50 };
                });
            }

            // --- 6. INSTANT LEVEL UP (Shift + L) ---
            if (key === 'L') {
                const xpNeeded = player.nextLevelXp - player.xp;
                const { updatedStats } = processLevelUp(player, xpNeeded);
                setPlayer(updatedStats);
                addLog("🛠️ CHEAT: Instant Level Up!");
            }
        };

        window.addEventListener('keydown', handleCheatInput);
        return () => window.removeEventListener('keydown', handleCheatInput);
    }, [player, setPlayer, addLog]);
};