import React from 'react';

const GameOverScreen = ({ gameState, onRespawn, onRestart }) => {
    // UPDATED: Only show if Dead. We removed 'WON' state logic.
    if (gameState !== 'GAME_OVER') return null;

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 200, color: '#f0f0f0', textAlign: 'center',
            animation: 'fadeIn 0.5s'
        }}>
            <h1 style={{
                fontSize: '48px',
                color: '#e74c3c', // Red for death
                marginBottom: '10px',
                textShadow: '0 0 20px rgba(231, 76, 60, 0.5)'
            }}>
                😵 YOU WERE KNOCKED OUT
            </h1>

            <p style={{ fontSize: '18px', marginBottom: '40px', maxWidth: '400px', color: '#ccc' }}>
                You took a heavy beating. You will wake up injured, but your journey is not over.
            </p>

            {/* BUTTONS ROW */}
            <div style={{ display: 'flex', gap: '20px' }}>

                {/* 1. RESPAWN BUTTON (Keep Progress) */}
                <button
                    onClick={onRespawn}
                    style={{
                        padding: '15px 30px', fontSize: '20px', cursor: 'pointer',
                        backgroundColor: '#e67e22', color: 'white', border: 'none',
                        borderRadius: '8px', fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                        transition: 'transform 0.1s'
                    }}
                >
                    🚑 Respawn (30% HP)
                </button>

                {/* 2. RESET BUTTON (Delete Save) */}
                <button
                    onClick={onRestart}
                    style={{
                        padding: '15px 30px', fontSize: '20px', cursor: 'pointer',
                        backgroundColor: '#7f8c8d', // Grey
                        color: 'white', border: 'none',
                        borderRadius: '8px', fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                    }}
                >
                    🗑️ Give Up & Reset
                </button>
            </div>

            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};

export default GameOverScreen;