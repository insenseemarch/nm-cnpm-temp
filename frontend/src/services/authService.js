import api from './api';

import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebaseConfig';


// 1. Register
export const registerAPI = (email, password, name) => {
  return api.post('/auth/register', { email, password, name });
};

// 2. Login
export const loginAPI = (email, password) => {
  return api.post('/auth/login', { email, password });
};

// 3. Login Google
// Backend requires the Google ID token to verify and create/login user
// export const loginGoogleAPI = async () => {
//   try {
//     const result = await signInWithPopup(auth, googleProvider);
//     // Get the ID token from the Firebase result
//     const token = await result.user.getIdToken();
//     // Send this token to backend
//     return api.post('/auth/google', { token });
//   } catch (error) {
//     throw error;
//   }
// };
//3.Login Google
export const loginGoogleAPI = (token) => {
  return api.post('/auth/google', { token });
};

// 4. Logout
export const logoutAPI = () => {
  // Clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Return resolved promise to maintain interface compatibility if needed
  return Promise.resolve();
};

// 5. User Profile
export const getProfileAPI = () => {
  return api.get('/auth/profile');
};

// 6. Forgot Password (Optional - Keep using Firebase for now if backend doesn't have it, or remove if backend handles it)
// Checking backend routes... backend doesn't seem to have forgot password yet.
// We can keep this utilizing Firebase for password reset emails if the users are Firebase users beneath the surface,
// BUT since we are using backend database, Firebase might not know about users created via backend API unless they are synced.
// For now, I will comment it out or leave as is but note it might not work for backend-only users.
// Actually, since registerAPI calls backend which calls ... wait, backend implementation uses bcrypt locally?
// The backend uses `bcrypt` and local DB (Prisma). It does NOT seem to create a Firebase user on register!
// So `sendPasswordResetEmail` from Firebase will NOT work for users registered via our new API.
// I will comment it out to avoid confusion.

// export const resetPasswordAPI = (email) => {
//   return api.post('/auth/forgot-password', { email });
// };

