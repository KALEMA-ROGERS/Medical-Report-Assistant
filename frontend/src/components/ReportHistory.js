export default function ReportHistory({ reports, onRefresh }) {
  if (!reports.length) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
        No reports processed yet. Process a report to see history.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-2xl shadow-lg p-2 sm:p-6 max-w-full overflow-x-auto border border-blue-100">
      <div className="px-2 sm:px-6 py-3 sm:py-4 border-b border-blue-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-blue-800 text-center sm:text-left tracking-tight drop-shadow">Report History</h2>
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 border border-blue-400 shadow font-bold rounded-xl text-blue-800 bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 transition"
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-blue-100 text-xs sm:text-sm">
          <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
            <tr>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Drug</th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Adverse Events</th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Severity</th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Outcome</th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white/80 divide-y divide-blue-100">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-blue-100/60 transition">
                <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-bold text-blue-900 break-words max-w-[8rem] sm:max-w-xs">{report.drug}</td>
                <td className="px-2 sm:px-6 py-2 sm:py-4">
                  <div className="flex flex-wrap gap-1">
                    {report.adverse_events.map((event, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-800 font-semibold shadow-sm">
                        {event}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm ${
                    report.severity === 'severe' ? 'bg-red-100 text-red-800' :
                    report.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {report.severity}
                  </span>
                </td>
                <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-green-700 font-bold">{report.outcome}</td>
                <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-500">{new Date(report.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}