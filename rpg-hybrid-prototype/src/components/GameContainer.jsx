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
        handleKeyDown
    } = useGameLogic();

    // Attach the keyboard listener to the document body when the component mounts
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
            // Change minHeight to height to match App.jsx dimensions exactly
            height: '100%',

            padding: '20px',
            fontFamily: 'monospace',
            backgroundColor: '#282828',
            color: '#f0f0f0',
        }}>
            <h1>Minimal 2D RPG Prototype</h1>

            <div style={{
                display: 'flex',
                gap: '20px',
                // Optional: Ensure the main content block doesn't interfere with centering
                marginBottom: '20px'
            }}>

                {/* Map View */}
                <div>
                    <h2>🗺️ Map</h2>
                    <MapRenderer map={map} playerPosition={position} />
                    <p style={{ marginTop: '10px', fontSize: '14px' }}>
                        Current Position: ({position.x}, {position.y})
                    </p>
                </div>

                {/* Stats and Log */}
                <div>
                    <StatsPanel stats={player} />
                    <CombatLog log={log} gameState={gameState} />
                </div>
            </div>

        </div>
    );
};

export default GameContainer;