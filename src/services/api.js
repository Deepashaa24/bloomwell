import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const isProduction = import.meta.env.PROD;

if (isProduction && !configuredApiUrl) {
  throw new Error('VITE_API_URL is required in production. Set it to the backend URL ending in /api.');
}

const normalizeApiUrl = (value) => {
  const trimmed = value.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export const API_URL = normalizeApiUrl(
  configuredApiUrl || 'http://localhost:5000/api',
);

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
    console.log('API Request:', config.method.toUpperCase(), config.url);
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

// Projects API calls
export const projectsAPI = {
  list: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
  get: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Notes API calls
export const notesAPI = {
  list: (projectId) => api.get(`/projects/${projectId}/notes`),
  create: (projectId, data) => api.post(`/projects/${projectId}/notes`, data),
  get: (projectId, noteId) => api.get(`/projects/${projectId}/notes/${noteId}`),
  update: (projectId, noteId, data) => api.patch(`/projects/${projectId}/notes/${noteId}`, data),
  delete: (projectId, noteId) => api.delete(`/projects/${projectId}/notes/${noteId}`),
};

// Files API calls
export const filesAPI = {
  list: (projectId) => api.get(`/projects/${projectId}/files`),
  upload: (projectId, file) => { const formData = new FormData(); formData.append('file', file); return api.post(`/projects/${projectId}/files`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); },
  get: (projectId, fileId) => api.get(`/projects/${projectId}/files/${fileId}`),
  download: (projectId, fileId) => api.get(`/projects/${projectId}/files/${fileId}/download`, { responseType: 'blob' }),
  delete: (projectId, fileId) => api.delete(`/projects/${projectId}/files/${fileId}`),
};

// Members API calls
export const membersAPI = {
  list: (projectId) => api.get(`/projects/${projectId}/members`),
  invite: (projectId, data) => api.post(`/projects/${projectId}/members/invite`, data),
  update: (projectId, memberId, data) => api.patch(`/projects/${projectId}/members/${memberId}`, data),
  remove: (projectId, memberId) => api.delete(`/projects/${projectId}/members/${memberId}`),
};

// Analytics API calls
export const analyticsAPI = {
  getProjectStats: (projectId) => api.get(`/projects/${projectId}/analytics/stats`),
  getActivity: (projectId, range = '30') => api.get(`/projects/${projectId}/analytics/activity?range=${range}`),
  getFilesStat: (projectId) => api.get(`/projects/${projectId}/analytics/files`),
};

// Sharing API calls
export const sharingAPI = {
  createLink: (projectId, data) => api.post(`/projects/${projectId}/share`, data),
  getLink: (projectId, token) => api.get(`/projects/${projectId}/share/${token}`),
  getByToken: (token) => api.get(`/public/projects/${token}`),
  updateLink: (projectId, token, data) => api.patch(`/projects/${projectId}/share/${token}`, data),
  revokeLink: (projectId, token) => api.delete(`/projects/${projectId}/share/${token}`),
  listLinks: (projectId) => api.get(`/projects/${projectId}/share`),
};

// Gemini API calls
export const geminiAPI = {
  generateInsight: (projectId, data) => api.post(`/projects/${projectId}/gemini/insight`, data),
  summarizeNotes: (projectId, data) => api.post(`/projects/${projectId}/gemini/summarize`, data),
  suggestTasks: (projectId, data) => api.post(`/projects/${projectId}/gemini/tasks`, data),
};
