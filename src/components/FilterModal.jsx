import React, { useState, useEffect } from 'react';
import './FilterModal.css';

function FilterModal({ show, onClose, data, onApplyFilters }) {
  const [filters, setFilters] = useState({
    years: [],
    months: [],
    skills: [],
    regions: [],
    domains: [],
    impactServices: [],
    severities: [],
    subProjects: [],
    excludeStatuses: [],
    pcmSources: [],
    unifiedStatuses: [],
    slaTypes: []
  });

  const [selectedFilters, setSelectedFilters] = useState({});
  const [allChecked, setAllChecked] = useState({});

  useEffect(() => {
    if (show && data && data.length > 0) {
      extractFiltersFromData(data);
    }
  }, [show, data]);

  const extractFiltersFromData = (data) => {
    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const extracted = {
      years: [...new Set(data.map(r => r['PCM Year']).filter(Boolean))].sort(),
      months: [...new Set(data.map(r => r['PCM Month']).filter(Boolean))].sort((a, b) => 
        monthOrder.indexOf(a) - monthOrder.indexOf(b)
      ),
      skills: [...new Set(data.map(r => r['Skill']).filter(Boolean))].sort(),
      regions: [...new Set(data.map(r => r['Region']).filter(Boolean))].sort(),
      domains: [...new Set(data.map(r => r['Domain']).filter(Boolean))].sort(),
      impactServices: [...new Set(data.map(r => r['Impact Service']).filter(Boolean))].sort(),
      severities: [...new Set(data.map(r => r['Fault Level']).filter(Boolean))].sort(),
      subProjects: [...new Set(data.map(r => r['Sub Project']).filter(Boolean))].sort(),
      excludeStatuses: [...new Set(data.map(r => r['Exclude'] || 'Not Excluded'))].sort(),
      pcmSources: [...new Set(data.map(r => r['PCM Source']).filter(Boolean))].sort(),
      unifiedStatuses: [...new Set(data.map(r => r['Unified Status']).filter(Boolean))].sort(),
      slaTypes: [...new Set(data.map(r => r['SLA/Non SLA']).filter(Boolean))].sort()
    };

    setFilters(extracted);

    // Initialize all as checked
    const initialSelected = {};
    const initialAllChecked = {};
    Object.keys(extracted).forEach(key => {
      initialSelected[key] = new Set(extracted[key]);
      initialAllChecked[key] = true;
    });
    setSelectedFilters(initialSelected);
    setAllChecked(initialAllChecked);
  };

  const handleAllChange = (filterType) => {
    const newAllChecked = { ...allChecked };
    const newSelected = { ...selectedFilters };

    if (allChecked[filterType]) {
      newAllChecked[filterType] = false;
      newSelected[filterType] = new Set();
    } else {
      newAllChecked[filterType] = true;
      newSelected[filterType] = new Set(filters[filterType]);
    }

    setAllChecked(newAllChecked);
    setSelectedFilters(newSelected);
  };

  const handleCheckboxChange = (filterType, value) => {
    const newSelected = { ...selectedFilters };
    const currentSet = new Set(newSelected[filterType]);

    if (currentSet.has(value)) {
      currentSet.delete(value);
    } else {
      currentSet.add(value);
    }

    newSelected[filterType] = currentSet;

    const newAllChecked = { ...allChecked };
    if (currentSet.size === 0) {
      newAllChecked[filterType] = false;
    } else if (currentSet.size === filters[filterType].length) {
      newAllChecked[filterType] = true;
    } else {
      newAllChecked[filterType] = 'indeterminate';
    }

    setSelectedFilters(newSelected);
    setAllChecked(newAllChecked);
  };

  const handleClearAll = () => {
    const clearedSelected = {};
    const clearedAllChecked = {};
    Object.keys(filters).forEach(key => {
      clearedSelected[key] = new Set(filters[key]);
      clearedAllChecked[key] = true;
    });
    setSelectedFilters(clearedSelected);
    setAllChecked(clearedAllChecked);
  };

  const handleApply = () => {
    const filterValues = {};
    Object.keys(selectedFilters).forEach(key => {
      filterValues[key] = Array.from(selectedFilters[key]);
    });
    onApplyFilters(filterValues);
    onClose();
  };

  const getSelectedCount = (filterType) => {
    return selectedFilters[filterType]?.size || 0;
  };

  const filterConfigs = [
    { key: 'years', label: 'PCM Year', dataKey: 'PCM Year' },
    { key: 'months', label: 'PCM Month', dataKey: 'PCM Month' },
    { key: 'skills', label: 'Skill', dataKey: 'Skill' },
    { key: 'regions', label: 'Region', dataKey: 'Region' },
    { key: 'domains', label: 'Domain', dataKey: 'Domain' },
    { key: 'impactServices', label: 'Impact Service', dataKey: 'Impact Service' },
    { key: 'severities', label: 'Severity', dataKey: 'Fault Level' },
    { key: 'subProjects', label: 'Sub Project', dataKey: 'Sub Project' },
    { key: 'excludeStatuses', label: 'Exclude', dataKey: 'Exclude' },
    { key: 'pcmSources', label: 'PCM Source', dataKey: 'PCM Source' },
    { key: 'unifiedStatuses', label: 'Unified Status', dataKey: 'Unified Status' },
    { key: 'slaTypes', label: 'SLA/Non SLA', dataKey: 'SLA/Non SLA' }
  ];

  if (!show) return null;

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div className="filter-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="filter-modal-header">
          <h3>🔍 Filter Data</h3>
          <span className="filter-modal-close" onClick={onClose}>&times;</span>
        </div>

        <div className="filter-modal-body">
          <div className="filters-grid">
            {filterConfigs.map(({ key, label }) => (
              <div key={key} className="filter-group">
                <label className="filter-group-label">
                  <input
                    type="checkbox"
                    checked={allChecked[key] === true}
                    ref={el => {
                      if (el && allChecked[key] === 'indeterminate') {
                        el.indeterminate = true;
                      }
                    }}
                    onChange={() => handleAllChange(key)}
                  />
                  <strong>All {label}</strong>
                  <span className="filter-count">
                    ({getSelectedCount(key)}/{filters[key]?.length || 0})
                  </span>
                </label>
                <div className="filter-options">
                  {filters[key]?.map(value => (
                    <label key={value} className="filter-option-label">
                      <input
                        type="checkbox"
                        checked={selectedFilters[key]?.has(value) || false}
                        onChange={() => handleCheckboxChange(key, value)}
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="filter-modal-footer">
          <button className="filter-btn filter-btn-clear" onClick={handleClearAll}>
            Clear Filters
          </button>
          <div className="filter-footer-actions">
            <button className="filter-btn filter-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="filter-btn filter-btn-apply" onClick={handleApply}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;
