import { useState, useRef, useEffect, useCallback } from 'react';

const MAX_MONSTERS = 5;
const TILE_FLOOR = 0;
const MONSTER_MOVE_INTERVAL = 1000;
const MONSTER_SPAWN_INTERVAL = 2000;

export const useMonsterManager = (map, playerPosition, playerLevel, gameState, addLog) => {
    const [monsters, setMonsters] = useState([]);

    // Refs to access fresh state inside intervals without resetting them
    const monstersRef = useRef(monsters);
    const positionRef = useRef(playerPosition);
    const playerLevelRef = useRef(playerLevel);
    const hasLoggedDragonRef = useRef(false);

    // Sync Refs with State
    useEffect(() => {
        monstersRef.current = monsters;
        positionRef.current = playerPosition;
        playerLevelRef.current = playerLevel;
    }, [monsters, playerPosition, playerLevel]);

    // Effect to log Dragon entry only once
    useEffect(() => {
        const bossExists = monsters.some(m => m.isBoss);
        if (bossExists && !hasLoggedDragonRef.current) {
            addLog("⚠️ The Dragon has entered the map!");
            hasLoggedDragonRef.current = true;
        }
        // Reset log flag if dragon is defeated
        if (!bossExists) hasLoggedDragonRef.current = false;
    }, [monsters, addLog]);

    // --- SPAWN LOGIC ---
    const spawnMonster = useCallback(() => {
        const currentMonsters = monstersRef.current;
        const playerPos = positionRef.current;
        const currentLevel = playerLevelRef.current;

        // Check if we need to spawn a Boss (Limit 1)
        const bossExists = currentMonsters.some(m => m.isBoss);
        const needsBoss = !bossExists;

        // Check monster cap (Boss ignores cap if it needs to spawn)
        if (!needsBoss && currentMonsters.length >= MAX_MONSTERS) return;

        // Try finding a valid spawn spot 50 times
        let attempts = 0;
        while (attempts < 50) {
            const x = Math.floor(Math.random() * map[0].length);
            const y = Math.floor(Math.random() * map.length);

            const isFloor = map[y][x] === TILE_FLOOR;
            const isOccupied = currentMonsters.some(m => m.x === x && m.y === y);
            const isPlayer = playerPos.x === x && playerPos.y === y;

            if (isFloor && !isOccupied && !isPlayer) {
                if (needsBoss) {
                    // Boss Logic: Always significantly stronger than current level
                    const bossLevel = Math.max(10, currentLevel + 5);
                    setMonsters(prev => prev.some(m => m.isBoss) ? prev : [...prev, { id: 'BOSS', x, y, level: bossLevel, isBoss: true }]);
                } else {
                    // --- UPDATED VARIANCE FOR XP PENALTY TESTING ---
                    // Range: -3 to +2 levels relative to Player
                    // Math.random() * 6 gives 0 to 5.99 -> floor gives 0 to 5 -> minus 3 gives -3 to +2
                    const variance = Math.floor(Math.random() * 6) - 3;

                    // Minimum level is always 1
                    const mLevel = Math.max(1, currentLevel + variance);

                    setMonsters(prev => [...prev, { id: Date.now() + Math.random(), x, y, level: mLevel, isBoss: false }]);
                }
                return;
            }
            attempts++;
        }
    }, [map]);

    // --- INTERVALS (Spawn & Roam) ---
    useEffect(() => {
        // Initial spawn attempt
        spawnMonster();

        // Spawn Timer
        const spawnTimer = setInterval(spawnMonster, MONSTER_SPAWN_INTERVAL);

        // Roam Timer
        const roamTimer = setInterval(() => {
            // Only move if exploring
            if (gameState !== 'EXPLORATION') return;

            setMonsters(prev => prev.map(m => {
                // 30% chance to idle
                if (Math.random() > 0.7) return m;

                const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
                const move = dirs[Math.floor(Math.random() * dirs.length)];
                const newX = m.x + move.dx;
                const newY = m.y + move.dy;

                // Boundary Checks
                if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) return m;
                // Collision with Player
                if (newX === positionRef.current.x && newY === positionRef.current.y) return m;
                // Collision with Other Monsters
                if (prev.some(other => other.id !== m.id && other.x === newX && other.y === newY)) return m;

                // Apply Move
                return { ...m, x: newX, y: newY };
            }));
        }, MONSTER_MOVE_INTERVAL);

        // Cleanup
        return () => { clearInterval(spawnTimer); clearInterval(roamTimer); };
    }, [spawnMonster, gameState, map]);

    const removeMonster = (id) => {
        setMonsters(prev => prev.filter(m => m.id !== id));
    };

    return { monsters, setMonsters, removeMonster };
};