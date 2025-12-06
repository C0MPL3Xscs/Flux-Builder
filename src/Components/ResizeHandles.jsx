import React, { useState, useEffect, useRef } from 'react';

const HANDLE_SIZE = 8;

const ResizeHandles = ({ shape, onResize, scale }) => {
    const [draggingHandle, setDraggingHandle] = useState(null);
    const startPosRef = useRef(null);
    const startShapeRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!draggingHandle) return;

            const dx = (e.clientX - startPosRef.current.x) / scale;
            const dy = (e.clientY - startPosRef.current.y) / scale;

            const newShape = { ...startShapeRef.current };

            if (startShapeRef.current.type === 'line' || startShapeRef.current.type === 'arrow') {
                const rad = startShapeRef.current.angle * (Math.PI / 180);
                const startX = startShapeRef.current.left;
                const startY = startShapeRef.current.top;
                const endX = startX + startShapeRef.current.width * Math.cos(rad);
                const endY = startY + startShapeRef.current.width * Math.sin(rad);

                if (draggingHandle === 'start') {
                    const newStartX = startX + dx;
                    const newStartY = startY + dy;

                    const deltaX = endX - newStartX;
                    const deltaY = endY - newStartY;

                    newShape.left = newStartX;
                    newShape.top = newStartY;
                    newShape.width = Math.sqrt(deltaX ** 2 + deltaY ** 2);
                    newShape.angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
                } else if (draggingHandle === 'end') {
                    const newEndX = endX + dx;
                    const newEndY = endY + dy;

                    const deltaX = newEndX - startX;
                    const deltaY = newEndY - startY;

                    newShape.width = Math.sqrt(deltaX ** 2 + deltaY ** 2);
                    newShape.angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
                }
            } else {
                // Standard shapes
                if (draggingHandle.includes('e')) {
                    newShape.width = Math.max(1, startShapeRef.current.width + dx);
                }
                if (draggingHandle.includes('s')) {
                    newShape.height = Math.max(1, startShapeRef.current.height + dy);
                }
                if (draggingHandle.includes('w')) {
                    const w = Math.max(1, startShapeRef.current.width - dx);
                    newShape.width = w;
                    newShape.left = startShapeRef.current.left + (startShapeRef.current.width - w);
                }
                if (draggingHandle.includes('n')) {
                    const h = Math.max(1, startShapeRef.current.height - dy);
                    newShape.height = h;
                    newShape.top = startShapeRef.current.top + (startShapeRef.current.height - h);
                }
            }

            onResize(newShape);
        };

        const handleMouseUp = () => {
            if (draggingHandle) {
                setDraggingHandle(null);
            }
        };

        if (draggingHandle) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingHandle, onResize, scale]);

    if (!shape) return null;

    const handleMouseDown = (e, handle) => {
        e.stopPropagation();
        e.preventDefault(); // Prevent canvas pan
        setDraggingHandle(handle);
        startPosRef.current = { x: e.clientX, y: e.clientY };
        startShapeRef.current = { ...shape };
    };

    const handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

    // Handles for Line/Arrow
    if (shape.type === 'line' || shape.type === 'arrow') {
        const rad = shape.angle * (Math.PI / 180);
        const endX = shape.width * Math.cos(rad);
        const endY = shape.width * Math.sin(rad);

        return (
            <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
                {/* Start Handle */}
                <div
                    style={{
                        position: 'absolute',
                        left: shape.left - HANDLE_SIZE / 2,
                        top: shape.top - HANDLE_SIZE / 2,
                        width: HANDLE_SIZE, height: HANDLE_SIZE,
                        background: 'white', border: '1px solid #3b82f6',
                        cursor: 'move', pointerEvents: 'auto', zIndex: 10
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'start')}
                />
                {/* End Handle */}
                <div
                    style={{
                        position: 'absolute',
                        left: shape.left + endX - HANDLE_SIZE / 2,
                        top: shape.top + endY - HANDLE_SIZE / 2,
                        width: HANDLE_SIZE, height: HANDLE_SIZE,
                        background: 'white', border: '1px solid #3b82f6',
                        cursor: 'move', pointerEvents: 'auto', zIndex: 10
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'end')}
                />
            </div>
        );
    }

    return (
        <div
            style={{
                position: 'absolute',
                left: shape.left,
                top: shape.top,
                width: shape.width,
                height: shape.height,
                pointerEvents: 'none', // Allow clicking through the box itself
            }}
        >
            <div style={{
                position: 'absolute',
                left: -1, top: -1, right: -1, bottom: -1,
                border: '1px solid #3b82f6',
                pointerEvents: 'none'
            }} />

            {handles.map(handle => {
                let style = {
                    position: 'absolute',
                    width: HANDLE_SIZE,
                    height: HANDLE_SIZE,
                    background: 'white',
                    border: '1px solid #3b82f6',
                    pointerEvents: 'auto',
                    cursor: `${handle}-resize`,
                    zIndex: 10
                };

                if (handle.includes('n')) style.top = -HANDLE_SIZE / 2;
                if (handle.includes('s')) style.bottom = -HANDLE_SIZE / 2;
                if (handle.includes('w')) style.left = -HANDLE_SIZE / 2;
                if (handle.includes('e')) style.right = -HANDLE_SIZE / 2;
                if (handle === 'n' || handle === 's') {
                    style.left = '50%';
                    style.marginLeft = -HANDLE_SIZE / 2;
                }
                if (handle === 'e' || handle === 'w') {
                    style.top = '50%';
                    style.marginTop = -HANDLE_SIZE / 2;
                }

                return (
                    <div
                        key={handle}
                        style={style}
                        onMouseDown={(e) => handleMouseDown(e, handle)}
                    />
                );
            })}
        </div>
    );
};

export default ResizeHandles;
