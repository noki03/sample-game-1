import React from 'react';
import Tile from './Tile';
import FloatingText from './FloatingText';
import playerImg from '../assets/player_1.png';

const TILE_SIZE = 32;
const VIEWPORT_WIDTH = 26;
const VIEWPORT_HEIGHT = 18;
const VISIBILITY_RADIUS = 8;

const MapRenderer = ({ map, playerPosition, monsters, isFogEnabled, floatingTexts, hitTargetId, visitedTiles, onTileClick }) => {

    // --- CAMERA MATH ---
    const cameraX = (playerPosition.x * TILE_SIZE) - ((VIEWPORT_WIDTH * TILE_SIZE) / 2) + (TILE_SIZE / 2);
    const cameraY = (playerPosition.y * TILE_SIZE) - ((VIEWPORT_HEIGHT * TILE_SIZE) / 2) + (TILE_SIZE / 2);

    const getHpBarColor = (current, max) => {
        const pct = current / max;
        if (pct > 0.5) return '#2ecc71';
        if (pct > 0.25) return '#f1c40f';
        return '#e74c3c';
    };

    return (
        <div style={{
            width: VIEWPORT_WIDTH * TILE_SIZE,
            height: VIEWPORT_HEIGHT * TILE_SIZE,
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#000',
            border: '4px solid #444',
            boxShadow: '0 0 20px rgba(0,0,0,0.8)',
            margin: '0 auto'
        }}>

            {/* CAMERA LAYER */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0,
                transform: `translate3d(${-cameraX}px, ${-cameraY}px, 0)`,
                transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'transform'
            }}>

                {/* --- LAYER 1: THE GRID --- */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${map[0].length}, ${TILE_SIZE}px)`,
                    width: map[0].length * TILE_SIZE,
                }}>
                    {map.map((row, y) => (
                        row.map((cell, x) => {
                            let isVisible = true;
                            const isVisited = visitedTiles ? visitedTiles.has(`${x},${y}`) : false;

                            if (isFogEnabled) {
                                const dist = Math.sqrt(Math.pow(x - playerPosition.x, 2) + Math.pow(y - playerPosition.y, 2));
                                isVisible = dist < VISIBILITY_RADIUS;
                            }

                            if (isFogEnabled && !isVisible && !isVisited) {
                                return <div key={`${x}-${y}`} style={{ width: TILE_SIZE, height: TILE_SIZE, backgroundColor: '#000' }} />;
                            }

                            return (
                                <div key={`${x}-${y}`} onClick={() => onTileClick(x, y)}>
                                    <Tile type={cell} isVisible={isVisible} isVisited={isVisited} />
                                </div>
                            );
                        })
                    ))}
                </div>

                {/* --- LAYER 2: MONSTERS --- */}
                {monsters.map(monster => {
                    const dist = Math.sqrt(Math.pow(monster.x - playerPosition.x, 2) + Math.pow(monster.y - playerPosition.y, 2));
                    const isVisible = dist < VISIBILITY_RADIUS;
                    if (isFogEnabled && !isVisible) return null;

                    const isHit = monster.id === hitTargetId;

                    return (
                        <div
                            key={monster.id}
                            style={{
                                position: 'absolute',
                                left: 0, top: 0,
                                width: TILE_SIZE, height: TILE_SIZE,
                                transform: `translate(${monster.x * TILE_SIZE}px, ${monster.y * TILE_SIZE}px)`,
                                transition: 'transform 0.2s linear',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 10,
                                pointerEvents: 'none'
                            }}
                        >
                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '100%', height: '100%', alignItems: 'center' }}>
                                {/* HP BAR */}
                                {monster.maxHp && (
                                    <div style={{
                                        position: 'absolute', top: '-6px', left: '0', width: '100%', height: '4px',
                                        backgroundColor: '#000', borderRadius: '2px', zIndex: 40, border: '1px solid #000'
                                    }}>
                                        <div style={{
                                            width: `${Math.max(0, (monster.hp / monster.maxHp) * 100)}%`,
                                            height: '100%',
                                            backgroundColor: getHpBarColor(monster.hp, monster.maxHp),
                                            borderRadius: '1px', transition: 'width 0.2s'
                                        }} />
                                    </div>
                                )}

                                {/* ICON */}
                                <span
                                    className={isHit ? 'shake-effect' : ''}
                                    style={{
                                        fontSize: '24px', zIndex: 10,
                                        filter: isHit ? 'brightness(2) hue-rotate(-50deg) drop-shadow(0 0 2px black)' : 'drop-shadow(0 0 2px black)',
                                        cursor: 'default', lineHeight: '32px'
                                    }}
                                >
                                    {monster.isBoss ? '🐉' : '👹'}
                                </span>

                                {/* LEVEL */}
                                {!monster.isBoss && (
                                    <span style={{
                                        position: 'absolute', bottom: '-2px', right: '-4px',
                                        fontSize: '9px', fontWeight: 'bold', color: 'white',
                                        backgroundColor: 'red', borderRadius: '3px', padding: '0 2px',
                                        zIndex: 30, border: '1px solid white', lineHeight: '10px'
                                    }}>
                                        {monster.level}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* --- LAYER 3: PLAYER --- */}
                <div style={{
                    position: 'absolute',
                    left: 0, top: 0,
                    width: TILE_SIZE, height: TILE_SIZE,
                    transform: `translate(${playerPosition.x * TILE_SIZE}px, ${playerPosition.y * TILE_SIZE}px)`,
                    transition: 'transform 0.1s linear',
                    zIndex: 50,
                    pointerEvents: 'none'
                }}>
                    <img
                        src={playerImg} alt="Hero" className="hero-sprite"
                        style={{
                            width: 'auto', height: '42px',
                            position: 'absolute', bottom: '2px',
                            transform: 'translateX(-50%)',
                            zIndex: 50, imageRendering: 'pixelated',
                            filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))'
                        }}
                    />
                </div>

                {/* --- FLOATING TEXTS --- */}
                {floatingTexts.map(ft => (
                    <div
                        key={ft.id}
                        style={{
                            position: 'absolute',
                            left: `${ft.x * TILE_SIZE}px`,
                            top: `${ft.y * TILE_SIZE}px`,
                            color: ft.color,
                            fontWeight: 'bold', fontSize: '14px',
                            zIndex: 60, pointerEvents: 'none',
                            animation: 'floatUp 1.5s forwards',
                            textShadow: '1px 1px 0 #000',

                            // --- FIX WRAPPING HERE ---
                            width: '200px',             // Allow plenty of width
                            marginLeft: '-84px',        // Center it: (200px width - 32px tile) / 2 = 84px offset
                            textAlign: 'center',        // Keep text centered in that box
                            whiteSpace: 'nowrap'        // Force single line
                        }}
                    >
                        {ft.text}
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(-40px) scale(1.1); opacity: 0; }
                }
                .shake-effect { animation: shake 0.3s; }
                @keyframes shake {
                    0% { transform: translate(1px, 1px) rotate(0deg); }
                    10% { transform: translate(-1px, -2px) rotate(-1deg); }
                    20% { transform: translate(-3px, 0px) rotate(1deg); }
                    30% { transform: translate(3px, 2px) rotate(0deg); }
                    40% { transform: translate(1px, -1px) rotate(1deg); }
                    50% { transform: translate(-1px, 2px) rotate(-1deg); }
                    60% { transform: translate(-3px, 1px) rotate(0deg); }
                    70% { transform: translate(3px, 1px) rotate(-1deg); }
                    80% { transform: translate(-1px, -1px) rotate(1deg); }
                    90% { transform: translate(1px, 2px) rotate(0deg); }
                    100% { transform: translate(1px, -2px) rotate(-1deg); }
                }
            `}</style>
        </div>
    );
};

export default MapRenderer;