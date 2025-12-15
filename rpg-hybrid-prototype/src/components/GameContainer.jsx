import React, { useEffect, useState } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import MapRenderer from './MapRenderer';
import StatsPanel from './StatsPanel';
import CombatLog from './CombatLog';
import GameOverScreen from './GameOverScreen';
import ConfirmationModal from './ConfirmationModal';
import InventoryScreen from './InventoryScreen';
import MiniMap from './MiniMap';
import CheatMenu from './CheatMenu'; // NEW IMPORT

const GameContainer = () => {
    const {
        isLoading,
        player, position, map, log, gameState, monsters, isFogEnabled,
        toggleFog, handleKeyDown, resetGame, respawnPlayer,
        isInventoryOpen, toggleInventory, equipItem, unequipItem,
        floatingTexts, hitTargetId, visitedTiles, handleTileClick, consumeItem,

        // NEW EXPORTS
        setPlayer,
        addLog
    } = useGameLogic();

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isCheatMenuOpen, setIsCheatMenuOpen] = useState(false); // NEW STATE

    useEffect(() => {
        // Disable keyboard game inputs if a modal is open
        if (!isLoading && !isResetModalOpen && !isCheatMenuOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown, isLoading, isResetModalOpen, isCheatMenuOpen]);

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
            minHeight: '100vh', backgroundColor: '#111',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            color: '#f0f0f0', position: 'relative', padding: '20px'
        }}>

            {/* --- MODALS --- */}
            <GameOverScreen gameState={gameState} onRestart={resetGame} onRespawn={respawnPlayer} />

            <ConfirmationModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={resetGame}
                title="Reset Progress?"
                message="Are you sure you want to delete your save file?"
            />

            <InventoryScreen
                isOpen={isInventoryOpen}
                player={player}
                onEquip={equipItem}
                onUnequip={unequipItem}
                onConsume={consumeItem} // <--- Pass it here
                onClose={toggleInventory}
            />

            {/* NEW CHEAT MENU */}
            <CheatMenu
                isOpen={isCheatMenuOpen}
                onClose={() => setIsCheatMenuOpen(false)}
                player={player}
                setPlayer={setPlayer}
                addLog={addLog}
            />

            {/* --- HEADER --- */}
            <h1 style={{ marginBottom: '10px', textShadow: '0 4px 10px rgba(0,0,0,0.5)', color: '#ecf0f1' }}>
                Minimal RPG Prototype
            </h1>

            {/* --- MAIN GAME CONSOLE --- */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                backgroundColor: '#222', padding: '20px', borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #333'
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

                    {/* NEW DEV BUTTON */}
                    <button onClick={() => setIsCheatMenuOpen(true)} style={btnStyle('#8e44ad')}>
                        ⚙️ Dev
                    </button>
                </div>

                {/* GAME VIEWPORT ROW */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <MiniMap map={map} playerPosition={position} monsters={monsters} />
                        <MapRenderer
                            map={map} playerPosition={position} monsters={monsters}
                            isFogEnabled={isFogEnabled} floatingTexts={floatingTexts}
                            hitTargetId={hitTargetId} visitedTiles={visitedTiles}
                            onTileClick={handleTileClick}
                        />
                        <div style={{
                            marginTop: '10px', fontSize: '14px', color: '#666', textAlign: 'center',
                            backgroundColor: '#111', padding: '5px', borderRadius: '4px'
                        }}>
                            Pos: {position.x}, {position.y} | Monsters: {monsters.length}
                        </div>
                    </div>

                    <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <StatsPanel stats={player} />
                        <CombatLog log={log} gameState={gameState} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const btnStyle = (bg) => ({
    padding: '10px 20px', backgroundColor: bg, color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    fontSize: '14px', fontWeight: 'bold',
    boxShadow: '0 4px 0 rgba(0,0,0,0.2)', transition: 'transform 0.1s',
    minWidth: '80px' // Slightly smaller to fit 4 buttons
});

export default GameContainer;