import React, { useState } from 'react';
import AuthDebugger from './AuthDebugger';

interface AuthDebugButtonProps {
  placement?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

const AuthDebugButton: React.FC<AuthDebugButtonProps> = ({ placement = 'bottom-right' }) => {
  const [showDebugger, setShowDebugger] = useState(false);

  // Determine position classes based on placement
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4',
  }[placement];

  return (
    <>
      {/* Floating button */}
      <button
        className={`fixed ${positionClasses} z-50 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg text-xs`}
        onClick={() => setShowDebugger(true)}
      >
        Debug Auth
      </button>

      {/* Render debugger when activated */}
      {showDebugger && <AuthDebugger show={true} />}
    </>
  );
};

export default AuthDebugButton;
