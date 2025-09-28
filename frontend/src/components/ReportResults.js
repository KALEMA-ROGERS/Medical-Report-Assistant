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
    <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-2xl shadow-lg p-4 sm:p-8 max-w-full border border-blue-100">
      <h2 className="text-xl sm:text-2xl font-extrabold mb-6 text-blue-800 text-center tracking-tight drop-shadow">Extracted Information</h2>
      <div className="space-y-4">
        <div className="bg-white/80 rounded-xl p-4 border border-blue-100 shadow-sm">
          <label className="block text-xs sm:text-sm font-medium text-blue-700">Drug Name</label>
          <p className="mt-1 text-base sm:text-lg font-bold text-blue-900 break-words tracking-wide">{report.drug}</p>
        </div>

        <div className="bg-white/80 rounded-xl p-4 border border-red-100 shadow-sm">
          <label className="block text-xs sm:text-sm font-medium text-red-700">Adverse Events</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {report.adverse_events.map((event, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 shadow-sm">
                {event}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white/80 rounded-xl p-4 border border-yellow-100 shadow-sm">
          <label className="block text-xs sm:text-sm font-medium text-yellow-700">Severity</label>
          <p className="mt-1">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-sm ${
              report.severity === 'severe' ? 'bg-red-100 text-red-800' :
              report.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {report.severity}
            </span>
          </p>
        </div>

        <div className="bg-white/80 rounded-xl p-4 border border-green-100 shadow-sm">
          <label className="block text-xs sm:text-sm font-medium text-green-700">Outcome</label>
          <p className="mt-1 text-base sm:text-lg font-bold text-green-900 break-words">{report.outcome}</p>

          <div className="mt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleTranslate('fr')}
              disabled={isTranslating}
              className="inline-flex items-center px-3 py-1 border border-blue-300 shadow-sm text-xs sm:text-sm leading-4 font-bold rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isTranslating ? 'Translating...' : 'Translate to French'}
            </button>
            <button
              onClick={() => handleTranslate('sw')}
              disabled={isTranslating}
              className="inline-flex items-center px-3 py-1 border border-green-300 shadow-sm text-xs sm:text-sm leading-4 font-bold rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isTranslating ? 'Translating...' : 'Translate to Swahili'}
            </button>
          </div>

          {translatedOutcome && (
            <div className="mt-2 p-2 sm:p-3 bg-blue-50 rounded-md">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>{translatedOutcome.target_language}:</strong> {translatedOutcome.translated_text}
              </p>
            </div>
          )}
        </div>

        <div className="border-t pt-3 sm:pt-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-500">Original Report</label>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 break-words">{report.original_report}</p>
        </div>
      </div>
    </div>
  );
}