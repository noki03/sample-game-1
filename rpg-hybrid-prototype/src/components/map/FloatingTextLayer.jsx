import React from 'react';

const FloatingTextLayer = ({ texts, tileSize }) => {
    return (
        <>
            {texts.map(ft => (
                <div
                    key={ft.id}
                    style={{
                        position: 'absolute',
                        left: `${ft.x * tileSize}px`,
                        top: `${ft.y * tileSize}px`,
                        color: ft.color,
                        fontWeight: 'bold', fontSize: '14px',
                        zIndex: 60, pointerEvents: 'none',
                        animation: 'floatUp 1.5s forwards',
                        textShadow: '1px 1px 0 #000',
                        width: '200px', marginLeft: '-84px', textAlign: 'center', whiteSpace: 'nowrap'
                    }}
                >
                    {ft.text}
                </div>
            ))}
        </>
    );
};

export default React.memo(FloatingTextLayer);