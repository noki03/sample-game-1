import React from 'react';
import Tile from '../Tile';

const MapLayer = ({ map, visitedTiles, playerPosition, isFogEnabled, onTileClick, tileSize, visibilityRadius }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${map[0].length}, ${tileSize}px)`,
            width: map[0].length * tileSize,
        }}>
            {map.map((row, y) => (
                row.map((cell, x) => {
                    let isVisible = true;
                    const isVisited = visitedTiles ? visitedTiles.has(`${x},${y}`) : false;

                    if (isFogEnabled) {
                        const dist = Math.sqrt(Math.pow(x - playerPosition.x, 2) + Math.pow(y - playerPosition.y, 2));
                        isVisible = dist < visibilityRadius;
                    }

                    if (isFogEnabled && !isVisible && !isVisited) {
                        return <div key={`${x}-${y}`} style={{ width: tileSize, height: tileSize, backgroundColor: '#000' }} />;
                    }

                    return (
                        <div key={`${x}-${y}`} onClick={() => onTileClick(x, y)}>
                            <Tile type={cell} isVisible={isVisible} isVisited={isVisited} />
                        </div>
                    );
                })
            ))}
        </div>
    );
};

export default React.memo(MapLayer);