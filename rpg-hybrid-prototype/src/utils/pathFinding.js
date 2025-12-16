// A simple A* Pathfinding implementation for 2D Grids

export const findPath = (start, end, map) => {
    const rows = map.length;
    const cols = map[0].length;

    // Helper to get a unique key for the set
    const key = (x, y) => `${x},${y}`;

    // --- CHANGE 1: Update Heuristic (Euclidean Distance is best for grids with diagonals) ---
    // Heuristic: Euclidean Distance (h is the straight-line distance)
    const h = (n) => Math.sqrt(Math.pow(n.x - end.x, 2) + Math.pow(n.y - end.y, 2));

    const openSet = [];
    const openSetHash = new Set();
    const closedSet = new Set();

    // Start Node
    const startNode = { x: start.x, y: start.y, g: 0, h: 0, f: 0, parent: null };
    startNode.h = h(startNode);
    startNode.f = startNode.h;

    openSet.push(startNode);
    openSetHash.add(key(start.x, start.y));

    // Define movement costs
    const CARDINAL_COST = 1;
    // Approximation of sqrt(2) for diagonal movement cost
    const DIAGONAL_COST = Math.SQRT2;

    while (openSet.length > 0) {
        // ... (Finding lowest F score and checking if end is reached remains the same) ...
        let lowInd = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowInd].f) {
                lowInd = i;
            }
        }
        let current = openSet[lowInd];

        if (current.x === end.x && current.y === end.y) {
            // ... (Path reconstruction remains the same) ...
            const path = [];
            let temp = current;
            while (temp.parent) {
                path.push({ x: temp.x, y: temp.y });
                temp = temp.parent;
            }
            return path.reverse();
        }

        openSet.splice(lowInd, 1);
        openSetHash.delete(key(current.x, current.y));
        closedSet.add(key(current.x, current.y));

        // --- CHANGE 2: Add Diagonal Neighbors ---
        // (dx, dy) pairs: Cardinal first, then Diagonal
        const neighborDeltas = [
            // Cardinal
            { dx: 0, dy: -1, cost: CARDINAL_COST },
            { dx: 0, dy: 1, cost: CARDINAL_COST },
            { dx: -1, dy: 0, cost: CARDINAL_COST },
            { dx: 1, dy: 0, cost: CARDINAL_COST },
            // Diagonal
            { dx: -1, dy: -1, cost: DIAGONAL_COST }, // Up-Left
            { dx: 1, dy: -1, cost: DIAGONAL_COST },  // Up-Right
            { dx: -1, dy: 1, cost: DIAGONAL_COST },  // Down-Left
            { dx: 1, dy: 1, cost: DIAGONAL_COST }   // Down-Right
        ];

        for (const delta of neighborDeltas) {
            const neighbor = { x: current.x + delta.dx, y: current.y + delta.dy };

            // Validity Check: Bounds
            if (neighbor.x < 0 || neighbor.x >= cols || neighbor.y < 0 || neighbor.y >= rows) continue;

            // Validity Check: Walls (1 is Wall)
            if (map[neighbor.y][neighbor.x] === 1) continue;

            // Check for Corner Cutting (Optional, but often desirable in RPGs)
            // If we are moving diagonally, ensure the two adjacent cardinal tiles are NOT both walls.
            if (delta.cost === DIAGONAL_COST) {
                const wall1 = map[current.y + delta.dy][current.x]; // Vertical adjacent
                const wall2 = map[current.y][current.x + delta.dx]; // Horizontal adjacent
                // If both adjacent cardinal tiles are walls, we cannot move diagonally (prevents "squeezing")
                if (wall1 === 1 && wall2 === 1) continue;
            }

            // Validity Check: Already checked
            if (closedSet.has(key(neighbor.x, neighbor.y))) continue;

            // --- CHANGE 3: Use the correct cost for G score ---
            const gScore = current.g + delta.cost;

            // Check if better path or new path
            let neighborNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

            if (!neighborNode) {
                neighborNode = {
                    x: neighbor.x,
                    y: neighbor.y,
                    g: gScore,
                    h: h(neighbor),
                    parent: current
                };
                neighborNode.f = neighborNode.g + neighborNode.h;
                openSet.push(neighborNode);
                openSetHash.add(key(neighbor.x, neighbor.y));
            } else if (gScore < neighborNode.g) {
                neighborNode.g = gScore;
                neighborNode.f = neighborNode.g + neighborNode.h;
                neighborNode.parent = current;
            }
        }
    }

    return []; // No path found
};