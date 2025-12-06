// Alert.js
import React, { useEffect } from 'react';

const Alert = ({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Hide alert after 3 seconds

      return () => clearTimeout(timer); // Clean up the timer on unmount
    }
  }, [show, onClose]);

  if (!show) return null; // Don't render anything if `show` is false

  return (
    <div
      className={`fixed top-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-4 rounded-2xl shadow-2xl transition-all duration-500 ease-out transform ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      style={{ zIndex: 9999 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
        <span className="font-medium tracking-wide text-sm">{message}</span>
      </div>
    </div>
  );
};

export default Alert;
