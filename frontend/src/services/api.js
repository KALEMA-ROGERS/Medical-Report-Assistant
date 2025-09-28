import axios from 'axios';

// Use environment variable for API base URL, fallback to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const processReport = async (reportData) => {
  const response = await api.post('/process-report', reportData);
  return response.data;
};

export const getReports = async () => {
  const response = await api.get('/reports');
  return response.data;
};

export const translateText = async (translationData) => {
  const response = await api.post('/translate', translationData);
  return response.data;
};

export default api;