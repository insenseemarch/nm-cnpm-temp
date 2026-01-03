import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginAPI, registerAPI, loginGoogleAPI, logoutAPI } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent login
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginAPI(email, password);
      // Backend returns { message, data: { user, token } }
      // Adjust based on actual backend response structure shown in AuthController
      // AuthController.login returns: res.status(200).json({ message: '...', data: { user, token } });
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async (googleToken) => {
    try {
      const response = await loginGoogleAPI(googleToken);
      // AuthController.googleLogin returns: res.status(200).json({ message: '...', data: { user, token } });
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, name) => {
    // Backend registration returns token too
    const response = await registerAPI(email, password, name);
    // AuthController.register returns: res.status(201).json({ message: '...', data: { user, token } });
    const { user, token } = response.data.data;

    // Auto login after register
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await logoutAPI();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    loginWithGoogle,
    logout
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium text-gray-400">Đang kết nối vũ trụ...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
