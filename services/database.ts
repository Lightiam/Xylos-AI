import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

// =================================================================
// NOTE FOR THE BACKEND TEAM:
// This file simulates a database access layer (e.g., using an ORM like Prisma or Sequelize).
// All the logic here should be replaced with actual queries to your PostgreSQL database.
// The `localStorage` usage is a temporary mock for the database table.
// =================================================================

// --- Helper Functions to Simulate Database Table ---

const DB_KEY = 'xylos_ai_users_db';

const getUsersFromDB = (): User[] => {
  const usersJSON = localStorage.getItem(DB_KEY);
  return usersJSON ? JSON.parse(usersJSON) : [];
};

const saveUsersToDB = (users: User[]) => {
  localStorage.setItem(DB_KEY, JSON.stringify(users));
};

// Simulates network/database latency
const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Database Service Functions ---

/**
 * Finds a single user by their email address.
 * In a real backend, this would be: `SELECT * FROM users WHERE email = $1`
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  await simulateDelay(150);
  const users = getUsersFromDB();
  const user = users.find(u => u.email === email);
  return user || null;
};

/**
 * Finds a single user by their ID.
 * In a real backend, this would be: `SELECT * FROM users WHERE id = $1`
 */
export const findUserById = async (userId: string): Promise<User | null> => {
    await simulateDelay(50);
    const users = getUsersFromDB();
    return users.find(u => u.id === userId) || null;
};

/**
 * Creates a new user in the database.
 * In a real backend, this would be: `INSERT INTO users (...) VALUES (...) RETURNING *`
 */
export const createUser = async (userData: Omit<User, 'id' | 'lastLogin'>): Promise<User> => {
  await simulateDelay(200);
  const users = getUsersFromDB();
  const newUser: User = {
    ...userData,
    id: uuidv4(),
    lastLogin: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsersToDB(users);
  return newUser;
};

/**
 * Updates a user's last login timestamp.
 * In a real backend, this would be: `UPDATE users SET "lastLogin" = $1 WHERE id = $2`
 */
export const updateUserLoginTime = async (userId: string): Promise<void> => {
    await simulateDelay(50);
    const users = getUsersFromDB();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].lastLogin = new Date().toISOString();
        saveUsersToDB(users);
    }
};

/**
 * Updates a user's name and avatar.
 * In a real backend, this would be: `UPDATE users SET name = $1, avatar = $2 WHERE id = $3 RETURNING *`
 */
export const updateUserProfile = async (userId: string, settings: { name: string; avatar: string }): Promise<User> => {
    await simulateDelay(200);
    const users = getUsersFromDB();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        throw new Error("User not found in database.");
    }
    
    users[userIndex] = { ...users[userIndex], ...settings };
    saveUsersToDB(users);
    return users[userIndex];
};