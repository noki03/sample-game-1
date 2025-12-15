import { useCallback } from 'react';

export const useInventoryLogic = (setPlayer) => {

    const equipItem = useCallback((item) => {
        setPlayer(prev => {
            const currentEquipment = prev.equipment || { weapon: null, armor: null };
            const currentInventory = prev.inventory || [];
            const type = item.type;
            const oldItem = currentEquipment[type];

            // Remove new item from inventory, add old item back if exists
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

    return { equipItem, unequipItem };
};