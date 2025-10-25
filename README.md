# POD Tickets Dashboard (React Version)

A modern, responsive dashboard for managing and analyzing POD (Point of Delivery) tickets, built with React and Vite.

## Features

- **File Upload & Processing**: Upload Excel files (Netask PCMs, TMS CM Operation, OWS FRT, Manual FRT, POD Excluded)
- **Auto-loading**: Automatically loads files from GitHub repositories on page load
- **Data Merging**: Intelligently merges data from multiple sources
- **Real-time Statistics**: View counts of total PCMs, Netask PCMs, TMS PCMs, and FRT matches
- **Interactive Dashboard**: Beautiful dashboard cards showing running tickets breakdown by SLA status and severity
- **Excel Export**: Download merged data as Excel files
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Gradient backgrounds, smooth animations, and intuitive interface

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **ExcelJS** - Excel file processing
- **Chart.js** - Data visualization (ready for integration)
- **HTML2Canvas** - Screenshot capability (ready for integration)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:3000`

## Deployment to GitHub Pages

### Option 1: GitHub Actions (Recommended)

This project includes a GitHub Actions workflow that automatically builds and deploys to GitHub Pages when you push to the `main` branch.

1. **Enable GitHub Pages** in your repository:
   - Go to Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **Update the base path** in `vite.config.js`:
   ```js
   base: '/your-repo-name/', // Change this to your GitHub repo name
   ```

3. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

4. **Monitor deployment**:
   - Go to the "Actions" tab in your GitHub repository
   - Wait for the workflow to complete
   - Your site will be live at `https://username.github.io/repo-name/`

### Option 2: Manual Deployment with gh-pages

```bash
# Build and deploy manually
npm run deploy
```

Then enable GitHub Pages in repository settings:
- Settings → Pages → Source: Deploy from a branch
- Select `gh-pages` branch

## Project Structure

```
/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx       # Main dashboard with cards
│   │   ├── FloatingFooter.jsx  # Footer component
│   │   ├── Header.jsx          # Header component
│   │   ├── Statistics.jsx      # Statistics cards
│   │   ├── StatusMessage.jsx   # Toast notifications
│   │   └── UploadSection.jsx   # File upload interface
│   ├── utils/
│   │   └── fileProcessor.js    # Excel processing logic
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # App styles
│   ├── index.css               # Global styles
│   └── main.jsx                # React entry point
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
└── README.md                   # This file
```

## Configuration

### Changing the POD Day

The POD day is currently hardcoded to day 8 in the file processor. To change it, edit `/src/utils/fileProcessor.js` and modify the `podDay` parameter in the `calculatePODBacklogStatus` function.

### File Sources

The app auto-loads files from these GitHub repositories:
- Netask PCMs: `https://decosaro.github.io/nextask_all/Nextask_PCMs_All.xlsx`
- TMS PCMs: `https://decosaro.github.io/tms_all/TMS_PCMs_All.xlsx`
- OWS FRT: `https://decosaro.github.io/ows_frt/OWS_FRT.xlsx`
- Manual FRT: `https://decosaro.github.io/manual_frt/Manual_FRT.xlsx`
- POD Excluded: `https://decosaro.github.io/pod_excluded/POD_Excluded.xlsx`

To use different sources, update the `fileUrls` object in `/src/App.jsx`.

## Features Implemented

✅ File upload and processing  
✅ Data merging from multiple sources  
✅ Statistics calculation  
✅ Dashboard cards with SLA breakdown  
✅ Excel export  
✅ Responsive design  
✅ Auto-loading from GitHub  
✅ Filter options (All PCMs / Running PCMs)  
✅ Collapsible upload section  

## Roadmap / Potential Enhancements

- 📊 Charts integration (Chart.js components ready)
- 🔍 Advanced filtering modal
- 📸 Screenshot functionality (html2canvas ready)
- 📋 Detailed SLA tables
- 🎯 SLA comparison charts
- ⚙️ POD settings modal
- 🔄 Refresh button

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Created by Tarek Mahran

## Troubleshooting

**Build fails with module errors:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**GitHub Pages shows 404:**
- Check that `base` in `vite.config.js` matches your repo name
- Verify GitHub Pages is enabled in repository settings
- Ensure the workflow completed successfully in Actions tab

**Files not loading:**
- Check browser console for CORS errors
- Verify the GitHub file URLs are accessible
- Check network tab for failed requests
