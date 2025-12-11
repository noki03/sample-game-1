import { useState, useCallback, useEffect, useRef } from 'react';
import { initialStats } from '../data/initialStats';
import { initialMap, findPlayerStart } from '../data/initialMap';

const MAX_MONSTERS = 5;
const TILE_FLOOR = 0;
const HEAL_AMOUNT = 50;
const MONSTER_MOVE_INTERVAL = 1000;
const MONSTER_SPAWN_INTERVAL = 2000;

const initialPlayerPos = findPlayerStart(initialMap);

export const useGameLogic = () => {
    const [player, setPlayer] = useState(initialStats);
    const [position, setPosition] = useState(initialPlayerPos);
    const [map] = useState(initialMap);
    const [log, setLog] = useState([
        'Welcome to the Minimal RPG!',
        'Use W, A, S, D to move.',
        'Careful! The monsters are roaming... 👹'
    ]);
    const [gameState, setGameState] = useState('EXPLORATION');
    const [monsters, setMonsters] = useState([]);
    const [isFogEnabled, setIsFogEnabled] = useState(true);

    const toggleFog = useCallback(() => {
        setIsFogEnabled(prev => !prev);
    }, []);

    // --- REFS ---
    const monstersRef = useRef(monsters);
    const positionRef = useRef(position);
    const playerRef = useRef(player);

    useEffect(() => {
        monstersRef.current = monsters;
        positionRef.current = position;
        playerRef.current = player;
    }, [monsters, position, player]);

    const addLog = useCallback((message) => {
        setLog(prevLog => {
            const newLog = [...prevLog, `[${new Date().toLocaleTimeString()}] ${message}`];
            return newLog.slice(-10); // Keep last 10
        });
    }, []);

    // --- FIXED: HEALING LOGIC ---
    const healPlayer = useCallback(() => {
        if (gameState !== 'EXPLORATION' && gameState !== 'COMBAT') return;

        // 1. Access current stats via Ref (safe from double-invocation)
        const current = playerRef.current;

        // 2. Perform Checks & Logging OUTSIDE setPlayer
        if (current.potions <= 0) {
            addLog("No potions left!");
            return;
        }
        if (current.hp >= current.maxHp) {
            addLog("HP is already full.");
            return;
        }

        // 3. Calculate new state
        const newHp = Math.min(current.hp + HEAL_AMOUNT, current.maxHp);
        addLog(`🧪 Used potion. HP: ${newHp}/${current.maxHp}`);

        // 4. Update State
        setPlayer(prev => ({ ...prev, hp: newHp, potions: prev.potions - 1 }));

    }, [gameState, addLog]);

    // --- MONSTER SPAWNING ---
    const spawnMonster = useCallback(() => {
        const currentMonsters = monstersRef.current;
        const playerPos = positionRef.current;
        if (currentMonsters.length >= MAX_MONSTERS) return;

        const mapHeight = map.length;
        const mapWidth = map[0].length;
        let x, y, tileType, attempts = 0;

        while (attempts < 50) {
            x = Math.floor(Math.random() * mapWidth);
            y = Math.floor(Math.random() * mapHeight);
            tileType = map[y][x];
            const isOccupied = currentMonsters.some(m => m.x === x && m.y === y);
            const isPlayer = playerPos.x === x && playerPos.y === y;

            if (tileType === TILE_FLOOR && !isOccupied && !isPlayer) {
                const newMonster = { id: Date.now() + Math.random(), x, y };
                setMonsters(prev => [...prev, newMonster]);
                return;
            }
            attempts++;
        }
    }, [map]);

    // --- TIMERS ---
    useEffect(() => {
        spawnMonster();
        const spawnInterval = setInterval(spawnMonster, MONSTER_SPAWN_INTERVAL);

        const roamInterval = setInterval(() => {
            if (gameState !== 'EXPLORATION') return;
            setMonsters(prevMonsters => {
                return prevMonsters.map(monster => {
                    if (Math.random() > 0.7) return monster;
                    const directions = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
                    const move = directions[Math.floor(Math.random() * directions.length)];
                    const newX = monster.x + move.dx;
                    const newY = monster.y + move.dy;
                    if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) return monster;
                    if (newX === positionRef.current.x && newY === positionRef.current.y) return monster;
                    if (prevMonsters.some(m => m.id !== monster.id && m.x === newX && m.y === newY)) return monster;
                    return { ...monster, x: newX, y: newY };
                });
            });
        }, MONSTER_MOVE_INTERVAL);

        return () => {
            clearInterval(spawnInterval);
            clearInterval(roamInterval);
        };
    }, [spawnMonster, gameState, map]);

    // --- PLAYER MOVEMENT ---
    const movePlayer = useCallback((dx, dy) => {
        if (gameState !== 'EXPLORATION') return;
        const newX = position.x + dx;
        const newY = position.y + dy;

        if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) {
            addLog('Ouch! Hit the map boundary.');
            return;
        }

        const encounteredMonster = monsters.find(m => m.x === newX && m.y === newY);

        if (encounteredMonster) {
            addLog('👹 A wild monster appears!');
            setGameState('COMBAT');

            setTimeout(() => {
                setGameState('EXPLORATION');
                const currentStats = playerRef.current;
                let newHp = Math.max(currentStats.hp - 10, 0);
                let newXp = currentStats.xp + 40;
                let newLevel = currentStats.level;
                let newMaxHp = currentStats.maxHp;
                let newNextLevelXp = currentStats.nextLevelXp;
                let newPotions = currentStats.potions;

                if (newHp === 0) {
                    addLog("💀 You died! Respawning...");
                    setPlayer({ ...initialStats, potions: 3 });
                } else {
                    if (Math.random() > 0.7) {
                        newPotions += 1;
                        addLog("✨ Found a Potion!");
                    }
                    if (newXp >= newNextLevelXp) {
                        newLevel += 1;
                        newMaxHp += 20;
                        newHp = newMaxHp;
                        newXp = newXp - newNextLevelXp;
                        newNextLevelXp = Math.floor(newNextLevelXp * 1.5);
                        addLog(`🎉 LEVEL UP! You are now Level ${newLevel}.`);
                    } else {
                        addLog('Victory! +40 XP, -10 HP');
                    }
                    setPlayer({ level: newLevel, hp: newHp, maxHp: newMaxHp, xp: newXp, nextLevelXp: newNextLevelXp, potions: newPotions });
                }
                setMonsters(prev => prev.filter(m => m.id !== encounteredMonster.id));
            }, 1000);
            return;
        }
        setPosition({ x: newX, y: newY });
    }, [position, map, gameState, addLog, monsters]);

    const handleKeyDown = useCallback((e) => {
        switch (e.key.toUpperCase()) {
            case 'W': movePlayer(0, -1); break;
            case 'S': movePlayer(0, 1); break;
            case 'A': movePlayer(-1, 0); break;
            case 'D': movePlayer(1, 0); break;
            case 'H': healPlayer(); break;
            case 'F': toggleFog(); break;
            default: return;
        }
        e.preventDefault();
    }, [movePlayer, healPlayer, toggleFog]);

    return { player, position, map, log, gameState, monsters, isFogEnabled, toggleFog, handleKeyDown };
};