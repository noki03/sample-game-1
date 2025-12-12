import React, { useRef, useEffect } from 'react';

const CELL_SIZE = 4; // 4px per tile

const MiniMap = ({ map, playerPosition, monsters }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !map || map.length === 0) return;

        const ctx = canvas.getContext('2d');
        const height = map.length;
        const width = map[0].length;

        // 1. Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2. Draw the Map (Walls & Floors)
        // Optimization: Loop through the raw data array
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tileType = map[y][x];

                // Colors
                if (tileType === 1) {
                    ctx.fillStyle = '#444'; // Wall (Grey)
                } else {
                    ctx.fillStyle = '#111'; // Floor (Black)
                }

                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }

        // 3. Draw Monsters (Boss = Red, Normal = Small Red)
        monsters.forEach(m => {
            ctx.fillStyle = m.isBoss ? '#e74c3c' : '#c0392b';
            // Make Boss slightly larger on minimap
            const size = m.isBoss ? CELL_SIZE + 2 : CELL_SIZE;
            const offset = m.isBoss ? -1 : 0;
            ctx.fillRect((m.x * CELL_SIZE) + offset, (m.y * CELL_SIZE) + offset, size, size);
        });

        // 4. Draw Player (Cyan Dot - Drawn last to be on top)
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(
            playerPosition.x * CELL_SIZE,
            playerPosition.y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
        );

    }, [map, playerPosition, monsters]); // Re-draw whenever these change

    // Calculate canvas size based on map dimensions
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
                style={{ display: 'block' }} // Removes generic inline-block spacing
            />
            <div style={{
                textAlign: 'center',
                fontSize: '10px',
                color: '#888',
                padding: '2px',
                backgroundColor: '#222',
                borderTop: '1px solid #444'
            }}>
                Mini-Map
            </div>
        </div>
    );
};

export default React.memo(MiniMap);