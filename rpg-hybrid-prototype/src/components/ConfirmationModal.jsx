import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent overlay
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200 // High z-index to sit on top of everything
        }}>
            <div style={{
                backgroundColor: '#3c3c3c',
                border: '1px solid #555',
                borderRadius: '8px',
                padding: '20px',
                maxWidth: '300px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                color: '#f0f0f0',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}>
                <h3 style={{ marginTop: 0, color: '#e74c3c' }}>{title}</h3>
                <p style={{ marginBottom: '25px', fontSize: '14px', lineHeight: '1.4' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#555',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#c0392b', // Red danger color
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}
                    >
                        Yes, Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;