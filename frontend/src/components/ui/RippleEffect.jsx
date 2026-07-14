import React, { useState, useEffect } from 'react';

// Reusable component that renders ripples on click.
export const RippleEffect = ({ children, className = '' }) => {
  const [ripples, setRipples] = useState([]);

  const addRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);
  };

  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 500); // match animation duration in CSS
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  return (
    <div 
      className={`relative overflow-hidden cursor-pointer ${className}`} 
      onMouseDown={addRipple}
    >
      {children}
      <div className="ripple-container">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="ripple-circle"
            style={{
              top: ripple.y,
              left: ripple.x,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}
      </div>
    </div>
  );
};
