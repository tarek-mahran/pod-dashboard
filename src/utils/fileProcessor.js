// File processor utility for POD Dashboard
// This handles all the Excel file processing and merging logic

export async function processFiles(uploadedFiles, filterType = 'all', podDay = 8) {
  const stats = {
    total: 0,
    netask: 0,
    tmsOnly: 0,
    frtMatches: 0,
    filtered: 0
  };

  try {
    // Extract data from workbooks
    const netaskData = uploadedFiles.netask ? await extractWorksheetData(uploadedFiles.netask, 0) : [];
    const cmOperationData = uploadedFiles.cmOperation ? await extractWorksheetData(uploadedFiles.cmOperation, 0) : [];
    const owsFrtData = uploadedFiles.owsFrt ? await extractWorksheetData(uploadedFiles.owsFrt, 0) : [];
    const manualFrtData = uploadedFiles.manualFrt ? await extractWorksheetData(uploadedFiles.manualFrt, 0) : [];
    const podExcludedData = uploadedFiles.podExcluded ? await extractWorksheetData(uploadedFiles.podExcluded, 0) : [];

    // Create maps for efficient lookups
    const frtMap = createMapFromData(owsFrtData, 'Order ID');
    const manualFrtMap = createMapFromData(manualFrtData, 'Order ID');
    const podExcludedMap = createExcludedMap(podExcludedData);

    // Merge data
    let mergedData = [];

    // Add Netask data
    if (netaskData.length > 0) {
      stats.netask = netaskData.length;
      mergedData = netaskData.map(row => ({
        ...row,
        'PCM Source': 'Netask',
        'Exclude': checkExcludeStatus(row, podExcludedMap)
      }));
    }

    // Add CM Operation data (TMS)
    if (cmOperationData.length > 0) {
      const convertedCMData = cmOperationData.map(row => convertCMToNetaskFormat(row));
      stats.tmsOnly = convertedCMData.length;
      
      convertedCMData.forEach(row => {
        row['PCM Source'] = 'TMS';
        row['Exclude'] = checkExcludeStatus(row, podExcludedMap);
        mergedData.push(row);
      });
    }

    // Add FRT data to all records
    mergedData = mergedData.map(row => {
      const orderId = row['Order ID'];
      const rowWithFrt = { ...row };

      if (orderId && frtMap.has(orderId)) {
        const frtRow = frtMap.get(orderId);
        rowWithFrt['OWS FRT'] = frtRow['Fault Recovery Time(Process TT)'] || frtRow['Fault Recovery Time'] || null;
        if (rowWithFrt['OWS FRT']) stats.frtMatches++;
      } else if (orderId && manualFrtMap.has(orderId)) {
        rowWithFrt['OWS FRT'] = manualFrtMap.get(orderId)['FRT'] || null;
        if (rowWithFrt['OWS FRT']) stats.frtMatches++;
      } else {
        rowWithFrt['OWS FRT'] = null;
      }

      // Calculate derived fields
      calculateDerivedFields(rowWithFrt, podDay);

      return rowWithFrt;
    });

    // Apply filter
    if (filterType === 'running') {
      const beforeFilter = mergedData.length;
      mergedData = mergedData.filter(row => row['Unified Status'] === 'Running');
      stats.filtered = beforeFilter - mergedData.length;
    }

    stats.total = mergedData.length;

    return {
      mergedData,
      stats
    };
  } catch (error) {
    console.error('Error processing files:', error);
    throw error;
  }
}

// Extract data from Excel worksheet
async function extractWorksheetData(workbook, sheetIndex = 0) {
  const worksheet = workbook.worksheets[sheetIndex];
  if (!worksheet) return [];

  const data = [];
  const headers = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // Header row
      row.eachCell((cell) => {
        headers.push(cell.value);
      });
    } else {
      // Data rows
      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        rowData[header] = cell.value;
      });
      data.push(rowData);
    }
  });

  return data;
}

// Create a map from data array for efficient lookups
function createMapFromData(data, keyField) {
  const map = new Map();
  data.forEach(row => {
    const key = row[keyField];
    if (key) {
      map.set(String(key), row);
    }
  });
  return map;
}

// Create excluded map with task_, order_, tt_ prefixes
function createExcludedMap(data) {
  const map = new Map();
  data.forEach(row => {
    const taskId = row['Task ID'];
    const orderId = row['Order ID'];
    const ttId = row['TT ID'];

    if (taskId) map.set(`task_${taskId}`, true);
    if (orderId) map.set(`order_${orderId}`, true);
    if (ttId) map.set(`tt_${ttId}`, true);
  });
  return map;
}

// Check if record should be excluded
function checkExcludeStatus(row, podExcludedMap) {
  if (!podExcludedMap || podExcludedMap.size === 0) return null;

  const taskId = row['Task ID'];
  const orderId = row['Order ID'];
  const ttId = row['TT ID'];

  if (taskId && podExcludedMap.has(`task_${taskId}`)) return 'Confirmed';
  if (orderId && podExcludedMap.has(`order_${orderId}`)) return 'Confirmed';
  if (ttId && podExcludedMap.has(`tt_${ttId}`)) return 'Confirmed';

  return null;
}

// Convert CM Operation data to Netask format
function convertCMToNetaskFormat(cmRow) {
  const columnMapping = {
    'Status': 'CM Status',
    'Task ID': 'Order No',
    'Order ID': 'OWS Order ID',
    'TT ID': 'OWS TT ID',
    'TT Type': 'OWS TT Type',
    'Region': 'Region',
    'Site ID': 'Site ID',
    'Site Name': 'Site ID',
    'Root Cause': 'Root Cause',
    'Sub Cause': 'Sub cause',
    'Action Taken': 'Action Taken',
    'Created At': 'Create Time',
    'Last Update': 'Finish Time',
    'SLA': 'SLA Status',
    'Title': 'Order Title',
    'Fault Level': 'Fault Severity',
    'Alarm Name': 'Alarm Name',
    'Impact': 'Fault Impact Service',
    'Updated Owner': 'OWS Initial Owner',
    'Fault Recovery Time': 'Fault Recovery Time',
    'pcm_status': 'Status'
  };

  const convertedRow = {};
  
  for (const [netaskCol, cmCol] of Object.entries(columnMapping)) {
    if (cmCol && cmRow[cmCol] !== undefined && cmRow[cmCol] !== null) {
      convertedRow[netaskCol] = cmRow[cmCol];
    }
  }

  return convertedRow;
}

// Calculate all derived fields
function calculateDerivedFields(row, podDay = 8) {
  // Calculate Unified Status
  row['Unified Status'] = calculateUnifiedStatus(row['pcm_status'], row['Status']);

  // Calculate POD/Backlog
  row['POD / Backlog'] = calculatePODBacklogStatus(row['Created At'], podDay);

  // Calculate SLA/Non SLA
  row['SLA/Non SLA'] = calculateSLAStatus(row['TT Type'], row['Title'], row['Alarm Name']);

  // Calculate Domain and Impact Service
  row['Domain'] = calculateDomain(row['Impact']);
  row['Impact Service'] = calculateImpactService(row['Impact']);

  // Calculate Duration
  const unifiedStatus = row['Unified Status'];
  if (unifiedStatus === 'Closed') {
    row['Duration'] = calculateDuration(row['Created At'], row['Fault Recovery Time']);
  } else if (unifiedStatus === 'Escalated' || unifiedStatus === 'Cancelled') {
    row['Duration'] = calculateDuration(row['Created At'], row['Last Update']);
  } else {
    row['Duration'] = null;
  }

  // Calculate Target and Hurdle SLA
  const duration = row['Duration'];
  const faultLevel = row['Fault Level'];
  row['Target'] = calculateTargetSLA(faultLevel, duration, unifiedStatus);
  row['Hurdle'] = calculateHurdleSLA(faultLevel, duration, unifiedStatus);
}

// Calculate Unified Status
function calculateUnifiedStatus(pcmStatus, status) {
  const pcmStatusStr = String(pcmStatus || '').trim();
  const statusStr = String(status || '').trim();

  switch (pcmStatusStr) {
    case 'Completed':
      return 'Closed';
    case 'Finished':
      return statusStr === 'Escalated' ? 'Escalated' : 'Closed';
    case 'Running':
      return 'Running';
    case 'Cancelled':
    case 'Cancel':
      return 'Cancelled';
    case 'Escalated':
      return 'Escalated';
    default:
      return pcmStatusStr || 'Unknown';
  }
}

// Calculate POD/Backlog status
function calculatePODBacklogStatus(createdAtValue, podDay = 8) {
  if (!createdAtValue) return 'Unknown';

  try {
    const createdDate = new Date(createdAtValue);
    if (isNaN(createdDate.getTime())) return 'Unknown';

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const createdYear = createdDate.getFullYear();
    const createdMonth = createdDate.getMonth();

    const podCutoffDate = new Date(currentYear, currentMonth, podDay, 23, 59, 59, 999);

    // Check if created in current month
    if (createdYear === currentYear && createdMonth === currentMonth) {
      if (now <= podCutoffDate) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[currentMonth]} POD`;
      }
      return 'POD';
    }

    // Check if in previous month
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    if (createdYear === previousMonthYear && createdMonth === previousMonth) {
      return now <= podCutoffDate ? 'POD' : 'Backlog';
    }

    return createdDate > now ? 'Future' : 'Backlog';
  } catch {
    return 'Unknown';
  }
}

// Calculate SLA/Non SLA status
function calculateSLAStatus(ttType, title, alarmName) {
  const ttTypeStr = String(ttType || '').trim().toLowerCase();
  const titleStr = String(title || '').trim();
  const alarmNameStr = String(alarmName || '').trim().toLowerCase();
  const titleLower = titleStr.toLowerCase();

  let result = 'SLA'; // Default

  // Check TT Type filters first (most common)
  if (ttTypeStr.includes('rssi') || ttTypeStr.includes('mw_hc') ||
      ttTypeStr.includes('performance') || ttTypeStr.includes('optimization') ||
      ttTypeStr.includes('quality') || ttTypeStr.includes('test')) {
    result = 'Non SLA';
  }
  // Check title filters
  else if (titleStr.includes('HC') || titleStr.includes('Performance issue') ||
      titleStr.includes('PT :') || titleStr.includes('PT:') ||
      titleStr.includes('Health Check') || titleStr.includes('PM Error') ||
      titleLower.includes('visibility') || titleLower.includes('chassis') ||
      titleLower.includes('dust')) {
    result = 'Non SLA';
  }
  // Check alarm name
  else if (alarmNameStr.includes('health')) {
    result = 'Non SLA';
  }

  return result;
}

// Calculate Domain
function calculateDomain(impactValue) {
  if (!impactValue) return null;

  const value = String(impactValue).trim();
  const upperValue = value.toUpperCase();

  let result = null;

  // Check for specific technology domains
  if (upperValue.includes('IBS')) result = 'IBS';
  else if (upperValue.includes('WIFI')) result = 'Wifi';
  else if (upperValue.includes('TX')) result = 'TX';
  else if (upperValue.includes('DWDM')) result = 'DWDM';
  else if (upperValue.includes('IPRAN')) result = 'IPRAN';
  else if (upperValue.includes('CS CORE')) result = 'CS CORE';
  else if (upperValue.includes('ISP')) result = 'ISP';
  else if (upperValue.includes('BNG')) result = 'BNG';
  else if (upperValue.includes('IPBB')) result = 'IPBB';
  else if (/^(SA|NSA)$/i.test(value) || /(2G|3G|LTE|5G)/i.test(value)) result = 'Access';

  return result;
}

// Calculate Impact Service
function calculateImpactService(impactValue) {
  if (!impactValue) return null;

  const value = String(impactValue).trim();
  const upperValue = value.toUpperCase();

  let result = null;

  if (upperValue.includes('NSA')) {
    result = 'NSA';
  } else if (upperValue.includes('SA')) {
    result = 'SA';
  }

  return result;
}

// Calculate duration between two dates
function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return null;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    const diffMs = end.getTime() - start.getTime();
    // Convert to Excel time format (fraction of a day)
    return diffMs / (1000 * 60 * 60 * 24);
  } catch {
    return null;
  }
}

// Calculate Target SLA status
function calculateTargetSLA(faultLevel, duration, unifiedStatus) {
  if (unifiedStatus === 'Running' && (duration === null || duration === undefined)) {
    return 'Exceeded SLA';
  }

  if (!faultLevel || duration === null || duration === undefined) return null;

  const faultLevelStr = String(faultLevel).trim();
  const durationHours = duration * 24;

  switch (faultLevelStr) {
    case 'Emergency': return durationHours < 2 ? 'Within SLA' : 'Exceeded SLA';
    case 'Critical': return durationHours < 4 ? 'Within SLA' : 'Exceeded SLA';
    case 'Major': return durationHours < 8 ? 'Within SLA' : 'Exceeded SLA';
    case 'Minor': return durationHours < 12 ? 'Within SLA' : 'Exceeded SLA';
    default: return null;
  }
}

// Calculate Hurdle SLA status
function calculateHurdleSLA(faultLevel, duration, unifiedStatus) {
  if (unifiedStatus === 'Running' && (duration === null || duration === undefined)) {
    return 'Exceeded SLA';
  }

  if (!faultLevel || duration === null || duration === undefined) return null;

  const faultLevelStr = String(faultLevel).trim();
  const durationHours = duration * 24;

  switch (faultLevelStr) {
    case 'Emergency': return durationHours < 4 ? 'Within SLA' : 'Exceeded SLA';
    case 'Critical': return durationHours < 6 ? 'Within SLA' : 'Exceeded SLA';
    case 'Major': return durationHours < 12 ? 'Within SLA' : 'Exceeded SLA';
    case 'Minor': return durationHours < 24 ? 'Within SLA' : 'Exceeded SLA';
    default: return null;
  }
}
