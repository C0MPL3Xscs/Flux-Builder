import React, { useEffect, useRef } from 'react';
import { FaEraser, FaClone } from 'react-icons/fa6';
import { BsLayerForward, BsLayerBackward } from "react-icons/bs";
import { CiText } from "react-icons/ci";

const ContextMenu = ({ position, visible, type, onDelete, onAddText, onClone, onLayerUp, onLayerDown, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    // Function to handle clicks outside of the context menu
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Add event listener for clicks
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={`absolute bg-black/40 backdrop-blur-xl text-white border border-white/10 shadow-2xl z-50 rounded-xl overflow-hidden min-w-[160px] transform transition-opacity duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      style={{ top: position.y, left: position.x }}
    >
      {type !== "line" && type !== "arrow" && <div
        className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors duration-150 flex items-center text-sm font-medium"
        onClick={onAddText}
      >
        < CiText className="inline mb-0 mr-2 text-lg" />
        Edit Text
      </div>}

      <div
        className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors duration-150 flex items-center text-sm font-medium"
        onClick={onClone}
      >
        < FaClone className="inline mb-0 mr-2 text-md" />
        Clone
      </div>
      <div
        className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors duration-150 flex items-center text-sm font-medium border-t border-white/10"
        onClick={onLayerUp}
      >
        <BsLayerForward className="inline mb-0 mr-2 text-md" />
        Bring to Front
      </div>
      <div
        className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors duration-150 flex items-center text-sm font-medium"
        onClick={onLayerDown}
      >
        <BsLayerBackward className="inline mb-0 mr-2 text-md" />
        Send to Back
      </div>
      <div
        className="px-4 py-3 hover:bg-red-500/20 text-red-400 hover:text-red-300 cursor-pointer transition-colors duration-150 flex items-center text-sm font-medium border-t border-white/10"
        onClick={onDelete}
      >
        < FaEraser className="inline mb-0 mr-2 text-md" />
        Delete
      </div>
    </div>
  );
};

export default ContextMenu;
