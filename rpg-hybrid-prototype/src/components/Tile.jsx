import React from 'react';
import cobbleStoneImg from '../assets/cobble_stone.png';

const Tile = ({ type, isPlayer, isMonster, isBoss, isVisible, monsterLevel }) => {

    // --- 1. TILE BACKGROUND ---
    const getStyle = () => {
        if (!isVisible) return { backgroundColor: '#000' };

        switch (type) {
            case 2: // Start
            case 0: // Floor
                return {
                    backgroundImage: `url(${cobbleStoneImg})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    imageRendering: 'pixelated'
                };
            default: // Walls
                return { backgroundColor: '#222222' };
        }
    };

    // --- 2. ACTOR STYLES ---
    const actorStyle = {
        fontSize: '24px',
        zIndex: 20,
        filter: 'drop-shadow(0 0 2px black) drop-shadow(0 0 1px white)',
        cursor: 'default',
        lineHeight: '32px',
        position: 'relative' // Needed for absolute positioning of the level badge
    };

    return (
        <div
            style={{
                width: '32px',
                height: '32px',
                border: '1px solid transparent',
                boxShadow: '0 0 0 0.5px #111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...getStyle(),
            }}
        >
            {isVisible && (
                <>
                    {isMonster ? (
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                            {/* The Monster Sprite */}
                            <span style={{ ...actorStyle, zIndex: 10 }}>
                                {isBoss ? '🐉' : '👹'}
                            </span>

                            {/* NEW: Level Badge */}
                            {!isBoss && (
                                <span style={{
                                    position: 'absolute',
                                    bottom: '-2px',
                                    right: '-4px',
                                    fontSize: '9px',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    backgroundColor: 'red',
                                    borderRadius: '3px',
                                    padding: '0 2px',
                                    zIndex: 30,
                                    border: '1px solid white',
                                    lineHeight: '10px'
                                }}>
                                    {monsterLevel}
                                </span>
                            )}
                        </div>
                    ) : isPlayer ? (
                        <span style={{
                            ...actorStyle,
                            zIndex: 20,
                            filter: 'drop-shadow(0 0 2px black) drop-shadow(0 0 2px cyan)'
                        }}>
                            🏃
                        </span>
                    ) : null}
                </>
            )}
        </div>
    );
};

export default React.memo(Tile);