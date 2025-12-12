import React from 'react';

const StatsPanel = ({ stats }) => {
    // Destructure new stats
    const { level, hp, maxHp, xp, nextLevelXp, potions, attack, defense } = stats;

    const hpPercent = (hp / maxHp) * 100;
    const xpPercent = (xp / nextLevelXp) * 100;

    return (
        <div style={{
            border: '1px solid #555',
            padding: '15px',
            minWidth: '220px',
            backgroundColor: '#3c3c3c',
            borderRadius: '8px',
            color: '#f0f0f0'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ marginTop: 0, marginBottom: '10px' }}>✨ Adventurer</h3>
                <span style={{ fontSize: '18px' }}>
                    🧪 x{potions}
                </span>
            </div>

            <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: 'bold' }}>Level {level}</p>

            {/* --- NEW STATS GRID --- */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '15px',
                fontSize: '14px',
                backgroundColor: '#222',
                padding: '8px',
                borderRadius: '4px'
            }}>
                <div title="Attack Damage">
                    ⚔️ <span style={{ color: '#ff7675' }}>ATK: {attack}</span>
                </div>
                <div title="Damage Reduction">
                    🛡️ <span style={{ color: '#74b9ff' }}>DEF: {defense}</span>
                </div>
            </div>
            {/* ---------------------- */}

            {/* HP Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>HP</span>
                <span>{hp}/{maxHp}</span>
            </div>
            <div style={{ height: '12px', backgroundColor: '#222', marginBottom: '15px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%',
                    width: `${hpPercent}%`,
                    backgroundColor: hpPercent > 20 ? '#e74c3c' : '#c0392b',
                    transition: 'width 0.3s ease'
                }}></div>
            </div>

            {/* XP Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>XP</span>
                <span>{xp}/{nextLevelXp}</span>
            </div>
            <div style={{ height: '12px', backgroundColor: '#222', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%',
                    width: `${xpPercent}%`,
                    backgroundColor: '#3498db',
                    transition: 'width 0.3s ease'
                }}></div>
            </div>

            <p style={{ fontSize: '11px', color: '#aaa', marginTop: '10px' }}>
                [H] Heal • [F] Fog
            </p>
        </div>
    );
};

export default StatsPanel;