import React, { useEffect, useRef } from 'react';

const CombatLog = ({ log, gameState }) => {
    const logEndRef = useRef(null);

    // Auto-scroll to the bottom when the log updates
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [log]);

    return (
        <div style={{
            border: '1px solid black',
            padding: '10px',
            height: '250px',
            overflowY: 'scroll',
            marginTop: '10px',
            backgroundColor: gameState === 'COMBAT' ? '#ffcccc' : '#f0f0f0' // Highlight combat state
        }}>
            <h4>📜 Game Log ({gameState})</h4>
            {log.map((message, index) => (
                <p key={index} style={{ margin: '2px 0', fontSize: '12px' }}>
                    {message}
                </p>
            ))}
            <div ref={logEndRef} />
        </div>
    );
};

export default CombatLog;