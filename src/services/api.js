import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Token expiblue or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

export const usersAPI = {
  saveOnboarding: (data) => api.patch('/users/onboarding', data),
  updateProfile: (data) => api.patch('/users/profile', data),
};

// Daily Logs API calls
export const logsAPI = {
  getLog: (date) => api.get(`/logs/${date}`),
  saveLog: (data) => api.post('/logs', data),
  getLogsRange: (start, end) => api.get(`/logs/range/query?start=${start}&end=${end}`),
};

// Periods API calls
export const periodsAPI = {
  getPeriods: () => api.get('/periods'),
  addPeriod: (startDate, endDate) => api.post('/periods', { startDate, endDate }),
  deletePeriod: (id) => api.delete(`/periods/${id}`),
};

// Settings API calls
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settings) => api.put('/settings', settings),
};

export const pregnancyAPI = {
  getProfile: () => api.get('/pregnancy/profile'),
  saveProfile: (dates) => api.post('/pregnancy/profile', dates),
  deleteProfile: () => api.delete('/pregnancy/profile'),
  getWeekInfo: (week) => api.get(`/pregnancy/week-info/${week}`),
  getWeeklyUpdate: () => api.get('/pregnancy/weekly-update'),
  getPartnerView: () => api.get('/pregnancy/partner-view'),
  getPartnerSuggestions: () => api.get('/pregnancy/partner-suggestions'),
  getLogs: () => api.get('/pregnancy/logs'),
  saveLog: (log) => api.post('/pregnancy/logs', log),
  deleteLog: (id) => api.delete(`/pregnancy/logs/${id}`),
};

export const babyAPI = {
  getProfiles: () => api.get('/baby/profiles'),
  createProfile: (profile) => api.post('/baby/profiles', profile),
  updateProfile: (id, profile) => api.put(`/baby/profiles/${id}`, profile),
  uploadProfilePhoto: (id, photo) => { const formData = new FormData(); formData.append('photo', photo); return api.post(`/baby/profiles/${id}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); },
  deleteProfile: (id) => api.delete(`/baby/profiles/${id}`),
  getFeeds: (babyId) => api.get(`/baby/feeds/${babyId}`),
  addFeed: (babyId, log) => api.post(`/baby/feeds/${babyId}`, log),
  getDiapers: (babyId) => api.get(`/baby/diapers/${babyId}`),
  addDiaper: (babyId, log) => api.post(`/baby/diapers/${babyId}`, log),
  getSleep: (babyId) => api.get(`/baby/sleep/${babyId}`),
  addSleep: (babyId, log) => api.post(`/baby/sleep/${babyId}`, log),
  getGrowth: (babyId) => api.get(`/baby/growth/${babyId}`),
  addGrowth: (babyId, log) => api.post(`/baby/growth/${babyId}`, log),
  uploadGrowthPhoto: (babyId, id, photo) => { const formData = new FormData(); formData.append('photo', photo); return api.post(`/baby/growth/${babyId}/${id}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); },
  getSummary: (babyId) => api.get(`/baby/summary/${babyId}`),
};

export const householdAPI = {
  get: () => api.get('/household'),
  invite: (email, permissions) => api.post('/household/invite', { email, permissions }),
  resendInvite: (token) => api.post(`/household/invite/${token}/resend`),
  accept: (token) => api.post(`/household/accept/${token}`),
  removeMember: (userId) => api.delete(`/household/members/${userId}`),
};

export const aiAPI = {
  getConversations: () => api.get('/ai/chat/conversations'),
  getHistory: (conversationId, page = 1) => api.get(`/ai/chat/history/${conversationId}?page=${page}`),
  getConversationSummary: (conversationId) => api.get(`/ai/chat/conversations/${conversationId}/summary`),
  getRecommendations: () => api.get('/ai/recommendations'),
  generateRecommendations: () => api.post('/ai/recommendations/generate'),
  dismissRecommendation: (id) => api.patch(`/ai/recommendations/${id}/dismiss`),
  search: (query) => api.post('/ai/search', { query }),
  generateReport: (range) => api.post('/ai/generate/report', { range }),
  generateReportSummary: (range) => api.post('/ai/generate/report-summary', { range }),
  getWeeklyDigest: () => api.get('/ai/weekly-digest'),
  generateJournalPrompt: (date) => api.post('/ai/generate/journal-prompt', { date }),
  generateSymptomRelief: (symptom) => api.post('/ai/generate/symptom-relief', { symptom }),
};

export const feedbackAPI = {
  submit: (data) => api.post('/feedback', data),
  getAll: (page = 1) => api.get(`/feedback?page=${page}`),
};

export default api;
