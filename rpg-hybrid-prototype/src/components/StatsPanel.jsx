import React from 'react';

const StatsPanel = ({ stats }) => {
    const { level, hp, maxHp, xp, nextLevelXp, potions } = stats;

    const hpPercent = (hp / maxHp) * 100;
    const xpPercent = (xp / nextLevelXp) * 100;

    return (
        <div style={{
            border: '1px solid #555',
            padding: '15px',
            minWidth: '220px',
            backgroundColor: '#3c3c3c',
            borderRadius: '8px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ marginTop: 0, marginBottom: '10px' }}>✨ Adventurer</h3>
                <span style={{ fontSize: '20px' }}>
                    {/* Potion Display */}
                    🧪 x{potions}
                </span>
            </div>

            <p style={{ margin: '5px 0' }}><strong>Level:</strong> {level}</p>

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
                    backgroundColor: '#3498db', // Blue for XP
                    transition: 'width 0.3s ease'
                }}></div>
            </div>

            <p style={{ fontSize: '11px', color: '#aaa', marginTop: '10px' }}>
                Press <strong>[H]</strong> to Heal
            </p>
        </div>
    );
};

export default StatsPanel;