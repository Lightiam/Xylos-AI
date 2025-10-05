import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

// =================================================================
// NOTE FOR THE BACKEND TEAM:
// This file is the frontend's API contract. All functions in this file
// should correspond to a real API endpoint on your server. The mockFetch
// function below simulates the network responses your server should send.
// =================================================================

const API_BASE_URL = '/api'; // This would be an environment variable in a real app

// --- Token Management ---

const TOKEN_KEY = 'xylos_ai_auth_token';
const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);


// --- MOCK FETCH - Replace with actual `fetch` in production ---

const mockFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    console.log(`[MOCK API] ${options.method || 'GET'} to ${url}`);

    // This simulates a user database table using localStorage.
    // In a real app, this database lives on your server.
    const getDb = (): User[] => JSON.parse(localStorage.getItem('xylos_ai_users_db') || '[]');
    const saveDb = (users: User[]) => localStorage.setItem('xylos_ai_users_db', JSON.stringify(users));
    
    await new Promise(res => setTimeout(res, 500 + Math.random() * 500)); // Simulate latency

    const { pathname } = new URL(url, 'http://localhost');
    const body = options.body ? JSON.parse(options.body as string) : {};

    if (pathname === `${API_BASE_URL}/auth/register` && options.method === 'POST') {
        const db = getDb();
        if (db.some(u => u.email === body.email.trim().toLowerCase())) {
            return new Response(JSON.stringify({ message: 'An account with this email already exists.' }), { status: 409 });
        }
        const newUser: User = {
            id: uuidv4(),
            name: body.name.trim(),
            email: body.email.trim().toLowerCase(),
            password: body.password, // This would be hashed on the server
            avatar: `https://robohash.org/${body.email.trim().toLowerCase()}.png?size=150x150&set=set4`,
            lastLogin: new Date().toISOString()
        };
        db.push(newUser);
        saveDb(db);
        const token = btoa(JSON.stringify({ userId: newUser.id })); // Fake JWT
        const { password, ...userResponse } = newUser;
        return new Response(JSON.stringify({ user: userResponse, token }), { status: 201 });
    }

    if (pathname === `${API_BASE_URL}/auth/login` && options.method === 'POST') {
        const db = getDb();
        const user = db.find(u => u.email === body.email.trim().toLowerCase() && u.password === body.password);
        if (user) {
            user.lastLogin = new Date().toISOString();
            saveDb(db);
            const token = btoa(JSON.stringify({ userId: user.id })); // Fake JWT
            const { password, ...userResponse } = user;
            return new Response(JSON.stringify({ user: userResponse, token }), { status: 200 });
        }
        return new Response(JSON.stringify({ message: 'Invalid email or password.' }), { status: 401 });
    }

    // All routes below require a token
    const authHeader = options.headers ? (options.headers as Headers).get('Authorization') : null;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
        decoded = JSON.parse(atob(token));
    } catch (e) {
        return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
    }

    if (pathname === `${API_BASE_URL}/auth/me` && options.method === 'GET') {
        const db = getDb();
        const user = db.find(u => u.id === decoded.userId);
        if (user) {
            const { password, ...userResponse } = user;
            return new Response(JSON.stringify({ user: userResponse }), { status: 200 });
        }
        return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    if (pathname.startsWith(`${API_BASE_URL}/users/`) && options.method === 'PUT') {
        const db = getDb();
        const userIndex = db.findIndex(u => u.id === decoded.userId);
        if (userIndex !== -1) {
            db[userIndex] = { ...db[userIndex], ...body };
            saveDb(db);
            const { password, ...userResponse } = db[userIndex];
            return new Response(JSON.stringify({ user: userResponse }), { status: 200 });
        }
        return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 });
};


const apiFetch = async (url: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // In production, you would use the real `fetch`. We use our mock here for development.
  const response = await mockFetch(`${API_BASE_URL}${url}`, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
    throw new Error(errorData.message || 'API request failed');
  }
  
  return response.json();
};

// --- API Service Functions ---

export const login = async (email: string, password: string): Promise<{ user: User, token: string }> => {
  const { user, token } = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(token);
  return { user, token };
};

export const register = async (name: string, email: string, password: string): Promise<{ user: User, token: string }> => {
  if (password.length < 6) throw new Error('Password must be at least 6 characters long.');
  const { user, token } = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setToken(token);
  return { user, token };
};

export const logout = (): void => {
  removeToken();
};

export const validateSession = async (): Promise<User | null> => {
  if (!getToken()) return null;
  try {
    const { user } = await apiFetch('/auth/me', { method: 'GET' });
    return user;
  } catch (error) {
    console.error('Session validation failed:', error);
    removeToken();
    return null;
  }
};

export const updateUser = async (userId: string, settings: { name: string; avatar: string }): Promise<User> => {
  const { user } = await apiFetch(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
  return user;
};
