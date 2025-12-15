import React, { useState } from 'react';
import InventoryItem from './inventory/InventoryItem';
import EquipmentSlot from './inventory/EquipmentSlot';

// --- FIXED SORTING CONFIGURATION ---
// Added 'mythic' at the top (7)
const RARITY_WEIGHTS = {
    mythic: 7,    // <--- NEW! Highest Priority
    legendary: 6,
    magical: 5,
    hardened: 4,
    sharpened: 3,
    common: 2,
    rusty: 1,
    broken: 0
};

const InventoryScreen = ({ isOpen, player, onEquip, onUnequip, onConsume, onSell, onClose }) => {
    const [sortBy, setSortBy] = useState('recent');

    if (!isOpen) return null;

    const inventory = player?.inventory || [];
    const equipment = player?.equipment || { weapon: null, armor: null };

    // --- SORTING LOGIC ---
    const getSortedInventory = () => {
        const items = [...inventory];
        switch (sortBy) {
            case 'value': // High Value -> Low
                return items.sort((a, b) => (b.value || 0) - (a.value || 0));

            case 'rarity': // Mythic -> Broken
                return items.sort((a, b) => {
                    // Safe access with fallback to 0
                    const weightA = RARITY_WEIGHTS[a.rarity?.toLowerCase()] || 0;
                    const weightB = RARITY_WEIGHTS[b.rarity?.toLowerCase()] || 0;
                    return weightB - weightA;
                });

            case 'type': // Weapon -> Armor -> Potion
                return items.sort((a, b) => a.type.localeCompare(b.type));

            case 'power': // High Stats -> Low
                return items.sort((a, b) => b.bonus - a.bonus);

            default: // Recent (Newest at bottom)
                return items;
        }
    };

    const sortedInventory = getSortedInventory();

    // ... (Rest of the Render logic remains exactly the same) ...

    return (
        <div style={overlayStyle}>
            <div style={containerStyle}>

                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>🎒 Inventory</h2>
                    <button onClick={onClose} style={closeBtnStyle}>✖</button>
                </div>

                {/* EQUIPMENT AREA */}
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #34495e' }}>
                    <EquipmentSlot
                        title="Weapon"
                        type="weapon"
                        item={equipment.weapon}
                        placeholderIcon="⚔️"
                        onUnequip={onUnequip}
                    />
                    <EquipmentSlot
                        title="Armor"
                        type="armor"
                        item={equipment.armor}
                        placeholderIcon="🛡️"
                        onUnequip={onUnequip}
                    />
                </div>

                {/* SORT CONTROLS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#bdc3c7' }}>Backpack ({inventory.length})</h4>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={dropdownStyle}
                    >
                        <option value="recent">Sort: Recent</option>
                        <option value="value">Sort: Value ($$)</option>
                        <option value="rarity">Sort: Rarity (✨)</option>
                        <option value="power">Sort: Power (⚔️)</option>
                        <option value="type">Sort: Type</option>
                    </select>
                </div>

                {/* SCROLLABLE GRID */}
                <div style={gridStyle}>
                    {inventory.length === 0 && (
                        <p style={{ color: '#7f8c8d', fontStyle: 'italic', gridColumn: '1/-1', textAlign: 'center', marginTop: '20px' }}>
                            Your bag is empty...
                        </p>
                    )}

                    {sortedInventory.map(item => (
                        <InventoryItem
                            key={item.uid}
                            item={item}
                            onEquip={onEquip}
                            onConsume={onConsume}
                            onSell={onSell}
                        />
                    ))}
                </div>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#95a5a6' }}>
                    Click an item to use or sell.
                </div>
            </div>
        </div>
    );
};

// --- STYLES ---
const overlayStyle = {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 150,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const containerStyle = {
    backgroundColor: '#2c3e50', padding: '20px', borderRadius: '12px',
    border: '2px solid #34495e', width: '500px', maxWidth: '95%',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: '#ecf0f1',
    maxHeight: '90vh', display: 'flex', flexDirection: 'column'
};

const closeBtnStyle = {
    background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer'
};

const dropdownStyle = {
    backgroundColor: '#34495e', color: '#ecf0f1', border: '1px solid #2c3e50',
    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer'
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '12px',
    overflowY: 'auto',
    paddingRight: '5px',
    paddingTop: '5px',
    alignContent: 'start',
    flex: 1
};

export default InventoryScreen;