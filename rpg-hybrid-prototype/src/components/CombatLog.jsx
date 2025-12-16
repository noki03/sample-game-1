import React, { useEffect, useRef } from 'react';

const CombatLog = ({ log }) => {
    const bottomRef = useRef(null);

    // Auto-scroll to bottom when log updates
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [log]);

    // Helper to colorize lines based on content
    const getLineStyle = (text) => {
        if (text.includes('XP') || text.includes('Level Up')) return { color: '#f1c40f', fontWeight: 'bold' }; // Gold
        if (text.includes('hits you')) return { color: '#e74c3c' }; // Red (Danger)
        if (text.includes('Heal') || text.includes('HP')) return { color: '#2ecc71' }; // Green (Good)
        if (text.includes('killed') || text.includes('defeated')) return { color: '#9b59b6' }; // Purple (Victory)
        if (text.includes('missed')) return { color: '#95a5a6' }; // Grey (Miss)
        if (text.includes('Dragon')) return { color: '#e67e22' }; // Orange (Boss)
        if (text.includes('CHEAT')) return { color: '#3498db' }; // Blue (Dev)

        return { color: '#ecf0f1' }; // Default White
    };

    return (
        <div style={{
            backgroundColor: '#1a1a1a',
            border: '2px solid #333',
            borderRadius: '8px',
            padding: '10px',
            height: '200px', // Fixed height
            overflowY: 'auto', // Scrollable
            fontFamily: "'Consolas', 'Courier New', monospace",
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
        }}>
            <div style={{
                borderBottom: '1px solid #333',
                marginBottom: '5px',
                paddingBottom: '5px',
                color: '#888',
                fontSize: '0.5em',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                Adventure Log
            </div>

            {log.length === 0 && (
                <div style={{ color: '#555', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                    Your journey begins...
                </div>
            )}

            {log.map((entry, index) => (
                <div key={index} style={{
                    ...getLineStyle(entry),
                    lineHeight: '1.4',
                    animation: 'fadeIn 0.2s ease-in'
                }}>

                    {entry}
                </div>
            ))}

            {/* Dummy div for auto-scrolling */}
            <div ref={bottomRef} />

            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateX(-5px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    /* Custom Scrollbar for Webkit */
                    ::-webkit-scrollbar { width: 8px; }
                    ::-webkit-scrollbar-track { background: #111; }
                    ::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
                    ::-webkit-scrollbar-thumb:hover { background: #666; }
                `}
            </style>
        </div>
    );
};

export default CombatLog;