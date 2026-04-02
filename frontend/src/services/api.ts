// API Service - Configure your backend URL here
// Backend is running on http://localhost:5000
// Environment variable: VITE_API_URL (set in .env file)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Generic fetch wrapper with auth
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
    throw new Error(error.message || 'Erro na requisição');
  }

  return response.json();
}

export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      fetchWithAuth<{ token: string; couple: import('../types').Couple }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    
    logout: () => {
      localStorage.removeItem('auth_token');
    },
    
    me: () => fetchWithAuth<import('../types').Couple>('/auth/me'),
  },

  // Couple endpoints
  couple: {
    get: () => fetchWithAuth<import('../types').Couple>('/couple'),
    
    getPublic: () => 
      fetch(`${API_BASE_URL}/couple/public`).then(r => r.json()) as Promise<import('../types').Couple>,
    
    update: (data: import('../types').UpdateCoupleInput) =>
      fetchWithAuth<import('../types').Couple>('/couple', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Gifts endpoints
  gifts: {
    getAll: () => 
      fetch(`${API_BASE_URL}/gifts`).then(r => r.json()) as Promise<import('../types').Gift[]>,
    
    getById: (id: string) =>
      fetch(`${API_BASE_URL}/gifts/${id}`).then(r => r.json()) as Promise<import('../types').Gift>,
    
    create: (data: import('../types').CreateGiftInput) =>
      fetchWithAuth<import('../types').Gift>('/gifts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: import('../types').UpdateGiftInput) =>
      fetchWithAuth<import('../types').Gift>(`/gifts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      fetchWithAuth<void>(`/gifts/${id}`, {
        method: 'DELETE',
      }),
    
    markAsSelected: (id: string) =>
      fetchWithAuth<import('../types').Gift>(`/gifts/${id}/select`, {
        method: 'POST',
      }),
  },

  // Upload endpoint (for images)
  upload: {
    image: async (file: File): Promise<{ url: string }> => {
      const formData = new FormData();
      formData.append('image', file);
      
      const token = getAuthToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      return response.json();
    },
  },
};

export { API_BASE_URL };