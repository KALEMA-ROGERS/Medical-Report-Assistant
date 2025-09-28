import { useState, useEffect } from 'react';
import Head from 'next/head';
import ReportForm from '../components/ReportForm';
import ReportResults from '../components/ReportResults';
import ReportHistory from '../components/ReportHistory';
import Charts from '../components/Charts';
import { getReports } from '../services/api';

export default function Home() {
  const [currentReport, setCurrentReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('process');

  const loadReports = async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleReportProcessed = (newReport) => {
    setCurrentReport(newReport);
    loadReports(); // Refresh the list
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>Feyti Medical Report Assistant</title>
        <meta name="description" content="AI-powered regulatory report processing" />
      </Head>

      <header className="bg-white shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Feyti Medical Report Assistant
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">AI-powered adverse event report processing</p>
        </div>
      </header>

      <nav className="bg-white border-b w-full">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex flex-wrap justify-center sm:justify-start space-x-2 sm:space-x-8">
            {['process', 'history', 'analytics'].map((tab) => (
              <button
                key={tab}
                className={`py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-sm capitalize transition-colors duration-200 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'process' ? 'Process Report' : 
                 tab === 'history' ? 'Report History' : 'Analytics'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {activeTab === 'process' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <ReportForm onReportProcessed={handleReportProcessed} />
            </div>
            <div className="order-1 lg:order-2">
              {currentReport && <ReportResults report={currentReport} />}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="w-full">
            <ReportHistory reports={reports} onRefresh={loadReports} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="w-full">
            <Charts reports={reports} />
          </div>
        )}
      </main>
    </div>
  );
}