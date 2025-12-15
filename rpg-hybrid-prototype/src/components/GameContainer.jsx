import React, { useEffect, useState } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import MapRenderer from './MapRenderer';
import StatsPanel from './StatsPanel';
import CombatLog from './CombatLog';
import GameOverScreen from './GameOverScreen';
import ConfirmationModal from './ConfirmationModal';
import InventoryScreen from './InventoryScreen';
import MiniMap from './MiniMap';

const GameContainer = () => {
    const {
        isLoading,
        player, position, map, log, gameState, monsters, isFogEnabled,
        toggleFog, handleKeyDown, resetGame,
        isInventoryOpen, toggleInventory, equipItem, unequipItem,
        floatingTexts, hitTargetId, visitedTiles, handleTileClick
    } = useGameLogic();

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !isResetModalOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown, isLoading, isResetModalOpen]);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center',
                backgroundColor: '#1a1a1a', color: '#888', fontFamily: 'monospace', fontSize: '24px'
            }}>
                Loading Adventure...
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#111', // Dark page background
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            color: '#f0f0f0', position: 'relative',
            padding: '20px'
        }}>

            {/* --- UI OVERLAYS --- */}
            <GameOverScreen gameState={gameState} onRestart={resetGame} />

            <ConfirmationModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={resetGame}
                title="Reset Progress?"
                message="Are you sure you want to delete your save file? This action cannot be undone."
            />

            <InventoryScreen
                isOpen={isInventoryOpen}
                player={player}
                onEquip={equipItem}
                onUnequip={unequipItem}
                onClose={toggleInventory}
            />

            {/* --- HEADER --- */}
            <h1 style={{ marginBottom: '10px', textShadow: '0 4px 10px rgba(0,0,0,0.5)', color: '#ecf0f1' }}>
                Minimal RPG Prototype
            </h1>

            {/* --- MAIN GAME CONSOLE --- */}
            {/* This container wraps everything to look like a unified interface */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#222', // Console body color
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                border: '1px solid #333'
            }}>

                {/* CONTROL BAR */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', width: '100%', justifyContent: 'center' }}>
                    <button onClick={toggleFog} style={btnStyle('#2c3e50')}>
                        Fog: {isFogEnabled ? 'ON' : 'OFF'} (F)
                    </button>
                    <button onClick={toggleInventory} style={btnStyle('#e67e22')}>
                        🎒 Bag (I)
                    </button>
                    <button onClick={() => setIsResetModalOpen(true)} style={btnStyle('#c0392b')}>
                        🗑️ Reset
                    </button>
                </div>

                {/* GAME VIEWPORT ROW */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>

                    {/* MAP AREA */}
                    <div style={{ position: 'relative' }}>
                        <MiniMap map={map} playerPosition={position} monsters={monsters} />
                        <MapRenderer
                            map={map} playerPosition={position} monsters={monsters} isFogEnabled={isFogEnabled}
                            floatingTexts={floatingTexts} hitTargetId={hitTargetId} visitedTiles={visitedTiles} onTileClick={handleTileClick}
                        />
                        <div style={{
                            marginTop: '10px', fontSize: '14px', color: '#666', textAlign: 'center',
                            backgroundColor: '#111', padding: '5px', borderRadius: '4px'
                        }}>
                            Pos: {position.x}, {position.y} | Monsters: {monsters.length}
                        </div>
                    </div>

                    {/* SIDEBAR */}
                    <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <StatsPanel stats={player} />
                        <CombatLog log={log} gameState={gameState} />
                    </div>

                </div>
            </div>
        </div>
    );
};

// Helper for consistent button styling
const btnStyle = (bg) => ({
    padding: '10px 20px',
    backgroundColor: bg,
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: '0 4px 0 rgba(0,0,0,0.2)', // Button 3D effect
    transition: 'transform 0.1s',
    minWidth: '100px'
});

export default GameContainer;