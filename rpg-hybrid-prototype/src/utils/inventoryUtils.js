// Helper to add items to inventory with stacking logic
export const addToInventory = (currentInventory, newItem) => {
    // Only Stack Potions
    if (newItem.type === 'potion') {
        const existingIndex = currentInventory.findIndex(item => item.name === newItem.name);

        if (existingIndex !== -1) {
            // Found duplicate! Clone array and update quantity
            const updatedInventory = [...currentInventory];
            const existingItem = updatedInventory[existingIndex];

            updatedInventory[existingIndex] = {
                ...existingItem,
                quantity: (existingItem.quantity || 1) + 1
            };
            return updatedInventory;
        }
    }

    // Otherwise just add it (Weapons/Armor don't stack)
    return [...currentInventory, newItem];
};