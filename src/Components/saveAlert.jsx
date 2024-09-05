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
      className={`fixed top-4 right-4 bg-green-500 bg-opacity-45 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ zIndex: 9999 }} // Ensure the alert is above other elements
    >
      {message}
    </div>
  );
};

export default Alert;
