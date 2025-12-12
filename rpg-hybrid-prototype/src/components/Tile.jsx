import React from 'react';
import cobbleStoneImg from '../assets/cobble_stone.png';
import playerImg from '../assets/player_1.png';

const Tile = ({ type, isPlayer, isMonster, isBoss, isVisible, isVisited, monsterLevel, isHit, monsterHp, monsterMaxHp }) => {

    const getStyle = () => {
        // --- VISIBLE ---
        if (isVisible) {
            const baseStyle = {
                backgroundImage: `url(${cobbleStoneImg})`,
                backgroundSize: 'cover', backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated', backgroundBlendMode: 'normal'
            };

            if (isPlayer) {
                return {
                    ...baseStyle,
                    backgroundImage: `radial-gradient(circle at bottom, rgba(0,0,0,0.6) 0%, transparent 70%), url(${cobbleStoneImg})`,
                    backgroundBlendMode: 'multiply'
                };
            }

            switch (type) {
                case 3: // STAIRS
                    return { ...baseStyle, filter: 'sepia(30%)' }; // Slight tint for stairs
                case 2: case 0: return baseStyle;
                default: return { backgroundColor: '#222222' };
            }
        }

        // --- VISITED ---
        if (isVisited) {
            switch (type) {
                case 3: // STAIRS
                case 2: case 0:
                    return {
                        backgroundImage: `url(${cobbleStoneImg})`,
                        backgroundSize: 'cover', backgroundRepeat: 'no-repeat',
                        imageRendering: 'pixelated',
                        filter: 'grayscale(100%) brightness(30%)'
                    };
                default: return { backgroundColor: '#1a1a1a' };
            }
        }
        return { backgroundColor: '#000' };
    };

    const monsterStyle = {
        fontSize: '24px', zIndex: 20, filter: 'drop-shadow(0 0 2px black) drop-shadow(0 0 1px white)',
        cursor: 'default', lineHeight: '32px', position: 'relative'
    };

    const getHpBarColor = (current, max) => {
        const pct = current / max;
        if (pct > 0.5) return '#2ecc71';
        if (pct > 0.25) return '#f1c40f';
        return '#e74c3c';
    };

    return (
        <div
            style={{
                width: '32px', height: '32px', border: '1px solid transparent',
                overflow: 'visible', position: 'relative',
                boxShadow: (isVisible || isVisited) && !isPlayer ? '0 0 0 0.5px #111' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...getStyle(),
            }}
        >
            {isVisible && (
                <>
                    {/* RENDER STAIRS ICON */}
                    {/* RENDER STAIRS (Type 3) */}
                    {type === 3 && !isPlayer && !isMonster && (
                        // REPLACED EMOJI WITH CSS "DUNGEON ENTRANCE"
                        <div style={{
                            width: '18px',
                            height: '18px',
                            backgroundColor: '#050505', // Almost black hole
                            border: '2px solid #555',   // Stone trim
                            boxShadow: 'inset 0 0 5px #000', // Inner shadow for depth
                            zIndex: 5,
                            // Optional: Rotate slightly for diamond shape? 
                            // transform: 'rotate(45deg)' 
                        }} />
                    )}

                    {isMonster ? (
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                            {/* HP BAR */}
                            {monsterMaxHp && (
                                <div style={{
                                    position: 'absolute', top: '-6px', left: '0', width: '100%', height: '4px',
                                    backgroundColor: '#000', borderRadius: '2px', zIndex: 40, border: '1px solid #000'
                                }}>
                                    <div style={{
                                        width: `${Math.max(0, (monsterHp / monsterMaxHp) * 100)}%`,
                                        height: '100%',
                                        backgroundColor: getHpBarColor(monsterHp, monsterMaxHp),
                                        borderRadius: '1px', transition: 'width 0.2s'
                                    }} />
                                </div>
                            )}

                            <span className={isHit ? 'shake-effect' : ''} style={{ ...monsterStyle, zIndex: 10 }}>
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
                        <img
                            src={playerImg} alt="Hero" className="hero-sprite"
                            style={{
                                width: 'auto', height: '42px', position: 'absolute', bottom: '2px',
                                transform: 'translateX(-50%)', zIndex: 50, imageRendering: 'pixelated',
                                filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))'
                            }}
                        />
                    ) : null}
                </>
            )}
        </div>
    );
};

export default React.memo(Tile);