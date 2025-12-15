import React from 'react';

const GameOverScreen = ({ gameState, onRespawn, onRestart }) => {
    // Only show if Dead or Won
    if (gameState !== 'GAME_OVER' && gameState !== 'WON') return null;

    const isWin = gameState === 'WON';

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)', // Slightly darker
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 100, color: '#f0f0f0', textAlign: 'center'
        }}>
            <h1 style={{
                fontSize: '48px',
                color: isWin ? '#f1c40f' : '#e74c3c', // Red for death
                marginBottom: '10px',
                textShadow: '0 0 10px rgba(0,0,0,0.5)'
            }}>
                {isWin ? '🏆 LEGENDARY VICTORY!' : '😵 YOU WERE KNOCKED OUT'}
            </h1>

            <p style={{ fontSize: '18px', marginBottom: '30px', maxWidth: '400px', color: '#ccc' }}>
                {isWin
                    ? "The Dragon has been slain! You are the hero of legend."
                    : "You took a heavy beating. You will wake up injured, but your journey is not over."}
            </p>

            {/* BUTTONS ROW */}
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* 1. RESPAWN BUTTON (Only if Lost) */}
                {!isWin && (
                    <button
                        onClick={onRespawn}
                        style={{
                            padding: '15px 30px', fontSize: '20px', cursor: 'pointer',
                            backgroundColor: '#e67e22', color: 'white', border: 'none',
                            borderRadius: '8px', fontWeight: 'bold',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                        }}
                    >
                        🚑 Respawn (30% HP)
                    </button>
                )}

                {/* 2. RESET BUTTON (Always available if you want to restart fully) */}
                <button
                    onClick={onRestart}
                    style={{
                        padding: '15px 30px', fontSize: '20px', cursor: 'pointer',
                        backgroundColor: isWin ? '#27ae60' : '#7f8c8d',
                        color: 'white', border: 'none',
                        borderRadius: '8px', fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                    }}
                >
                    {isWin ? 'New Adventure' : '🗑️ Give Up & Reset'}
                </button>
            </div>
        </div>
    );
};

export default GameOverScreen;