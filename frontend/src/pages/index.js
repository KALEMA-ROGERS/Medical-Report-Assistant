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
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Feyti Medical Report Assistant</title>
        <meta name="description" content="AI-powered regulatory report processing" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Feyti Medical Report Assistant
          </h1>
          <p className="text-gray-600">AI-powered adverse event report processing</p>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {['process', 'history', 'analytics'].map((tab) => (
              <button
                key={tab}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'process' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ReportForm onReportProcessed={handleReportProcessed} />
            </div>
            <div>
              {currentReport && <ReportResults report={currentReport} />}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <ReportHistory reports={reports} onRefresh={loadReports} />
        )}

        {activeTab === 'analytics' && (
          <Charts reports={reports} />
        )}
      </main>
    </div>
  );
}