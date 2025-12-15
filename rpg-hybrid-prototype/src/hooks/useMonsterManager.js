import { useState, useRef, useEffect, useCallback } from 'react';

const MAX_MONSTERS = 10;
const TILE_FLOOR = 0;
const MONSTER_MOVE_INTERVAL = 1000;
const MONSTER_SPAWN_INTERVAL = 2000;

export const useMonsterManager = (map, playerPosition, playerLevel, floor, gameState, addLog, savedMonsters) => {
    const [monsters, setMonsters] = useState(savedMonsters || []);

    const monstersRef = useRef(monsters);
    const positionRef = useRef(playerPosition);
    const playerLevelRef = useRef(playerLevel);
    const floorRef = useRef(floor);
    const hasLoggedDragonRef = useRef(false);

    useEffect(() => {
        monstersRef.current = monsters;
        positionRef.current = playerPosition;
        playerLevelRef.current = playerLevel;
        floorRef.current = floor;
    }, [monsters, playerPosition, playerLevel, floor]);

    // Dragon Log
    useEffect(() => {
        const bossExists = monsters.some(m => m.isBoss);
        if (bossExists && !hasLoggedDragonRef.current) {
            addLog("⚠️ The Dragon has entered the map!");
            hasLoggedDragonRef.current = true;
        }
        if (!bossExists) hasLoggedDragonRef.current = false;
    }, [monsters, addLog]);

    const spawnMonster = useCallback(() => {
        const currentMonsters = monstersRef.current;
        const playerPos = positionRef.current;
        const currentLevel = playerLevelRef.current;
        const currentFloor = floorRef.current || 1;

        if (!map || map.length === 0) return;

        // Boss on every 5th floor
        const isBossFloor = (currentFloor % 5 === 0);
        const bossExists = currentMonsters.some(m => m.isBoss);
        const needsBoss = isBossFloor && !bossExists;

        if (!needsBoss && currentMonsters.length >= MAX_MONSTERS) return;

        let attempts = 0;
        while (attempts < 50) {
            const x = Math.floor(Math.random() * map[0].length);
            const y = Math.floor(Math.random() * map.length);

            const isFloor = map[y][x] === TILE_FLOOR;
            const isOccupied = currentMonsters.some(m => m.x === x && m.y === y);
            const isPlayer = playerPos.x === x && playerPos.y === y;

            if (isFloor && !isOccupied && !isPlayer) {
                // SCALING LOGIC: Monsters get stronger deeper in the dungeon
                // Base Level = Player Level + (Floor / 2)
                const baseDifficulty = Math.max(1, currentLevel + Math.floor((currentFloor - 1) / 2));

                if (needsBoss) {
                    const bossLevel = baseDifficulty + 5;
                    const bossHp = 200 + (bossLevel * 30); // Boss is a tank
                    setMonsters(prev => prev.some(m => m.isBoss) ? prev : [...prev, {
                        id: 'BOSS', x, y, level: bossLevel, isBoss: true, isMonster: true, // ADDED FLAG
                        hp: bossHp, maxHp: bossHp,
                        name: 'Dragon King'
                    }]);
                } else {
                    const variance = Math.floor(Math.random() * 3);
                    const mLevel = Math.max(1, baseDifficulty + variance);

                    // BALANCED HP: 20 + (Level * 10). Lvl 1 = 30 HP.
                    const mHp = 20 + (mLevel * 10);

                    setMonsters(prev => [...prev, {
                        id: Date.now() + Math.random(), x, y, level: mLevel,
                        isBoss: false, isMonster: true, // <--- CRITICAL FIX: Added this flag
                        hp: mHp, maxHp: mHp
                    }]);
                }
                return;
            }
            attempts++;
        }
    }, [map]);

    // ... (Timers and Helper functions remain the same) ...
    // Paste existing timer useEffect and updateMonster/removeMonster here

    // Timers
    useEffect(() => {
        spawnMonster();
        const spawnTimer = setInterval(spawnMonster, MONSTER_SPAWN_INTERVAL);

        const roamTimer = setInterval(() => {
            if (gameState !== 'EXPLORATION') return;
            if (!map || map.length === 0) return;

            setMonsters(prev => prev.map(m => {
                if (Math.random() > 0.7) return m;

                const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
                const move = dirs[Math.floor(Math.random() * dirs.length)];
                const newX = m.x + move.dx;
                const newY = m.y + move.dy;

                if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) return m;
                if (map[newY][newX] === 1) return m;

                if (newX === positionRef.current.x && newY === positionRef.current.y) return m;
                if (prev.some(other => other.id !== m.id && other.x === newX && other.y === newY)) return m;

                return { ...m, x: newX, y: newY };
            }));
        }, MONSTER_MOVE_INTERVAL);

        return () => { clearInterval(spawnTimer); clearInterval(roamTimer); };
    }, [spawnMonster, gameState, map]);

    const updateMonster = useCallback((updatedMonster) => {
        setMonsters(prev => prev.map(m => m.id === updatedMonster.id ? updatedMonster : m));
    }, []);

    const removeMonster = (id) => {
        setMonsters(prev => prev.filter(m => m.id !== id));
    };

    return { monsters, setMonsters, removeMonster, updateMonster };
};