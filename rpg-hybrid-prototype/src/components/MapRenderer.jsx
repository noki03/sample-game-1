import React from 'react';
import Tile from './Tile';

const VISIBILITY_RADIUS = 4;

const MapRenderer = ({ map, playerPosition, monsters, isFogEnabled }) => {
    const mapWidth = map.length > 0 ? map[0].length : 1;

    return (
        <div style={{
            display: 'inline-grid',
            gridTemplateColumns: `repeat(${mapWidth}, 32px)`,
            gridGap: '0px',
            border: '4px solid #555',
            backgroundColor: '#000',
            alignSelf: 'center'
        }}>
            {map.map((row, y) => (
                <React.Fragment key={y}>
                    {row.map((tileType, x) => {
                        const monsterAtTile = monsters.find(m => m.x === x && m.y === y);

                        let isVisible = true;
                        if (isFogEnabled) {
                            const distance = Math.sqrt(Math.pow(x - playerPosition.x, 2) + Math.pow(y - playerPosition.y, 2));
                            isVisible = distance < VISIBILITY_RADIUS;
                        }

                        return (
                            <Tile
                                key={`${x},${y}`}
                                type={tileType}
                                isPlayer={playerPosition.x === x && playerPosition.y === y}
                                isMonster={!!monsterAtTile}
                                // NEW: Pass the level if a monster exists
                                monsterLevel={monsterAtTile?.level}
                                isBoss={monsterAtTile?.isBoss}
                                isVisible={isVisible}
                            />
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
    );
};

export default MapRenderer;