// Helper to add items to inventory with stacking logic
export const addToInventory = (currentInventory, newItem) => {
    // 1. Only Stack Potions
    if (newItem.type === 'potion') {
        // Check if we already have a potion with this NAME
        const existingIndex = currentInventory.findIndex(item => item.name === newItem.name);

        if (existingIndex !== -1) {
            // Found duplicate! Clone array and update quantity
            const updatedInventory = [...currentInventory];
            const existingItem = updatedInventory[existingIndex];

            updatedInventory[existingIndex] = {
                ...existingItem,
                // UPDATED: Add the quantity of the new item (default to 1)
                quantity: (existingItem.quantity || 1) + (newItem.quantity || 1)
            };
            return updatedInventory;
        }
    }

    // 2. Weapons/Armor do not stack, or if Potion is new
    return [...currentInventory, newItem];
};