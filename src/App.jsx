import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import Statistics from './components/Statistics';
import Dashboard from './components/Dashboard';
import StatusMessage from './components/StatusMessage';
import FloatingFooter from './components/FloatingFooter';
import FilterModal from './components/FilterModal';
import SLAComparisonChart from './components/SLAComparisonChart';
import DashboardCharts from './components/DashboardCharts';
import PivotTable from './components/PivotTable';
import PODSettingsModal from './components/PODSettingsModal';
import DownloadModal from './components/DownloadModal';
import { processFiles } from './utils/fileProcessor';
import './App.css';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState({
    netask: null,
    manualFrt: null,
    cmOperation: null,
    owsFrt: null,
    podExcluded: null
  });

  const [processedData, setProcessedData] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    netask: 0,
    tmsOnly: 0,
    frtMatches: 0,
    filtered: 0
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '', show: false });
  const [filterType, setFilterType] = useState('all');
  const [isUploadSectionCollapsed, setIsUploadSectionCollapsed] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [displayData, setDisplayData] = useState(null);
  const [showPODSettings, setShowPODSettings] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [podDay, setPodDay] = useState(8);

  // Auto-load files on mount
  useEffect(() => {
    loadFilesFromGitHub();
  }, []);

  const showMessage = (text, type = 'info') => {
    setStatusMessage({ text, type, show: true });
    setTimeout(() => {
      setStatusMessage(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const loadFilesFromGitHub = async () => {
    showMessage('Loading input files...', 'info');

    const fileUrls = {
      netask: 'https://decosaro.github.io/nextask_all/Nextask_PCMs_All.xlsx',
      cmOperation: 'https://decosaro.github.io/tms_all/TMS_PCMs_All.xlsx',
      owsFrt: 'https://decosaro.github.io/ows_frt/OWS_FRT.xlsx',
      manualFrt: 'https://decosaro.github.io/manual_frt/Manual_FRT.xlsx',
      podExcluded: 'https://decosaro.github.io/pod_excluded/POD_Excluded.xlsx'
    };

    const ExcelJS = (await import('exceljs')).default;
    const loadedFiles = {};
    let successCount = 0;

    for (const [fileType, url] of Object.entries(fileUrls)) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        
        loadedFiles[fileType] = workbook;
        successCount++;
      } catch (error) {
        console.error(`Error loading ${fileType}:`, error);
      }
    }

    setUploadedFiles(loadedFiles);

    if (successCount > 0) {
      showMessage(`Successfully loaded ${successCount} of ${Object.keys(fileUrls).length} input files`, 'success');
      
      // Auto-process if all files loaded
      if (successCount === Object.keys(fileUrls).length) {
        setTimeout(() => {
          handleProcess(loadedFiles);
        }, 1000);
      }
    } else {
      showMessage('Failed to load input files. Please upload files manually.', 'error');
    }
  };

  const handleFileUpload = async (file, fileType) => {
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);

      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: workbook
      }));

      showMessage(`${file.name} uploaded successfully`, 'success');
    } catch (error) {
      showMessage(`Error reading ${file.name}: ${error.message}`, 'error');
    }
  };

  const handleProcess = async (files = uploadedFiles, customPodDay = podDay) => {
    if (!files.netask && !files.cmOperation && !files.owsFrt && !files.manualFrt) {
      showMessage('Please upload at least one file before processing', 'warning');
      return;
    }

    setIsProcessing(true);
    showMessage('Processing files...', 'info');

    try {
      const result = await processFiles(files, filterType, customPodDay);
      setProcessedData(result.mergedData);
      setStatistics({
        total: result.stats.total,
        netask: result.stats.netask,
        tmsOnly: result.stats.tmsOnly,
        frtMatches: result.stats.frtMatches,
        filtered: result.stats.filtered
      });

      showMessage('Files processed successfully!', 'success');
      setIsUploadSectionCollapsed(true);
      setDisplayData(result.mergedData);
    } catch (error) {
      showMessage(`Error processing files: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyFilters = (filters) => {
    if (!processedData) return;

    let filtered = [...processedData];

    Object.keys(filters).forEach(filterKey => {
      const selectedValues = filters[filterKey];
      if (selectedValues.length === 0) return;

      const keyMap = {
        years: 'PCM Year',
        months: 'PCM Month',
        skills: 'Skill',
        regions: 'Region',
        domains: 'Domain',
        impactServices: 'Impact Service',
        severities: 'Fault Level',
        subProjects: 'Sub Project',
        excludeStatuses: 'Exclude',
        pcmSources: 'PCM Source',
        unifiedStatuses: 'Unified Status',
        slaTypes: 'SLA/Non SLA'
      };

      const dataKey = keyMap[filterKey];
      if (dataKey) {
        filtered = filtered.filter(row => {
          const value = row[dataKey] || (dataKey === 'Exclude' ? 'Not Excluded' : null);
          return selectedValues.includes(value);
        });
      }
    });

    setDisplayData(filtered);
    setAppliedFilters(filters);
    showMessage(`Filters applied: ${filtered.length} records shown`, 'success');
  };

  const handlePODDayChange = async (newPODDay) => {
    setPodDay(newPODDay);
    showMessage(`POD day updated to ${newPODDay}. Reprocessing data...`, 'info');
    
    // Reprocess files with new POD day
    if (uploadedFiles.netask || uploadedFiles.cmOperation) {
      await handleProcess(uploadedFiles, newPODDay);
    }
  };

  const hasAnyFile = Object.values(uploadedFiles).some(file => file !== null);

  return (
    <div className="app-container">
      <Header />
      
      <div className="main-card">
        <UploadSection
          uploadedFiles={uploadedFiles}
          onFileUpload={handleFileUpload}
          filterType={filterType}
          onFilterChange={setFilterType}
          isCollapsed={isUploadSectionCollapsed}
          onToggleCollapse={() => setIsUploadSectionCollapsed(!isUploadSectionCollapsed)}
        />

        <button
          id="process-button"
          className={`process-button ${isProcessing ? 'processing' : ''}`}
          onClick={() => handleProcess()}
          disabled={!hasAnyFile || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Process Merge Files'}
        </button>

        {processedData && (
          <div className="action-buttons">
            <button
              className="filter-button"
              onClick={() => setShowFilterModal(true)}
            >
              🔍 Filters
              {appliedFilters && ' (Active)'}
            </button>
            <button
              className="pod-settings-button"
              onClick={() => setShowPODSettings(true)}
            >
              ⚙️ POD Settings
            </button>
            <button
              className="download-button"
              onClick={() => setShowDownloadModal(true)}
            >
              ⬇️ Download Files
            </button>
            <button
              className="refresh-button"
              onClick={loadFilesFromGitHub}
            >
              🔄 Refresh
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="loader"></div>
        )}

        <Statistics statistics={statistics} show={processedData !== null} />

        {displayData && (
          <>
            <SLAComparisonChart data={displayData} />
            <DashboardCharts data={displayData} />
            <PivotTable data={displayData} onShowMessage={showMessage} />
            <Dashboard 
              data={displayData}
              uploadedFiles={uploadedFiles}
              onShowMessage={showMessage}
            />
          </>
        )}
      </div>

      <StatusMessage message={statusMessage} />
      <FloatingFooter />
      
      <FilterModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        data={processedData}
        onApplyFilters={handleApplyFilters}
      />
      
      <PODSettingsModal
        show={showPODSettings}
        onClose={() => setShowPODSettings(false)}
        currentPODDay={podDay}
        onApply={handlePODDayChange}
      />
      
      <DownloadModal
        show={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        uploadedFiles={uploadedFiles}
        processedData={processedData}
        onShowMessage={showMessage}
      />
    </div>
  );
}

export default App;
