import React from 'react';
import { processLevelUp } from '../utils/combatLogic';

const CheatMenu = ({ isOpen, onClose, player, setPlayer, addLog }) => {
    if (!isOpen) return null;

    // --- TOGGLES ---
    const toggleCheat = (flag, name) => {
        setPlayer(prev => {
            const newVal = !prev[flag];
            addLog(`🛠️ CHEAT: ${name} ${newVal ? 'ENABLED' : 'DISABLED'}`);
            return { ...prev, [flag]: newVal };
        });
    };

    const toggleSpeed = () => {
        setPlayer(prev => {
            const isFast = prev.speed > 20;
            addLog(`🛠️ CHEAT: Super Speed ${isFast ? 'DISABLED' : 'ENABLED'}`);
            return { ...prev, speed: isFast ? 10 : 50 }; // Toggle between 10 and 50
        });
    };

    // --- ACTIONS ---
    const fullHeal = () => {
        setPlayer(prev => ({
            ...prev,
            hp: prev.maxHp,
            lastHealTime: 0
        }));
        addLog("🛠️ CHEAT: Fully Healed!");
    };

    const levelUp = () => {
        const xpNeeded = player.nextLevelXp - player.xp;
        const { updatedStats } = processLevelUp(player, xpNeeded);
        setPlayer(updatedStats);
        addLog("🛠️ CHEAT: Forced Level Up!");
    };

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: '#222', padding: '20px', borderRadius: '8px',
                border: '2px solid #555', width: '300px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
                color: '#ecf0f1', fontFamily: 'monospace'
            }}>
                <h2 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🛠️ DEV TOOLS</span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '16px' }}>✖</button>
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    <CheatToggle
                        label="🛡️ God Mode"
                        isActive={player.isGodMode}
                        onClick={() => toggleCheat('isGodMode', 'God Mode')}
                    />
                    <CheatToggle
                        label="👻 Ghost Mode"
                        isActive={player.isGhostMode}
                        onClick={() => toggleCheat('isGhostMode', 'Ghost Mode')}
                    />
                    <CheatToggle
                        label="⚔️ One Hit Kill"
                        isActive={player.isOneHitKill}
                        onClick={() => toggleCheat('isOneHitKill', 'One Hit Kill')}
                    />
                    <CheatToggle
                        label="👟 Super Speed"
                        isActive={player.speed > 20}
                        onClick={toggleSpeed}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button onClick={fullHeal} style={actionBtnStyle}>💚 Full Heal</button>
                    <button onClick={levelUp} style={actionBtnStyle}>🆙 Level Up</button>
                </div>
            </div>
        </div>
    );
};

// Helper Sub-component for Toggles
const CheatToggle = ({ label, isActive, onClick }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 10px', backgroundColor: isActive ? '#2980b9' : '#333',
            borderRadius: '4px', cursor: 'pointer', userSelect: 'none',
            border: isActive ? '1px solid #3498db' : '1px solid #444'
        }}
    >
        <span>{label}</span>
        <span style={{ fontWeight: 'bold' }}>{isActive ? 'ON' : 'OFF'}</span>
    </div>
);

const actionBtnStyle = {
    padding: '8px', backgroundColor: '#444', color: 'white', border: 'none',
    borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
};

export default CheatMenu;