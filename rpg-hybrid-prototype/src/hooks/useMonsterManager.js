import { useState, useRef, useEffect, useCallback } from 'react';

const MAX_MONSTERS = 10;
const TILE_FLOOR = 0;
// CHANGED: 1000ms (1s) feels much more responsive than 2s
const GAME_TICK_INTERVAL = 1000;
const AGGRO_RADIUS = 6;

export const useMonsterManager = (map, playerPosition, playerLevel, floor, gameState, addLog, savedMonsters, onPlayerHit) => {
    const [monsters, setMonsters] = useState(savedMonsters || []);

    // Refs
    const monstersRef = useRef(monsters);
    const positionRef = useRef(playerPosition);
    const playerLevelRef = useRef(playerLevel);
    const floorRef = useRef(floor);
    const hasLoggedDragonRef = useRef(false);
    const onPlayerHitRef = useRef(onPlayerHit);

    useEffect(() => {
        monstersRef.current = monsters;
        positionRef.current = playerPosition;
        playerLevelRef.current = playerLevel;
        floorRef.current = floor;
        onPlayerHitRef.current = onPlayerHit;
    }, [monsters, playerPosition, playerLevel, floor, onPlayerHit]);

    // Dragon Log
    useEffect(() => {
        const bossExists = monsters.some(m => m.isBoss);
        if (bossExists && !hasLoggedDragonRef.current) {
            addLog("⚠️ The Dragon has entered the map!");
            hasLoggedDragonRef.current = true;
        }
        if (!bossExists) hasLoggedDragonRef.current = false;
    }, [monsters, addLog]);


    // --- UNIFIED GAME LOOP ---
    useEffect(() => {
        const tick = () => {
            if (gameState !== 'EXPLORATION') return;
            if (!map || map.length === 0) return;

            const playerPos = positionRef.current;
            const currentLevel = playerLevelRef.current;
            const currentFloor = floorRef.current || 1;

            // --- STEP 1: SPAWN LOGIC ---
            let nextMonsters = [...monstersRef.current];

            const isBossFloor = (currentFloor % 5 === 0);
            const bossExists = nextMonsters.some(m => m.isBoss);
            const needsBoss = isBossFloor && !bossExists;

            if (needsBoss || nextMonsters.length < MAX_MONSTERS) {
                let attempts = 0;
                let spawned = false;
                while (attempts < 10 && !spawned) {
                    const x = Math.floor(Math.random() * map[0].length);
                    const y = Math.floor(Math.random() * map.length);

                    const isFloor = map[y][x] === TILE_FLOOR;
                    const isOccupied = nextMonsters.some(m => m.x === x && m.y === y);
                    const isPlayer = playerPos.x === x && playerPos.y === y;

                    if (isFloor && !isOccupied && !isPlayer) {
                        const baseDifficulty = Math.max(1, currentLevel + Math.floor((currentFloor - 1) / 2));
                        let newMonster;

                        if (needsBoss) {
                            const bossLevel = baseDifficulty + 5;
                            const bossHp = 200 + (bossLevel * 30);
                            newMonster = {
                                id: 'BOSS', x, y, level: bossLevel, isBoss: true, isMonster: true,
                                hp: bossHp, maxHp: bossHp, name: 'Dragon King'
                            };
                        } else {
                            const variance = Math.floor(Math.random() * 3);
                            const mLevel = Math.max(1, baseDifficulty + variance);
                            const mHp = 20 + (mLevel * 10);
                            newMonster = {
                                id: Date.now() + Math.random(), x, y, level: mLevel,
                                isBoss: false, isMonster: true,
                                hp: mHp, maxHp: mHp
                            };
                        }
                        nextMonsters.push(newMonster);
                        spawned = true;
                    }
                    attempts++;
                }
            }

            // --- STEP 2: MOVEMENT AI ---
            const attacksToTrigger = [];

            nextMonsters = nextMonsters.map(m => {
                const distToPlayer = Math.abs(m.x - playerPos.x) + Math.abs(m.y - playerPos.y);
                let dx = 0;
                let dy = 0;

                if (distToPlayer <= AGGRO_RADIUS) {
                    // CHASE MODE: Always try to move
                    if (m.x < playerPos.x) dx = 1;
                    else if (m.x > playerPos.x) dx = -1;
                    if (m.y < playerPos.y) dy = 1;
                    else if (m.y > playerPos.y) dy = -1;

                    if (Math.abs(m.x - playerPos.x) > Math.abs(m.y - playerPos.y)) dy = 0;
                    else dx = 0;
                } else {
                    // IDLE MODE: 60% chance to move (was 30%)
                    // If random > 0.6 (40% chance), we stay. 
                    if (Math.random() > 0.6) return m;

                    const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
                    const move = dirs[Math.floor(Math.random() * dirs.length)];
                    dx = move.dx; dy = move.dy;
                }

                const newX = m.x + dx;
                const newY = m.y + dy;

                // Collision Checks
                if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) return m;
                if (map[newY][newX] === 1) return m;

                // Player Attack Check
                if (newX === playerPos.x && newY === playerPos.y) {
                    attacksToTrigger.push(m);
                    return m;
                }

                // Monster Collision Check
                if (nextMonsters.some(other => other.id !== m.id && other.x === newX && other.y === newY)) return m;

                return { ...m, x: newX, y: newY };
            });

            // --- STEP 3: UPDATE STATE ---
            setMonsters(nextMonsters);

            // --- STEP 4: TRIGGERS ---
            attacksToTrigger.forEach(monster => {
                if (onPlayerHitRef.current) onPlayerHitRef.current(monster);
            });
        };

        const timer = setInterval(tick, GAME_TICK_INTERVAL);
        return () => clearInterval(timer);
    }, [gameState, map]);


    const updateMonster = useCallback((updatedMonster) => {
        setMonsters(prev => prev.map(m => m.id === updatedMonster.id ? updatedMonster : m));
    }, []);

    const removeMonster = (id) => {
        setMonsters(prev => prev.filter(m => m.id !== id));
    };

    return { monsters, setMonsters, removeMonster, updateMonster };
};