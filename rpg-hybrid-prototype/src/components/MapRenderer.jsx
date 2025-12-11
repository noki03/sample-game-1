import React from 'react';
import Tile from './Tile';
import FloatingText from './FloatingText';

const VISIBILITY_RADIUS = 4;

const MapRenderer = ({ map, playerPosition, monsters, isFogEnabled, floatingTexts, hitTargetId }) => {
    const mapWidth = map.length > 0 ? map[0].length : 1;

    return (
        <div style={{ position: 'relative', alignSelf: 'center' }}>
            {/* Map Grid */}
            <div style={{
                display: 'inline-grid',
                gridTemplateColumns: `repeat(${mapWidth}, 32px)`,
                gridGap: '0px',
                border: '4px solid #555',
                backgroundColor: '#000',
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
                                    monsterLevel={monsterAtTile?.level}
                                    isBoss={monsterAtTile?.isBoss}
                                    // Pass down the hit state for animation
                                    isHit={monsterAtTile && monsterAtTile.id === hitTargetId}
                                    isVisible={isVisible}
                                />
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>

            {/* Floating Text Layer */}
            {floatingTexts.map(ft => (
                <FloatingText key={ft.id} x={ft.x} y={ft.y} text={ft.text} color={ft.color} />
            ))}
        </div>
    );
};

export default MapRenderer;