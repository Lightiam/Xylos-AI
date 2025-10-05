import { User } from '../types';
import * as db from './database';

// =================================================================
// NOTE FOR THE BACKEND TEAM:
// This file simulates a backend API service. It contains business logic
// like password checking and token generation. This should be implemented
// on your server, and the functions here should be replaced with `fetch`
// calls to your API endpoints.
// =================================================================

// --- Token Management (Simulates JWT) ---

const TOKEN_KEY = 'xylos_ai_auth_token';

// In a real app, this would be a secure, signed JWT.
// Here, we're just base64 encoding the user ID.
const generateToken = (user: User): string => btoa(JSON.stringify({ userId: user.id, issuedAt: Date.now() }));

const decodeToken = (token: string): { userId: string } | null => {
    try {
        return JSON.parse(atob(token));
    } catch (e) {
        return null;
    }
};

const getToken = (): string | null => sessionStorage.getItem(TOKEN_KEY);
const setToken = (token: string): void => sessionStorage.setItem(TOKEN_KEY, token);
const removeToken = (): void => sessionStorage.removeItem(TOKEN_KEY);

// --- Authentication API Functions ---

/**
 * Logs in a user.
 */
export const login = async (email: string, password: string): Promise<{ user: User, token: string }> => {
  const loginEmail = email.trim().toLowerCase();
  const user = await db.findUserByEmail(loginEmail);

  // In a real backend, you'd use a library like bcrypt to compare hashed passwords
  if (user && user.password === password) {
    await db.updateUserLoginTime(user.id);
    const token = generateToken(user);
    setToken(token);
    const { password: _, ...userWithoutPassword } = user; // Don't send password to client
    return { user: userWithoutPassword, token };
  } else {
    throw new Error('Invalid email or password.');
  }
};

/**
 * Registers a new user.
 */
export const register = async (name: string, email: string, password: string): Promise<{ user: User, token: string }> => {
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  const signupEmail = email.trim().toLowerCase();
  
  const existingUser = await db.findUserByEmail(signupEmail);
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = await db.createUser({
    name: name.trim(),
    email: signupEmail,
    password, // In a real backend, this would be hashed before saving
    avatar: `https://robohash.org/${signupEmail}.png?size=150x150&set=set4`,
  });

  const token = generateToken(newUser);
  setToken(token);

  const { password: _, ...userWithoutPassword } = newUser; // Don't send password to client
  return { user: userWithoutPassword, token };
};

/**
 * Logs out the current user.
 */
export const logout = (): void => {
  removeToken();
};

/**
 * Validates the current session token and fetches the user.
 */
export const validateSession = async (): Promise<User | null> => {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.userId) {
    removeToken();
    return null;
  }

  try {
    const user = await db.findUserById(decoded.userId);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  } catch (error) {
    console.error('Session validation failed:', error);
    removeToken();
    return null;
  }
};

/**
 * Updates a user's settings.
 */
export const updateUser = async (userId: string, settings: { name: string; avatar: string }): Promise<User> => {
  // In a real app, the API would validate that the logged-in user has permission to update this profile.
  const updatedUser = await db.updateUserProfile(userId, settings);
  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};