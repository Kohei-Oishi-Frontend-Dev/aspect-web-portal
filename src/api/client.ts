export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = import.meta.env.VITE_BACKEND_BASE_URL || '') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthToken(): string | null {
    return sessionStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (response.status === 401) {
        // Handle unauthorized - redirect to login
        sessionStorage.clear();
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || 'API request failed',
          status: response.status,
          code: data.code,
        } as ApiError;
      }

      return {
        data,
        status: response.status,
        message: data.message,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        throw error;
      }
      
      throw {
        message: error instanceof Error ? error.message : 'Network error',
        status: 0,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    console.log("client working");
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}