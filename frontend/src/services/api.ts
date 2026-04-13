// API Service - Configure your backend URL here
// Backend is running on http://localhost:8000
// Environment variable: VITE_API_URL (set in .env file)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Generic fetch wrapper with auth (for JSON)
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

  // Handle 204 No Content responses (typically DELETE)
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
}

// Generic fetch wrapper with auth (for FormData - multipart)
async function fetchWithAuthFormData<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
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

  // Handle 204 No Content responses (typically DELETE)
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
}

export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      fetchWithAuth<{ token: string; couple: import('../types').Couple }>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (email: string, password: string, coupleName?: string) =>
      fetchWithAuth<{ token: string; couple: import('../types').Couple }>('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({ email, password, couple_name: coupleName }),
      }),

    logout: () => {
      localStorage.removeItem('auth_token');
    },

    me: () => fetchWithAuth<import('../types').Couple>('/auth/me/'),
  },

  // Couple endpoints
  couple: {
    get: () => fetchWithAuth<import('../types').Couple>('/couple/'),

    getPublic: () =>
      fetch(`${API_BASE_URL}/couple/public/`).then(r => r.json()) as Promise<import('../types').Couple>,

    update: (data: import('../types').UpdateCoupleInput) =>
      fetchWithAuth<import('../types').Couple>('/couple/', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Gifts endpoints
  gifts: {
    getAll: async (coupleId?: string) => {
      let url = `${API_BASE_URL}/gifts/`;
      if (coupleId) {
        url += `?couple_id=${encodeURIComponent(coupleId)}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      // Handle paginated response from Django REST Framework
      return data.results || data;
    },

    getById: (id: string) =>
      fetch(`${API_BASE_URL}/gifts/${id}/`).then(r => r.json()) as Promise<import('../types').Gift>,

    create: async (data: import('../types').CreateGiftInput) => {
      // If image_file is present, use FormData for multipart upload
      if (data.image_file) {
        const formData = new FormData();
        formData.append('name', data.name || '');
        formData.append('description', data.description || '');
        formData.append('price', String(data.price || 0));
        if (data.category) {
          formData.append('category', data.category);
        }
        formData.append('image_file', data.image_file);

        return fetchWithAuthFormData<import('../types').Gift>('/gifts/', {
          method: 'POST',
          body: formData,
        });
      }

      // Otherwise use standard JSON
      return fetchWithAuth<import('../types').Gift>('/gifts/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: import('../types').UpdateGiftInput) => {
      // If image_file is present, use FormData for multipart upload
      if (data.image_file) {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.price !== undefined) formData.append('price', String(data.price));
        if (data.category) formData.append('category', data.category);
        formData.append('image_file', data.image_file);

        return fetchWithAuthFormData<import('../types').Gift>(`/gifts/${id}/`, {
          method: 'PUT',
          body: formData,
        });
      }

      // Otherwise use standard JSON
      return fetchWithAuth<import('../types').Gift>(`/gifts/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: (id: string) =>
      fetchWithAuth<void>(`/gifts/${id}/`, {
        method: 'DELETE',
      }),

    reserve: (id: string, name: string) =>
      fetch(`${API_BASE_URL}/gifts/${id}/reserve/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }).then(r => r.json()) as Promise<import('../types').Gift>,

    markAsSelected: (id: string) =>
      fetchWithAuth<import('../types').Gift>(`/gifts/${id}/select/`, {
        method: 'POST',
      }),

    donate: (id: string, donorName: string, amount: number) =>
      fetch(`${API_BASE_URL}/gifts/${id}/donate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donor_name: donorName, amount }),
      }).then(r => r.json()) as Promise<import('../types').Gift>,
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