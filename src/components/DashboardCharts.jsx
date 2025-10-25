import React from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './DashboardCharts.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

function DashboardCharts({ data }) {
  if (!data || data.length === 0) {
    return <div className="charts-loading">No data available for charts</div>;
  }

  // Calculate region distribution (exclude "Stuck")
  const runningTickets = data.filter(r => r['Unified Status'] === 'Running' && r['Region'] !== 'Stuck');
  const regionCounts = {};
  runningTickets.forEach(ticket => {
    const region = ticket['Region'] || 'Unknown';
    regionCounts[region] = (regionCounts[region] || 0) + 1;
  });

  const regions = Object.keys(regionCounts).sort();
  const regionValues = regions.map(region => regionCounts[region]);

  const barChartData = {
    labels: regions,
    datasets: [
      {
        label: 'Running Tickets by Region',
        data: regionValues,
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: '500'
          },
          padding: 15
        }
      },
      title: {
        display: true,
        text: '📍 Tickets Distribution by Region',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          maxTicksLimit: 10,
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  // Calculate severity distribution
  const severityCounts = {
    'Emergency': 0,
    'Critical': 0,
    'Major': 0,
    'Minor': 0
  };

  runningTickets.forEach(ticket => {
    const severity = ticket['Fault Level'];
    if (severity && severityCounts.hasOwnProperty(severity)) {
      severityCounts[severity]++;
    }
  });

  const radarChartData = {
    labels: ['Emergency', 'Critical', 'Major', 'Minor'],
    datasets: [
      {
        label: 'Running Tickets by Severity',
        data: [
          severityCounts['Emergency'],
          severityCounts['Critical'],
          severityCounts['Major'],
          severityCounts['Minor']
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: '500'
          },
          padding: 15
        }
      },
      title: {
        display: true,
        text: '🎯 Tickets Distribution by Severity',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          maxTicksLimit: 8,
          font: {
            size: 11
          }
        },
        pointLabels: {
          font: {
            size: 12,
            weight: '500'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  return (
    <div className="dashboard-charts-container">
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-wrapper">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-wrapper">
            <Radar data={radarChartData} options={radarChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCharts;
