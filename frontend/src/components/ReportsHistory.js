import React, { useState } from 'react';

const ReportsHistory = ({ reports, onReportSelect, onRefresh }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.severity?.toLowerCase() === filter;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'drug':
        aValue = a.drug || '';
        bValue = b.drug || '';
        break;
      case 'severity':
        const severityOrder = { 'severe': 3, 'moderate': 2, 'mild': 1 };
        aValue = severityOrder[a.severity?.toLowerCase()] || 0;
        bValue = severityOrder[b.severity?.toLowerCase()] || 0;
        break;
      case 'date':
      default:
        aValue = new Date(a.created_at || a.timestamp || Date.now());
        bValue = new Date(b.created_at || b.timestamp || Date.now());
        break;
    }

    if (sortOrder === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    } else {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
  });

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
      case 'serious':
        return 'severity-severe';
      case 'moderate':
        return 'severity-moderate';
      case 'mild':
      case 'minor':
        return 'severity-mild';
      default:
        return 'severity-unknown';
    }
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome?.toLowerCase()) {
      case 'recovered':
      case 'resolved':
        return 'outcome-positive';
      case 'recovering':
      case 'improving':
        return 'outcome-progress';
      case 'not recovered':
      case 'fatal':
      case 'death':
        return 'outcome-negative';
      default:
        return 'outcome-unknown';
    }
  };

  const handleReportClick = (report) => {
    if (onReportSelect) {
      onReportSelect(report);
    }
  };

  if (!reports || reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 bg-white rounded-xl shadow p-8 mt-8">
        <div className="flex flex-col items-center">
          <div className="text-4xl mb-2">📋</div>
          <h3 className="text-lg font-bold mb-2 text-blue-700">No Reports Yet</h3>
          <p className="text-gray-500 mb-4">Process your first adverse event report to see it appear here.</p>
          <button 
            onClick={onRefresh}
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow p-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 items-end justify-between">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Filter by Severity:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 bg-white"
          >
            <option value="all">All Severities</option>
            <option value="severe">Severe</option>
            <option value="moderate">Moderate</option>
            <option value="mild">Mild</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Sort by:</label>
          <div className="flex gap-2">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 bg-white"
            >
              <option value="date">Date</option>
              <option value="drug">Drug Name</option>
              <option value="severity">Severity</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition border border-blue-200"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <button 
          onClick={onRefresh}
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          title="Refresh reports"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="flex flex-col items-center bg-blue-50 rounded-lg p-4">
          <span className="text-2xl font-bold text-blue-700">{reports.length}</span>
          <span className="text-sm text-blue-800">Total Reports</span>
        </div>
        <div className="flex flex-col items-center bg-red-50 rounded-lg p-4">
          <span className="text-2xl font-bold text-red-700">
            {reports.filter(r => r.severity?.toLowerCase() === 'severe').length}
          </span>
          <span className="text-sm text-red-800">Severe</span>
        </div>
        <div className="flex flex-col items-center bg-yellow-50 rounded-lg p-4">
          <span className="text-2xl font-bold text-yellow-700">
            {reports.filter(r => r.severity?.toLowerCase() === 'moderate').length}
          </span>
          <span className="text-sm text-yellow-800">Moderate</span>
        </div>
        <div className="flex flex-col items-center bg-green-50 rounded-lg p-4">
          <span className="text-2xl font-bold text-green-700">
            {reports.filter(r => r.severity?.toLowerCase() === 'mild').length}
          </span>
          <span className="text-sm text-green-800">Mild</span>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid gap-6">
        {sortedReports.map((report, index) => (
          <div 
            key={report.id || index} 
            className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer border border-gray-100"
            onClick={() => handleReportClick(report)}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h4 className="text-lg font-bold text-blue-700">💊 {report.drug || 'Unknown Drug'}</h4>
                <span className="text-xs text-gray-500 md:ml-4">
                  {new Date(report.created_at || report.timestamp || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getSeverityColor(report.severity)}`}>
                  {report.severity || 'Unknown'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getOutcomeColor(report.outcome)}`}>
                  {report.outcome || 'Unknown'}
                </span>
              </div>
            </div>

            <div className="px-6 py-4">
              {report.adverse_events && report.adverse_events.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-semibold text-red-700 mr-2">⚠️ Events:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {report.adverse_events.slice(0, 3).map((event, idx) => (
                      <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {event}
                      </span>
                    ))}
                    {report.adverse_events.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                        +{report.adverse_events.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {report.original_report && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700">
                    {report.original_report.length > 150 
                      ? `${report.original_report.substring(0, 150)}...`
                      : report.original_report
                    }
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
              <button 
                className="px-3 py-1 rounded bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 transition text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReportClick(report);
                }}
              >
                👁️ View Details
              </button>
              {report.id && (
                <span className="text-xs text-gray-400">ID: {report.id}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {sortedReports.length === 0 && filter !== 'all' && (
        <div className="flex flex-col items-center mt-8">
          <p className="text-gray-500 mb-2">No reports found with severity: <strong>{filter}</strong></p>
          <button 
            onClick={() => setFilter('all')}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsHistory;