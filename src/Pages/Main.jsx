import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiSquare, FiCircle, FiMousePointer, FiMinus, FiPlus, FiMaximize } from 'react-icons/fi';
import { FaDiamond, FaEraser } from 'react-icons/fa6';
import { FaSave } from 'react-icons/fa';
import ContextMenu from '../Components/ContextMenu';
import ResizeHandles from '../Components/ResizeHandles';
import PropertiesPanel from '../Components/PropertiesPanel';
import ConnectorHandles from '../Components/ConnectorHandles';
import ShapePicker from '../Components/ShapePicker';
import SaveAlert from '../Components/saveAlert'

const AppContainer = styled.div`
  -webkit-user-select: none;
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: ${(props) => (props.isPanning ? 'grabbing' : 'default')};
  
  /* Grid Pattern */
  background-image: radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: ${(props) => `${props.pan.x}px ${props.pan.y}px`};
`;

const TransformLayer = styled.div`
  transform-origin: 0 0;
  transform: translate(${(props) => props.pan.x}px, ${(props) => props.pan.y}px) scale(${(props) => props.scale});
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const Shape = styled.div`
  position: absolute;
  border: ${(props) => `${props.strokeWidth !== undefined ? props.strokeWidth : 2}px solid ${props.strokeColor || (props.selected ? '#60A5FA' : 'rgba(255, 255, 255, 0.8)')}`};
  background-color: ${(props) => props.backgroundColor || 'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(4px);
  cursor: ${(props) => (props.selected ? 'move' : 'pointer')};
  box-shadow: ${(props) => (props.selected ? '0 0 0 2px #60A5FA, 0 0 15px rgba(96, 165, 250, 0.6)' : '0 4px 6px rgba(0,0,0,0.1)')};
  opacity: ${(props) => props.opacity !== undefined ? props.opacity : 1};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 15px;
  font-family: ${(props) => props.fontFamily || 'cursive'};
  font-size: 14px;
  color: ${(props) => props.textColor || 'white'};

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
      border-top: 2px solid ${props.selected ? '#60A5FA' : 'white'};
      background-color: transparent;
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
      border-top: 2px solid ${props.selected ? '#60A5FA' : 'white'};
      background-color: transparent;
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
        border-bottom: 12px solid ${props.selected ? '#60A5FA' : 'white'};
        transform: rotate(90deg);
        scale: 1.2;
        transform-origin: 80% 100%;
      }
    `}
`;

function App() {
  const [appMode, setAppMode] = useState('freeroam'); // 'freeroam' | 'flux'
  const [freeroamData, setFreeroamData] = useState({ shapes: [], history: [], historyStep: -1, pan: { x: 0, y: 0 }, scale: 1 });
  const [fluxData, setFluxData] = useState({ shapes: [], history: [], historyStep: -1, pan: { x: 0, y: 0 }, scale: 1 });

  const [activeTool, setActiveTool] = useState('select');
  const [selectedShapeIds, setSelectedShapeIds] = useState([]);
  const [selectionBox, setSelectionBox] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [currentShape, setCurrentShape] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, shapeId: null });

  // Pan & Zoom State
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);
  const [isMovingShapes, setIsMovingShapes] = useState(false);
  const [connectionDrag, setConnectionDrag] = useState(null); // { startShapeId, startHandle, currentX, currentY }
  const [shapePicker, setShapePicker] = useState(null); // { x, y, sourceId, sourceHandle }

  // History State
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const canvasRef = useRef(null);
  const [editingText, setEditingText] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);

  const switchMode = (mode) => {
    if (mode === appMode) return;

    // Save current state
    const currentData = { shapes, history, historyStep, pan: panOffset, scale };
    if (appMode === 'freeroam') setFreeroamData(currentData);
    else setFluxData(currentData);

    // Load next state
    const nextData = mode === 'freeroam' ? freeroamData : fluxData;
    setShapes(nextData.shapes);
    setHistory(nextData.history);
    setHistoryStep(nextData.historyStep);
    setPanOffset(nextData.pan);
    setScale(nextData.scale);

    setAppMode(mode);
    setSelectionBox(null);
    setSelectedShapeIds([]);
  };

  // Helper: World Coordinates
  const getWorldPoint = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - panOffset.x) / scale,
      y: (clientY - rect.top - panOffset.y) / scale
    };
  };

  // History Helper
  const recordHistory = React.useCallback((newShapes) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newShapes);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [history, historyStep]);

  // Initial History
  useEffect(() => {
    if (shapes.length > 0 && history.length === 0) {
      recordHistory(shapes);
    }
  }, [shapes, history.length, recordHistory]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          // Redo
          if (historyStep < history.length - 1) {
            const nextStep = historyStep + 1;
            setHistoryStep(nextStep);
            setShapes(history[nextStep]);
          }
        } else {
          // Undo
          if (historyStep > 0) {
            const prevStep = historyStep - 1;
            setHistoryStep(prevStep);
            setShapes(history[prevStep]);
          }
        }
      }

      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeIds.length > 0) {
        if (editingText) return; // Don't delete if typing
        setShapes(prev => {
          const newShapes = prev.filter(s => !selectedShapeIds.includes(s.id));
          recordHistory(newShapes);
          return newShapes;
        });
        setSelectedShapeIds([]);
      }

      // Space for Panning
      if (e.code === 'Space' && !editingText) {
        setIsPanning(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [history, historyStep, selectedShapeIds, editingText, recordHistory]);


  useEffect(() => {
    const savedShapes = JSON.parse(localStorage.getItem('shapes')) || [];
    if (savedShapes.length === 0) {
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
    setShapes(savedShapes);
  }, []);

  // Flux: Auto-Start Node
  useEffect(() => {
    if (appMode === 'flux' && shapes.length === 0) {
      const startNode = {
        id: Date.now(),
        type: 'circle',
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        text: 'Start',
        backgroundColor: '#4ade80', // Green
        strokeColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1
      };
      setShapes([startNode]);
      setPanOffset({ x: 0, y: 0 });
      setScale(1);
    }
  }, [appMode, shapes.length]);

  const handleSave = (e) => {
    localStorage.setItem('shapes', JSON.stringify(shapes));
    setAlertVisible(true);
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
  };

  const handleMouseDown = (e) => {
    // 1. Basic checks
    if (e.button === 2) return; // Right click
    if (e.button === 1 || isPanning) { // Panning
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.stopPropagation();
      return;
    }

    const { x: startX, y: startY } = getWorldPoint(e.clientX, e.clientY);

    // 2. Eraser
    if (activeTool === 'eraser') {
      const clickedShapeId = e.target.closest('.shape')?.dataset.id;
      if (clickedShapeId) {
        setShapes(prev => {
          const newShapes = prev.filter(s => s.id !== Number(clickedShapeId));
          recordHistory(newShapes);
          return newShapes;
        });
      }
      return;
    }

    // 3. Creation (Square, Circle, etc)
    if (activeTool !== 'select') {
      setSelectedShapeIds([]); // Deselect existing
      const newShape = {
        id: Date.now(),
        type: activeTool,
        startX,
        startY,
        width: 0,
        height: 0,
        size: 50,
        angle: 0,
        text: '',
        left: startX,
        top: startY
      };
      setCurrentShape(newShape); // dragging is undefined/false -> creation/resize mode
      return;
    }

    // 4. Selection Mode (activeTool === 'select')
    const clickedShapeId = e.target.closest('.shape')?.dataset.id;
    if (clickedShapeId) {
      const id = Number(clickedShapeId);
      // Multi-select Logic
      if (e.shiftKey) {
        setSelectedShapeIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
      } else {
        if (!selectedShapeIds.includes(id)) {
          setSelectedShapeIds([id]);
        }
      }
      // Prepare for move
      setIsMovingShapes(true);
      setDragStart({ x: startX, y: startY });
    } else {
      // Clicked Empty -> Selection Box
      if (!e.shiftKey) setSelectedShapeIds([]);
      setSelectionBox({ startX, startY, currentX: startX, currentY: startY });
    }
  };

  const handleConnectStart = (e, shape, handleId) => {
    e.stopPropagation(); // Don't select/drag shape
    const { x, y } = getWorldPoint(e.clientX, e.clientY);
    setConnectionDrag({
      startShapeId: shape.id,
      startHandle: handleId,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y
    });
  };

  const handleShapePickerSelect = (type) => {
    if (!shapePicker) return;

    const { x, y, sourceId, sourceHandle } = shapePicker;
    setShapePicker(null); // Close picker

    const startShape = shapes.find(s => s.id === sourceId);
    if (!startShape) return;

    // Create New Node
    const newNodeId = Date.now();
    let newNodeX = x;
    let newNodeY = y;

    // Define size based on type
    let width = 150;
    let height = 100; // default (adjusted below)
    let text = 'New Step';

    if (type === 'square') { width = 150; height = 60; text = 'Process'; }
    if (type === 'diamond') { width = 100; height = 100; text = 'Decision'; }
    if (type === 'circle') { width = 80; height = 80; text = 'End'; }

    const newNode = {
      id: newNodeId,
      type: type,
      left: newNodeX - width / 2,
      top: newNodeY - height / 2,
      width: width,
      height: height,
      size: 50, // for diamond/circle consistency logic if used
      text: text,
      backgroundColor: 'rgba(255,255,255,0.1)',
      strokeColor: '#ffffff',
      strokeWidth: 2,
      opacity: 1
    };

    // Calculate Arrow
    let arrowStartX, arrowStartY;
    if (sourceHandle === 'right') { arrowStartX = startShape.left + startShape.width; arrowStartY = startShape.top + startShape.height / 2; }
    else if (sourceHandle === 'left') { arrowStartX = startShape.left; arrowStartY = startShape.top + startShape.height / 2; }
    else if (sourceHandle === 'bottom') { arrowStartX = startShape.left + startShape.width / 2; arrowStartY = startShape.top + startShape.height; }
    else if (sourceHandle === 'top') { arrowStartX = startShape.left + startShape.width / 2; arrowStartY = startShape.top; }
    else { arrowStartX = startShape.left + startShape.width / 2; arrowStartY = startShape.top + startShape.height / 2; }

    const deltaX = newNodeX - arrowStartX;
    const deltaY = newNodeY - arrowStartY;
    const length = Math.sqrt(deltaX ** 2 + deltaY ** 2) - 60; // Shorten by 60px (approx buffer for node radius)
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    const arrow = {
      id: Date.now() + 1,
      type: 'arrow',
      left: arrowStartX,
      top: arrowStartY,
      width: Math.max(0, length), // Prevent negative length
      height: 0,
      angle: angle,
      text: '',
      strokeColor: '#ffffff',
      strokeWidth: 2,
    };

    setShapes(prev => {
      const updated = [...prev, newNode, arrow];
      recordHistory(updated);
      return updated;
    });
  };

  const handleMouseMove = (e) => {
    // Panning
    if (isPanning && (e.buttons === 4 || isPanning)) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }

    const { x: currentX, y: currentY } = getWorldPoint(e.clientX, e.clientY);

    // 0. Connection Drag
    if (connectionDrag) {
      setConnectionDrag(prev => ({ ...prev, currentX, currentY }));
      return;
    }

    // 1. Moving Selected Shapes
    if (isMovingShapes && dragStart) {
      const dx = currentX - dragStart.x;
      const dy = currentY - dragStart.y;

      setShapes(prev => prev.map(s => {
        if (selectedShapeIds.includes(s.id)) {
          return { ...s, left: s.left + dx, top: s.top + dy, startX: s.startX + dx, startY: s.startY + dy }; // Update startX/Y too?
          // Actually, if we update shape state directly, next move event needs fresh dragStart.
        }
        return s;
      }));
      setDragStart({ x: currentX, y: currentY });
      return;
    }

    // 2. Creating New Shape (Resizing)
    if (currentShape) {
      const newWidth = Math.abs(currentX - currentShape.startX);
      const newHeight = Math.abs(currentY - currentShape.startY);

      if (currentShape.type === 'line' || currentShape.type === 'arrow') {
        const angle = Math.atan2(currentY - currentShape.startY, currentX - currentShape.startX) * (180 / Math.PI);
        const length = Math.sqrt(newWidth ** 2 + newHeight ** 2);
        setCurrentShape(prev => ({ ...prev, width: length, angle }));
      } else {
        setCurrentShape(prev => ({
          ...prev,
          width: prev.type === 'diamond' ? Math.max(newWidth, newHeight) : newWidth,
          height: prev.type === 'diamond' ? Math.max(newWidth, newHeight) : newHeight,
          left: Math.min(currentShape.startX, currentX),
          top: Math.min(currentShape.startY, currentY)
        }));
      }
      return;
    }

    // 3. Selection Box
    if (selectionBox) {
      setSelectionBox(prev => ({ ...prev, currentX, currentY }));
    }
  };

  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);

    // Finish Moving
    if (isMovingShapes) {
      setIsMovingShapes(false);
      setDragStart(null);
      recordHistory(shapes); // Record move
    }

    // Finish Creating
    if (currentShape) {
      setShapes(prev => {
        const newShapes = [...prev, currentShape];
        recordHistory(newShapes);
        return newShapes;
      });
      setCurrentShape(null);
      // Select the new shape?
      // setSelectedShapeIds([currentShape.id]); // Need ID. currentShape has ID.
      setActiveTool('select'); // Switch back to select after creation? Standard behavior.
    }

    // Finish Selection Box
    if (selectionBox) {
      // Calculate intersection
      const x1 = Math.min(selectionBox.startX, selectionBox.currentX);
      const x2 = Math.max(selectionBox.startX, selectionBox.currentX);
      const y1 = Math.min(selectionBox.startY, selectionBox.currentY);
      const y2 = Math.max(selectionBox.startY, selectionBox.currentY);

      const selectedIds = shapes.filter(s => {
        // Check if shape center is within selection box
        const centerX = s.left + (s.width || 0) / 2;
        const centerY = s.top + (s.height || 0) / 2;
        return centerX >= x1 && centerX <= x2 && centerY >= y1 && centerY <= y2;
      }).map(s => s.id);

      setSelectedShapeIds(prev => [...new Set([...prev, ...selectedIds])]); // Add to existing if Shift? 
      // Logic says: if not shift, we cleared at Start. So just set.
      // Only issue is checking shift key here? `handleMouseUp` doesn't have `e`? 
      // `handleMouseDown` already handled clearing. So just Add.

      setSelectionBox(null);
    }

    // Finish Connection Drag (Flux)
    if (connectionDrag) {
      const { startShapeId, startHandle, currentX, currentY } = connectionDrag;
      // Open Shape Picker instead of creating immediately
      setShapePicker({
        x: currentX,
        y: currentY,
        sourceId: startShapeId,
        sourceHandle: startHandle
      });
      setConnectionDrag(null);
    }
  };

  const handleMouseLeave = () => {
    if (isPanning) setIsPanning(false);
    if (isMovingShapes) setIsMovingShapes(false);
    if (selectionBox) setSelectionBox(null);
    if (connectionDrag) setConnectionDrag(null);
    // Cancel creation?
    if (currentShape) setCurrentShape(null);
  };

  const handleContextMenu = (e, shape) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      type: shape ? shape.type : 'canvas', // 'canvas' for right-click on empty space
      x: e.clientX,
      y: e.clientY,
      shapeId: shape ? shape.id : null,
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
        setShapes(prev => {
          const newShapes = [...prev, newShape];
          recordHistory(newShapes);
          return newShapes;
        });
      }
    } else if (action === 'text') {
      const shapeToAddText = shapes.find(shape => shape.id === contextMenu.shapeId);
      if (shapeToAddText) {
        handleShapeDoubleClick(shapeToAddText);
      }
    } else if (action === 'layer-front') {
      const shapeId = contextMenu.shapeId;
      setShapes(prev => {
        const shape = prev.find(s => s.id === shapeId);
        if (!shape) return prev;
        const others = prev.filter(s => s.id !== shapeId);
        const newShapes = [...others, shape];
        recordHistory(newShapes);
        return newShapes;
      });
    } else if (action === 'layer-back') {
      const shapeId = contextMenu.shapeId;
      setShapes(prev => {
        const shape = prev.find(s => s.id === shapeId);
        if (!shape) return prev;
        const others = prev.filter(s => s.id !== shapeId);
        const newShapes = [shape, ...others];
        recordHistory(newShapes);
        return newShapes;
      });
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleResize = (updatedShape) => {
    setShapes(prev => prev.map(s => s.id === updatedShape.id ? updatedShape : s));
  };

  const handleMenuClose = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleShapeDoubleClick = (shape) => {
    if (shape.type !== 'line' && shape.type !== 'arrow') {
      setSelectedShapeIds([shape.id]);
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

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom to Point
      e.preventDefault();
      const zoomSpeed = 0.001;
      const zoomDelta = -e.deltaY * zoomSpeed;
      const newScale = Math.max(0.1, Math.min(5, scale + zoomDelta));

      // Calculate new pan offset to keep mouse pointer fixed
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // worldX = (mouseX - panX) / scale
      // mouseX = worldX * scale + panX
      // We want worldX to remain constant under the mouse

      const worldX = (mouseX - panOffset.x) / scale;
      const worldY = (mouseY - panOffset.y) / scale;

      const newPanX = mouseX - worldX * newScale;
      const newPanY = mouseY - worldY * newScale;

      setScale(newScale);
      setPanOffset({ x: newPanX, y: newPanY });
    } else {
      // Pan
      setPanOffset(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  return (
    <AppContainer>
      <SaveAlert
        message="Saved successfully!"
        show={alertVisible}
        onClose={handleAlertClose}
      />
      {/* Floating Toolbar / Dock */}
      {appMode !== 'flux' && (
        <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50'>
          <div className='flex items-center gap-4 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl'>

            <button
              className={`p-3 rounded-xl transition-all duration-200 hover:bg-white/20 hover:scale-110 ${activeTool === 'select' ? 'bg-white text-black shadow-lg' : 'text-white'}`}
              onClick={() => setActiveTool('select')}
              title="Select"
            >
              <FiMousePointer size={20} />
            </button>

            <div className="w-px h-8 bg-white/20 mx-1"></div>

            <button
              className={`p-3 rounded-xl transition-all duration-200 hover:bg-white/20 hover:scale-110 ${activeTool === 'square' ? 'bg-white text-black shadow-lg' : 'text-white'}`}
              onClick={() => setActiveTool('square')}
              title="Square"
            >
              <FiSquare size={20} />
            </button>

            <button
              className={`p-3 rounded-xl transition-all duration-200 hover:bg-white/20 hover:scale-110 ${activeTool === 'circle' ? 'bg-white text-black shadow-lg' : 'text-white'}`}
              onClick={() => setActiveTool('circle')}
              title="Circle"
            >
              <FiCircle size={20} />
            </button>

            <button
              className={`p-3 rounded-xl transition-all duration-200 hover:bg-white/20 hover:scale-110 ${activeTool === 'diamond' ? 'bg-white text-black shadow-lg' : 'text-white'}`}
              onClick={() => setActiveTool('diamond')}
              title="Diamond"
            >
              <FaDiamond size={20} />
            </button>

            <div className="w-px h-8 bg-white/20 mx-1"></div>

            <button
              className={`p-3 rounded-xl transition-all duration-200 hover:bg-white/20 hover:scale-110 ${activeTool === 'line' ? 'bg-white text-black shadow-lg' : 'text-white'}`}
              onClick={() => setActiveTool('line')}
              title="Line"
            >
              <strong>|</strong>
            </button>

            <button
              className={`p-3 rounded-xl transition-all duration-200 hover:bg-white/20 hover:scale-110 ${activeTool === 'arrow' ? 'bg-white text-black shadow-lg' : 'text-white'}`}
              onClick={() => setActiveTool('arrow')}
              title="Arrow"
            >
              <strong>→</strong>
            </button>

            <div className="w-px h-8 bg-white/20 mx-1"></div>

            <button
              className={`p-3 rounded-xl transition-all duration-200 hover:bg-white/20 hover:scale-110 ${activeTool === 'eraser' ? 'bg-white text-black shadow-lg' : 'text-white'}`}
              onClick={() => setActiveTool('eraser')}
              title="Eraser"
            >
              <FaEraser size={20} />
            </button>


            <div className="w-px h-8 bg-white/20 mx-1"></div>

            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
                onClick={() => setScale(s => Math.max(0.1, s - 0.1))}
                title="Zoom Out"
              >
                <FiMinus />
              </button>
              <span className="text-white text-xs font-mono min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
              <button
                className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
                onClick={() => setScale(s => Math.min(5, s + 0.1))}
                title="Zoom In"
              >
                <FiPlus />
              </button>
              <button
                className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors ml-2"
                onClick={() => { setPanOffset({ x: 0, y: 0 }); setScale(1); }}
                title="Center View"
              >
                <FiMaximize />
              </button>
            </div>

            <div className="w-px h-8 bg-white/20 mx-1"></div>

            <button
              className={`p-3 rounded-xl transition-all duration-200 hover:bg-green-500/80 hover:scale-110 hover:shadow-green-500/50 text-white`}
              onClick={() => handleSave()}
              title="Save Project"
            >
              <FaSave size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="absolute top-8 left-8 z-50">
        <div className="flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-1 shadow-2xl">
          <button
            onClick={() => switchMode('flux')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${appMode === 'flux' ? 'bg-white text-black shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            Flux
          </button>
          <button
            onClick={() => switchMode('freeroam')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${appMode === 'freeroam' ? 'bg-white text-black shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            Freeroam
          </button>
        </div>
      </div>

      <CanvasContainer
        ref={canvasRef}
        isPanning={isPanning}
        pan={panOffset}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel} // Capture zoom wheel
        onContextMenu={(e) => handleContextMenu(e, null)}
      >
        <TransformLayer pan={panOffset} scale={scale}>
          {shapes.map((shape) => (
            <>
              <Shape
                key={shape.id}
                type={shape.type}
                size={shape.size}
                selected={selectedShapeIds.includes(shape.id)}
                data-id={shape.id}
                onContextMenu={(e) => handleContextMenu(e, shape)}
                onDoubleClick={() => handleShapeDoubleClick(shape)}
                strokeColor={shape.strokeColor}
                strokeWidth={shape.strokeWidth}
                backgroundColor={shape.backgroundColor}
                opacity={shape.opacity}
                textColor={shape.textColor}
                fontFamily={shape.fontFamily}
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
                      color: shape.textColor || 'white',
                      fontFamily: shape.fontFamily || 'cursive',
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
              {/* Flux Connector Handles */}
              {appMode === 'flux' && (selectedShapeIds.includes(shape.id)) && shape.type !== 'line' && shape.type !== 'arrow' && (
                <ConnectorHandles shape={shape} onConnectStart={handleConnectStart} />
              )}
            </>
          ))}

          {/* Connection Drag Line */}
          {connectionDrag && (
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <line
                x1={connectionDrag.startX}
                y1={connectionDrag.startY}
                x2={connectionDrag.currentX}
                y2={connectionDrag.currentY}
                stroke="white"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          )}

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

          {/* Shape Picker Popover */}
          {shapePicker && (
            <ShapePicker
              position={{ x: shapePicker.x, y: shapePicker.y }}
              onSelect={handleShapePickerSelect}
            />
          )}
          {selectedShapeIds.length === 1 && !isMovingShapes && !isPanning && (
            <ResizeHandles
              shape={shapes.find(s => s.id === selectedShapeIds[0])}
              onResize={handleResize}
              scale={scale}
            />
          )}
          {selectionBox && (
            <div
              style={{
                position: 'absolute',
                left: Math.min(selectionBox.startX, selectionBox.currentX),
                top: Math.min(selectionBox.startY, selectionBox.currentY),
                width: Math.abs(selectionBox.currentX - selectionBox.startX),
                height: Math.abs(selectionBox.currentY - selectionBox.startY),
                border: '1px solid #60A5FA',
                backgroundColor: 'rgba(96, 165, 250, 0.2)',
                pointerEvents: 'none',
              }}
            />
          )}
        </TransformLayer>
        <ContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          visible={contextMenu.visible}
          type={contextMenu.type}
          onAddText={() => handleMenuItemClick('text')}
          onDelete={() => handleMenuItemClick('delete')}
          onClone={() => handleMenuItemClick('clone')}
          onLayerUp={() => handleMenuItemClick('layer-front')}
          onLayerDown={() => handleMenuItemClick('layer-back')}
          onClose={() => handleMenuClose()}
        />
        {selectedShapeIds.length === 1 && !isMovingShapes && !isPanning && (
          <PropertiesPanel
            shape={shapes.find(s => s.id === selectedShapeIds[0])}
            onChange={handleResize}
          />
        )}
      </CanvasContainer>
    </AppContainer>
  );
}

export default App;
