import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiSquare, FiCircle, FiMousePointer } from 'react-icons/fi';
import { FaDiamond, FaEraser } from 'react-icons/fa6';
import {FaSave} from 'react-icons/fa';
import ContextMenu from '../Components/ContextMenu';
import SaveAlert from '../Components/saveAlert'

const AppContainer = styled.div`
  -webkit-user-select: none;
  display: flex;
  height: 100vh;
  background-color: #181818;
  color: white;
`;

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  background-color: #1e1e1e;
  pading: 10px;
  overflow: auto;
`;

const Shape = styled.div`
  position: absolute;
  border: 2.5px solid ${(props) => (props.selected ? '#FCA101' : 'white')};
  background-color: rgba(255, 255, 255, 0);
  cursor: ${(props) => (props.selected ? 'move' : 'pointer')};
  box-shadow: ${(props) => (props.selected ? '0 0 5px #FCA101' : 'none')};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  border-radius: 15px;
  font-family: cursive;
  font-size: 14px;

  ${(props) =>
    props.type === 'circle' && `
      border-radius: 50%;
      width: ${props.width}px;
      height: ${props.width}px;
    `}

  ${(props) =>
    props.type === 'diamond' && `
      width: ${props.size}px;
      height: ${props.size}px;
      transform: rotate(45deg);
    `}

  ${(props) =>
    props.type === 'line' && `
      width: 0;
      height: 0;
      border-top: 2px solid ${props.selected ? '#FCA101' : 'white'};
      background-color: #ffffff;
      transform: rotate(${props.angle}deg);
      transform-origin: 0 0;
      position: absolute;
      top: ${props.top}px;
      left: ${props.left}px;
    `}

  ${(props) =>
    props.type === 'arrow' && `
      width: 0;
      height: 0;
      border-top: 2px solid ${props.selected ? '#FCA101' : 'white'};
      background-color: #ffffff;
      transform: rotate(${props.angle}deg);
      transform-origin: 0 0;
      position: absolute;
      top: ${props.top}px;
      left: ${props.left}px;
      
      &::after {
        content: '';
        position: absolute;
        top: -6.5px;
        right: 0;
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 12px solid ${props.selected ? '#FCA101' : 'white'};
        transform: rotate(90deg);
        scale: 1.2;
        transform-origin: 80% 100%;
      }
    `}
`;

function App() {
  const [selectedShape, setSelectedShape] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [currentShape, setCurrentShape] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, shapeId: null });
  const [editingText, setEditingText] = useState(null);
  const canvasRef = useRef(null);
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    const savedShapes = JSON.parse(localStorage.getItem('shapes')) || [];
    if (savedShapes.length === 0){
      const defaultShapes =
      [
        {
          "id": 1725500240772,
          "type": "square",
          "startX": 378,
          "startY": 68,
          "width": 193,
          "height": 76,
          "size": 50,
          "angle": 0,
          "text": "Welcome to Flux",
          "left": 181,
          "top": 12
        },
        {
          "id": 1725501445201,
          "type": "circle",
          "startX": 312,
          "startY": 67,
          "width": 58,
          "height": 61,
          "size": 50,
          "angle": 0,
          "text": "1",
          "left": 41,
          "top": 19
        },
        {
          "id": 1725501523189,
          "type": "diamond",
          "startX": 498,
          "startY": 266,
          "width": 93,
          "height": 93,
          "size": 50,
          "angle": 0,
          "text": "Are you a developer?",
          "left": 233,
          "top": 224
        },
        {
          "id": 1725501535437,
          "type": "line",
          "startX": 604,
          "startY": 315,
          "width": 31,
          "height": 0,
          "size": 50,
          "angle": 0,
          "text": "",
          "left": 355,
          "top": 272
        },
        {
          "id": 1725501539505,
          "type": "square",
          "startX": 644,
          "startY": 306,
          "width": 107,
          "height": 31,
          "size": 50,
          "angle": 0,
          "text": "Hell Nah",
          "left": 401,
          "top": 260
        },
        {
          "id": 1725501576597,
          "type": "square",
          "startX": 449,
          "startY": 491,
          "width": 149,
          "height": 31,
          "size": 50,
          "angle": 0,
          "text": "Unfortunatly Yes",
          "left": 211,
          "top": 378
        },
        {
          "id": 1725501585191,
          "type": "line",
          "startX": 529,
          "startY": 378,
          "width": 30.01666203960727,
          "height": 0,
          "size": 50,
          "angle": 88.09084756700362,
          "text": "",
          "left": 281,
          "top": 339
        },
        {
          "id": 1725501722692,
          "type": "square",
          "startX": 788,
          "startY": 277,
          "width": 274,
          "height": 101,
          "size": 50,
          "angle": 0,
          "text": "Flux is a simple online free Diagram Builder",
          "left": 568,
          "top": 246
        },
        {
          "id": 1725501769303,
          "type": "square",
          "startX": 788,
          "startY": 277,
          "width": 274,
          "height": 101,
          "size": 50,
          "angle": 0,
          "text": "Flux is a React.js open Source Project made to help design and build diagrams/ fluxograms/ work flow / etc.",
          "left": 163,
          "top": 463
        },
        {
          "id": 1725501868676,
          "type": "circle",
          "startX": 307,
          "startY": 178,
          "width": 173,
          "height": 71,
          "size": 50,
          "angle": 0,
          "text": "What is flux?",
          "left": 310,
          "top": 120
        },
        {
          "id": 1725501895050,
          "type": "line",
          "startX": 922,
          "startY": 375,
          "width": 256.0175775215444,
          "height": 0,
          "size": 50,
          "angle": 89.32859581715003,
          "text": "",
          "left": 679,
          "top": 363
        },
        {
          "id": 1725501949407,
          "type": "circle",
          "startX": 312,
          "startY": 67,
          "width": 58,
          "height": 61,
          "size": 50,
          "angle": 0,
          "text": "2",
          "left": 40,
          "top": 378
        },
        {
          "id": 1725501961258,
          "type": "circle",
          "startX": 312,
          "startY": 67,
          "width": 58,
          "height": 61,
          "size": 50,
          "angle": 0,
          "text": "3",
          "left": 43,
          "top": 666
        },
        {
          "id": 1725501986588,
          "type": "line",
          "startX": 522.0142059326172,
          "startY": 244,
          "width": 107.01868995647442,
          "height": 0,
          "size": 50,
          "angle": -91.07082445478697,
          "text": "",
          "left": 278.0142059326172,
          "top": 204
        },
        {
          "id": 1725501993106,
          "type": "arrow",
          "startX": 533,
          "startY": 447,
          "width": 26.019223662515376,
          "height": 0,
          "size": 50,
          "angle": 87.7974018382342,
          "text": "",
          "left": 285,
          "top": 421
        },
        {
          "id": 1725501999471,
          "type": "arrow",
          "startX": 751,
          "startY": 318,
          "width": 27,
          "height": 0,
          "size": 50,
          "angle": 0,
          "text": "",
          "left": 520,
          "top": 275
        },
        {
          "id": 1725502029904,
          "type": "line",
          "startX": 523,
          "startY": 590,
          "width": 79.00632886041473,
          "height": 0,
          "size": 50,
          "angle": 89.27477570094075,
          "text": "",
          "left": 287,
          "top": 576
        },
        {
          "id": 1725502233306,
          "type": "square",
          "startX": 396,
          "startY": 692,
          "width": 274,
          "height": 52,
          "size": 50,
          "angle": 0,
          "text": "Feel free to contribute !",
          "left": 162,
          "top": 667
        },
        {
          "id": 1725502324559,
          "type": "line",
          "startX": 905,
          "startY": 614,
          "width": 377.01193615056803,
          "height": 0,
          "size": 50,
          "angle": 179.5440750383278,
          "text": "",
          "left": 672,
          "top": 618
        },
        {
          "id": 1725502421107,
          "type": "line",
          "startX": 71,
          "startY": 140,
          "width": 162.00308639035245,
          "height": 0,
          "size": 50,
          "angle": 89.64632684075355,
          "text": "",
          "left": 658,
          "top": 17
        },
        {
          "id": 1725502428853,
          "type": "line",
          "startX": 76,
          "startY": 189,
          "width": 49,
          "height": 0,
          "size": 50,
          "angle": 0,
          "text": "",
          "left": 665,
          "top": 74
        },
        {
          "id": 1725502437919,
          "type": "line",
          "startX": 71,
          "startY": 140,
          "width": 162.00308639035245,
          "height": 0,
          "size": 50,
          "angle": 89.64632684075355,
          "text": "",
          "left": 751,
          "top": 15
        },
        {
          "id": 1725502444005,
          "type": "line",
          "startX": 76,
          "startY": 141,
          "width": 68,
          "height": 0,
          "size": 50,
          "angle": 0,
          "text": "",
          "left": 663,
          "top": 18
        },
        {
          "id": 1725502448202,
          "type": "line",
          "startX": 76,
          "startY": 141,
          "width": 68,
          "height": 0,
          "size": 50,
          "angle": 0,
          "text": "",
          "left": 759,
          "top": 173
        },
        {
          "id": 1725502454024,
          "type": "line",
          "startX": 71,
          "startY": 140,
          "width": 162.00308639035245,
          "height": 0,
          "size": 50,
          "angle": 89.64632684075355,
          "text": "",
          "left": 851,
          "top": 14
        },
        {
          "id": 1725502458168,
          "type": "line",
          "startX": 76,
          "startY": 141,
          "width": 68,
          "height": 0,
          "size": 50,
          "angle": 0,
          "text": "",
          "left": 858,
          "top": 172
        },
        {
          "id": 1725502464837,
          "type": "line",
          "startX": 71,
          "startY": 140,
          "width": 162.00308639035245,
          "height": 0,
          "size": 50,
          "angle": 89.64632684075355,
          "text": "",
          "left": 936,
          "top": 15
        },
        {
          "id": 1725502532016,
          "type": "line",
          "startX": 1128,
          "startY": 166,
          "width": 211.45448682872635,
          "height": 0,
          "size": 50,
          "angle": -44.04196589132404,
          "text": "",
          "left": 951,
          "top": 176
        },
        {
          "id": 1725502537609,
          "type": "line",
          "startX": 1286,
          "startY": 166,
          "width": 208.6935552430884,
          "height": 0,
          "size": 50,
          "angle": -136.7474648062331,
          "text": "",
          "left": 1112,
          "top": 180
        }
      ]
      setShapes(defaultShapes);
      localStorage.setItem('shapes', JSON.stringify(defaultShapes));
    }
    setShapes(savedShapes);
  }, []);

  const handleSave = (e) => {
    localStorage.setItem('shapes', JSON.stringify(shapes));
    setAlertVisible(true);
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
  };

  const handleMouseDown = (e) => {
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const startX = e.clientX - canvasRect.left;
    const startY = e.clientY - canvasRect.top;

    if (e.target.classList.contains('shape')) {
      const shapeId = e.target.dataset.id;
      const shape = shapes.find((s) => s.id === Number(shapeId));

      if (shape) {
        if (selectedShape && selectedShape.type === "eraser") {
          setShapes(prevShapes => prevShapes.filter(shape => shape.id !== Number(shapeId)));
        } else {
          setSelectedShape(shape);
          setCurrentShape({ ...shape, startX, startY, dragging: true });
        }
      }
    } else if (selectedShape) {
      if (selectedShape.type === "eraser") return;

      const newShape = {
        id: Date.now(),
        type: selectedShape.type,
        startX,
        startY,
        width: 0,
        height: 0,
        size: selectedShape.size || 50,
        angle: 0,
        text: '' // Initialize text attribute
      };
      setCurrentShape(newShape);
      setSelectedShape(null);
    }
  };

  const handleMouseMove = (e) => {
    if (!currentShape) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - canvasRect.left;
    const currentY = e.clientY - canvasRect.top;

    if (currentShape.dragging) {
      const dx = currentX - currentShape.startX;
      const dy = currentY - currentShape.startY;

      setShapes(prevShapes => prevShapes.map(shape =>
        shape.id === currentShape.id
          ? { ...shape, left: shape.left + dx, top: shape.top + dy }
          : shape
      ));
      setCurrentShape(prevShape => ({ ...prevShape, startX: currentX, startY: currentY }));
    } else {
      const newWidth = Math.abs(currentX - currentShape.startX);
      const newHeight = Math.abs(currentY - currentShape.startY);

      if (currentShape.type === 'line' || currentShape.type === 'arrow') {
        const angle = Math.atan2(currentY - currentShape.startY, currentX - currentShape.startX) * (180 / Math.PI);
        const length = Math.sqrt(newWidth ** 2 + newHeight ** 2);
        setCurrentShape(prevShape => ({
          ...prevShape,
          width: length,
          angle,
          left: Math.min(currentShape.startX),
          top: Math.min(currentShape.startY),
        }));
      } else {
        setCurrentShape(prevShape => ({
          ...prevShape,
          width: prevShape.type === 'diamond' ? Math.max(newWidth, newHeight) : newWidth,
          height: prevShape.type === 'diamond' ? Math.max(newWidth, newHeight) : newHeight,
          left: Math.min(currentShape.startX, currentX),
          top: Math.min(currentShape.startY, currentY),
        }));
      }
    }
  };

  const handleMouseUp = () => {
    if (currentShape) {
      if (currentShape.dragging) {
        setSelectedShape(null);
      } else {
        setShapes(prevShapes => [
          ...prevShapes.filter(shape => shape.id !== currentShape.id),
          currentShape
        ]);
      }
      setCurrentShape(null);
    }
  };

  const handleContextMenu = (e, shape) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      type: shape.type,
      x: e.clientX,
      y: e.clientY,
      shapeId: shape.id,
    });
  };

  const handleMenuItemClick = (action) => {
    if (action === 'delete') {
      setShapes(prevShapes => prevShapes.filter(shape => shape.id !== contextMenu.shapeId));
    } else if (action === 'clone') {
      const shapeToClone = shapes.find(shape => shape.id === contextMenu.shapeId);
      if (shapeToClone) {
        const newShape = {
          ...shapeToClone,
          id: Date.now(),
          left: shapeToClone.left + 10,
          top: shapeToClone.top + 10,
        };
        setShapes(prevShapes => [...prevShapes, newShape]);
      }
    } else if (action === 'text') {
      const shapeToAddText = shapes.find(shape => shape.id === contextMenu.shapeId);
      if (shapeToAddText) {
        handleShapeDoubleClick(shapeToAddText);
      }
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleMenuClose = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleShapeDoubleClick = (shape) => {
    if (shape.type !== 'line' && shape.type !== 'arrow') {
      setSelectedShape(shape);
      setEditingText(shape.id);
    }
  };

  const handleTextChange = (e) => {
    setShapes(prevShapes =>
      prevShapes.map(shape =>
        shape.id === editingText
          ? { ...shape, text: e.target.value }
          : shape
      )
    );
  };

  const handleTextBlur = () => {
    setEditingText(null);
  };

  return (
    <AppContainer>
      <SaveAlert
        message="Saved successfully!"
        show={alertVisible}
        onClose={handleAlertClose}
      />
      <div className='flex flex-col p-2 gap-2'>
        <button
          className={`p-1 rounded-md hover:bg-slate-600 ${!selectedShape ? 'bg-white text-black' : ''}`}
          onClick={() => setSelectedShape(null)}
        >
          <FiMousePointer />
        </button>
        <button
          className={`p-1 rounded-md hover:bg-slate-600 ${selectedShape?.type === "square" ? 'bg-white text-black' : ''}`}
          onClick={() => setSelectedShape({ type: 'square' })}
        >
          <FiSquare />
        </button>
        <button
          className={`p-1 rounded-md hover:bg-slate-600 ${selectedShape?.type === "circle" ? 'bg-white text-black' : ''}`}
          onClick={() => setSelectedShape({ type: 'circle' })}
        >
          <FiCircle />
        </button>
        <button
          className={`p-1 rounded-md hover:bg-slate-600 ${selectedShape?.type === "diamond" ? 'bg-white text-black' : ''}`}
          onClick={() => setSelectedShape({ type: 'diamond', size: 50 })}
        >
          <FaDiamond />
        </button>
        <button
          className={`p-1 rounded-md hover:bg-slate-600 ${selectedShape?.type === "line" ? 'bg-white text-black' : ''}`}
          onClick={() => setSelectedShape({ type: 'line' })}
        >
          <strong>|</strong>
        </button>
        <button
          className={`p-1 rounded-md hover:bg-slate-600 ${selectedShape?.type === "arrow" ? 'bg-white text-black' : ''}`}
          onClick={() => setSelectedShape({ type: 'arrow' })}
        >
          <strong>→</strong>
        </button>
        <button
          className={`p-1 rounded-md hover:bg-slate-600 ${selectedShape?.type === "eraser" ? 'bg-white text-black' : ''}`}
          onClick={() => setSelectedShape({ type: 'eraser' })}
        >
          <FaEraser />
        </button>
        <button
          className={`p-1 rounded-md hover:bg-slate-600 b-0 mt-auto`}
          onClick={() => handleSave()}
        >
          <FaSave />
        </button>
      </div>
      <CanvasContainer
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        {shapes.map((shape) => (
          <Shape
            key={shape.id}
            type={shape.type}
            size={shape.size}
            selected={selectedShape && selectedShape.id === shape.id}
            data-id={shape.id}
            onContextMenu={(e) => handleContextMenu(e, shape)}
            onDoubleClick={() => handleShapeDoubleClick(shape)}
            style={{
              top: shape.top,
              left: shape.left,
              width: shape.width,
              height: shape.height,
              transform: shape.type === 'line' || shape.type === 'arrow' ? `rotate(${shape.angle}deg)` : '',
            }}
            className='shape'
          >
            {editingText === shape.id ? (
              <input
                type="text"
                value={shape.text}
                onChange={handleTextChange}
                onBlur={handleTextBlur}
                autoFocus
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'white',
                  width: '100%',
                  height: '100%',
                  textAlign: 'center',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            ) : (
              shape.text
            )}
          </Shape>
        ))}
        {currentShape && (
          <Shape
            type={currentShape.type}
            size={currentShape.size}
            selected={true}
            style={{
              top: currentShape.top,
              left: currentShape.left,
              width: currentShape.width,
              height: currentShape.height,
              transform: currentShape.type === 'line' || currentShape.type === 'arrow' ? `rotate(${currentShape.angle}deg)` : '',
            }}
          />
        )}
        <ContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          visible={contextMenu.visible}
          type={contextMenu.type}
          onAddText={() => handleMenuItemClick('text')}
          onDelete={() => handleMenuItemClick('delete')}
          onClone={() => handleMenuItemClick('clone')}
          onClose={() => handleMenuClose()}
        />
      </CanvasContainer>
    </AppContainer>
  );
}

export default App;
