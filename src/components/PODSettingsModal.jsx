import React, { useState, useEffect } from 'react';
import './PODSettingsModal.css';

function PODSettingsModal({ show, onClose, currentPODDay, onApply }) {
  const [podDay, setPodDay] = useState(currentPODDay || 8);
  const [currentMonth, setCurrentMonth] = useState('');
  const [previousMonth, setPreviousMonth] = useState('');

  useEffect(() => {
    if (show) {
      setPodDay(currentPODDay || 8);
      updateMonthDisplay();
    }
  }, [show, currentPODDay]);

  const updateMonthDisplay = () => {
    const now = new Date();
    const current = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previous = prevDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    setCurrentMonth(current);
    setPreviousMonth(previous);
  };

  const handleApply = () => {
    onApply(podDay);
    onClose();
  };

  const handleReset = () => {
    setPodDay(8);
  };

  if (!show) return null;

  return (
    <div className="pod-settings-overlay" onClick={onClose}>
      <div className="pod-settings-content" onClick={(e) => e.stopPropagation()}>
        <div className="pod-settings-header">
          <h3>⚙️ POD Settings</h3>
          <span className="pod-settings-close" onClick={onClose}>&times;</span>
        </div>

        <div className="pod-settings-body">
          <div className="pod-info-section">
            <div className="pod-info-card">
              <div className="pod-info-icon">📅</div>
              <div className="pod-info-content">
                <div className="pod-info-label">Current Month</div>
                <div className="pod-info-value">{currentMonth}</div>
              </div>
            </div>
            <div className="pod-info-card">
              <div className="pod-info-icon">📆</div>
              <div className="pod-info-content">
                <div className="pod-info-label">Previous Month</div>
                <div className="pod-info-value">{previousMonth}</div>
              </div>
            </div>
          </div>

          <div className="pod-day-section">
            <label className="pod-day-label">
              <span className="pod-day-text">POD Day of Month</span>
              <span className="pod-day-description">
                Tickets created before this day are considered "POD", after are "Backlog"
              </span>
            </label>
            <div className="pod-day-input-group">
              <input
                type="number"
                min="1"
                max="31"
                value={podDay}
                onChange={(e) => setPodDay(parseInt(e.target.value) || 1)}
                className="pod-day-input"
              />
              <button onClick={handleReset} className="pod-reset-btn">
                Reset to Default (8)
              </button>
            </div>
          </div>

          <div className="pod-example-section">
            <div className="pod-example-title">📌 How it works:</div>
            <div className="pod-example-item">
              <span className="pod-example-badge pod-badge">POD</span>
              <span>Ticket created before day {podDay} of current month</span>
            </div>
            <div className="pod-example-item">
              <span className="pod-example-badge backlog-badge">Backlog</span>
              <span>Ticket created on or after day {podDay} of current month</span>
            </div>
          </div>
        </div>

        <div className="pod-settings-footer">
          <button className="pod-btn pod-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="pod-btn pod-btn-apply" onClick={handleApply}>
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default PODSettingsModal;
