import React, { useState } from 'react';

const ResultsDisplay = ({ result, onTranslate, loading }) => {
  const [translatedData, setTranslatedData] = useState({});
  const [translatingField, setTranslatingField] = useState(null);

  const handleTranslation = async (text, field, targetLang) => {
    setTranslatingField(field);
    try {
      const translationResult = await onTranslate({
        text: text,
        target_lang: targetLang
      });
      setTranslatedData(prev => ({
        ...prev,
        [`${field}_${targetLang}`]: translationResult
      }));
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setTranslatingField(null);
    }
  };

  if (!result) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-2xl shadow-lg p-6 sm:p-10 text-center text-gray-500 border border-blue-100">
        <p className="text-2xl mb-2">📝</p>
        <p className="font-medium">No results to display. Process a report first.</p>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
      case 'serious':
        return 'bg-red-100 text-red-700';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700';
      case 'mild':
      case 'minor':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome?.toLowerCase()) {
      case 'recovered':
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'recovering':
      case 'improving':
        return 'bg-yellow-100 text-yellow-700';
      case 'not recovered':
      case 'fatal':
      case 'death':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-2xl shadow-lg p-4 sm:p-8 max-w-full border border-blue-100">
      <div className="mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-extrabold mb-4 text-blue-800 flex items-center gap-2 text-center tracking-tight drop-shadow">📊 Processing Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/80 rounded-xl p-4 text-center shadow hover:shadow-lg transition-all border border-blue-100">
            <span className="block text-xs sm:text-sm font-semibold text-blue-700 mb-1">Drug Identified</span>
            <span className="block text-lg font-bold text-blue-900 break-words tracking-wide">{result.drug || 'Not identified'}</span>
          </div>
          <div className="bg-white/80 rounded-xl p-4 text-center shadow hover:shadow-lg transition-all border border-red-100">
            <span className="block text-xs sm:text-sm font-semibold text-red-700 mb-1">Adverse Events</span>
            <span className="block text-lg font-bold text-red-900">{result.adverse_events?.length || 0}</span>
          </div>
          <div className="bg-white/80 rounded-xl p-4 text-center shadow hover:shadow-lg transition-all border border-yellow-100">
            <span className="block text-xs sm:text-sm font-semibold text-yellow-700 mb-1">Severity</span>
            <span className={`block text-lg font-bold rounded px-2 py-1 ${getSeverityColor(result.severity)} shadow-sm`}>{result.severity || 'Unknown'}</span>
          </div>
          <div className="bg-white/80 rounded-xl p-4 text-center shadow hover:shadow-lg transition-all border border-green-100">
            <span className="block text-xs sm:text-sm font-semibold text-green-700 mb-1">Outcome</span>
            <span className={`block text-lg font-bold rounded px-2 py-1 ${getOutcomeColor(result.outcome)} shadow-sm`}>{result.outcome || 'Unknown'}</span>
          </div>
        </div>
      </div>
      {/* Drug Information */}
      <div className="mb-6 sm:mb-8 border-b pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
          <h4 className="font-semibold text-blue-700 flex items-center gap-2">💊 Drug Information</h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleTranslation(result.drug, 'drug', 'fr')}
              disabled={translatingField === 'drug' || !result.drug}
              className="px-3 py-1 rounded bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 disabled:opacity-50 text-xs sm:text-sm"
            >
              {translatingField === 'drug' ? '⏳' : '🇫🇷'} FR
            </button>
            <button
              onClick={() => handleTranslation(result.drug, 'drug', 'sw')}
              disabled={translatingField === 'drug' || !result.drug}
              className="px-3 py-1 rounded bg-green-100 text-green-800 font-semibold hover:bg-green-200 disabled:opacity-50 text-xs sm:text-sm"
            >
              {translatingField === 'drug' ? '⏳' : '🇹🇿'} SW
            </button>
          </div>
        </div>
        <div>
          <p className="text-base sm:text-lg font-medium text-gray-800 mb-1 break-words">{result.drug || 'No drug identified'}</p>
          {translatedData.drug_fr && (
            <p className="italic text-blue-700 text-xs sm:text-sm mt-1"><strong>French:</strong> {translatedData.drug_fr.translated_text}</p>
          )}
          {translatedData.drug_sw && (
            <p className="italic text-green-700 text-xs sm:text-sm mt-1"><strong>Swahili:</strong> {translatedData.drug_sw.translated_text}</p>
          )}
        </div>
      </div>
      {/* Adverse Events */}
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-red-700 flex items-center gap-2">⚠️ Adverse Events</h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleTranslation(result.adverse_events?.join(', '), 'events', 'fr')}
              disabled={translatingField === 'events' || !result.adverse_events?.length}
              className="px-3 py-1 rounded bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 disabled:opacity-50"
            >
              {translatingField === 'events' ? '⏳' : '🇫🇷'} FR
            </button>
            <button
              onClick={() => handleTranslation(result.adverse_events?.join(', '), 'events', 'sw')}
              disabled={translatingField === 'events' || !result.adverse_events?.length}
              className="px-3 py-1 rounded bg-green-100 text-green-800 font-semibold hover:bg-green-200 disabled:opacity-50"
            >
              {translatingField === 'events' ? '⏳' : '🇹🇿'} SW
            </button>
          </div>
        </div>
        <div>
          {result.adverse_events && result.adverse_events.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.adverse_events.map((event, index) => (
                <span key={index} className="inline-block bg-red-100 text-red-700 rounded px-3 py-1 text-xs font-semibold">
                  {event}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No adverse events identified</p>
          )}
          {translatedData.events_fr && (
            <p className="italic text-blue-700 text-sm mt-1"><strong>French:</strong> {translatedData.events_fr.translated_text}</p>
          )}
          {translatedData.events_sw && (
            <p className="italic text-green-700 text-sm mt-1"><strong>Swahili:</strong> {translatedData.events_sw.translated_text}</p>
          )}
        </div>
      </div>
      {/* Severity Assessment */}
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-yellow-700 flex items-center gap-2">📏 Severity Assessment</h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleTranslation(result.severity, 'severity', 'fr')}
              disabled={translatingField === 'severity' || !result.severity}
              className="px-3 py-1 rounded bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 disabled:opacity-50"
            >
              {translatingField === 'severity' ? '⏳' : '🇫🇷'} FR
            </button>
            <button
              onClick={() => handleTranslation(result.severity, 'severity', 'sw')}
              disabled={translatingField === 'severity' || !result.severity}
              className="px-3 py-1 rounded bg-green-100 text-green-800 font-semibold hover:bg-green-200 disabled:opacity-50"
            >
              {translatingField === 'severity' ? '⏳' : '🇹🇿'} SW
            </button>
          </div>
        </div>
        <div>
          <p className={`inline-block rounded px-3 py-1 font-semibold ${getSeverityColor(result.severity)}`}>
            {result.severity || 'Not determined'}
          </p>
          {translatedData.severity_fr && (
            <p className="italic text-blue-700 text-sm mt-1"><strong>French:</strong> {translatedData.severity_fr.translated_text}</p>
          )}
          {translatedData.severity_sw && (
            <p className="italic text-green-700 text-sm mt-1"><strong>Swahili:</strong> {translatedData.severity_sw.translated_text}</p>
          )}
        </div>
      </div>
      {/* Outcome */}
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-green-700 flex items-center gap-2">🎯 Outcome</h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleTranslation(result.outcome, 'outcome', 'fr')}
              disabled={translatingField === 'outcome' || !result.outcome}
              className="px-3 py-1 rounded bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 disabled:opacity-50"
            >
              {translatingField === 'outcome' ? '⏳' : '🇫🇷'} FR
            </button>
            <button
              onClick={() => handleTranslation(result.outcome, 'outcome', 'sw')}
              disabled={translatingField === 'outcome' || !result.outcome}
              className="px-3 py-1 rounded bg-green-100 text-green-800 font-semibold hover:bg-green-200 disabled:opacity-50"
            >
              {translatingField === 'outcome' ? '⏳' : '🇹🇿'} SW
            </button>
          </div>
        </div>
        <div>
          <p className={`inline-block rounded px-3 py-1 font-semibold ${getOutcomeColor(result.outcome)}`}>
            {result.outcome || 'Not determined'}
          </p>
          {translatedData.outcome_fr && (
            <p className="italic text-blue-700 text-sm mt-1"><strong>French:</strong> {translatedData.outcome_fr.translated_text}</p>
          )}
          {translatedData.outcome_sw && (
            <p className="italic text-green-700 text-sm mt-1"><strong>Swahili:</strong> {translatedData.outcome_sw.translated_text}</p>
          )}
        </div>
      </div>
      {/* Original Report */}
      {result.original_report && (
        <div className="mb-8 border-b pb-6">
          <div className="flex items-center mb-2">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2">📄 Original Report</h4>
          </div>
          <div>
            <div className="bg-gray-50 rounded p-4 text-gray-700">
              <p>{result.original_report}</p>
            </div>
          </div>
        </div>
      )}
      {/* Processing Metadata */}
      {result.timestamp && (
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2">ℹ️ Processing Information</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-100 rounded p-3">
              <span className="block text-xs text-gray-500">Processed:</span>
              <span className="block text-sm font-semibold text-gray-800">
                {new Date(result.timestamp).toLocaleString()}
              </span>
            </div>
            {result.id && (
              <div className="bg-gray-100 rounded p-3">
                <span className="block text-xs text-gray-500">Report ID:</span>
                <span className="block text-sm font-semibold text-gray-800">{result.id}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;