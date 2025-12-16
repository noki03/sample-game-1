import React, { useState, useEffect, useRef } from 'react';
import playerImg from '../../assets/player_1.png';

const PlayerLayer = ({ position, tileSize, hp, maxHp }) => {
    // --- FLIPPING LOGIC ---
    const [facing, setFacing] = useState('right');
    const prevX = useRef(position.x);

    useEffect(() => {
        if (position.x > prevX.current) setFacing('right');
        else if (position.x < prevX.current) setFacing('left');
        prevX.current = position.x;
    }, [position.x]);

    const getHpBarColor = (current, max) => {
        const pct = current / max;
        if (pct > 0.5) return '#2ecc71';
        if (pct > 0.25) return '#f1c40f';
        return '#e74c3c';
    };

    return (
        <div style={{
            position: 'absolute', left: 0, top: 0,
            width: tileSize, height: tileSize,
            transform: `translate(${position.x * tileSize}px, ${position.y * tileSize}px)`,
            transition: 'transform 0.1s linear',
            zIndex: 50, pointerEvents: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            {/* PLAYER HP BAR */}
            {(hp !== undefined && maxHp !== undefined) && (
                <div style={{
                    position: 'absolute', top: '-8px', left: '-4px', width: '40px', height: '5px',
                    backgroundColor: '#000', borderRadius: '2px', zIndex: 51, border: '1px solid #000'
                }}>
                    <div style={{
                        width: `${Math.max(0, (hp / maxHp) * 100)}%`,
                        height: '100%',
                        backgroundColor: getHpBarColor(hp, maxHp),
                        borderRadius: '1px', transition: 'width 0.3s'
                    }} />
                </div>
            )}

            <img
                src={playerImg} alt="Hero"
                style={{
                    width: 'auto', height: '42px', marginBottom: '6px',
                    imageRendering: 'pixelated',
                    filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))',
                    transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
                    transformOrigin: 'center'
                }}
            />
        </div>
    );
};

export default React.memo(PlayerLayer);