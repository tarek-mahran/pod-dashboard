import React, { useState, useEffect } from 'react';
import './SLAComparisonChart.css';

function SLAComparisonChart({ data }) {
  const [selectedPOD, setSelectedPOD] = useState('All POD');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [comparisonData, setComparisonData] = useState(null);

  useEffect(() => {
    if (data && data.length > 0) {
      calculateComparison();
    }
  }, [data, selectedPOD, selectedRegion]);

  const calculateComparison = () => {
    let filteredData = data.filter(r => r['Unified Status'] === 'Running');

    // Exclude "Stuck" region
    filteredData = filteredData.filter(r => r['Region'] !== 'Stuck');

    if (selectedPOD !== 'All POD') {
      filteredData = filteredData.filter(r => r['POD / Backlog'] === selectedPOD);
    }

    if (selectedRegion !== 'All Regions') {
      filteredData = filteredData.filter(r => r['Region'] === selectedRegion);
    }

    const severities = ['Emergency', 'Critical', 'Major', 'Minor'];
    const zainData = {};
    const latisData = {};

    severities.forEach(severity => {
      const severityData = filteredData.filter(r => r['Fault Level'] === severity);
      const total = severityData.length;

      if (total === 0) {
        zainData[severity] = { target: 0, hurdle: 0 };
        latisData[severity] = { target: 0, hurdle: 0 };
        return;
      }

      // Zain (Target SLA)
      const zainTarget = severityData.filter(r => r['Target SLA'] === 'SA').length;
      const zainTargetPercent = (zainTarget / total) * 100;

      // Latis (Hurdle SLA)
      const latisHurdle = severityData.filter(r => r['Hurdle SLA'] === 'SA').length;
      const latisHurdlePercent = (latisHurdle / total) * 100;

      zainData[severity] = {
        target: Math.round(zainTargetPercent),
        hurdle: 0
      };

      latisData[severity] = {
        target: 0,
        hurdle: Math.round(latisHurdlePercent)
      };
    });

    setComparisonData({ zain: zainData, latis: latisData });
  };

  const getColorClass = (percentage) => {
    if (percentage >= 90) return 'sla-green';
    if (percentage >= 75) return 'sla-yellow';
    return 'sla-red';
  };

  const getPodOptions = () => {
    if (!data || data.length === 0) return ['All POD'];
    const pods = [...new Set(data.map(r => r['POD / Backlog']).filter(Boolean))];
    return ['All POD', ...pods.sort()];
  };

  const getRegionOptions = () => {
    if (!data || data.length === 0) return ['All Regions'];
    const regions = [...new Set(data.map(r => r['Region']).filter(Boolean))];
    return ['All Regions', ...regions.sort()];
  };

  if (!comparisonData) {
    return <div className="sla-comparison-loading">Loading SLA comparison...</div>;
  }

  return (
    <div className="sla-comparison-container">
      <div className="sla-comparison-header">
        <h2>🎯 SLA Performance Comparison</h2>
        <div className="sla-filters">
          <select
            value={selectedPOD}
            onChange={(e) => setSelectedPOD(e.target.value)}
            className="sla-filter-select"
          >
            {getPodOptions().map(pod => (
              <option key={pod} value={pod}>{pod}</option>
            ))}
          </select>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="sla-filter-select"
          >
            {getRegionOptions().map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="sla-comparison-grid">
        {/* Zain SLA (Target) */}
        <div className="sla-vendor-section">
          <div className="sla-vendor-header zain-header">
            <h3>🏆 Zain SLA (Target)</h3>
          </div>
          <div className="sla-cards">
            {['Emergency', 'Critical', 'Major', 'Minor'].map(severity => (
              <div key={severity} className={`sla-card ${getColorClass(comparisonData.zain[severity].target)}`}>
                <div className="sla-card-severity">{severity}</div>
                <div className="sla-card-percentage">{comparisonData.zain[severity].target}%</div>
                <div className="sla-card-label">Target SLA</div>
              </div>
            ))}
          </div>
        </div>

        {/* Latis SLA (Hurdle) */}
        <div className="sla-vendor-section">
          <div className="sla-vendor-header latis-header">
            <h3>🎯 Latis SLA (Hurdle)</h3>
          </div>
          <div className="sla-cards">
            {['Emergency', 'Critical', 'Major', 'Minor'].map(severity => (
              <div key={severity} className={`sla-card ${getColorClass(comparisonData.latis[severity].hurdle)}`}>
                <div className="sla-card-severity">{severity}</div>
                <div className="sla-card-percentage">{comparisonData.latis[severity].hurdle}%</div>
                <div className="sla-card-label">Hurdle SLA</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sla-legend">
        <div className="sla-legend-item">
          <div className="sla-legend-color sla-green"></div>
          <span>≥ 90% (Excellent)</span>
        </div>
        <div className="sla-legend-item">
          <div className="sla-legend-color sla-yellow"></div>
          <span>75-89% (Warning)</span>
        </div>
        <div className="sla-legend-item">
          <div className="sla-legend-color sla-red"></div>
          <span>&lt; 75% (Critical)</span>
        </div>
      </div>
    </div>
  );
}

export default SLAComparisonChart;
