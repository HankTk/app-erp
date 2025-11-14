/**
 * Generic HTTP API client for making API requests
 */

export interface ApiConfig {
  baseUrl: string;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Generic HTTP request function
 */
export const httpRequest = async <T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = 'GET', headers = {}, body } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (error) {
    // Handle network errors (e.g., connection refused, CORS issues)
    if (error instanceof TypeError) {
      throw new Error(`Network error: Unable to connect to ${url}. Make sure the server is running.`);
    }
    throw error;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  // Handle empty responses (e.g., DELETE requests)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  // Return empty object for non-JSON responses
  return {} as T;
};

/**
 * Create a resource API client for a specific endpoint
 */
export const createResourceApi = <T = any>(baseUrl: string) => {
  /**
   * Fetch all resources
   */
  const fetchAll = async (): Promise<T[]> => {
    const data = await httpRequest<T | T[] | { data: T[]; users?: T[] }>(baseUrl);
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data && typeof data === 'object') {
      // Check for common response wrapper formats
      if ('users' in data && Array.isArray(data.users)) {
        return data.users;
      }
      if ('data' in data && Array.isArray(data.data)) {
        return data.data;
      }
      if ('items' in data && Array.isArray(data.items)) {
        return data.items;
      }
    }
    
    return [];
  };

  /**
   * Fetch a single resource by ID
   */
  const fetchById = async (id: string | number): Promise<T> => {
    return httpRequest<T>(`${baseUrl}/${id}`);
  };

  /**
   * Create a new resource
   */
  const create = async (data: Partial<T>): Promise<T> => {
    return httpRequest<T>(baseUrl, {
      method: 'POST',
      body: data,
    });
  };

  /**
   * Update an existing resource
   */
  const update = async (id: string | number, data: Partial<T>): Promise<T> => {
    return httpRequest<T>(`${baseUrl}/${id}`, {
      method: 'PUT',
      body: data,
    });
  };

  /**
   * Partially update a resource (PATCH)
   */
  const patch = async (id: string | number, data: Partial<T>): Promise<T> => {
    return httpRequest<T>(`${baseUrl}/${id}`, {
      method: 'PATCH',
      body: data,
    });
  };

  /**
   * Delete a resource
   */
  const remove = async (id: string | number): Promise<void> => {
    await httpRequest<void>(`${baseUrl}/${id}`, {
      method: 'DELETE',
    });
  };

  return {
    fetchAll,
    fetchById,
    create,
    update,
    patch,
    remove,
  };
};

