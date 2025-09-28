import React, { useState } from 'react';

const SeverityChart = ({ reports }) => {
  const [activeChart, setActiveChart] = useState('severity');

  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
        <div className="text-4xl mb-2">📊</div>
        <h3 className="text-lg font-bold mb-1">No Data Available</h3>
        <p>Process some adverse event reports to see analytics and charts.</p>
      </div>
    );
  }

  // Process data for different charts
  const severityData = reports.reduce((acc, report) => {
    const severity = report.severity?.toLowerCase() || 'unknown';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  const outcomeData = reports.reduce((acc, report) => {
    const outcome = report.outcome?.toLowerCase() || 'unknown';
    acc[outcome] = (acc[outcome] || 0) + 1;
    return acc;
  }, {});

  const drugData = reports.reduce((acc, report) => {
    const drug = report.drug || 'Unknown Drug';
    acc[drug] = (acc[drug] || 0) + 1;
    return acc;
  }, {});

  // Get top 10 drugs for better visualization
  const topDrugs = Object.entries(drugData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .reduce((obj, [drug, count]) => ({ ...obj, [drug]: count }), {});

  const renderBarChart = (data, title, colorClass = 'bar-default') => {
    const maxValue = Math.max(...Object.values(data));
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="bg-gray-100 rounded-lg p-4">
          {Object.entries(data).map(([key, value]) => {
            const percentage = ((value / maxValue) * 100);
            const share = ((value / total) * 100).toFixed(1);
            
            return (
              <div key={key} className="flex items-center justify-between py-2">
                <div className="flex-1 mr-4">
                  <div className="text-sm font-medium text-gray-700">{key}</div>
                  <div className="text-xs text-gray-500">{value} ({share}%)</div>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPieChart = (data, title) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
    
    // Calculate angles for pie slices
    let currentAngle = 0;
    const slices = Object.entries(data).map(([key, value], index) => {
      const percentage = (value / total) * 100;
      const angle = (value / total) * 360;
      const slice = {
        key,
        value,
        percentage: percentage.toFixed(1),
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: colors[index % colors.length]
      };
      currentAngle += angle;
      return slice;
    });

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex justify-center">
          <div className="w-64 h-64">
            <svg viewBox="0 0 200 200" className="pie-svg">
              {slices.map((slice, index) => {
                const largeArcFlag = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
                const x1 = 100 + 80 * Math.cos((slice.startAngle * Math.PI) / 180);
                const y1 = 100 + 80 * Math.sin((slice.startAngle * Math.PI) / 180);
                const x2 = 100 + 80 * Math.cos((slice.endAngle * Math.PI) / 180);
                const y2 = 100 + 80 * Math.sin((slice.endAngle * Math.PI) / 180);
                
                const pathData = [
                  `M 100 100`,
                  `L ${x1} ${y1}`,
                  `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');

                return (
                  <path
                    key={slice.key}
                    d={pathData}
                    fill={slice.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {slices.map((slice) => (
            <div key={slice.key} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-sm">
                {slice.key}: {slice.value} ({slice.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStatsGrid = () => {
    const totalReports = reports.length;
    const severeCount = reports.filter(r => r.severity?.toLowerCase() === 'severe').length;
    const recoveredCount = reports.filter(r => r.outcome?.toLowerCase() === 'recovered').length;
    const uniqueDrugs = new Set(reports.map(r => r.drug).filter(d => d)).size;
    const recentReports = reports.filter(r => {
      const reportDate = new Date(r.created_at || r.timestamp || Date.now());
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return reportDate >= weekAgo;
    }).length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 rounded-lg p-4 shadow">
          <div className="text-3xl font-bold text-blue-700">{totalReports}</div>
          <div className="text-sm text-blue-500">Total Reports</div>
        </div>
        
        <div className="bg-yellow-100 rounded-lg p-4 shadow">
          <div className="text-3xl font-bold text-yellow-700">{severeCount}</div>
          <div className="text-sm text-yellow-500">Severe Cases</div>
          <div className="text-xs text-yellow-600">
            {totalReports > 0 ? ((severeCount / totalReports) * 100).toFixed(1) : 0}%
          </div>
        </div>
        
        <div className="bg-green-100 rounded-lg p-4 shadow">
          <div className="text-3xl font-bold text-green-700">{recoveredCount}</div>
          <div className="text-sm text-green-500">Recovered</div>
          <div className="text-xs text-green-600">
            {totalReports > 0 ? ((recoveredCount / totalReports) * 100).toFixed(1) : 0}%
          </div>
        </div>
        
        <div className="bg-purple-100 rounded-lg p-4 shadow">
          <div className="text-3xl font-bold text-purple-700">{uniqueDrugs}</div>
          <div className="text-sm text-purple-500">Unique Drugs</div>
        </div>
        
        <div className="bg-red-100 rounded-lg p-4 shadow">
          <div className="text-3xl font-bold text-red-700">{recentReports}</div>
          <div className="text-sm text-red-500">This Week</div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow p-8">
      {/* Chart Navigation */}
      <div className="flex gap-2 mb-8 justify-center">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition border-b-4 ${activeChart === 'overview' ? 'border-blue-600 bg-white text-blue-700 shadow' : 'border-transparent bg-blue-100 text-blue-500 hover:bg-white'}`}
          onClick={() => setActiveChart('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition border-b-4 ${activeChart === 'severity' ? 'border-yellow-500 bg-white text-yellow-700 shadow' : 'border-transparent bg-yellow-50 text-yellow-600 hover:bg-white'}`}
          onClick={() => setActiveChart('severity')}
        >
          ⚠️ Severity
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition border-b-4 ${activeChart === 'outcomes' ? 'border-green-600 bg-white text-green-700 shadow' : 'border-transparent bg-green-50 text-green-600 hover:bg-white'}`}
          onClick={() => setActiveChart('outcomes')}
        >
          🎯 Outcomes
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition border-b-4 ${activeChart === 'drugs' ? 'border-purple-600 bg-white text-purple-700 shadow' : 'border-transparent bg-purple-50 text-purple-600 hover:bg-white'}`}
          onClick={() => setActiveChart('drugs')}
        >
          💊 Drugs
        </button>
      </div>

      {/* Chart Content */}
      <div className="chart-content">
        {activeChart === 'overview' && (
          <div className="overview-section">
            <h2 className="text-2xl font-bold mb-4">📈 Analytics Overview</h2>
            {renderStatsGrid()}
            
            <div className="overview-insights">
              <h3 className="text-lg font-semibold mb-2">🔍 Key Insights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow">
                  <h4 className="font-semibold">Most Common Severity</h4>
                  <p className="text-gray-700">
                    {Object.entries(severityData).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                    {Object.entries(severityData).length > 0 && 
                      ` (${Object.entries(severityData).sort(([,a], [,b]) => b - a)[0]?.[1]} cases)`
                    }
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <h4 className="font-semibold">Most Reported Drug</h4>
                  <p className="text-gray-700">
                    {Object.entries(drugData).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                    {Object.entries(drugData).length > 0 && 
                      ` (${Object.entries(drugData).sort(([,a], [,b]) => b - a)[0]?.[1]} reports)`
                    }
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <h4 className="font-semibold">Recovery Rate</h4>
                  <p className="text-gray-700">
                    {totalReports > 0 
                      ? `${((recoveredCount / totalReports) * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeChart === 'severity' && (
          <div className="charts-section">
            {renderBarChart(severityData, '⚠️ Severity Distribution', 'bar-severity')}
            {renderPieChart(severityData, '📊 Severity Breakdown')}
          </div>
        )}

        {activeChart === 'outcomes' && (
          <div className="charts-section">
            {renderBarChart(outcomeData, '🎯 Outcome Distribution', 'bar-outcome')}
            {renderPieChart(outcomeData, '📊 Outcome Breakdown')}
          </div>
        )}

        {activeChart === 'drugs' && (
          <div className="charts-section">
            {renderBarChart(topDrugs, '💊 Top 10 Reported Drugs', 'bar-drugs')}
            <div className="drug-stats mt-4">
              <h3 className="text-lg font-semibold">Drug Analysis</h3>
              <p className="text-gray-700">Total unique drugs reported: <strong>{Object.keys(drugData).length}</strong></p>
              <p className="text-gray-700">Most frequently reported: <strong>
                {Object.entries(drugData).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
              </strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeverityChart;