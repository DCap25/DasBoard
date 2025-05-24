import { CSSProperties } from 'react';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  style?: CSSProperties;
}

export default function LoadingSpinner({ 
  size = 40, 
  color = '#007bff', 
  style = {} 
}: LoadingSpinnerProps) {
  const spinnerStyle: CSSProperties = {
    border: `4px solid rgba(0, 0, 0, 0.1)`,
    borderLeftColor: color,
    borderRadius: '50%',
    width: `${size}px`,
    height: `${size}px`,
    animation: 'spin 1s linear infinite',
    ...style
  };

  return (
    <div className="loading-spinner-container">
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .loading-spinner-container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
          }
        `}
      </style>
      <div style={spinnerStyle}></div>
    </div>
  );
} 