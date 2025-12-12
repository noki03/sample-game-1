import { useState, useRef, useEffect, useCallback } from 'react';

const MAX_MONSTERS = 10;
const TILE_FLOOR = 0;
const MONSTER_MOVE_INTERVAL = 1000;
const MONSTER_SPAWN_INTERVAL = 2000;

export const useMonsterManager = (map, playerPosition, playerLevel, gameState, addLog, savedMonsters) => {
    const [monsters, setMonsters] = useState(savedMonsters || []);

    const monstersRef = useRef(monsters);
    const positionRef = useRef(playerPosition);
    const playerLevelRef = useRef(playerLevel);
    const hasLoggedDragonRef = useRef(false);

    useEffect(() => {
        monstersRef.current = monsters;
        positionRef.current = playerPosition;
        playerLevelRef.current = playerLevel;
    }, [monsters, playerPosition, playerLevel]);

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

        if (!map || map.length === 0) return;

        const bossExists = currentMonsters.some(m => m.isBoss);
        const needsBoss = !bossExists;

        if (!needsBoss && currentMonsters.length >= MAX_MONSTERS) return;

        let attempts = 0;
        while (attempts < 50) {
            const x = Math.floor(Math.random() * map[0].length);
            const y = Math.floor(Math.random() * map.length);

            const isFloor = map[y][x] === TILE_FLOOR;
            const isOccupied = currentMonsters.some(m => m.x === x && m.y === y);
            const isPlayer = playerPos.x === x && playerPos.y === y;

            if (isFloor && !isOccupied && !isPlayer) {
                if (needsBoss) {
                    const bossLevel = Math.max(10, currentLevel + 5);
                    // BOSS HP
                    const bossHp = 100 + (bossLevel * 20);
                    setMonsters(prev => prev.some(m => m.isBoss) ? prev : [...prev, {
                        id: 'BOSS', x, y, level: bossLevel, isBoss: true,
                        hp: bossHp, maxHp: bossHp // Added HP
                    }]);
                } else {
                    const variance = Math.floor(Math.random() * 6) - 3;
                    const mLevel = Math.max(1, currentLevel + variance);
                    // NORMAL HP
                    const mHp = 15 + (mLevel * 5);

                    setMonsters(prev => [...prev, {
                        id: Date.now() + Math.random(), x, y, level: mLevel, isBoss: false,
                        hp: mHp, maxHp: mHp // Added HP
                    }]);
                }
                return;
            }
            attempts++;
        }
    }, [map]);

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

    const removeMonster = (id) => {
        setMonsters(prev => prev.filter(m => m.id !== id));
    };

    return { monsters, setMonsters, removeMonster };
};