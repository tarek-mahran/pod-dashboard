# Calculation Comparison: HTML vs React

**Date:** November 2, 2025  
**Purpose:** Compare calculation logic between original HTML file and React implementation

---

## 🔍 **Overall Assessment**

### **Status: ⚠️ CRITICAL DIFFERENCES FOUND**

The React implementation has **SIGNIFICANT CALCULATION ERRORS** compared to the original HTML file. Several key calculations are using incorrect logic.

---

## 📊 **Detailed Comparison**

### **1. SLA/Non SLA Status Calculation**

#### **HTML (Original - CORRECT):**
```javascript
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
```

#### **React (Current - ❌ WRONG):**
```javascript
function calculateSLAStatus(ttType, title, alarmName) {
  const ttTypeStr = String(ttType || '').toLowerCase();
  const titleStr = String(title || '').toLowerCase();
  const alarmNameStr = String(alarmName || '').toLowerCase();

  // Non SLA conditions
  if (ttTypeStr.includes('pm') || ttTypeStr.includes('preventive maintenance')) return 'Non SLA';
  if (titleStr.includes('pm') || titleStr.includes('preventive')) return 'Non SLA';
  if (alarmNameStr.includes('pm')) return 'Non SLA';

  // NSA conditions
  if (ttTypeStr.includes('nsa') || titleStr.includes('nsa')) return 'NSA';

  // Default to SA
  return 'SA';
}
```

#### **❌ CRITICAL ERROR:**
The React version is **COMPLETELY DIFFERENT** and **WRONG**:
- **HTML checks for:** RSSI, MW_HC, Performance, Optimization, Quality, Test, HC, PT, Health Check, PM Error, Visibility, Chassis, Dust, Health
- **React checks for:** PM, Preventive Maintenance only (INCOMPLETE)
- **HTML returns:** "SLA" or "Non SLA"
- **React returns:** "Non SLA", "NSA", or "SA" (WRONG VALUES)

---

### **2. Impact Service Calculation**

#### **HTML (Original - CORRECT):**
```javascript
function calculateImpactService(impactValue) {
    if (!impactValue) return null;

    const value = String(impactValue).trim();
    const upperValue = value.toUpperCase();

    if (upperValue.includes('NSA')) {
        result = 'NSA';
    } else if (upperValue.includes('SA')) {
        result = 'SA';
    }

    return result;
}
```

#### **React (Current - ❌ WRONG):**
```javascript
function calculateImpactService(impact) {
  const impactStr = String(impact || '').toLowerCase();
  if (impactStr.includes('no service')) return 'No Service';
  if (impactStr.includes('partial')) return 'Partial Service';
  if (impactStr.includes('degraded')) return 'Degraded Service';
  return 'Normal';
}
```

#### **❌ CRITICAL ERROR:**
The React version is **COMPLETELY DIFFERENT**:
- **HTML checks for:** NSA or SA in the impact value
- **React checks for:** "no service", "partial", "degraded" (COMPLETELY WRONG)
- **HTML returns:** "NSA", "SA", or null
- **React returns:** "No Service", "Partial Service", "Degraded Service", "Normal" (WRONG)

---

### **3. Domain Calculation**

#### **HTML (Original - CORRECT):**
```javascript
function calculateDomain(impactValue) {
    if (!impactValue) return null;

    const value = String(impactValue).trim();
    const upperValue = value.toUpperCase();

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
```

#### **React (Current - ❌ WRONG):**
```javascript
function calculateDomain(impact) {
  const impactStr = String(impact || '').toLowerCase();
  if (impactStr.includes('core')) return 'Core';
  if (impactStr.includes('transmission')) return 'Transmission';
  if (impactStr.includes('access')) return 'Access';
  if (impactStr.includes('power')) return 'Power';
  return 'Other';
}
```

#### **❌ CRITICAL ERROR:**
The React version is **COMPLETELY DIFFERENT**:
- **HTML checks for:** IBS, Wifi, TX, DWDM, IPRAN, CS CORE, ISP, BNG, IPBB, SA/NSA, 2G/3G/LTE/5G
- **React checks for:** core, transmission, access, power (COMPLETELY WRONG)
- React returns generic domains instead of specific technology domains

---

### **4. Hurdle SLA Calculation**

#### **HTML (Original - CORRECT):**
```javascript
function calculateHurdleSLA(faultLevel, duration, unifiedStatus = null) {
    // If Unified Status is "Running" and Duration is null/empty, return "Exceeded SLA"
    if (unifiedStatus === 'Running' && (duration === null || duration === undefined || duration === '')) {
        return 'Exceeded SLA';
    }

    if (!faultLevel || duration === null || duration === undefined) {
        return null;
    }

    const faultLevelStr = String(faultLevel).trim();
    const durationHours = duration * 24;

    switch (faultLevelStr) {
        case 'Emergency':
            result = durationHours < 4 ? 'Within SLA' : 'Exceeded SLA';
            break;
        case 'Critical':
            result = durationHours < 6 ? 'Within SLA' : 'Exceeded SLA';
            break;
        case 'Major':
            result = durationHours < 12 ? 'Within SLA' : 'Exceeded SLA';
            break;
        case 'Minor':
            result = durationHours < 24 ? 'Within SLA' : 'Exceeded SLA';
            break;
        default:
            result = null;
    }

    return result;
}
```

#### **React (Current - ❌ WRONG):**
```javascript
function calculateHurdleSLA(faultLevel, duration, unifiedStatus) {
  if (unifiedStatus === 'Running' && (duration === null || duration === undefined)) {
    return 'Exceeded SLA';
  }

  if (!faultLevel || duration === null || duration === undefined) return null;

  const faultLevelStr = String(faultLevel).trim();
  const durationHours = duration * 24;

  switch (faultLevelStr) {
    case 'Emergency': return durationHours < 1 ? 'Within SLA' : 'Exceeded SLA';
    case 'Critical': return durationHours < 2 ? 'Within SLA' : 'Exceeded SLA';
    case 'Major': return durationHours < 4 ? 'Within SLA' : 'Exceeded SLA';
    case 'Minor': return durationHours < 8 ? 'Within SLA' : 'Exceeded SLA';
    default: return null;
  }
}
```

#### **❌ CRITICAL ERROR:**
The React version uses **WRONG THRESHOLDS**:
- **Emergency:** HTML = 4 hours, React = 1 hour ❌
- **Critical:** HTML = 6 hours, React = 2 hours ❌
- **Major:** HTML = 12 hours, React = 4 hours ❌
- **Minor:** HTML = 24 hours, React = 8 hours ❌

**ALL HURDLE SLA THRESHOLDS ARE INCORRECT!**

---

### **5. ✅ Target SLA Calculation (CORRECT)**

Both HTML and React use the same logic:
- Emergency: < 2 hours
- Critical: < 4 hours
- Major: < 8 hours
- Minor: < 12 hours

---

### **6. ✅ Unified Status Calculation (CORRECT)**

Both implementations match correctly.

---

### **7. ✅ POD/Backlog Calculation (CORRECT)**

Both implementations match correctly.

---

### **8. ✅ Duration Calculation (CORRECT)**

Both implementations match correctly.

---

## 🚨 **CRITICAL ISSUES SUMMARY**

| Calculation | Status | Impact |
|-------------|--------|--------|
| **SLA/Non SLA Status** | ❌ **COMPLETELY WRONG** | HIGH - Wrong categorization |
| **Impact Service** | ❌ **COMPLETELY WRONG** | HIGH - Wrong values returned |
| **Domain** | ❌ **COMPLETELY WRONG** | HIGH - Wrong technology domains |
| **Hurdle SLA** | ❌ **WRONG THRESHOLDS** | CRITICAL - All thresholds incorrect |
| Target SLA | ✅ Correct | - |
| Unified Status | ✅ Correct | - |
| POD/Backlog | ✅ Correct | - |
| Duration | ✅ Correct | - |

---

## 🔧 **REQUIRED FIXES**

### **Priority 1: CRITICAL (Must fix immediately)**

1. **Fix Hurdle SLA thresholds** - All values are wrong
2. **Fix SLA/Non SLA Status** - Completely different logic
3. **Fix Impact Service** - Completely different logic
4. **Fix Domain** - Completely different logic

### **Impact of These Errors:**

- **SLA Calculations:** Wrong SLA categorization will cause incorrect SLA performance reports
- **Charts and Statistics:** All charts showing SA/NSA, Domain breakdown will be WRONG
- **Pivot Tables:** SLA performance tables will show incorrect data
- **Business Decisions:** Management making decisions based on WRONG DATA

---

## 📝 **Recommendations**

1. **Immediate Action Required:** Fix all 4 critical calculation errors in `fileProcessor.js`
2. **Testing:** Re-test all calculations with sample data from HTML file
3. **Validation:** Compare output Excel files from HTML vs React to verify correctness
4. **Documentation:** Update calculation documentation to match HTML implementation

---

**Status:** ⚠️ **PRODUCTION SYSTEM HAS CRITICAL BUGS - IMMEDIATE FIX REQUIRED**
