import { User } from '../types';

// --- Helper Functions to Simulate Database ---

// This simulates a user database table using localStorage.
const getUsersFromDB = (): User[] => {
  const usersJSON = localStorage.getItem('xylos_ai_users');
  return usersJSON ? JSON.parse(usersJSON) : [];
};

// This simulates writing back to the user database table.
const saveUsersToDB = (users: User[]) => {
  localStorage.setItem('xylos_ai_users', JSON.stringify(users));
};

// --- Simulated API Functions ---

// Simulates network latency
const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Simulates a login API call.
 * @throws Will throw an error if credentials are invalid.
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  await simulateDelay(1000);
  
  const users = getUsersFromDB();
  const loginEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email === loginEmail && u.password === password);

  if (user) {
    user.lastLogin = new Date().toISOString();
    saveUsersToDB(users);
    return user;
  } else {
    throw new Error('Invalid email or password.');
  }
};

/**
 * Simulates a user registration API call.
 * @throws Will throw an error if the email is already in use or password is too short.
 */
export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  await simulateDelay(1000);

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const users = getUsersFromDB();
  const signupEmail = email.trim().toLowerCase();

  if (users.some(u => u.email === signupEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const newUser: User = {
    name: name.trim(),
    email: signupEmail,
    password, // In a real backend, this would be hashed
    avatar: `https://robohash.org/${signupEmail}.png?size=150x150&set=set4`,
    lastLogin: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsersToDB(users);
  return newUser;
};

/**
 * Simulates an API call to update user settings.
 * @throws Will throw an error if the user is not found.
 */
export const updateUser = async (email: string, settings: { name: string; avatar: string }): Promise<User> => {
  await simulateDelay(500);
  
  const users = getUsersFromDB();
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    throw new Error('User not found.');
  }
  
  const updatedUser = {
    ...users[userIndex],
    name: settings.name,
    avatar: settings.avatar,
  };

  users[userIndex] = updatedUser;
  saveUsersToDB(users);
  
  return updatedUser;
};