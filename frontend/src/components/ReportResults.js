import { useState } from 'react';
import { translateText } from '../services/api';

export default function ReportResults({ report }) {
  const [translatedOutcome, setTranslatedOutcome] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async (language) => {
    setIsTranslating(true);
    try {
      const result = await translateText({
        text: `Outcome: ${report.outcome}`,
        target_lang: language
      });
      setTranslatedOutcome(result);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  if (!report) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Extracted Information</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">Drug Name</label>
          <p className="mt-1 text-lg font-semibold text-gray-900">{report.drug}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Adverse Events</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {report.adverse_events.map((event, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {event}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Severity</label>
          <p className="mt-1">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              report.severity === 'severe' ? 'bg-red-100 text-red-800' :
              report.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {report.severity}
            </span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Outcome</label>
          <p className="mt-1 text-lg font-semibold text-gray-900">{report.outcome}</p>
          
          <div className="mt-2 space-x-2">
            <button
              onClick={() => handleTranslate('fr')}
              disabled={isTranslating}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isTranslating ? 'Translating...' : 'Translate to French'}
            </button>
            <button
              onClick={() => handleTranslate('sw')}
              disabled={isTranslating}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isTranslating ? 'Translating...' : 'Translate to Swahili'}
            </button>
          </div>

          {translatedOutcome && (
            <div className="mt-2 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>{translatedOutcome.target_language}:</strong> {translatedOutcome.translated_text}
              </p>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-500">Original Report</label>
          <p className="mt-1 text-sm text-gray-600">{report.original_report}</p>
        </div>
      </div>
    </div>
  );
}