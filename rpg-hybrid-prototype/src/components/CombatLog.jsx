import React, { useEffect, useRef } from 'react';

const CombatLog = ({ log, gameState }) => {
    const logEndRef = useRef(null);
    const isCombat = gameState === 'COMBAT';

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [log]);

    const getMessageStyle = (message) => {
        let color = '#ccc';
        let fontWeight = 'normal';

        if (message.includes('LEVEL UP')) {
            color = '#f1c40f'; // Gold
            fontWeight = 'bold';
        }
        else if (message.includes('Found a Potion')) color = '#9b59b6'; // Purple
        else if (message.includes('Used potion')) color = '#2ecc71'; // Green
        else if (message.includes('Victory')) color = '#2ecc71';
        else if (message.includes('wild monster')) color = '#e74c3c';
        else if (message.includes('Ouch')) color = '#f39c12';

        return { margin: '4px 0', fontSize: '12px', color, fontWeight, fontFamily: 'monospace' };
    };

    return (
        <div style={{
            border: isCombat ? '2px solid #c0392b' : '1px solid #555',
            padding: '10px',
            height: '200px',
            overflowY: 'auto',
            marginTop: '20px',
            backgroundColor: isCombat ? '#2c0b0b' : '#1e1e1e',
            borderRadius: '8px',
            transition: 'background-color 0.3s'
        }}>
            <h4 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '5px' }}>
                📜 Log <span style={{ fontSize: '0.8em', color: isCombat ? '#e74c3c' : '#888' }}>
                    {gameState === 'COMBAT' ? '(COMBAT!)' : ''}
                </span>
            </h4>
            {log.map((message, index) => (
                <p key={index} style={getMessageStyle(message)}>
                    {message}
                </p>
            ))}
            <div ref={logEndRef} />
        </div>
    );
};

export default CombatLog;