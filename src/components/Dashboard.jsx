import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ data, uploadedFiles, onShowMessage, filterType = 'all' }) {
  const [dashboardData, setDashboardData] = useState({
    running: 0,
    received: 0,
    sa: 0,
    saEmergency: 0,
    saCritical: 0,
    saMajor: 0,
    saMinor: 0,
    nsa: 0,
    nonSla: 0,
    nsaCritical: 0,
    nsaMajor: 0,
    nsaMinor: 0
  });

  useEffect(() => {
    if (data && data.length > 0) {
      calculateDashboardStats();
    }
  }, [data]);

  const calculateDashboardStats = () => {
    const stats = {
      running: 0,
      received: 0,
      sa: 0,
      saEmergency: 0,
      saCritical: 0,
      saMajor: 0,
      saMinor: 0,
      nsa: 0,
      nonSla: 0,
      nsaCritical: 0,
      nsaMajor: 0,
      nsaMinor: 0
    };

    data.forEach(row => {
      const unifiedStatus = row['Unified Status'];
      const slaStatus = row['SLA/Non SLA'];
      const impactService = row['Impact Service'];
      const faultLevel = row['Fault Level'];
      const region = row['Region'];

      // Exclude "Stuck" region
      if (region === 'Stuck') return;

      // Count running tickets
      if (unifiedStatus === 'Running') {
        stats.running++;
      }

      // Count all received tickets (total excluding Stuck)
      stats.received++;

      // Count by Impact Service (SA/NSA) for all tickets
      if (impactService === 'SA') {
        stats.sa++;
        if (faultLevel === 'Emergency') stats.saEmergency++;
        else if (faultLevel === 'Critical') stats.saCritical++;
        else if (faultLevel === 'Major') stats.saMajor++;
        else if (faultLevel === 'Minor') stats.saMinor++;
      } else if (impactService === 'NSA') {
        stats.nsa++;
        if (faultLevel === 'Critical') stats.nsaCritical++;
        else if (faultLevel === 'Major') stats.nsaMajor++;
        else if (faultLevel === 'Minor') stats.nsaMinor++;
      }
      
      // Count Non SLA tickets
      if (slaStatus === 'Non SLA') {
        stats.nonSla++;
      }
    });

    setDashboardData(stats);
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* Dashboard Cards */}
      <div className="dashboard-cards" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '16px' }}>
          {/* Running/Received Tickets - spans 2 rows */}
          <div className="dashboard-card running-card" style={{ gridRow: 'span 2' }}>
            <div className="card-value">
              {filterType === 'all' ? dashboardData.received : dashboardData.running}
            </div>
            <div className="card-title">
              {filterType === 'all' ? 'Received Tickets' : 'Running Tickets'}
            </div>
          </div>

          {/* SA Cards - First Row */}
          <div className="dashboard-card sa-card">
            <div className="card-value">{dashboardData.sa}</div>
            <div className="card-title">SA Tickets</div>
          </div>
          <div className="dashboard-card sa-emergency-card">
            <div className="card-value">{dashboardData.saEmergency}</div>
            <div className="card-title">Emergency SA</div>
          </div>
          <div className="dashboard-card sa-critical-card">
            <div className="card-value">{dashboardData.saCritical}</div>
            <div className="card-title">Critical SA</div>
          </div>
          <div className="dashboard-card sa-major-card">
            <div className="card-value">{dashboardData.saMajor}</div>
            <div className="card-title">Major SA</div>
          </div>
          <div className="dashboard-card sa-minor-card">
            <div className="card-value">{dashboardData.saMinor}</div>
            <div className="card-title">Minor SA</div>
          </div>

          {/* NSA Cards - Second Row */}
          <div className="dashboard-card nsa-card">
            <div className="card-value">{dashboardData.nsa}</div>
            <div className="card-title">NSA Tickets</div>
          </div>
          <div className="dashboard-card non-sla-card">
            <div className="card-value">{dashboardData.nonSla}</div>
            <div className="card-title">Non SLA</div>
          </div>
          <div className="dashboard-card nsa-critical-card">
            <div className="card-value">{dashboardData.nsaCritical}</div>
            <div className="card-title">Critical NSA</div>
          </div>
          <div className="dashboard-card nsa-major-card">
            <div className="card-value">{dashboardData.nsaMajor}</div>
            <div className="card-title">Major NSA</div>
          </div>
          <div className="dashboard-card nsa-minor-card">
            <div className="card-value">{dashboardData.nsaMinor}</div>
            <div className="card-title">Minor NSA</div>
          </div>
        </div>
      </div>

      <div className="summary-section">
        <h4 style={{ color: '#374151', margin: '0 0 20px 0', fontSize: '1.1em' }}>
          📊 Summary
        </h4>
        <p style={{ color: '#6b7280' }}>
          Total records processed: <strong>{data.length}</strong>
        </p>
        <p style={{ color: '#6b7280', marginTop: '10px' }}>
          {filterType === 'all' ? 'Received tickets' : 'Running tickets'}: <strong>{filterType === 'all' ? dashboardData.received : dashboardData.running}</strong>
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
