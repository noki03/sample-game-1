import React from 'react';
import Tile from './Tile';

// Visibility Radius in tiles
const VISIBILITY_RADIUS = 4;

const MapRenderer = ({ map, playerPosition, monsters, isFogEnabled }) => {
    const mapWidth = map.length > 0 ? map[0].length : 1;

    return (
        <div style={{
            display: 'inline-grid',
            gridTemplateColumns: `repeat(${mapWidth}, 34px)`,
            gridGap: '0px',
            border: '4px solid #555',
            backgroundColor: '#000',
            // Center the map visually if smaller than container
            alignSelf: 'center'
        }}>
            {map.map((row, y) => (
                <React.Fragment key={y}>
                    {row.map((tileType, x) => {
                        const isMonsterAtTile = monsters.some(m => m.x === x && m.y === y);

                        // --- FOG CALCULATION ---
                        let isVisible = true;
                        if (isFogEnabled) {
                            // Euclidean distance formula (Pythagoras)
                            const distance = Math.sqrt(
                                Math.pow(x - playerPosition.x, 2) +
                                Math.pow(y - playerPosition.y, 2)
                            );
                            // If tile is further than radius, it's hidden
                            isVisible = distance < VISIBILITY_RADIUS;
                        }
                        // -----------------------

                        return (
                            <Tile
                                key={`${x},${y}`}
                                type={tileType}
                                isPlayer={playerPosition.x === x && playerPosition.y === y}
                                isMonster={isMonsterAtTile}
                                isVisible={isVisible} // Pass visibility prop
                            />
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
    );
};

export default MapRenderer;