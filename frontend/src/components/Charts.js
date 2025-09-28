import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Charts({ reports }) {
  if (!reports.length) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
        Process some reports to see analytics.
      </div>
    );
  }

  // Prepare data for charts
  const severityData = Object.entries(
    reports.reduce((acc, report) => {
      acc[report.severity] = (acc[report.severity] || 0) + 1;
      return acc;
    }, {})
  ).map(([severity, count]) => ({ severity, count }));

  const outcomeData = Object.entries(
    reports.reduce((acc, report) => {
      acc[report.outcome] = (acc[report.outcome] || 0) + 1;
      return acc;
    }, {})
  ).map(([outcome, count]) => ({ outcome, count }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold mb-4 text-blue-700">Severity Distribution</h3>
          <BarChart width={400} height={300} data={severityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="severity" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold mb-4 text-green-700">Outcome Distribution</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={outcomeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ outcome, count }) => `${outcome}: ${count}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {outcomeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold mb-4 text-purple-700">Report Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
            <div className="text-sm text-blue-800">Total Reports</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.outcome === 'recovered').length}
            </div>
            <div className="text-sm text-green-800">Recovered Cases</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {reports.filter(r => r.severity === 'severe').length}
            </div>
            <div className="text-sm text-yellow-800">Severe Cases</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {new Set(reports.map(r => r.drug)).size}
            </div>
            <div className="text-sm text-red-800">Unique Drugs</div>
          </div>
        </div>
      </div>
    </div>
  );
}