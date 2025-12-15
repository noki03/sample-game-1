import { useCallback } from 'react';

export const useInventoryLogic = (player, setPlayer, visuals) => {

    const equipItem = useCallback((item) => {
        if (!item) return;
        setPlayer(prev => {
            // 1. Remove item from inventory
            const newInventory = prev.inventory.filter(i => i.uid !== item.uid);

            // 2. If slot occupied, move old item to inventory
            const oldItem = prev.equipment[item.type];
            if (oldItem) newInventory.push(oldItem);

            // 3. Equip new item
            return {
                ...prev,
                equipment: { ...prev.equipment, [item.type]: item },
                inventory: newInventory
            };
        });
        visuals.addLog(`Equipped ${item.name}`);
    }, [setPlayer, visuals]);

    const unequipItem = useCallback((slotType) => {
        setPlayer(prev => {
            const item = prev.equipment[slotType];
            if (!item) return prev;
            return {
                ...prev,
                equipment: { ...prev.equipment, [slotType]: null },
                inventory: [...prev.inventory, item]
            };
        });
    }, [setPlayer]);

    // --- CONSUME (Reduces Stack) ---
    const consumeItem = useCallback((item) => {
        if (item.type !== 'potion') return;

        const currentHp = player.hp;
        const maxHp = player.maxHp;

        if (currentHp >= maxHp) {
            visuals.addLog("You are already at full health.");
            return;
        }

        const healAmount = item.bonus;
        const newHp = Math.min(maxHp, currentHp + healAmount);
        const actualHeal = newHp - currentHp;

        visuals.addLog(`🍷 Used ${item.name}. Healed ${actualHeal} HP.`);

        setPlayer(prev => {
            // Find item and decrement quantity
            const newInventory = prev.inventory.map(invItem => {
                if (invItem.uid === item.uid) {
                    return { ...invItem, quantity: (invItem.quantity || 1) - 1 };
                }
                return invItem;
            }).filter(invItem => invItem.quantity > 0); // Remove if 0

            return {
                ...prev,
                hp: newHp,
                inventory: newInventory
            };
        });
    }, [player, setPlayer, visuals]);

    // --- SELL (Reduces Stack) ---
    const sellItem = useCallback((item) => {
        const sellValue = item.value || 0;

        setPlayer(prev => {
            const newInventory = prev.inventory.map(invItem => {
                if (invItem.uid === item.uid) {
                    return { ...invItem, quantity: (invItem.quantity || 1) - 1 };
                }
                return invItem;
            }).filter(invItem => invItem.quantity > 0);

            return {
                ...prev,
                gold: (prev.gold || 0) + sellValue,
                inventory: newInventory
            };
        });

        visuals.addLog(`💰 Sold 1x ${item.name} for ${sellValue} G`);

    }, [setPlayer, visuals]);

    return { equipItem, unequipItem, consumeItem, sellItem };
};