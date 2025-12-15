import React from 'react';

const EquipmentSlot = ({ title, item, placeholderIcon, type, onUnequip }) => {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            border: item ? `1px solid ${item.color}` : '1px solid #555',
            padding: '10px', borderRadius: '8px',
            width: '120px', minHeight: '160px',
            backgroundColor: '#222',
            justifyContent: 'flex-start',
            boxShadow: item ? `inset 0 0 15px ${item.color}20` : 'none'
        }}>
            <span style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>{title}</span>

            {item ? (
                <button
                    onClick={() => onUnequip(type)}
                    title="Click to Unequip"
                    style={{
                        background: 'none', border: 'none', color: 'inherit',
                        cursor: 'pointer', width: '100%',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', flex: 1
                    }}
                >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{item.icon}</div>

                    <div style={{
                        fontSize: '14px', fontWeight: 'bold', marginBottom: '5px',
                        lineHeight: '1.2', maxWidth: '100%', color: item.color
                    }}>
                        {item.name}
                    </div>

                    <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>
                        +{item.bonus} {item.type === 'weapon' ? 'ATK' : 'DEF'}
                    </div>

                    <div style={{
                        fontSize: '10px', color: '#e74c3c', border: '1px solid #e74c3c',
                        borderRadius: '4px', padding: '2px 6px', marginTop: 'auto'
                    }}>
                        Unequip
                    </div>
                </button>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, opacity: 0.4 }}>
                    <div style={{ fontSize: '32px', marginBottom: '5px' }}>{placeholderIcon}</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Empty</div>
                    <div style={{ fontSize: '12px' }}>-</div>
                </div>
            )}
        </div>
    );
};

export default EquipmentSlot;