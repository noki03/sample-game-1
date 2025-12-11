import React, { useEffect } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import MapRenderer from './MapRenderer';
import StatsPanel from './StatsPanel';
import CombatLog from './CombatLog';

const GameContainer = () => {
    const {
        player,
        position,
        map,
        log,
        gameState,
        monsters,
        isFogEnabled, // Get state
        toggleFog,    // Get toggle function
        handleKeyDown
    } = useGameLogic();

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            color: '#f0f0f0',
        }}>
            <h1 style={{ marginBottom: '20px', textShadow: '2px 2px 4px #000' }}>
                Minimal RPG Prototype
            </h1>

            {/* --- FOG TOGGLE BUTTON --- */}
            <button
                onClick={toggleFog}
                style={{
                    marginBottom: '15px',
                    padding: '8px 16px',
                    backgroundColor: isFogEnabled ? '#2c3e50' : '#27ae60', // Dark Blue vs Green
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                }}
            >
                Fog of War: <strong>{isFogEnabled ? 'ON' : 'OFF'}</strong> (Press F)
            </button>
            {/* ------------------------- */}

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>

                {/* Left Col: Map */}
                <div>
                    <MapRenderer
                        map={map}
                        playerPosition={position}
                        monsters={monsters}
                        isFogEnabled={isFogEnabled} // Pass prop
                    />
                    <div style={{ marginTop: '10px', fontSize: '14px', color: '#888', textAlign: 'center' }}>
                        Pos: {position.x}, {position.y} | Monsters: {monsters.length}
                    </div>
                </div>

                {/* Right Col: HUD */}
                <div style={{ width: '250px' }}>
                    <StatsPanel stats={player} />
                    <CombatLog log={log} gameState={gameState} />
                </div>

            </div>
        </div>
    );
};

export default GameContainer;