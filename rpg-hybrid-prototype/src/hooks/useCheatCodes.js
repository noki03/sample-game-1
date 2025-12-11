import { useEffect } from 'react';
import { processLevelUp } from '../utils/combatLogic';

export const useCheatCodes = (player, setPlayer, addLog) => {
    useEffect(() => {
        const handleCheatInput = (e) => {
            // Cheat Code: Shift + L (Level Up)
            if (e.shiftKey && e.key.toUpperCase() === 'L') {

                // Calculate exact XP needed to level up immediately
                const xpNeeded = player.nextLevelXp - player.xp;

                // Use the existing utility to calculate new stats
                const { updatedStats } = processLevelUp(player, xpNeeded);

                // Apply the update
                setPlayer(updatedStats);
                addLog("🛠️ CHEAT ACTIVATED: Instant Level Up!");
            }

            // Cheat Code: Shift + P (Give Potions)
            if (e.shiftKey && e.key.toUpperCase() === 'P') {
                setPlayer(prev => ({ ...prev, potions: prev.potions + 5 }));
                addLog("🛠️ CHEAT ACTIVATED: +5 Potions");
            }
        };

        window.addEventListener('keydown', handleCheatInput);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('keydown', handleCheatInput);
        };
    }, [player, setPlayer, addLog]);
};