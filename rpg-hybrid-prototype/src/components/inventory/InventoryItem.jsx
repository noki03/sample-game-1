import React from 'react';

const InventoryItem = ({ item, onEquip, onConsume, onSell }) => {
    const isPotion = item.type === 'potion';

    return (
        <div
            title={`${item.name}\n${isPotion ? `Heals ${item.bonus}` : `+${item.bonus} Stats`}\nValue: ${item.value} G`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px',
                backgroundColor: '#34495e',
                border: `1px solid ${item.color || '#2c3e50'}`,
                borderRadius: '8px',
                color: 'white',
                textAlign: 'center',
                boxShadow: `0 4px 6px rgba(0,0,0,0.3), inset 0 0 10px ${item.color}15`, // Subtle glow based on rarity
                animation: 'fadeIn 0.3s',
                height: '160px', // Fixed height for uniform grid
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
            <div style={{ width: '100%', marginTop: '5px' }}>
                <div style={{
                    fontSize: '12px', fontWeight: 'bold', color: item.color,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginBottom: '5px'
                }}>
                    {item.name}
                </div>
                <div style={{ fontSize: '36px', lineHeight: '1' }}>{item.icon}</div>
            </div>

            {/* INFO: Stats & Value */}
            <div style={{ fontSize: '10px', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>
                    {isPotion ? `💚 +${item.bonus}` : `⚔️ +${item.bonus}`}
                </span>
                <span style={{ color: '#f1c40f' }}>
                    {item.value || 0} G
                </span>
            </div>

            {/* ACTIONS: Button Group */}
            <div style={{ display: 'flex', gap: '5px', width: '100%', marginTop: '5px' }}>
                <button
                    onClick={() => isPotion ? onConsume(item) : onEquip(item)}
                    style={{ ...actionBtnStyle(isPotion ? '#27ae60' : '#2980b9'), flex: 1 }}
                    title={isPotion ? "Drink Potion" : "Equip Item"}
                >
                    {isPotion ? 'Use' : 'Equip'}
                </button>

                <button
                    onClick={() => onSell(item)}
                    style={{ ...actionBtnStyle('#c0392b'), flex: 1 }}
                    title="Sell Item"
                >
                    $
                </button>
            </div>

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
};

const actionBtnStyle = (bg) => ({
    backgroundColor: bg, color: 'white', border: 'none',
    padding: '6px 0', borderRadius: '4px', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '11px',
    transition: 'filter 0.1s'
});

export default InventoryItem;