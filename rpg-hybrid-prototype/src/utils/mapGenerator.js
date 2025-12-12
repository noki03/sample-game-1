// Tile Types (Must match your existing constants)
const TILE_FLOOR = 0;
const TILE_WALL = 1;

export const generateDungeon = (width, height) => {
    // 1. Start with a map full of walls
    let map = Array(height).fill(null).map(() => Array(width).fill(TILE_WALL));

    // 2. Random Walker Setup
    // Start in the middle
    let x = Math.floor(width / 2);
    let y = Math.floor(height / 2);

    // Total number of floor tiles we want (e.g., 40% of the map)
    const maxFloors = Math.floor(width * height * 0.4);
    let floorCount = 0;

    // 3. Walk!
    while (floorCount < maxFloors) {
        // Dig out current spot
        if (map[y][x] === TILE_WALL) {
            map[y][x] = TILE_FLOOR;
            floorCount++;
        }

        // Move Randomly
        const direction = Math.floor(Math.random() * 4);
        switch (direction) {
            case 0: // Up
                if (y > 1) y--;
                break;
            case 1: // Down
                if (y < height - 2) y++;
                break;
            case 2: // Left
                if (x > 1) x--;
                break;
            case 3: // Right
                if (x < width - 2) x++;
                break;
            default: break;
        }
    }

    return map;
};

// Helper to find a valid spawn point on a generated map
export const findRandomFloor = (map) => {
    const height = map.length;
    const width = map[0].length;

    while (true) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        if (map[y][x] === TILE_FLOOR) {
            return { x, y };
        }
    }
};