import React from 'react';
import Tile from './Tile';
import FloatingText from './FloatingText';

const VISIBILITY_RADIUS = 5; // Increased slightly for larger view
const VIEWPORT_WIDTH = 20;   // How many tiles wide is the camera
const VIEWPORT_HEIGHT = 15;  // How many tiles tall is the camera

const MapRenderer = ({ map, playerPosition, monsters, isFogEnabled, floatingTexts, hitTargetId }) => {
    const mapHeight = map.length;
    const mapWidth = map.length > 0 ? map[0].length : 0;

    // --- CAMERA LOGIC ---
    // Calculate top-left corner of the camera (clamped to map bounds)
    let cameraX = playerPosition.x - Math.floor(VIEWPORT_WIDTH / 2);
    let cameraY = playerPosition.y - Math.floor(VIEWPORT_HEIGHT / 2);

    // Clamp camera so it doesn't show void outside map
    cameraX = Math.max(0, Math.min(cameraX, mapWidth - VIEWPORT_WIDTH));
    cameraY = Math.max(0, Math.min(cameraY, mapHeight - VIEWPORT_HEIGHT));

    // Create the visible slice
    // We don't use .slice() on the array because we need the absolute indices for logic
    // We will iterate 0..ViewportSize and add the offset
    const visibleGrid = [];

    for (let y = 0; y < VIEWPORT_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < VIEWPORT_WIDTH; x++) {
            const absoluteX = cameraX + x;
            const absoluteY = cameraY + y;

            // Safety check
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
                border: '4px solid #555',
                backgroundColor: '#000',
            }}>
                {visibleGrid.map((row, relativeY) => (
                    <React.Fragment key={relativeY}>
                        {row.map((tileData) => {
                            const { x, y, type } = tileData; // Absolute Coordinates

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
            {/* We must subtract Camera Offset so text floats over the correct visible tile */}
            {floatingTexts.map(ft => {
                // Only render text if it's within the camera view
                if (
                    ft.x >= cameraX && ft.x < cameraX + VIEWPORT_WIDTH &&
                    ft.y >= cameraY && ft.y < cameraY + VIEWPORT_HEIGHT
                ) {
                    return (
                        <FloatingText
                            key={ft.id}
                            x={ft.x - cameraX} // Convert Absolute X to Relative X
                            y={ft.y - cameraY} // Convert Absolute Y to Relative Y
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