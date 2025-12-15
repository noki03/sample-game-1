import { useCallback } from 'react';

// Requires 'player' object to validate items before setting state
export const useInventoryLogic = (player, setPlayer, visuals) => {

    // --- EQUIP ITEM ---
    const equipItem = useCallback((item) => {
        setPlayer(prev => {
            const currentEquipment = prev.equipment || { weapon: null, armor: null };
            const currentInventory = prev.inventory || [];
            const type = item.type;
            const oldItem = currentEquipment[type];

            // Remove new item from inventory, add old item back
            const newInventory = currentInventory.filter(i => i.uid !== item.uid);
            if (oldItem) newInventory.push(oldItem);

            // Recalculate Stats
            let newAttack = prev.attack;
            let newDefense = prev.defense;

            const getItemBonus = (itm) => itm ? itm.bonus : 0;

            if (type === 'weapon') {
                newAttack = (newAttack - getItemBonus(oldItem)) + item.bonus;
            } else if (type === 'armor') {
                newDefense = (newDefense - getItemBonus(oldItem)) + item.bonus;
            }

            return {
                ...prev,
                inventory: newInventory,
                equipment: { ...currentEquipment, [type]: item },
                attack: newAttack,
                defense: newDefense
            };
        });
    }, [setPlayer]);

    // --- UNEQUIP ITEM ---
    const unequipItem = useCallback((type) => {
        setPlayer(prev => {
            const currentEquipment = prev.equipment || { weapon: null, armor: null };
            const itemToUnequip = currentEquipment[type];
            if (!itemToUnequip) return prev;

            const newInventory = [...(prev.inventory || []), itemToUnequip];
            let newAttack = prev.attack;
            let newDefense = prev.defense;

            if (type === 'weapon') newAttack -= itemToUnequip.bonus;
            else if (type === 'armor') newDefense -= itemToUnequip.bonus;

            return {
                ...prev,
                inventory: newInventory,
                equipment: { ...currentEquipment, [type]: null },
                attack: newAttack,
                defense: newDefense
            };
        });
    }, [setPlayer]);

    // --- CONSUME ITEM (POTIONS) ---
    const consumeItem = useCallback((item) => {
        // 1. Validation OUTSIDE the setter
        if (item.type !== 'potion') return;

        // Check if item actually exists in the provided player state (prevents spam/race conditions)
        const exists = player.inventory.find(i => i.uid === item.uid);
        if (!exists) return;

        const missingHp = player.maxHp - player.hp;
        if (missingHp <= 0) {
            if (visuals) visuals.addLog("Health is already full!");
            return;
        }

        // 2. Perform Side Effects (Logging) ONCE
        const healAmount = Math.min(missingHp, item.bonus);

        if (visuals) {
            visuals.addLog(`🍷 Used ${item.name} (+${healAmount} HP)`);
            visuals.showFloatText(0, 0, `+${healAmount}`, '#e74c3c');
        }

        // 3. Update State
        setPlayer(prev => {
            // Double-check existence in 'prev' to be safe
            if (!prev.inventory.find(i => i.uid === item.uid)) return prev;

            const newHp = Math.min(prev.maxHp, prev.hp + healAmount);
            const newInventory = prev.inventory.filter(i => i.uid !== item.uid);

            return {
                ...prev,
                hp: newHp,
                inventory: newInventory
            };
        });
    }, [player, setPlayer, visuals]);

    // --- NEW: SELL ITEM ---
    const sellItem = useCallback((item) => {
        // 1. Validation
        const exists = player.inventory.find(i => i.uid === item.uid);
        if (!exists) return;

        const sellValue = item.value || 10; // Default fallback

        // 2. Log ONCE
        if (visuals) {
            visuals.addLog(`💰 Sold ${item.name} for ${sellValue} Gold`);
            visuals.showFloatText(0, 0, `+${sellValue} G`, '#f1c40f');
        }

        // 3. Update State
        setPlayer(prev => {
            if (!prev.inventory.find(i => i.uid === item.uid)) return prev;

            return {
                ...prev,
                gold: (prev.gold || 0) + sellValue,
                inventory: prev.inventory.filter(i => i.uid !== item.uid)
            };
        });
    }, [player, setPlayer, visuals]);

    return { equipItem, unequipItem, consumeItem, sellItem };
};