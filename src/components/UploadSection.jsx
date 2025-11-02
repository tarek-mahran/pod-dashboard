import React, { useRef } from 'react';
import './UploadSection.css';

function UploadSection({ 
  uploadedFiles, 
  onFileUpload, 
  filterType, 
  onFilterChange,
  isCollapsed,
  onToggleCollapse 
}) {
  const fileInputRefs = {
    netask: useRef(null),
    owsFrt: useRef(null),
    cmOperation: useRef(null),
    manualFrt: useRef(null),
    podExcluded: useRef(null)
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file, fileType);
    }
  };

  const fileConfigs = [
    { key: 'netask', label: '📁 Netask Running PCMs', inputId: 'netask-file' },
    { key: 'owsFrt', label: '⏱️ OWS FRT', inputId: 'ows-frt-file' },
    { key: 'cmOperation', label: '📝 TMS CM Operation', inputId: 'cm-operation-file' },
    { key: 'manualFrt', label: '📋 Manual FRT', inputId: 'manual-frt-file' },
    { key: 'podExcluded', label: '🚫 POD Excluded', inputId: 'pod-excluded-file' }
  ];

  return (
    <div className="upload-section">
      <div 
        className="upload-section-header" 
        onClick={onToggleCollapse}
      >
        <div className="upload-section-title">
          <span>📂</span>
          <span>File Upload Section</span>
        </div>
        <div className={`upload-section-toggle ${isCollapsed ? 'collapsed' : ''}`}>
          ▼
        </div>
      </div>

      <div className={`upload-section-content ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="files-grid">
          {fileConfigs.map(({ key, label, inputId }) => (
            <div 
              key={key}
              className={`file-input-group ${uploadedFiles[key] ? 'uploaded' : ''}`}
              id={`group-${key}`}
            >
              <label className="file-label">{label}</label>
              <label 
                htmlFor={inputId} 
                className="file-button"
              >
                Choose File
              </label>
              <input
                ref={fileInputRefs[key]}
                type="file"
                id={inputId}
                className="file-input"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileChange(e, key)}
              />
              {uploadedFiles[key] && (
                <div className="file-status show">
                  ✅ File uploaded successfully
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="filter-section">
          <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '1.1em' }}>
            📋 Filter Options
          </h3>
          <div className="filter-options">
            <label className={`filter-option ${filterType === 'all' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="filter-type"
                value="all"
                checked={filterType === 'all'}
                onChange={(e) => onFilterChange(e.target.value)}
              />
              <span className="filter-label">All PCMs</span>
            </label>
            <label className={`filter-option ${filterType === 'running' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="filter-type"
                value="running"
                checked={filterType === 'running'}
                onChange={(e) => onFilterChange(e.target.value)}
              />
              <span className="filter-label">Running PCMs</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadSection;
