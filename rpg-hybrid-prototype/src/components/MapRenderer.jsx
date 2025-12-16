import React from 'react';
import MapLayer from './map/MapLayer';
import MonsterLayer from './map/MonsterLayer';
import PlayerLayer from './map/PlayerLayer';
import FloatingTextLayer from './map/FloatingTextLayer';

const TILE_SIZE = 32;
const VIEWPORT_WIDTH = 26;
const VIEWPORT_HEIGHT = 18;
const VISIBILITY_RADIUS = 8;

const MapRenderer = ({ map, playerPosition, monsters, isFogEnabled, floatingTexts, hitTargetId, visitedTiles, onTileClick, playerHealth, playerMaxHealth }) => {

    // --- CAMERA MATH ---
    const cameraX = (playerPosition.x * TILE_SIZE) - ((VIEWPORT_WIDTH * TILE_SIZE) / 2) + (TILE_SIZE / 2);
    const cameraY = (playerPosition.y * TILE_SIZE) - ((VIEWPORT_HEIGHT * TILE_SIZE) / 2) + (TILE_SIZE / 2);

    return (
        <div style={{
            width: VIEWPORT_WIDTH * TILE_SIZE,
            height: VIEWPORT_HEIGHT * TILE_SIZE,
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#000',
            border: '4px solid #444',
            boxShadow: '0 0 20px rgba(0,0,0,0.8)',
            margin: '0 auto'
        }}>

            {/* CAMERA CONTAINER */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0,
                transform: `translate3d(${-cameraX}px, ${-cameraY}px, 0)`,
                transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'transform'
            }}>

                <MapLayer
                    map={map}
                    visitedTiles={visitedTiles}
                    playerPosition={playerPosition}
                    isFogEnabled={isFogEnabled}
                    onTileClick={onTileClick}
                    tileSize={TILE_SIZE}
                    visibilityRadius={VISIBILITY_RADIUS}
                />

                <MonsterLayer
                    monsters={monsters}
                    playerPosition={playerPosition}
                    tileSize={TILE_SIZE}
                    isFogEnabled={isFogEnabled}
                    visibilityRadius={VISIBILITY_RADIUS}
                    hitTargetId={hitTargetId}
                />

                <PlayerLayer
                    position={playerPosition}
                    tileSize={TILE_SIZE}
                    hp={playerHealth}
                    maxHp={playerMaxHealth}
                />

                <FloatingTextLayer
                    texts={floatingTexts}
                    tileSize={TILE_SIZE}
                />

            </div>

            {/* GLOBAL ANIMATIONS */}
            <style>{`
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(-40px) scale(1.1); opacity: 0; }
                }
                .shake-effect { animation: shake 0.3s; }
                @keyframes shake {
                    0% { transform: translate(1px, 1px) rotate(0deg); }
                    10% { transform: translate(-1px, -2px) rotate(-1deg); }
                    30% { transform: translate(3px, 2px) rotate(0deg); }
                    50% { transform: translate(-1px, 2px) rotate(-1deg); }
                    70% { transform: translate(3px, 1px) rotate(-1deg); }
                    90% { transform: translate(1px, 2px) rotate(0deg); }
                    100% { transform: translate(1px, -2px) rotate(-1deg); }
                }
            `}</style>
        </div>
    );
};

export default MapRenderer;