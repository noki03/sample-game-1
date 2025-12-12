const TILE_FLOOR = 0;
const TILE_WALL = 1;
// Type 2 is usually Start, we will use Type 3 for Stairs
const TILE_STAIRS = 3;

export const generateDungeon = (width, height) => {
    // 1. Initialize Wall Map
    let map = Array(height).fill(null).map(() => Array(width).fill(TILE_WALL));

    // 2. Drunkard's Walk Generation
    let x = Math.floor(width / 2);
    let y = Math.floor(height / 2);
    const maxFloors = Math.floor(width * height * 0.4);
    let floorCount = 0;

    while (floorCount < maxFloors) {
        if (map[y][x] === TILE_WALL) {
            map[y][x] = TILE_FLOOR;
            floorCount++;
        }

        const direction = Math.floor(Math.random() * 4);
        switch (direction) {
            case 0: if (y > 1) y--; break;
            case 1: if (y < height - 2) y++; break;
            case 2: if (x > 1) x--; break;
            case 3: if (x < width - 2) x++; break;
        }
    }

    // 3. Place Stairs (Type 3)
    // We try to place it far from the center, but random is fine for now
    let stairsPlaced = false;
    while (!stairsPlaced) {
        const rx = Math.floor(Math.random() * width);
        const ry = Math.floor(Math.random() * height);
        // Must be a floor and NOT the starting center roughly
        if (map[ry][rx] === TILE_FLOOR) {
            map[ry][rx] = TILE_STAIRS;
            stairsPlaced = true;
        }
    }

    return map;
};

export const findRandomFloor = (map) => {
    const height = map.length;
    const width = map[0].length;

    while (true) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        // Ensure we don't spawn ON the stairs
        if (map[y][x] === TILE_FLOOR) {
            return { x, y };
        }
    }
};