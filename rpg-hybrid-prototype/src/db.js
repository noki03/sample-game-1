import Dexie from 'dexie';

export const db = new Dexie('RpgDatabase');

// Define the schema
db.version(1).stores({
    saves: 'id' // Primary key is 'id'
});

// Helper to save the entire game state
export const saveGameState = async (state) => {
    try {
        // We always overwrite the entry with id: 1
        await db.saves.put({ id: 1, ...state });
    } catch (error) {
        console.error('Failed to save game:', error);
    }
};

// Helper to load the game state
export const loadGameState = async () => {
    try {
        const save = await db.saves.get(1);
        return save;
    } catch (error) {
        console.error('Failed to load game:', error);
        return null;
    }
};

// Helper to clear the save (Reset Game)
export const clearGameState = async () => {
    try {
        await db.saves.delete(1);
    } catch (error) {
        console.error('Failed to delete save:', error);
    }
};