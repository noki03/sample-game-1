import React from 'react';
import cobbleStoneImg from '../assets/cobble_stone.png';

// NEW Prop: isHit
const Tile = ({ type, isPlayer, isMonster, isBoss, isVisible, monsterLevel, isHit }) => {

    // ... (getStyle / background styles remain the same) ...
    const getStyle = () => {
        if (!isVisible) return { backgroundColor: '#000' };
        switch (type) {
            case 2: case 0: return { backgroundImage: `url(${cobbleStoneImg})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated' };
            default: return { backgroundColor: '#222222' };
        }
    };

    const actorStyle = {
        fontSize: '24px', zIndex: 20, filter: 'drop-shadow(0 0 2px black) drop-shadow(0 0 1px white)', cursor: 'default', lineHeight: '32px', position: 'relative'
    };

    return (
        <div style={{ width: '32px', height: '32px', border: '1px solid transparent', boxShadow: '0 0 0 0.5px #111', display: 'flex', alignItems: 'center', justifyContent: 'center', ...getStyle() }}>
            {isVisible && (
                <>
                    {isMonster ? (
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>

                            {/* NEW: Apply shake class conditionally to the sprite span */}
                            <span
                                className={isHit ? 'shake-effect' : ''}
                                style={{ ...actorStyle, zIndex: 10 }}
                            >
                                {isBoss ? '🐉' : '👹'}
                            </span>

                            {!isBoss && (
                                <span style={{ position: 'absolute', bottom: '-2px', right: '-4px', fontSize: '9px', fontWeight: 'bold', color: 'white', backgroundColor: 'red', borderRadius: '3px', padding: '0 2px', zIndex: 30, border: '1px solid white', lineHeight: '10px' }}>
                                    {monsterLevel}
                                </span>
                            )}
                        </div>
                    ) : isPlayer ? (
                        // (Player doesn't shake on attack, only monsters)
                        <span style={{ ...actorStyle, zIndex: 20, filter: 'drop-shadow(0 0 2px black) drop-shadow(0 0 2px cyan)' }}>
                            🧍‍♂️
                        </span>
                    ) : null}
                </>
            )}
        </div>
    );
};

export default React.memo(Tile);