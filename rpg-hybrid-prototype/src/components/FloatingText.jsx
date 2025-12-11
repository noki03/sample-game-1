import React from 'react';

const TILE_SIZE = 32;

const FloatingText = ({ x, y, text, color }) => {
    // Calculate absolute position relative to the map container
    // Center horizontally, position slightly above the tile vertically
    const top = y * TILE_SIZE - 10;
    const left = x * TILE_SIZE;

    return (
        <div
            className="floating-text-item"
            style={{
                top: `${top}px`,
                left: `${left}px`,
                width: `${TILE_SIZE}px`, // Ensure centering works
                textAlign: 'center',
                color: color || '#fff',

                // --- NEW SIZE SETTINGS ---
                fontSize: '13px',
                fontWeight: 'bold',
                zIndex: 100,
                textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' // Strong outline
            }}
        >
            {text}
        </div>
    );
};

// Using memo to prevent unnecessary re-renders of existing text items
export default React.memo(FloatingText);