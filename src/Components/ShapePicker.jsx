import React from 'react';
import { FiSquare, FiCircle } from 'react-icons/fi';
import { FaDiamond } from 'react-icons/fa6';

const ShapePicker = ({ position, onSelect, onClose }) => {
    return (
        <div
            style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                zIndex: 100,
                transform: 'translate(-50%, -50%)'
            }}
        >
            <div
                className="flex gap-2 p-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => onSelect('square')}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all hover:scale-110 group"
                    title="Process (Square)"
                >
                    <FiSquare size={24} className="group-hover:text-blue-400 transition-colors" />
                </button>
                <button
                    onClick={() => onSelect('diamond')}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all hover:scale-110 group"
                    title="Decision (Diamond)"
                >
                    <FaDiamond size={24} className="group-hover:text-yellow-400 transition-colors" />
                </button>
                <button
                    onClick={() => onSelect('circle')}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all hover:scale-110 group"
                    title="Terminator (Circle)"
                >
                    <FiCircle size={24} className="group-hover:text-red-400 transition-colors" />
                </button>
            </div>

            {/* Click outside backdrop (transparent) is handled by main canvas click or we can add one here if needed, 
          but usually main canvas click clears selection/menus. */}
        </div>
    );
};

export default ShapePicker;
