import React from 'react';
import cobbleStoneImg from '../assets/cobble_stone.png';

const Tile = ({ type, isVisible, isVisited }) => {

    const getStyle = () => {
        // --- VISIBLE ---
        if (isVisible) {
            const baseStyle = {
                backgroundImage: `url(${cobbleStoneImg})`,
                backgroundSize: 'cover', backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated', backgroundBlendMode: 'normal'
            };

            switch (type) {
                case 3: // STAIRS
                    return { ...baseStyle, filter: 'sepia(30%)' };
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

    return (
        <div
            style={{
                width: '32px', height: '32px',
                border: '1px solid transparent',
                overflow: 'visible', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...getStyle(),
            }}
        >
            {/* RENDER STAIRS ICON */}
            {(isVisible || isVisited) && type === 3 && (
                <div style={{
                    width: '18px', height: '18px',
                    backgroundColor: '#050505',
                    border: '2px solid #555',
                    boxShadow: 'inset 0 0 5px #000',
                    zIndex: 5
                }} />
            )}
        </div>
    );
};

export default React.memo(Tile);