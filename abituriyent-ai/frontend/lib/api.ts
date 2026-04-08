import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface AttributeScores {
  [key: string]: number;
}

export interface MatchResult {
  major_name: string;
  match_percentage: number;
  attribute_breakdown: {
    [key: string]: {
      user_score: number;
      required_score: number;
      difference: number;
    };
  };
}

export interface AnalyzeResponse {
  matches: MatchResult[];
  ai_review: string;
}

/**
 * Get list of attributes for a specific exam group
 */
export async function getAttributes(groupId?: number): Promise<string[]> {
  const url = groupId
    ? `/api/attributes?group_id=${groupId}`
    : '/api/attributes';

  const response = await api.get(url);
  return response.data;
}

/**
 * Get all majors for a specific exam group
 */
export async function getMajorsForGroup(groupId: number): Promise<any[]> {
  const response = await api.get(`/api/groups/${groupId}/majors`);
  return response.data;
}

/**
 * Analyze user profile and get matching majors
 */
export async function analyzeProfile(
  examGroup: number,
  attributes: AttributeScores
): Promise<AnalyzeResponse> {
  const response = await api.post('/api/analyze', {
    exam_group: examGroup,
    attributes,
  });
  return response.data;
}

// ----------- AUTHENTICATION --------------

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function login(email: string, password: string) {
  const formData = new URLSearchParams();
  formData.append('username', email); // OAuth2 expects username
  formData.append('password', password);
  
  const response = await api.post('/api/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
}

export async function register(name: string, email: string, password: string) {
  const response = await api.post('/api/auth/register', {
    name,
    email,
    password
  });
  
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
}

export async function getCurrentUser() {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error) {
    return null;
  }
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

export async function getUserResults() {
  try {
    const response = await api.get('/api/auth/results');
    return response.data;
  } catch (error) {
    return [];
  }
}
