import React from 'react';

const GameOverScreen = ({ gameState, onRestart }) => {
    if (gameState !== 'GAME_OVER' && gameState !== 'WON') return null;

    const isWin = gameState === 'WON';

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.85)', // Dark overlay
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100, // Ensure it sits on top of everything
            color: '#f0f0f0',
            textAlign: 'center'
        }}>
            <h1 style={{
                fontSize: '48px',
                color: isWin ? '#f1c40f' : '#c0392b',
                marginBottom: '20px',
                textShadow: '0 0 10px rgba(0,0,0,0.5)'
            }}>
                {isWin ? '🏆 LEGENDARY VICTORY!' : '💀 YOU DIED'}
            </h1>

            <p style={{ fontSize: '18px', marginBottom: '30px', maxWidth: '400px' }}>
                {isWin
                    ? "The Dragon has been slain and the lands are safe once more."
                    : "Your journey has ended here. The monsters roam free..."}
            </p>

            <button
                onClick={onRestart}
                style={{
                    padding: '15px 30px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    backgroundColor: isWin ? '#27ae60' : '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    transition: 'transform 0.1s'
                }}
                onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
            >
                Play Again
            </button>
        </div>
    );
};

export default GameOverScreen;