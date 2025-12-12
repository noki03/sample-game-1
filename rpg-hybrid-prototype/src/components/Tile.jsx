import React from 'react';
import cobbleStoneImg from '../assets/cobble_stone.png';
import playerImg from '../assets/player_1.png';

const Tile = ({ type, isPlayer, isMonster, isBoss, isVisible, isVisited, monsterLevel, isHit }) => {

    // --- TILE BACKGROUND ---
    const getStyle = () => {
        // 1. VISIBLE (Bright)
        if (isVisible) {
            const baseStyle = {
                backgroundImage: `url(${cobbleStoneImg})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
                backgroundBlendMode: 'normal'
            };

            if (isPlayer) {
                return {
                    ...baseStyle,
                    backgroundImage: `radial-gradient(circle at bottom, rgba(0,0,0,0.6) 0%, transparent 70%), url(${cobbleStoneImg})`,
                    backgroundBlendMode: 'multiply'
                };
            }

            switch (type) {
                case 2: case 0: return baseStyle;
                default: return { backgroundColor: '#222222' };
            }
        }

        // 2. VISITED (Dimmed / Memory)
        if (isVisited) {
            switch (type) {
                case 2: // Start
                case 0: // Floor
                    return {
                        backgroundImage: `url(${cobbleStoneImg})`,
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        imageRendering: 'pixelated',
                        filter: 'grayscale(100%) brightness(30%)'
                    };
                default: // Walls
                    return { backgroundColor: '#1a1a1a' };
            }
        }

        // 3. HIDDEN (Black)
        return { backgroundColor: '#000' };
    };

    const monsterStyle = {
        fontSize: '24px',
        zIndex: 20,
        filter: 'drop-shadow(0 0 2px black) drop-shadow(0 0 1px white)',
        cursor: 'default',
        lineHeight: '32px',
        position: 'relative'
    };

    return (
        <div
            style={{
                width: '32px',
                height: '32px',
                border: '1px solid transparent',
                // Allow the player image to overflow out of the top of the tile
                overflow: 'visible',
                position: 'relative', // Needed for absolute positioning of player

                boxShadow: (isVisible || isVisited) && !isPlayer ? '0 0 0 0.5px #111' : 'none',
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
                            <span
                                className={isHit ? 'shake-effect' : ''}
                                style={{ ...monsterStyle, zIndex: 10 }}
                            >
                                {isBoss ? '🐉' : '👹'}
                            </span>

                            {!isBoss && (
                                <span style={{
                                    position: 'absolute', bottom: '-2px', right: '-4px', fontSize: '9px', fontWeight: 'bold', color: 'white', backgroundColor: 'red', borderRadius: '3px', padding: '0 2px', zIndex: 30, border: '1px solid white', lineHeight: '10px'
                                }}>
                                    {monsterLevel}
                                </span>
                            )}
                        </div>
                    ) : isPlayer ? (
                        // --- UPDATED PLAYER RENDERING ---
                        <img
                            src={playerImg}
                            alt="Hero"
                            className="hero-sprite"
                            style={{
                                // 1. Allow aspect ratio to determine width
                                width: 'auto',
                                // 2. Set height taller than the tile (e.g., 42px or 48px)
                                height: '42px',

                                // 3. Position: Center horizontally, Anchor feet to bottom
                                position: 'absolute',
                                left: '50%',
                                bottom: '4px', // Adjust this if feet are floating too high/low
                                transform: 'translateX(-50%)', // Perfectly center based on dynamic width

                                zIndex: 50,
                                imageRendering: 'pixelated', // Critical for scaling down pixel art
                                filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' // Optional shadow for depth
                            }}
                        />
                    ) : null}
                </>
            )}
        </div>
    );
};

export default React.memo(Tile);