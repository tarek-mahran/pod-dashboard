import React, { useEffect } from 'react';
import './StatusMessage.css';

function StatusMessage({ message }) {
  useEffect(() => {
    if (message.show) {
      const timer = setTimeout(() => {
        // Message will auto-hide after 5 seconds (handled by parent)
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.show]);

  if (!message.show) return null;

  return (
    <div className={`status-message ${message.type}`}>
      {message.text}
    </div>
  );
}

export default StatusMessage;
