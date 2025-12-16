import React from 'react';

const MonsterLayer = ({ monsters, playerPosition, tileSize, isFogEnabled, visibilityRadius, hitTargetId }) => {

    const getHpBarColor = (current, max) => {
        const pct = current / max;
        if (pct > 0.5) return '#2ecc71';
        if (pct > 0.25) return '#f1c40f';
        return '#e74c3c';
    };

    return (
        <>
            {monsters.map(monster => {
                const dist = Math.sqrt(Math.pow(monster.x - playerPosition.x, 2) + Math.pow(monster.y - playerPosition.y, 2));
                const isVisible = dist < visibilityRadius;
                if (isFogEnabled && !isVisible) return null;

                const isHit = monster.id === hitTargetId;

                return (
                    <div
                        key={monster.id}
                        style={{
                            position: 'absolute', left: 0, top: 0,
                            width: tileSize, height: tileSize,
                            transform: `translate(${monster.x * tileSize}px, ${monster.y * tileSize}px)`,
                            transition: 'transform 0.2s linear',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 10, pointerEvents: 'none'
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
        </>
    );
};

export default React.memo(MonsterLayer);