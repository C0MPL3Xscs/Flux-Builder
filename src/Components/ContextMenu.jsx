import React, { useEffect, useRef } from 'react';
import { FaEraser, FaClone } from 'react-icons/fa6';
import { CiText } from "react-icons/ci";

const ContextMenu = ({ position, visible, type, onDelete, onAddText, onClone, onClose }) => {
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
      className={`absolute bg-gray-800 text-white border border-gray-600 shadow-lg z-10 ${
        visible ? 'block' : 'hidden'
      }`}
      style={{ top: position.y, left: position.x }}
    >
      {type !== "line" && type !== "arrow" && <div
        className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
        onClick={onAddText}
      >
        < CiText className="inline mb-1 mr-1" />
        Edit Text
      </div>}
      
      <div
        className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
        onClick={onClone}
      >
        < FaClone className="inline mb-1 mr-1" />
        Clone
      </div>
      <div
        className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
        onClick={onDelete}
      >
        < FaEraser className="inline mb-1 mr-1" />
        Delete
      </div>
    </div>
  );
};

export default ContextMenu;
