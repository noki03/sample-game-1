import React from 'react';
import Tile from './Tile';
import FloatingText from './FloatingText';

// --- UPDATED CONFIG ---
const VISIBILITY_RADIUS = 8; // Increased from 5 to 8 for better visibility
const VIEWPORT_WIDTH = 26;   // Increased from 20 to 26 (Wider view)
const VIEWPORT_HEIGHT = 18;  // Increased from 15 to 18 (Taller view)
// ----------------------

const MapRenderer = ({ map, playerPosition, monsters, isFogEnabled, floatingTexts, hitTargetId }) => {
    const mapHeight = map.length;
    const mapWidth = map.length > 0 ? map[0].length : 0;

    // --- CAMERA LOGIC ---
    let cameraX = playerPosition.x - Math.floor(VIEWPORT_WIDTH / 2);
    let cameraY = playerPosition.y - Math.floor(VIEWPORT_HEIGHT / 2);

    // Clamp camera
    cameraX = Math.max(0, Math.min(cameraX, mapWidth - VIEWPORT_WIDTH));
    cameraY = Math.max(0, Math.min(cameraY, mapHeight - VIEWPORT_HEIGHT));

    const visibleGrid = [];

    for (let y = 0; y < VIEWPORT_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < VIEWPORT_WIDTH; x++) {
            const absoluteX = cameraX + x;
            const absoluteY = cameraY + y;

            if (absoluteY >= mapHeight || absoluteX >= mapWidth) continue;

            row.push({
                x: absoluteX,
                y: absoluteY,
                type: map[absoluteY][absoluteX]
            });
        }
        visibleGrid.push(row);
    }

    return (
        <div style={{ position: 'relative', alignSelf: 'center' }}>

            {/* Render Viewport Grid */}
            <div style={{
                display: 'inline-grid',
                gridTemplateColumns: `repeat(${VIEWPORT_WIDTH}, 32px)`,
                gridGap: '0px',
                border: '4px solid #444', // Slightly lighter border
                backgroundColor: '#000',
                boxShadow: '0 0 20px rgba(0,0,0,0.8)' // Nice shadow for depth
            }}>
                {visibleGrid.map((row, relativeY) => (
                    <React.Fragment key={relativeY}>
                        {row.map((tileData) => {
                            const { x, y, type } = tileData;

                            const monsterAtTile = monsters.find(m => m.x === x && m.y === y);

                            let isVisible = true;
                            if (isFogEnabled) {
                                const distance = Math.sqrt(Math.pow(x - playerPosition.x, 2) + Math.pow(y - playerPosition.y, 2));
                                isVisible = distance < VISIBILITY_RADIUS;
                            }

                            return (
                                <Tile
                                    key={`${x},${y}`}
                                    type={type}
                                    isPlayer={playerPosition.x === x && playerPosition.y === y}
                                    isMonster={!!monsterAtTile}
                                    monsterLevel={monsterAtTile?.level}
                                    isBoss={monsterAtTile?.isBoss}
                                    isHit={monsterAtTile && monsterAtTile.id === hitTargetId}
                                    isVisible={isVisible}
                                />
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>

            {/* Floating Text Layer */}
            {floatingTexts.map(ft => {
                if (
                    ft.x >= cameraX && ft.x < cameraX + VIEWPORT_WIDTH &&
                    ft.y >= cameraY && ft.y < cameraY + VIEWPORT_HEIGHT
                ) {
                    return (
                        <FloatingText
                            key={ft.id}
                            x={ft.x - cameraX}
                            y={ft.y - cameraY}
                            text={ft.text}
                            color={ft.color}
                        />
                    );
                }
                return null;
            })}
        </div>
    );
};

export default MapRenderer;