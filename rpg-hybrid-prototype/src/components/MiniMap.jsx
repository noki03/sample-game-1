import React, { useRef, useEffect } from 'react';

const CELL_SIZE = 4;

const MiniMap = ({ map, playerPosition, monsters }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !map || map.length === 0) return;

        const ctx = canvas.getContext('2d');
        const height = map.length;
        const width = map[0].length;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Map Tiles
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tileType = map[y][x];

                if (tileType === 1) {
                    ctx.fillStyle = '#444'; // Wall
                } else if (tileType === 3) {
                    ctx.fillStyle = '#f39c12'; // STAIRS (Orange/Yellow) <-- NEW
                } else {
                    ctx.fillStyle = '#111'; // Floor
                }

                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }

        // 2. Draw Monsters
        monsters.forEach(m => {
            // Boss = Bright Red (#e74c3c), Normal = Darker Red (#c0392b)
            ctx.fillStyle = m.isBoss ? '#e74c3c' : '#c0392b';

            // FIX: Removed visual bleed. 
            // Both are now exactly CELL_SIZE (4px). 
            // No offset needed.
            ctx.fillRect(m.x * CELL_SIZE, m.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        });
        // 3. Draw Player
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(
            playerPosition.x * CELL_SIZE,
            playerPosition.y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
        );

    }, [map, playerPosition, monsters]);

    const mapHeight = map && map.length > 0 ? map.length : 0;
    const mapWidth = map && map.length > 0 ? map[0].length : 0;

    if (!mapWidth) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            border: '2px solid #555',
            backgroundColor: '#000',
            zIndex: 90,
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            opacity: 0.9,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <canvas
                ref={canvasRef}
                width={mapWidth * CELL_SIZE}
                height={mapHeight * CELL_SIZE}
                style={{ display: 'block' }}
            />
            <div style={{
                textAlign: 'center', fontSize: '10px', color: '#888',
                padding: '2px', backgroundColor: '#222', borderTop: '1px solid #444'
            }}>
                Mini-Map
            </div>
        </div>
    );
};

export default React.memo(MiniMap);