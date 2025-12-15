import React from 'react';

const InventoryItem = ({ item, onEquip, onConsume, onSell }) => {
    const isPotion = item.type === 'potion';

    // Check if it's a Boss Item
    const isMythic = item.rarity === 'mythic';

    // --- LOGIC: Determine Display Info based on Type ---
    let statIcon = '';
    let statLabel = '';
    let statColor = '#ccc';

    if (item.type === 'weapon') {
        statIcon = '⚔️';
        statLabel = 'ATK';
        statColor = '#e67e22';
    } else if (item.type === 'armor') {
        statIcon = '🛡️';
        statLabel = 'DEF';
        statColor = '#3498db';
    } else {
        statIcon = '💚';
        statLabel = 'HP';
        statColor = '#2ecc71';
    }

    // DYNAMIC STYLES FOR MYTHIC ITEMS
    const containerStyle = {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px',

        // Background: Mythics get a subtle gradient, others flat grey
        background: isMythic
            ? 'linear-gradient(135deg, #34495e 0%, #4a1c1c 100%)'
            : '#34495e',

        border: `1px solid ${item.color || '#2c3e50'}`,
        borderRadius: '8px', color: 'white', textAlign: 'center',

        // Shadow: Mythics get a pulsing glow animation
        boxShadow: isMythic
            ? `0 0 10px ${item.color}, inset 0 0 10px ${item.color}33`
            : `0 4px 6px rgba(0,0,0,0.3), inset 0 0 10px ${item.color}15`,

        // FIX: Chain the animations with a comma
        // Mythic = FadeIn (0.3s) AND Pulse (Infinite)
        // Normal = FadeIn (0.3s)
        animation: isMythic
            ? 'fadeIn 0.3s ease-out, mythicPulse 2s infinite alternate'
            : 'fadeIn 0.3s ease-out',

        height: '160px', position: 'relative', overflow: 'hidden'
    };

    return (
        <div
            title={`${item.name}\nRarity: ${item.rarity.toUpperCase()}\nBonus: +${item.bonus} ${statLabel}\nValue: ${item.value} G`}
            style={containerStyle}
        >
            {/* Rarity Indicator (Top Stripe) */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                backgroundColor: item.color || '#555',
                boxShadow: isMythic ? `0 0 10px ${item.color}` : 'none'
            }} />

            {/* HEADER: Name & Icon */}
            <div style={{ width: '100%', marginTop: '5px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{
                    fontSize: '12px', fontWeight: 'bold', color: item.color,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginBottom: '5px',
                    textShadow: isMythic ? `0 0 5px ${item.color}` : 'none'
                }}>
                    {item.name}
                </div>
                <div style={{ fontSize: '32px', lineHeight: '1', marginBottom: '5px' }}>{item.icon}</div>
            </div>

            {/* INFO: Compact Stats & Value */}
            <div style={{
                fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px',
                width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', padding: '4px 0', borderRadius: '4px'
            }}>
                <span style={{ color: statColor, fontWeight: 'bold' }}>
                    {statIcon} +{item.bonus} {statLabel}
                </span>
                <span style={{ color: '#f1c40f', fontSize: '10px' }}>
                    🥮 {item.value || 0}
                </span>
            </div>

            {/* ACTIONS */}
            <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                <button
                    onClick={() => isPotion ? onConsume(item) : onEquip(item)}
                    style={{ ...actionBtnStyle(isPotion ? '#27ae60' : '#2980b9'), flex: 2 }}
                >
                    {isPotion ? 'Use' : 'Equip'}
                </button>
                <button
                    onClick={() => onSell(item)}
                    style={{ ...actionBtnStyle('#c0392b'), flex: 1 }}
                >
                    $
                </button>
            </div>

            <style>{`
                @keyframes fadeIn { 
                    from { opacity: 0; transform: scale(0.95); } 
                    to { opacity: 1; transform: scale(1); } 
                }
                @keyframes mythicPulse {
                    0% { box-shadow: 0 0 5px #ff3333, inset 0 0 5px #ff333333; }
                    100% { box-shadow: 0 0 15px #ff3333, inset 0 0 15px #ff333333; }
                }
            `}</style>
        </div>
    );
};

const actionBtnStyle = (bg) => ({
    backgroundColor: bg, color: 'white', border: 'none',
    padding: '6px 0', borderRadius: '4px', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '11px',
    transition: 'filter 0.1s, transform 0.1s',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
});

export default InventoryItem;