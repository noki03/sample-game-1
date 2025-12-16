import { useEffect, useCallback } from 'react';
import { initialStats } from '../../data/initialStats';
import { generateDungeon, findRandomFloor } from '../../utils/mapGenerator';
import { saveGameState, loadGameState, clearGameState } from '../../db';

const MAP_WIDTH = 60;
const MAP_HEIGHT = 40;

export const useDataPersistence = (state, setFns, setIsDataLoaded) => {

    // Destructure needed state and setters
    const { player, position, monsters, gameState, isFogEnabled, map, visitedTiles } = state;
    const { setPlayer, setPosition, setMap, setVisitedTiles, setGameState, setIsFogEnabled, setLoadedMonsters, setMonsters, setMoveQueue, visuals } = setFns;

    // --- LOAD GAME STATE (Original useEffect) ---
    useEffect(() => {
        const initGame = async () => {
            const savedData = await loadGameState();
            if (savedData) {
                setPlayer({
                    ...initialStats, ...savedData.player,
                    speed: savedData.player.speed || initialStats.speed,
                    floor: savedData.player.floor || 1,
                    lastHealTime: savedData.player.lastHealTime || 0,
                    healCooldown: savedData.player.healCooldown || 20000,
                    inventory: savedData.player.inventory || [],
                    equipment: savedData.player.equipment || { weapon: null, armor: null }
                });
                setPosition(savedData.position);
                setGameState(savedData.gameState);
                setIsFogEnabled(savedData.isFogEnabled);
                setLoadedMonsters(savedData.monsters);
                if (savedData.map) setMap(savedData.map);
                if (savedData.visitedTiles) setVisitedTiles(new Set(savedData.visitedTiles));
            } else {
                const newMap = generateDungeon(MAP_WIDTH, MAP_HEIGHT);
                setMap(newMap);
                const startPos = findRandomFloor(newMap);
                setPosition(startPos);
                setVisitedTiles(new Set([`${startPos.x},${startPos.y}`]));
            }
            setIsDataLoaded(true);
        };
        initGame();
    }, []);

    // --- AUTOSAVE (Original useEffect) ---
    useEffect(() => {
        if (!setIsDataLoaded) return;
        const saveData = async () => {
            await saveGameState({
                player, position, monsters, gameState, isFogEnabled, map,
                visitedTiles: Array.from(visitedTiles)
            });
        };
        const timeoutId = setTimeout(saveData, 500);
        return () => clearTimeout(timeoutId);
    }, [player, position, monsters, gameState, isFogEnabled, map, visitedTiles, setIsDataLoaded]);

    // --- RESET GAME LOGIC (Original logic) ---
    const resetGame = useCallback(async () => {
        await clearGameState();
        const newMap = generateDungeon(MAP_WIDTH, MAP_HEIGHT);
        const startPos = findRandomFloor(newMap);
        setMap(newMap);
        setPlayer(initialStats);
        setPosition(startPos);
        setGameState('EXPLORATION');
        setMonsters([]);
        setMoveQueue([]);
        setVisitedTiles(new Set([`${startPos.x},${startPos.y}`]));
        visuals.resetVisuals();
    }, [setMap, setPlayer, setPosition, setGameState, setMonsters, setMoveQueue, setVisitedTiles, visuals]);

    return { resetGame };
};