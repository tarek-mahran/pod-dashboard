import React, { useState, useEffect } from 'react';
import * as XLSX from 'exceljs';
import './DownloadModal.css';

function DownloadModal({ show, onClose, uploadedFiles, processedData, onShowMessage }) {
  const [fileInfo, setFileInfo] = useState([]);

  useEffect(() => {
    if (show) {
      updateFileInfo();
    }
  }, [show, uploadedFiles, processedData]);

  const updateFileInfo = () => {
    const files = [
      {
        id: 'merged',
        name: 'Merged PCM Data',
        fileName: 'Merged_PCM_Data.xlsx',
        icon: '📊',
        description: 'Complete merged and processed data',
        size: processedData ? `${processedData.length} records` : 'N/A',
        available: !!processedData,
        color: '#6366f1'
      },
      {
        id: 'netask',
        name: 'Netask PCMs',
        fileName: uploadedFiles.netask?.name || 'Nextask_PCMs_All.xlsx',
        icon: '📄',
        description: 'Original Netask input file',
        size: uploadedFiles.netask ? formatFileSize(uploadedFiles.netask.size) : 'N/A',
        available: !!uploadedFiles.netask,
        color: '#10b981'
      },
      {
        id: 'tms',
        name: 'TMS PCMs',
        fileName: uploadedFiles.cmOperation?.name || 'TMS_PCMs_All.xlsx',
        icon: '📄',
        description: 'Original TMS/CM Operation file',
        size: uploadedFiles.cmOperation ? formatFileSize(uploadedFiles.cmOperation.size) : 'N/A',
        available: !!uploadedFiles.cmOperation,
        color: '#ec4899'
      },
      {
        id: 'owsFrt',
        name: 'OWS FRT',
        fileName: uploadedFiles.owsFrt?.name || 'OWS_FRT.xlsx',
        icon: '📄',
        description: 'OWS FRT input file',
        size: uploadedFiles.owsFrt ? formatFileSize(uploadedFiles.owsFrt.size) : 'N/A',
        available: !!uploadedFiles.owsFrt,
        color: '#f59e0b'
      },
      {
        id: 'manualFrt',
        name: 'Manual FRT',
        fileName: uploadedFiles.manualFrt?.name || 'Manual_FRT.xlsx',
        icon: '📄',
        description: 'Manual FRT input file',
        size: uploadedFiles.manualFrt ? formatFileSize(uploadedFiles.manualFrt.size) : 'N/A',
        available: !!uploadedFiles.manualFrt,
        color: '#8b5cf6'
      },
      {
        id: 'podExcluded',
        name: 'POD Excluded',
        fileName: uploadedFiles.podExcluded?.name || 'POD_Excluded.xlsx',
        icon: '📄',
        description: 'POD excluded tickets file',
        size: uploadedFiles.podExcluded ? formatFileSize(uploadedFiles.podExcluded.size) : 'N/A',
        available: !!uploadedFiles.podExcluded,
        color: '#ef4444'
      }
    ];

    setFileInfo(files);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownloadMerged = async () => {
    if (!processedData || processedData.length === 0) {
      onShowMessage('No processed data available to download', 'warning');
      return;
    }

    try {
      onShowMessage('Preparing merged file...', 'info');

      const workbook = new XLSX.Workbook();
      const worksheet = workbook.addWorksheet('Merged Data');

      // Add headers
      const headers = Object.keys(processedData[0]);
      worksheet.addRow(headers);

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }
      };

      // Add data
      processedData.forEach(row => {
        const values = headers.map(header => row[header]);
        worksheet.addRow(values);
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Merged_PCM_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      onShowMessage('Merged file downloaded successfully!', 'success');
    } catch (error) {
      onShowMessage(`Download failed: ${error.message}`, 'error');
    }
  };

  const handleDownloadOriginal = async (fileId) => {
    const fileMap = {
      netask: uploadedFiles.netask,
      tms: uploadedFiles.cmOperation,
      owsFrt: uploadedFiles.owsFrt,
      manualFrt: uploadedFiles.manualFrt,
      podExcluded: uploadedFiles.podExcluded
    };

    const file = fileMap[fileId];
    if (!file) {
      onShowMessage('File not available', 'warning');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(link.href);

      onShowMessage(`${file.name} downloaded successfully!`, 'success');
    } catch (error) {
      onShowMessage(`Download failed: ${error.message}`, 'error');
    }
  };

  const handleDownload = (file) => {
    if (file.id === 'merged') {
      handleDownloadMerged();
    } else {
      handleDownloadOriginal(file.id);
    }
  };

  if (!show) return null;

  return (
    <div className="download-modal-overlay" onClick={onClose}>
      <div className="download-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="download-modal-header">
          <h3>⬇️ Download Files</h3>
          <span className="download-modal-close" onClick={onClose}>&times;</span>
        </div>

        <div className="download-modal-body">
          <div className="download-files-grid">
            {fileInfo.map(file => (
              <div 
                key={file.id}
                className={`download-file-card ${!file.available ? 'disabled' : ''}`}
                style={{ '--file-color': file.color }}
              >
                <div className="download-file-icon">{file.icon}</div>
                <div className="download-file-info">
                  <div className="download-file-name">{file.name}</div>
                  <div className="download-file-description">{file.description}</div>
                  <div className="download-file-meta">
                    <span className="download-file-size">{file.size}</span>
                    {file.available && (
                      <span className="download-file-filename">{file.fileName}</span>
                    )}
                  </div>
                </div>
                <button
                  className="download-file-btn"
                  onClick={() => handleDownload(file)}
                  disabled={!file.available}
                  title={file.available ? `Download ${file.name}` : 'File not available'}
                >
                  {file.available ? '⬇️ Download' : '❌ N/A'}
                </button>
              </div>
            ))}
          </div>

          <div className="download-summary">
            <div className="download-summary-item">
              <span className="download-summary-icon">✅</span>
              <span>{fileInfo.filter(f => f.available).length} files available</span>
            </div>
            <div className="download-summary-item">
              <span className="download-summary-icon">📦</span>
              <span>Total files: {fileInfo.length}</span>
            </div>
          </div>
        </div>

        <div className="download-modal-footer">
          <button className="download-btn download-btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DownloadModal;
