import React from 'react';

const EquipmentSlot = ({ title, item, placeholderIcon, type, onUnequip }) => {

    // Check for Mythic status
    const isMythic = item?.rarity === 'mythic';

    // Container Style (Matches InventoryItem)
    const containerStyle = {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px',
        width: '120px', minHeight: '160px',

        // Background: Mythics get the gradient
        background: isMythic
            ? 'linear-gradient(135deg, #34495e 0%, #4a1c1c 100%)'
            : '#222', // Slightly darker than inventory items to denote a "Slot"

        border: item ? `1px solid ${item.color}` : '1px solid #444',
        borderRadius: '8px',
        boxShadow: isMythic
            ? `0 0 10px ${item.color}, inset 0 0 10px ${item.color}33`
            : 'inset 0 0 10px rgba(0,0,0,0.5)',

        position: 'relative', overflow: 'hidden',
        transition: 'all 0.2s'
    };

    // Stat Info Logic
    let statLabel = type === 'weapon' ? 'ATK' : 'DEF';
    let statIcon = type === 'weapon' ? '⚔️' : '🛡️';
    let statColor = type === 'weapon' ? '#e67e22' : '#3498db';

    return (
        <div style={containerStyle}>
            {/* Slot Label (Weapon/Armor) - Only show if empty or unobtrusive */}
            {!item && <span style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>{title}</span>}

            {item ? (
                <>
                    {/* Rarity Indicator Stripe */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                        backgroundColor: item.color
                    }} />

                    {/* CONTENT: Name & Icon */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: '5px' }}>
                        <div style={{
                            fontSize: '12px', fontWeight: 'bold', color: item.color,
                            textAlign: 'center', lineHeight: '1.2', marginBottom: '5px',
                            textShadow: isMythic ? `0 0 5px ${item.color}` : 'none'
                        }}>
                            {item.name}
                        </div>
                        <div style={{ fontSize: '32px', marginBottom: '5px' }}>{item.icon}</div>
                    </div>

                    {/* INFO: Compact Stats */}
                    <div style={{
                        fontSize: '11px', display: 'flex', justifyContent: 'center', gap: '5px',
                        width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', padding: '4px 0', borderRadius: '4px',
                        marginBottom: '8px'
                    }}>
                        <span style={{ color: statColor, fontWeight: 'bold' }}>
                            {statIcon} +{item.bonus} {statLabel}
                        </span>
                    </div>

                    {/* ACTION: Unequip Button */}
                    <button
                        onClick={() => onUnequip(type)}
                        style={{
                            width: '100%', padding: '6px 0', fontSize: '11px', fontWeight: 'bold',
                            backgroundColor: '#c0392b', color: 'white', border: 'none', borderRadius: '4px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        Unequip
                    </button>
                </>
            ) : (
                // EMPTY STATE
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, opacity: 0.3 }}>
                    <div style={{ fontSize: '36px', marginBottom: '5px' }}>{placeholderIcon}</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Empty</div>
                </div>
            )}
        </div>
    );
};

export default EquipmentSlot;