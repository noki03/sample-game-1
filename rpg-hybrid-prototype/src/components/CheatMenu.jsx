import React, { useState } from 'react';
import { processLevelUp } from '../utils/combatLogic';
import { generateSpecificLoot } from '../utils/itemGenerator'; // NEW IMPORT

const CheatMenu = ({ isOpen, onClose, player, setPlayer, addLog }) => {
    if (!isOpen) return null;

    // --- LOCAL STATE FOR SPAWNER ---
    const [spawnType, setSpawnType] = useState('weapon');
    const [spawnRarity, setSpawnRarity] = useState('legendary');

    // --- EXISTING TOGGLES ---
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
            return { ...prev, speed: isFast ? 10 : 50 };
        });
    };

    // --- ACTIONS ---
    const fullHeal = () => {
        setPlayer(prev => ({ ...prev, hp: prev.maxHp, lastHealTime: 0 }));
        addLog("🛠️ CHEAT: Fully Healed!");
    };

    const levelUp = () => {
        const xpNeeded = player.nextLevelXp - player.xp;
        const { updatedStats } = processLevelUp(player, xpNeeded);
        setPlayer(updatedStats);
        addLog("🛠️ CHEAT: Forced Level Up!");
    };

    // --- NEW: SPAWN ITEM ---
    const spawnItem = () => {
        const newItem = generateSpecificLoot(player.level, spawnType, spawnRarity);

        setPlayer(prev => ({
            ...prev,
            inventory: [...(prev.inventory || []), newItem]
        }));

        addLog(`🛠️ SPAWNED: ${newItem.name}`);
    };

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: '#222', padding: '20px', borderRadius: '8px',
                border: '2px solid #555', width: '320px', // Slightly wider
                boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
                color: '#ecf0f1', fontFamily: 'monospace'
            }}>
                <h2 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🛠️ DEV TOOLS</span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '16px' }}>✖</button>
                </h2>

                {/* TOGGLES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <CheatToggle label="🛡️ God Mode" isActive={player.isGodMode} onClick={() => toggleCheat('isGodMode', 'God Mode')} />
                    <CheatToggle label="👻 Ghost Mode" isActive={player.isGhostMode} onClick={() => toggleCheat('isGhostMode', 'Ghost Mode')} />
                    <CheatToggle label="⚔️ One Hit Kill" isActive={player.isOneHitKill} onClick={() => toggleCheat('isOneHitKill', 'One Hit Kill')} />
                    <CheatToggle label="👟 Super Speed" isActive={player.speed > 20} onClick={toggleSpeed} />
                </div>

                {/* ACTIONS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '20px' }}>
                    <button onClick={fullHeal} style={actionBtnStyle}>💚 Full Heal</button>
                    <button onClick={levelUp} style={actionBtnStyle}>🆙 Level Up</button>
                </div>

                {/* ITEM SPAWNER */}
                <h3 style={{ fontSize: '14px', margin: '0 0 10px 0', color: '#aaa' }}>🎁 Item Spawner</h3>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                    <select
                        value={spawnType}
                        onChange={(e) => setSpawnType(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="weapon">Weapon</option>
                        <option value="armor">Armor</option>
                        <option value="potion">Potion</option>
                    </select>

                    <select
                        value={spawnRarity}
                        onChange={(e) => setSpawnRarity(e.target.value)}
                        style={selectStyle}
                        disabled={spawnType === 'potion'}
                    >
                        <option value="broken">Broken</option>
                        <option value="rusty">Rusty</option>
                        <option value="common">Common</option>
                        <option value="sharpened">Sharpened</option>
                        <option value="hardened">Hardened</option>
                        <option value="magical">Magical</option>
                        <option value="legendary">Legendary</option>
                    </select>
                </div>
                <button onClick={spawnItem} style={{ ...actionBtnStyle, width: '100%', backgroundColor: '#8e44ad' }}>
                    ✨ Spawn Item
                </button>
            </div>
        </div>
    );
};

// --- STYLES & SUBCOMPONENTS ---
const CheatToggle = ({ label, isActive, onClick }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 10px', backgroundColor: isActive ? '#2980b9' : '#333',
            borderRadius: '4px', cursor: 'pointer', userSelect: 'none', fontSize: '13px',
            border: isActive ? '1px solid #3498db' : '1px solid #444'
        }}
    >
        <span>{label}</span>
        <span style={{ fontWeight: 'bold' }}>{isActive ? 'ON' : 'OFF'}</span>
    </div>
);

const actionBtnStyle = {
    padding: '8px', backgroundColor: '#444', color: 'white', border: 'none',
    borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
};

const selectStyle = {
    flex: 1, padding: '5px', borderRadius: '4px', backgroundColor: '#333',
    color: 'white', border: '1px solid #555'
};

export default CheatMenu;