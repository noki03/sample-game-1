import React from 'react';

// Simple presentational component for a single tile
const Tile = ({ type, isPlayer }) => {
    const getStyle = () => {
        switch (type) {
            case 1: return { backgroundColor: 'darkgray', color: 'white' }; // Wall
            case 2: // Start position, treated as floor visually
            case 0: return { backgroundColor: 'saddlebrown' }; // Floor
            case 3: return { backgroundColor: 'red' }; // Monster
            default: return { backgroundColor: 'lightgray' };
        }
    };

    return (
        <div
            style={{
                width: '32px',
                height: '32px',
                border: '1px solid black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...getStyle(),
            }}
        >
            {/* Player visualization - simple dot for MVP */}
            {isPlayer ? <span style={{ fontSize: '20px' }}>🏃</span> : ''}
            {/* Uncomment below to see tile numbers for debugging */}
            {/* {!isPlayer ? type : ''} */}
        </div>
    );
};

export default React.memo(Tile);