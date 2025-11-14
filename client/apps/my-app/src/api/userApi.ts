import { createResourceApi } from './httpApi';

export type User = Record<string, any>;

const API_BASE_URL = 'http://localhost:8080/api/users';

// Create user API using the generic resource API
const userApi = createResourceApi<User>(API_BASE_URL);

/**
 * Fetch all users from the API
 */
export const fetchUsers = userApi.fetchAll;

/**
 * Fetch a single user by ID
 */
export const fetchUserById = userApi.fetchById;

/**
 * Create a new user
 */
export const createUser = userApi.create;

/**
 * Update an existing user
 */
export const updateUser = userApi.update;

/**
 * Partially update a user (PATCH)
 */
export const patchUser = userApi.patch;

/**
 * Delete a user
 */
export const deleteUser = userApi.remove;

/**
 * Login with userid and password
 */
export const login = async (userid: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userid, password }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid userid or password');
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

