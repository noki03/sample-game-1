import React from 'react';

const StatsPanel = ({ stats }) => {
    return (
        <div style={{
            backgroundColor: '#222',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #444',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            color: '#ecf0f1',
            fontFamily: 'monospace'
        }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #555', paddingBottom: '5px' }}>
                HERO STATS
            </h3>

            <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                <strong>Level:</strong> {stats.level}
            </div>

            {/* HP Bar */}
            <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                    <span>HP</span>
                    <span>{stats.hp} / {stats.maxHp}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#444', borderRadius: '4px' }}>
                    <div style={{
                        width: `${Math.max(0, (stats.hp / stats.maxHp) * 100)}%`,
                        height: '100%',
                        backgroundColor: stats.hp > 20 ? '#e74c3c' : '#c0392b',
                        borderRadius: '4px',
                        transition: 'width 0.3s'
                    }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                <div style={{ color: '#f1c40f' }}>⚔️ ATK: {stats.attack}</div>
                <div style={{ color: '#3498db' }}>🛡️ DEF: {stats.defense}</div>
                {/* NEW SPEED STAT */}
                <div style={{ color: '#2ecc71' }}>👟 SPD: {stats.speed || 10}</div>
                <div style={{ color: '#9b59b6' }}>🧪 POT: {stats.potions}</div>
            </div>

            <div style={{ marginTop: '15px', fontSize: '12px', color: '#888' }}>
                XP: {stats.xp} / {stats.nextLevelXp}
            </div>
        </div>
    );
};

export default StatsPanel;