import React, { useState, useEffect } from 'react';

const StatsPanel = ({ stats }) => {
    // Force local update every 500ms to animate cooldown text
    const [, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 500);
        return () => clearInterval(timer);
    }, []);

    // XP Calc
    const xpPercent = Math.min(100, Math.max(0, (stats.xp / stats.nextLevelXp) * 100));

    // HEAL SKILL CALC
    const now = Date.now();
    const lastHeal = stats.lastHealTime || 0;
    const cooldown = stats.healCooldown || 10000;
    const timePassed = now - lastHeal;

    // Percent Ready (0 to 100%)
    let skillPercent = Math.min(100, (timePassed / cooldown) * 100);
    const isReady = skillPercent >= 100;
    const secondsWait = Math.ceil((cooldown - timePassed) / 1000);

    return (
        <div style={{
            backgroundColor: '#222', padding: '15px', borderRadius: '8px', border: '1px solid #444',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)', color: '#ecf0f1', fontFamily: 'monospace'
        }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #555', paddingBottom: '5px' }}>
                HERO STATS
            </h3>

            {/* --- NEW: GOLD DISPLAY --- */}
            <div style={{
                marginBottom: '15px', padding: '8px', backgroundColor: '#f1c40f15',
                borderRadius: '4px', border: '1px solid #f1c40f', color: '#f1c40f',
                fontWeight: 'bold', textAlign: 'center', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
                <span>🥮</span>
                <span>{stats.gold || 0} Gold</span>
            </div>

            <div style={{ marginBottom: '10px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Level: {stats.level}</span>
                <span style={{ color: '#f39c12' }}>Floor: {stats.floor || 1}</span>
            </div>

            {/* HP Bar */}
            <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                    <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>HP</span>
                    <span>{stats.hp} / {stats.maxHp}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#444', borderRadius: '4px' }}>
                    <div style={{
                        width: `${Math.max(0, (stats.hp / stats.maxHp) * 100)}%`,
                        height: '100%',
                        backgroundColor: stats.hp > 20 ? '#e74c3c' : '#c0392b',
                        borderRadius: '4px', transition: 'width 0.3s'
                    }} />
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                <div style={{ color: '#f1c40f' }}>⚔️ ATK: {stats.attack}</div>
                <div style={{ color: '#3498db' }}>🛡️ DEF: {stats.defense}</div>
                <div style={{ color: '#2ecc71' }}>👟 SPD: {stats.speed || 10}</div>

                {/* HEAL SKILL UI */}
                <div style={{
                    color: isReady ? '#2ecc71' : '#95a5a6',
                    border: '1px solid #444',
                    padding: '2px 5px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: `${skillPercent}%`,
                        backgroundColor: '#27ae60',
                        opacity: 0.2,
                        zIndex: 0
                    }} />
                    <span style={{ position: 'relative', zIndex: 1, fontWeight: 'bold' }}>
                        {isReady ? "💚 HEAL (H)" : `⏳ ${secondsWait}s`}
                    </span>
                </div>
            </div>

            {/* XP Progress Bar */}
            <div style={{ marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px', color: '#ccc' }}>
                    <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>XP</span>
                    <span>{stats.xp} / {stats.nextLevelXp}</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#444', borderRadius: '3px' }}>
                    <div style={{
                        width: `${xpPercent}%`,
                        height: '100%',
                        backgroundColor: '#f1c40f',
                        borderRadius: '3px',
                        transition: 'width 0.3s',
                        boxShadow: '0 0 5px rgba(241, 196, 15, 0.5)'
                    }} />
                </div>
            </div>
        </div>
    );
};

export default StatsPanel;