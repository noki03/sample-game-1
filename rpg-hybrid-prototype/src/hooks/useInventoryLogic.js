import { useCallback } from 'react';

// CHANGED: Added 'player' to arguments
export const useInventoryLogic = (player, setPlayer, visuals) => {

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

    // --- CONSUME ITEM (Fixed Duplicate Log) ---
    const consumeItem = useCallback((item) => {
        // 1. Validation OUTSIDE the setter
        if (item.type !== 'potion') return;

        // Check if item actually exists in the provided player state (prevents spam clicks)
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
            // Double-check existence in 'prev' to avoid race conditions
            const currentItem = prev.inventory.find(i => i.uid === item.uid);
            if (!currentItem) return prev;

            const newHp = Math.min(prev.maxHp, prev.hp + healAmount);
            const newInventory = prev.inventory.filter(i => i.uid !== item.uid);

            return {
                ...prev,
                hp: newHp,
                inventory: newInventory
            };
        });
    }, [player, setPlayer, visuals]); // Added 'player' dependency

    return { equipItem, unequipItem, consumeItem };
};