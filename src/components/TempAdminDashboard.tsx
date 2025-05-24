import React from 'react';

const TempAdminDashboard = () => {
  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Emergency Admin Dashboard
      </h1>
      <div
        style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <p>This is a temporary dashboard to verify routing works correctly.</p>
        <p>Time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default TempAdminDashboard;
