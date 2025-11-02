import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ data, uploadedFiles, onShowMessage }) {
  const [dashboardData, setDashboardData] = useState({
    running: 0,
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
      const faultLevel = row['Fault Level'];
      const region = row['Region'];

      // Count running tickets (exclude "Stuck" region)
      if (unifiedStatus === 'Running' && region !== 'Stuck') {
        stats.running++;

        // Count by SLA status
        if (slaStatus === 'SA') {
          stats.sa++;
          if (faultLevel === 'Emergency') stats.saEmergency++;
          else if (faultLevel === 'Critical') stats.saCritical++;
          else if (faultLevel === 'Major') stats.saMajor++;
          else if (faultLevel === 'Minor') stats.saMinor++;
        } else if (slaStatus === 'NSA') {
          stats.nsa++;
          if (faultLevel === 'Critical') stats.nsaCritical++;
          else if (faultLevel === 'Major') stats.nsaMajor++;
          else if (faultLevel === 'Minor') stats.nsaMinor++;
        } else if (slaStatus === 'Non SLA') {
          stats.nonSla++;
        }
      }
    });

    setDashboardData(stats);
  };

  const handleDownload = async () => {
    onShowMessage('Preparing download...', 'info');
    
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Merged Data');

      // Add headers
      const headers = Object.keys(data[0] || {});
      worksheet.addRow(headers);

      // Add data
      data.forEach(row => {
        const values = headers.map(header => row[header]);
        worksheet.addRow(values);
      });

      // Generate and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Merged_POD_Data.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);

      onShowMessage('Download complete!', 'success');
    } catch (error) {
      onShowMessage(`Download failed: ${error.message}`, 'error');
    }
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '30px', marginTop: '40px', gap: '10px' }}>
        <button
          onClick={handleDownload}
          style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '0.9em', transition: 'all 0.2s ease' }}
        >
          📥 Download
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard-cards" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '16px' }}>
          {/* Running Tickets - spans 2 rows */}
          <div className="dashboard-card running-card" style={{ gridRow: 'span 2' }}>
            <div className="card-value">{dashboardData.running}</div>
            <div className="card-title">Running Tickets</div>
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
          Running tickets: <strong>{dashboardData.running}</strong>
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
