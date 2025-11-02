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

  // Calculate region distribution with SA/NSA breakdown (exclude "Stuck")
  const allTickets = data.filter(r => r['Region'] !== 'Stuck');
  
  const regionSACounts = {};
  const regionNSACounts = {};
  const regionTotalCounts = {};
  
  allTickets.forEach(ticket => {
    const region = ticket['Region'] || 'Unknown';
    const impactService = ticket['Impact Service'];
    
    if (!regionSACounts[region]) {
      regionSACounts[region] = 0;
      regionNSACounts[region] = 0;
      regionTotalCounts[region] = 0;
    }
    
    if (impactService === 'SA') {
      regionSACounts[region]++;
    } else if (impactService === 'NSA') {
      regionNSACounts[region]++;
    }
    
    regionTotalCounts[region]++;
  });

  const regions = Object.keys(regionTotalCounts).sort();
  const saValues = regions.map(region => regionSACounts[region] || 0);
  const nsaValues = regions.map(region => regionNSACounts[region] || 0);
  const totalValues = regions.map(region => regionTotalCounts[region]);

  // Bar Chart Data - SA & NSA by Region
  const barChartData = {
    labels: regions,
    datasets: [
      {
        label: 'SA',
        data: saValues,
        backgroundColor: 'rgba(16, 185, 129, 0.8)', // Green
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'NSA',
        data: nsaValues,
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4
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
          padding: 15,
          usePointStyle: true,
          boxWidth: 15
        }
      },
      title: {
        display: true,
        text: 'Tickets Per Regions (SA & NSA)',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const regionIndex = context.dataIndex;
            const total = totalValues[regionIndex];
            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
            return `${percentage}% of ${total} tickets`;
          }
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

  // Radar Chart Data - Total tickets by Region
  const radarChartData = {
    labels: regions,
    datasets: [
      {
        label: 'Tickets',
        data: totalValues,
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
        display: false
      },
      title: {
        display: true,
        text: 'Tickets Distribution by Region',
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
