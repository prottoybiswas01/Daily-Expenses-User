import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginApi, registerApi, demoLoginApi, getMeApi, updateSettingsApi } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('expenses_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('expenses_theme', theme);
  }, [theme]);

  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem('expenses_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed.user);
          setToken(parsed.token);
          if (parsed.user?.theme) {
            setTheme(parsed.user.theme);
          }
        } catch (err) {
          console.error('Failed to parse local user storage:', err);
          localStorage.removeItem('expenses_user');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await loginApi(credentials);
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
      if (data.user.theme) setTheme(data.user.theme);
      localStorage.setItem('expenses_user', JSON.stringify({ user: data.user, token: data.token }));
    }
    return data;
  };

  const register = async (userData) => {
    const data = await registerApi(userData);
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('expenses_user', JSON.stringify({ user: data.user, token: data.token }));
    }
    return data;
  };

  const loginDemo = async () => {
    const data = await demoLoginApi();
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('expenses_user', JSON.stringify({ user: data.user, token: data.token }));
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('expenses_user');
  };

  const updateProfile = async (settings) => {
    const data = await updateSettingsApi(settings);
    if (data.success) {
      setUser(data.user);
      const stored = JSON.parse(localStorage.getItem('expenses_user') || '{}');
      localStorage.setItem('expenses_user', JSON.stringify({ ...stored, user: data.user }));
    }
    return data;
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (user) {
      updateProfile({ theme: newTheme }).catch(err => console.error(err));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        theme,
        login,
        register,
        loginDemo,
        logout,
        updateProfile,
        toggleTheme
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
