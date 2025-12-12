import React from 'react';

// NEW PROP: onUnequip
const InventoryScreen = ({ isOpen, player, onEquip, onUnequip, onClose }) => {
    if (!isOpen) return null;

    const inventory = player?.inventory || [];
    const equipment = player?.equipment || { weapon: null, armor: null };

    // Helper to render the equipped slot
    const renderSlot = (title, item, placeholderIcon, type) => (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            border: '1px solid #555', padding: '10px', borderRadius: '8px',
            width: '120px', // Increased width to prevent tight wrapping
            minHeight: '160px', // Ensure consistent vertical size
            backgroundColor: '#222',
            justifyContent: 'flex-start'
        }}>
            <span style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>{title}</span>

            {item ? (
                // CLICK TO UNEQUIP
                <button
                    onClick={() => onUnequip(type)}
                    title="Click to Unequip"
                    style={{
                        background: 'none', border: 'none', color: 'inherit',
                        cursor: 'pointer', width: '100%',
                        // Use Flex column to stack children naturally
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', flex: 1
                    }}
                >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{item.icon}</div>

                    {/* Fixed: Removed fixed height, added line-height */}
                    <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginBottom: '5px',
                        lineHeight: '1.2',
                        maxWidth: '100%'
                    }}>
                        {item.name}
                    </div>

                    <div style={{ fontSize: '12px', color: '#e67e22', marginBottom: '5px' }}>
                        +{item.bonus} {item.type === 'weapon' ? 'ATK' : 'DEF'}
                    </div>

                    <div style={{
                        fontSize: '10px',
                        color: '#e74c3c',
                        border: '1px solid #e74c3c',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        marginTop: 'auto' // Push to bottom if space allows
                    }}>
                        Unequip
                    </div>
                </button>
            ) : (
                // EMPTY SLOT (Non-clickable)
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', flex: 1, opacity: 0.4
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '5px' }}>{placeholderIcon}</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Empty</div>
                    <div style={{ fontSize: '12px' }}>-</div>
                </div>
            )}
        </div>
    );

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 150,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: '#2c3e50', padding: '20px', borderRadius: '12px',
                border: '2px solid #34495e', width: '450px', maxWidth: '95%',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: '#ecf0f1'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>🎒 Inventory</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>✖</button>
                </div>

                {/* EQUIPMENT SLOTS */}
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #34495e' }}>
                    {renderSlot("Weapon", equipment.weapon, "⚔️", 'weapon')}
                    {renderSlot("Armor", equipment.armor, "🛡️", 'armor')}
                </div>

                {/* BACKPACK */}
                <h4 style={{ margin: '0 0 10px 0', color: '#bdc3c7' }}>Backpack ({inventory.length} items)</h4>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '10px', maxHeight: '200px', overflowY: 'auto'
                }}>
                    {inventory.length === 0 && <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>Your bag is empty...</p>}

                    {inventory.map(item => (
                        <button
                            key={item.uid}
                            onClick={() => onEquip(item)}
                            style={{
                                display: 'flex', alignItems: 'center', padding: '8px',
                                backgroundColor: '#34495e', border: '1px solid #2c3e50',
                                borderRadius: '6px', cursor: 'pointer', color: 'white', textAlign: 'left'
                            }}
                        >
                            <span style={{ fontSize: '20px', marginRight: '10px' }}>{item.icon}</span>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.name}</div>
                                <div style={{ fontSize: '11px', color: '#f1c40f' }}>
                                    +{item.bonus} {item.type === 'weapon' ? 'ATK' : 'DEF'}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#95a5a6' }}>
                    Click an item to equip it. Click equipped slot to unequip.
                </div>
            </div>
        </div>
    );
};

export default InventoryScreen;