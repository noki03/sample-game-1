import React from 'react';

const InventoryItem = ({ item, onEquip, onConsume, onSell }) => {
    const isPotion = item.type === 'potion';

    // --- LOGIC: Determine Display Info based on Type ---
    let statIcon = '';
    let statLabel = '';
    let statColor = '#ccc'; // Default gray

    if (item.type === 'weapon') {
        statIcon = '⚔️';
        statLabel = 'ATK';
        statColor = '#e67e22'; // Orange tint for Attack
    } else if (item.type === 'armor') {
        statIcon = '🛡️';
        statLabel = 'DEF';
        statColor = '#3498db'; // Blue tint for Defense
    } else {
        statIcon = '💚';
        statLabel = 'HP';
        statColor = '#2ecc71'; // Green tint for Health
    }

    return (
        <div
            // Tooltip gives full details on hover
            title={`${item.name}\nType: ${item.type.toUpperCase()}\nBonus: +${item.bonus} ${statLabel}\nValue: ${item.value} Gold`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px', // Slightly reduced padding for compactness
                backgroundColor: '#34495e',
                border: `1px solid ${item.color || '#2c3e50'}`,
                borderRadius: '8px',
                color: 'white',
                textAlign: 'center',
                boxShadow: `0 4px 6px rgba(0,0,0,0.3), inset 0 0 10px ${item.color}15`,
                animation: 'fadeIn 0.3s',
                height: '160px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Rarity Indicator (Top Stripe) */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                backgroundColor: item.color || '#555'
            }} />

            {/* HEADER: Name & Icon */}
            <div style={{ width: '100%', marginTop: '5px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{
                    fontSize: '12px', fontWeight: 'bold', color: item.color,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginBottom: '5px'
                }}>
                    {item.name}
                </div>
                <div style={{ fontSize: '32px', lineHeight: '1', marginBottom: '5px' }}>{item.icon}</div>
            </div>

            {/* INFO: Compact Stats & Value */}
            <div style={{
                fontSize: '11px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                marginBottom: '8px',
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.2)', // Darker background for stats
                padding: '4px 0',
                borderRadius: '4px'
            }}>
                <span style={{ color: statColor, fontWeight: 'bold' }}>
                    {statIcon} +{item.bonus} {statLabel}
                </span>
                <span style={{ color: '#f1c40f', fontSize: '10px' }}>
                    🥮 {item.value || 0}
                </span>
            </div>

            {/* ACTIONS: Button Group */}
            <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                <button
                    onClick={() => isPotion ? onConsume(item) : onEquip(item)}
                    style={{ ...actionBtnStyle(isPotion ? '#27ae60' : '#2980b9'), flex: 2 }}
                    title={isPotion ? "Drink Potion" : "Equip Item"}
                >
                    {isPotion ? 'Use' : 'Equip'}
                </button>

                <button
                    onClick={() => onSell(item)}
                    style={{ ...actionBtnStyle('#c0392b'), flex: 1 }}
                    title={`Sell for ${item.value} Gold`}
                >
                    $
                </button>
            </div>

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
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