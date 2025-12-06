import React from 'react';

const ConnectorHandles = ({ shape, onConnectStart }) => {
    const HANDLE_SIZE = 12;
    const HALF = HANDLE_SIZE / 2;

    // Render 4 handles: Top, Right, Bottom, Left
    const handles = [
        { id: 'top', x: shape.left + shape.width / 2, y: shape.top },
        { id: 'right', x: shape.left + shape.width, y: shape.top + shape.height / 2 },
        { id: 'bottom', x: shape.left + shape.width / 2, y: shape.top + shape.height },
        { id: 'left', x: shape.left, y: shape.top + shape.height / 2 },
    ];

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, pointerEvents: 'none' }}>
            {handles.map(h => (
                <div
                    key={h.id}
                    style={{
                        position: 'absolute',
                        left: h.x - HALF,
                        top: h.y - HALF,
                        width: HANDLE_SIZE,
                        height: HANDLE_SIZE,
                        borderRadius: '50%',
                        backgroundColor: '#3B82F6',
                        border: '2px solid white',
                        cursor: 'crosshair',
                        pointerEvents: 'auto',
                        zIndex: 50,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'transform 0.1s'
                    }}
                    className="hover:scale-125"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        onConnectStart(e, shape, h.id);
                    }}
                    title="Drag to connect"
                />
            ))}
        </div>
    );
};

export default ConnectorHandles;
