// lib/api.ts - Updated API functions with docker-compose compatible URLs
import axios, { Axios, AxiosResponse } from 'axios';
import {
  // ... svi postojeći importi ...
} from './types';
import { InstitutionType } from './institution-templates';

// 🚀 DINAMIČKA DETEKCIJA API URL-a - Ažurirano za docker-compose setup
const getApiBaseUrl = (): string => {
  // Server-side rendering (Next.js)
  if (typeof window === 'undefined') {
    // Na server strani, koristi environment variable ili fallback
    return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://api-codilio.sbugarin.com/api';
  }

  // Client-side detection
  const hostname = window.location.hostname;
  
  console.log('🔍 Detecting API URL for hostname:', hostname);
  
  // Production URLs - api-codilio.sbugarin.com je glavni za sve
  if (hostname === 'codilio2.sbugarin.com' || hostname === 'codilio.sbugarin.com') {
    console.log('✅ Detected production domain - using api-codilio (main API)');
    return 'https://api-codilio.sbugarin.com/api';
  }

  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('✅ Detected localhost - using local API');
    return 'http://localhost:3001/api';
  }

  // Docker container internal communication
  if (hostname.includes('codilio-frontend') || process.env.NODE_ENV === 'production') {
    const dockerApiUrl = 'http://backend:3001/api';
    console.log('🐳 Docker environment detected - using internal API:', dockerApiUrl);
    return dockerApiUrl;
  }

  // Fallback - prioritize environment variables
  const fallbackUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-codilio.sbugarin.com/api';
  console.log('⚠️ Using fallback API URL:', fallbackUrl);
  return fallbackUrl;
};

export const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL configured:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling with better Docker support
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors in Docker environment
    if (error.code === 'ECONNREFUSED' || error.code === 'ENETUNREACH') {
      console.error('🚨 Network error detected, checking alternative URLs...');
      
      // Try alternative API URL if primary fails
      if (API_BASE_URL.includes('backend:3001') && typeof window !== 'undefined') {
        console.log('🔄 Switching to external API URL...');
        const externalApiUrl = 'https://api-codilio.sbugarin.com/api';
        
        // Update base URL and retry
        api.defaults.baseURL = externalApiUrl;
        return api.request(error.config);
      }
    }

    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        // Proverava da li nije setup stranica
        if (!window.location.pathname.includes('/setup')) {
          window.location.href = '/login';
        }
      }
    } else if (error.response?.status === 412 && error.response?.data?.setupRequired) {
      // Handle setup required - samo loguj, SetupGuard će hendlovati
      console.log('Setup required, будет обработано SetupGuard-ом');
    }
    return Promise.reject(error);
  }
);

// Helper function to check API connectivity
export const checkApiConnectivity = async (): Promise<{
  isConnected: boolean;
  url: string;
  responseTime: number;
}> => {
  const startTime = Date.now();
  try {
    await api.get('/');
    const responseTime = Date.now() - startTime;
    return {
      isConnected: true,
      url: API_BASE_URL,
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      isConnected: false,
      url: API_BASE_URL,
      responseTime
    };
  }
};

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }
};

// ... svi ostali API objekti ostaju isti ...
// (postsApi, pagesApi, mediaApi, etc.)
