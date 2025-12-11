import React from 'react';

const Tile = ({ type, isPlayer, isMonster, isVisible }) => {
    const getStyle = () => {
        // Hidden (Fog)
        if (!isVisible) {
            return { backgroundColor: '#000' };
        }

        // Visible
        switch (type) {
            case 2:
            case 0: return { backgroundColor: '#58432b' }; // Dark Earth
            default: return { backgroundColor: '#222222' };
        }
    };

    return (
        <div
            style={{
                width: '32px',
                height: '32px',
                // --- REMOVED BORDER FOR SEAMLESS LOOK ---
                border: '1px solid #3e2f1f',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...getStyle(),
            }}
        >
            {isVisible && (
                <>
                    {isMonster ? (
                        <span style={{ fontSize: '20px', zIndex: 10 }}>👹</span>
                    ) : isPlayer ? (
                        <span style={{ fontSize: '20px', zIndex: 20 }}>🏃</span>
                    ) : null}
                </>
            )}
        </div>
    );
};

export default React.memo(Tile);