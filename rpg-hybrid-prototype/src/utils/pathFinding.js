// A simple A* Pathfinding implementation for 2D Grids

export const findPath = (start, end, map) => {
    const rows = map.length;
    const cols = map[0].length;

    // Helper to get a unique key for the set
    const key = (x, y) => `${x},${y}`;

    // Heuristic: Manhattan Distance (fast calculation for grids)
    const h = (n) => Math.abs(n.x - end.x) + Math.abs(n.y - end.y);

    const openSet = [];
    const openSetHash = new Set(); // For fast lookup
    const closedSet = new Set();

    // Start Node
    const startNode = { x: start.x, y: start.y, g: 0, h: 0, f: 0, parent: null };
    startNode.h = h(startNode);
    startNode.f = startNode.h;

    openSet.push(startNode);
    openSetHash.add(key(start.x, start.y));

    while (openSet.length > 0) {
        // 1. Get node with lowest F score
        let lowInd = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowInd].f) {
                lowInd = i;
            }
        }

        let current = openSet[lowInd];

        // 2. Check if we reached the end
        if (current.x === end.x && current.y === end.y) {
            const path = [];
            let temp = current;
            while (temp.parent) {
                path.push({ x: temp.x, y: temp.y });
                temp = temp.parent;
            }
            // Return path from Start -> End
            // Note: The path includes the target, but not the start point
            return path.reverse();
        }

        // 3. Move current from Open to Closed
        openSet.splice(lowInd, 1);
        openSetHash.delete(key(current.x, current.y));
        closedSet.add(key(current.x, current.y));

        // 4. Check Neighbors (Up, Down, Left, Right)
        const neighbors = [
            { x: current.x, y: current.y - 1 }, // Up
            { x: current.x, y: current.y + 1 }, // Down
            { x: current.x - 1, y: current.y }, // Left
            { x: current.x + 1, y: current.y }  // Right
        ];

        for (let neighbor of neighbors) {
            // Validity Check: Bounds
            if (neighbor.x < 0 || neighbor.x >= cols || neighbor.y < 0 || neighbor.y >= rows) continue;

            // Validity Check: Walls (1 is Wall)
            if (map[neighbor.y][neighbor.x] === 1) continue;

            // Validity Check: Already checked
            if (closedSet.has(key(neighbor.x, neighbor.y))) continue;

            // Calculate G score (distance from start)
            const gScore = current.g + 1;

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