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
    <div className="bg-white rounded-xl shadow-md p-8 max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Process Adverse Event Report</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="report" className="block mb-2 font-semibold text-gray-700">
            Medical Report Text
          </label>
          <textarea
            id="report"
            rows="6"
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 text-gray-800 text-base shadow-sm"
            placeholder="Enter the adverse event report here..."
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
          />
        </div>
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-md px-4 py-3 mb-4 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-3 px-6 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed mb-6"
        >
          {isProcessing ? 'Processing...' : 'Process Report'}
        </button>
      </form>
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-blue-800">📝 Sample Reports</h3>
        <div className="space-y-2">
          {sampleReports.map((sample, index) => (
            <button
              key={index}
              type="button"
              onClick={() => loadSample(sample)}
              className="block w-full text-left bg-white border border-blue-200 rounded-md px-4 py-2 text-blue-700 hover:bg-blue-100 transition"
              style={{marginBottom: '0.5rem'}}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}