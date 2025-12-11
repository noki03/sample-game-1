import React from 'react';

const StatsPanel = ({ stats }) => {
    const { level, hp, maxHp, xp, nextLevelXp } = stats;

    // Calculate HP and XP bar percentages
    const hpPercent = (hp / maxHp) * 100;
    const xpPercent = (xp / nextLevelXp) * 100;

    return (
        <div style={{ border: '1px solid black', padding: '10px', minWidth: '200px' }}>
            <h3>✨ Adventurer Stats</h3>
            <p><strong>Level:</strong> {level}</p>

            {/* HP Bar */}
            <p><strong>HP:</strong> {hp}/{maxHp}</p>
            <div style={{ height: '10px', backgroundColor: '#ddd', marginBottom: '10px' }}>
                <div style={{
                    height: '100%',
                    width: `${hpPercent}%`,
                    backgroundColor: hpPercent > 20 ? 'green' : 'red'
                }}></div>
            </div>

            {/* XP Bar */}
            <p><strong>XP:</strong> {xp}/{nextLevelXp}</p>
            <div style={{ height: '10px', backgroundColor: '#ddd' }}>
                <div style={{
                    height: '100%',
                    width: `${xpPercent}%`,
                    backgroundColor: 'blue'
                }}></div>
            </div>
        </div>
    );
};

export default StatsPanel;