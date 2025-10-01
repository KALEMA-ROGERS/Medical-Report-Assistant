import axios from 'axios';

// Use NEXT_PUBLIC_API_URL for deployment, fallback to localhost for local dev
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Log the API base URL to verify what is being used in the deployed build
console.log('API_BASE_URL:', API_BASE_URL);

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