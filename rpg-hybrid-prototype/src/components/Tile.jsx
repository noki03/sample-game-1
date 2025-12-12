import React from 'react';
import cobbleStoneImg from '../assets/cobble_stone.png';
import playerImg from '../assets/player_1.png';

const Tile = ({ type, isPlayer, isMonster, isBoss, isVisible, monsterLevel, isHit }) => {

    // --- TILE BACKGROUND ---
    const getStyle = () => {
        // 1. Hidden (Fog)
        if (!isVisible) return { backgroundColor: '#000' };

        // 2. Base Texture (Applied to all visible floor/start tiles)
        const baseStyle = {
            // Always define these defaults to overwrite previous state
            backgroundImage: `url(${cobbleStoneImg})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
            // IMPORTANT: Explicitly reset special effects so they don't "trail"
            backgroundBlendMode: 'normal'
        };

        // 3. Player Tile (Adds Shadow Gradient)
        if (isPlayer) {
            return {
                ...baseStyle,
                // We layer the Shadow Gradient ON TOP of the image using comma separation
                backgroundImage: `radial-gradient(circle at bottom, rgba(0,0,0,0.6) 0%, transparent 70%), url(${cobbleStoneImg})`,
                backgroundBlendMode: 'multiply' // Darkens the floor under the player
            };
        }

        // 4. Standard Tiles
        switch (type) {
            case 2: // Start
            case 0: // Floor
                return baseStyle;
            default: // Walls
                return { backgroundColor: '#222222' };
        }
    };

    // Monster Sprite Styles
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
                // Explicitly toggle shadow to prevent border artifacts
                boxShadow: isPlayer ? 'none' : '0 0 0 0.5px #111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // Spread the dynamic style last
                ...getStyle(),
            }}
        >
            {isVisible && (
                <>
                    {/* --- MONSTER RENDERING --- */}
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
                        // --- PLAYER RENDERING ---
                        <img
                            src={playerImg}
                            alt="Hero"
                            className="hero-sprite"
                            style={{
                                width: '32px',
                                height: '32px',
                                zIndex: 50,
                                position: 'relative',
                                top: '-4px'
                            }}
                        />
                    ) : null}
                </>
            )}
        </div>
    );
};

export default React.memo(Tile);