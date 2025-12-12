import React, { useEffect, useState } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import MapRenderer from './MapRenderer';
import StatsPanel from './StatsPanel';
import CombatLog from './CombatLog';
import GameOverScreen from './GameOverScreen';
import ConfirmationModal from './ConfirmationModal';
import InventoryScreen from './InventoryScreen';

const GameContainer = () => {
    const {
        isLoading,
        player,
        position,
        map,
        log,
        gameState,
        monsters,
        isFogEnabled,

        toggleFog,
        handleKeyDown,
        resetGame,

        // Inventory
        isInventoryOpen,
        toggleInventory,
        equipItem,
        unequipItem, // <-- NEW

        floatingTexts,
        hitTargetId
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
                backgroundColor: '#282828', color: 'white', fontFamily: 'monospace', fontSize: '24px'
            }}>
                Loading Adventure...
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            color: '#f0f0f0', position: 'relative'
        }}>

            <GameOverScreen gameState={gameState} onRestart={resetGame} />

            <ConfirmationModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={resetGame}
                title="Reset Progress?"
                message="Are you sure you want to delete your save file? This action cannot be undone."
            />

            {/* NEW: Pass onUnequip to InventoryScreen */}
            <InventoryScreen
                isOpen={isInventoryOpen}
                player={player}
                onEquip={equipItem}
                onUnequip={unequipItem} // <-- PASS THIS PROP
                onClose={toggleInventory}
            />

            <h1 style={{ marginBottom: '20px', textShadow: '2px 2px 4px #000' }}>
                Minimal RPG Prototype
            </h1>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button onClick={toggleFog} style={{ padding: '8px 16px', backgroundColor: isFogEnabled ? '#2c3e50' : '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                    Fog: {isFogEnabled ? 'ON' : 'OFF'} (F)
                </button>

                <button onClick={toggleInventory} style={{ padding: '8px 16px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                    🎒 Bag (I)
                </button>

                <button onClick={() => setIsResetModalOpen(true)} style={{ padding: '8px 16px', backgroundColor: '#c0392b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                    🗑️ Reset
                </button>
            </div>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                <div>
                    <MapRenderer
                        map={map} playerPosition={position} monsters={monsters} isFogEnabled={isFogEnabled}
                        floatingTexts={floatingTexts} hitTargetId={hitTargetId}
                    />
                    <div style={{ marginTop: '10px', fontSize: '14px', color: '#888', textAlign: 'center' }}>
                        Pos: {position.x}, {position.y} | Monsters: {monsters.length}
                    </div>
                </div>

                <div style={{ width: '250px' }}>
                    <StatsPanel stats={player} />
                    <CombatLog log={log} gameState={gameState} />
                </div>
            </div>
        </div>
    );
};

export default GameContainer;