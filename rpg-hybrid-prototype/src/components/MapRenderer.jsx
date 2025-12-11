import React from 'react';
import Tile from './Tile';

const MapRenderer = ({ map, playerPosition }) => {
    // Determine the map width dynamically or use a fixed value based on the design (20 columns)
    const mapWidth = map.length > 0 ? map[0].length : 1;

    return (
        <div style={{
            display: 'inline-grid',
            // Update: Use the calculated map width to create the grid columns (20 columns)
            gridTemplateColumns: `repeat(${mapWidth}, 34px)`, // 32px tile + 2*1px borders
            gridGap: '0px',
            border: '2px solid #555' // Slightly darker border
        }}>
            {map.map((row, y) => (
                <React.Fragment key={y}>
                    {row.map((tileType, x) => (
                        <Tile
                            key={`${x},${y}`}
                            type={tileType}
                            isPlayer={playerPosition.x === x && playerPosition.y === y}
                        />
                    ))}
                </React.Fragment>
            ))}
        </div>
    );
};

export default MapRenderer;