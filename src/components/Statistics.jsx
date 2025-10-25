import React from 'react';
import './Statistics.css';

function Statistics({ statistics, show }) {
  if (!show) return null;

  return (
    <div id="statistics" className="statistics">
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📈</div>
          <div className="stat-label">Total PCMs</div>
          <div className="stat-value">{statistics.total}</div>
        </div>
        <div className="stat-card netask">
          <div className="stat-icon">📁</div>
          <div className="stat-label">Netask PCMs</div>
          <div className="stat-value">{statistics.netask}</div>
        </div>
        <div className="stat-card tms">
          <div className="stat-icon">📝</div>
          <div className="stat-label">TMS PCMs</div>
          <div className="stat-value">{statistics.tmsOnly}</div>
        </div>
        <div className="stat-card frt">
          <div className="stat-icon">⏱️</div>
          <div className="stat-label">FRT Matched</div>
          <div className="stat-value">{statistics.frtMatches}</div>
        </div>
        {statistics.filtered > 0 && (
          <div className="stat-card filtered">
            <div className="stat-icon">🔍</div>
            <div className="stat-label">Records Filtered Out</div>
            <div className="stat-value">{statistics.filtered}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Statistics;
