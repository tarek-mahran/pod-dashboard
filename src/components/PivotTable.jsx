import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import './PivotTable.css';

function PivotTable({ data, onShowMessage }) {
  const [selectedOwner, setSelectedOwner] = useState('All Owners');
  const [selectedPOD, setSelectedPOD] = useState('Overall');
  const [tableData, setTableData] = useState(null);
  const tableRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0) {
      calculatePivotData();
    }
  }, [data, selectedOwner, selectedPOD]);

  const calculatePivotData = () => {
    let filteredData = data.filter(r => r['Unified Status'] === 'Running');

    // Exclude "Stuck" region
    filteredData = filteredData.filter(r => r['Region'] !== 'Stuck');

    // Apply POD filter
    if (selectedPOD === 'Closure') {
      filteredData = filteredData.filter(r => r['POD / Backlog'] === 'POD');
    } else if (selectedPOD === 'Escalated') {
      filteredData = filteredData.filter(r => r['POD / Backlog'] === 'Backlog');
    }

    // Apply Owner filter (with FLM filtering logic)
    if (selectedOwner !== 'All Owners') {
      if (selectedOwner === 'FLM' || selectedOwner === 'FLM_EM') {
        // FLM filtering: include FLM, FLM_EM, or empty owner
        filteredData = filteredData.filter(r => {
          const owner = r['Resolved Owner'] || r['Updated Owner'];
          return owner === 'FLM' || owner === 'FLM_EM' || !owner;
        });
      } else {
        filteredData = filteredData.filter(r => r['Sub Project'] === selectedOwner);
      }
    }

    const severities = ['Emergency', 'Critical', 'High', 'Medium'];
    const rows = [];
    let totalPCMs = 0;
    let totalTargetExceeded = 0;
    let totalTargetWithin = 0;
    let totalTargetAchieved = 0;
    let totalHurdleExceeded = 0;
    let totalHurdleWithin = 0;
    let totalHurdleAchieved = 0;

    severities.forEach(severity => {
      const severityData = filteredData.filter(r => r['Fault Level'] === severity);
      const count = severityData.length;

      if (count === 0) {
        rows.push({
          severity,
          total: 0,
          targetExceeded: 0,
          targetWithin: 0,
          targetAchieved: 0,
          targetPercent: 0,
          targetThreshold: getTargetThreshold(severity),
          hurdleExceeded: 0,
          hurdleWithin: 0,
          hurdleAchieved: 0,
          hurdlePercent: 0,
          hurdleThreshold: getHurdleThreshold(severity)
        });
        return;
      }

      // Target SLA calculations
      const targetExceeded = severityData.filter(r => r['Target SLA'] === 'Exceeded').length;
      const targetWithin = severityData.filter(r => r['Target SLA'] === 'SA').length;
      const targetAchieved = targetExceeded + targetWithin;
      const targetPercent = Math.round((targetAchieved / count) * 100);

      // Hurdle SLA calculations
      const hurdleExceeded = severityData.filter(r => r['Hurdle SLA'] === 'Exceeded').length;
      const hurdleWithin = severityData.filter(r => r['Hurdle SLA'] === 'SA').length;
      const hurdleAchieved = hurdleExceeded + hurdleWithin;
      const hurdlePercent = Math.round((hurdleAchieved / count) * 100);

      rows.push({
        severity,
        total: count,
        targetExceeded,
        targetWithin,
        targetAchieved,
        targetPercent,
        targetThreshold: getTargetThreshold(severity),
        hurdleExceeded,
        hurdleWithin,
        hurdleAchieved,
        hurdlePercent,
        hurdleThreshold: getHurdleThreshold(severity)
      });

      totalPCMs += count;
      totalTargetExceeded += targetExceeded;
      totalTargetWithin += targetWithin;
      totalTargetAchieved += targetAchieved;
      totalHurdleExceeded += hurdleExceeded;
      totalHurdleWithin += hurdleWithin;
      totalHurdleAchieved += hurdleAchieved;
    });

    // Add total row
    const totalTargetPercent = totalPCMs > 0 ? Math.round((totalTargetAchieved / totalPCMs) * 100) : 0;
    const totalHurdlePercent = totalPCMs > 0 ? Math.round((totalHurdleAchieved / totalPCMs) * 100) : 0;

    setTableData({
      rows,
      totals: {
        total: totalPCMs,
        targetExceeded: totalTargetExceeded,
        targetWithin: totalTargetWithin,
        targetAchieved: totalTargetAchieved,
        targetPercent: totalTargetPercent,
        hurdleExceeded: totalHurdleExceeded,
        hurdleWithin: totalHurdleWithin,
        hurdleAchieved: totalHurdleAchieved,
        hurdlePercent: totalHurdlePercent
      }
    });
  };

  const getTargetThreshold = (severity) => {
    const thresholds = {
      'Emergency': '2/4 Hours',
      'Critical': '4/8 Hours',
      'High': '8/12 Hours',
      'Medium': '12/24 Hours'
    };
    return thresholds[severity] || '-';
  };

  const getHurdleThreshold = (severity) => {
    const thresholds = {
      'Emergency': '1/2 Hours',
      'Critical': '2/4 Hours',
      'High': '4/8 Hours',
      'Medium': '8/16 Hours'
    };
    return thresholds[severity] || '-';
  };

  const getCellColor = (percent, threshold = 90) => {
    if (percent >= threshold) return 'cell-green';
    if (percent >= 75) return 'cell-yellow';
    return 'cell-red';
  };

  const getOwnerOptions = () => {
    if (!data || data.length === 0) return ['All Owners'];
    const owners = [...new Set(data.map(r => r['Sub Project']).filter(Boolean))];
    return ['All Owners', ...owners.sort()];
  };

  const handleScreenshot = async () => {
    if (!tableRef.current) return;

    try {
      onShowMessage('Generating screenshot...', 'info');
      
      const canvas = await html2canvas(tableRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `POD_SLA_Table_${selectedPOD}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      onShowMessage('Screenshot saved successfully!', 'success');
    } catch (error) {
      onShowMessage(`Screenshot failed: ${error.message}`, 'error');
    }
  };

  const getTableTitle = () => {
    const podText = selectedPOD === 'Overall' ? 'Overall' :
                    selectedPOD === 'Closure' ? 'POD' :
                    'Backlog (Escalated)';
    return `${podText} CM SLA`;
  };

  if (!tableData) {
    return <div className="pivot-table-loading">Loading SLA table...</div>;
  }

  return (
    <div className="pivot-table-container">
      <div className="pivot-table-header">
        <div className="pivot-table-title">
          <h2>📋 {getTableTitle()}</h2>
        </div>
        <div className="pivot-table-controls">
          <select
            value={selectedPOD}
            onChange={(e) => setSelectedPOD(e.target.value)}
            className="pivot-select"
          >
            <option value="Overall">Overall</option>
            <option value="Closure">POD (Closure)</option>
            <option value="Escalated">Backlog (Escalated)</option>
          </select>
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="pivot-select"
          >
            {getOwnerOptions().map(owner => (
              <option key={owner} value={owner}>{owner}</option>
            ))}
          </select>
          <button onClick={handleScreenshot} className="screenshot-btn">
            📸 Screenshot
          </button>
        </div>
      </div>

      <div className="pivot-table-wrapper" ref={tableRef}>
        <table className="pivot-table">
          <thead>
            <tr>
              <th rowSpan="2" className="severity-header">Fault Level</th>
              <th rowSpan="2" className="total-header">Total PCMs</th>
              <th colSpan="4" className="target-header">Zain SLA (Target)</th>
              <th colSpan="4" className="hurdle-header">Latis SLA (Hurdle)</th>
            </tr>
            <tr>
              <th className="sub-header">Exceeded</th>
              <th className="sub-header">Within</th>
              <th className="sub-header">Achieved %</th>
              <th className="sub-header threshold-header">Threshold</th>
              <th className="sub-header">Exceeded</th>
              <th className="sub-header">Within</th>
              <th className="sub-header">Achieved %</th>
              <th className="sub-header threshold-header">Threshold</th>
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map(row => (
              <tr key={row.severity}>
                <td className="severity-cell">{row.severity}</td>
                <td className="total-cell">{row.total}</td>
                <td className="count-cell">{row.targetExceeded}</td>
                <td className="count-cell">{row.targetWithin}</td>
                <td className={`percent-cell ${getCellColor(row.targetPercent)}`}>
                  {row.targetPercent}%
                </td>
                <td className="threshold-cell">{row.targetThreshold}</td>
                <td className="count-cell">{row.hurdleExceeded}</td>
                <td className="count-cell">{row.hurdleWithin}</td>
                <td className={`percent-cell ${getCellColor(row.hurdlePercent)}`}>
                  {row.hurdlePercent}%
                </td>
                <td className="threshold-cell">{row.hurdleThreshold}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td className="severity-cell"><strong>Total</strong></td>
              <td className="total-cell"><strong>{tableData.totals.total}</strong></td>
              <td className="count-cell"><strong>{tableData.totals.targetExceeded}</strong></td>
              <td className="count-cell"><strong>{tableData.totals.targetWithin}</strong></td>
              <td className={`percent-cell ${getCellColor(tableData.totals.targetPercent)}`}>
                <strong>{tableData.totals.targetPercent}%</strong>
              </td>
              <td className="threshold-cell">-</td>
              <td className="count-cell"><strong>{tableData.totals.hurdleExceeded}</strong></td>
              <td className="count-cell"><strong>{tableData.totals.hurdleWithin}</strong></td>
              <td className={`percent-cell ${getCellColor(tableData.totals.hurdlePercent)}`}>
                <strong>{tableData.totals.hurdlePercent}%</strong>
              </td>
              <td className="threshold-cell">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pivot-table-legend">
        <div className="legend-item">
          <div className="legend-color cell-green"></div>
          <span>≥ 90% (Excellent)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color cell-yellow"></div>
          <span>75-89% (Warning)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color cell-red"></div>
          <span>&lt; 75% (Critical)</span>
        </div>
      </div>
    </div>
  );
}

export default PivotTable;
