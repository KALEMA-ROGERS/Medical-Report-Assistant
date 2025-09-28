import { useState } from 'react';
import { processReport } from '../services/api';

export default function ReportForm({ onReportProcessed }) {
  const [reportText, setReportText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportText.trim()) {
      setError('Please enter a report');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const result = await processReport({ report: reportText });
      console.log('[DEBUG] Backend /process-report response:', result);
      onReportProcessed(result);
      setReportText(''); // Clear form after successful processing
    } catch (err) {
      setError('Failed to process report. Please try again.');
      console.error('Error processing report:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleReports = [
    "Patient experienced severe nausea and headache after taking Drug X. Patient recovered.",
    "Moderate rash developed following administration of Medication Y. Symptoms are ongoing.",
    "Mild dizziness reported after using Treatment Z. Patient has recovered fully."
  ];

  const loadSample = (sample) => {
    setReportText(sample);
    setError('');
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-2xl shadow-lg p-4 sm:p-8 max-w-full sm:max-w-xl mx-auto mt-4 sm:mt-8 border border-blue-100">
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-blue-800 text-center tracking-tight drop-shadow">Process Adverse Event Report</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 sm:mb-6">
          <label htmlFor="report" className="block mb-2 font-semibold text-gray-700">Medical Report Text</label>
          <textarea
            id="report"
            rows="6"
            className="w-full p-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 text-gray-800 text-base shadow resize-none bg-white/80"
            placeholder="Enter the adverse event report here..."
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
          />
        </div>
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 shadow-sm">
            <span className="text-lg">⚠️</span>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed mb-6 text-lg tracking-wide"
        >
          {isProcessing ? 'Processing...' : 'Process Report'}
        </button>
      </form>
      <div className="mt-8 bg-white/80 rounded-xl p-4 border border-blue-100 shadow-sm">
        <h3 className="font-semibold mb-3 text-blue-800">📝 Sample Reports</h3>
        <div className="space-y-2">
          {sampleReports.map((sample, index) => (
            <button
              key={index}
              type="button"
              onClick={() => loadSample(sample)}
              className="block w-full text-left bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-700 hover:bg-blue-100 transition mb-2 last:mb-0 shadow-sm"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}