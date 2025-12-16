import { useState, useCallback } from 'react';
import { initialStats } from '../../data/initialStats';
import { generateDungeon } from '../../utils/mapGenerator';

const MAP_WIDTH = 60;
const MAP_HEIGHT = 40;
const VISIBILITY_RADIUS = 8;

export const useDungeonState = () => {
    // --- CORE STATE (Moved from useGameLogic) ---
    const [player, setPlayer] = useState(initialStats);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [map, setMap] = useState(() => generateDungeon(MAP_WIDTH, MAP_HEIGHT));
    const [visitedTiles, setVisitedTiles] = useState(new Set());
    const [gameState, setGameState] = useState('EXPLORATION');
    const [isFogEnabled, setIsFogEnabled] = useState(true);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [monsters, setMonsters] = useState([]);
    const [loadedMonsters, setLoadedMonsters] = useState(null);
    const [moveQueue, setMoveQueue] = useState([]);

    // --- Helpers (Kept here as they depend on local constants) ---
    const updateVisited = useCallback((pos) => {
        setVisitedTiles(prev => {
            const newSet = new Set(prev);
            for (let y = pos.y - VISIBILITY_RADIUS; y <= pos.y + VISIBILITY_RADIUS; y++) {
                for (let x = pos.x - VISIBILITY_RADIUS; x <= pos.x + VISIBILITY_RADIUS; x++) {
                    const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                    if (dist < VISIBILITY_RADIUS) { newSet.add(`${x},${y}`); }
                }
            }
            return newSet;
        });
    }, []);

    return {
        player, setPlayer, position, setPosition, map, setMap,
        visitedTiles, setVisitedTiles, updateVisited,
        gameState, setGameState, isFogEnabled, setIsFogEnabled,
        isInventoryOpen, setIsInventoryOpen,
        monsters, setMonsters,
        loadedMonsters, setLoadedMonsters,
        moveQueue, setMoveQueue,
        MAP_WIDTH, MAP_HEIGHT, VISIBILITY_RADIUS
    };
};