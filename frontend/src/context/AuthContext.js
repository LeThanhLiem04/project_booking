import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { login as loginApi, register as registerApi, getUserProfile, setToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationRefreshKey, setNotificationRefreshKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  // Helper để set user và đồng bộ localStorage
  const setUserAndSync = (userObj) => {
    setUser(userObj);
    if (userObj) {
      localStorage.setItem('user', JSON.stringify(userObj));
    } else {
      localStorage.removeItem('user');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      setUserAndSync(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginApi({ email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUserAndSync(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const register = async (userData) => {
    try {
      // Validate input
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('Vui lòng điền đầy đủ thông tin');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Email không hợp lệ');
      }

      // Validate password length
      if (userData.password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }

      const response = await registerApi(userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUserAndSync(user);
      return user;
    } catch (error) {
      console.error('Register error:', error);
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserAndSync(null);
  };

  const triggerNotificationRefresh = () => {
    setNotificationRefreshKey(prevKey => prevKey + 1);
  };

  const value = {
    user,
    setUser: setUserAndSync,
    loading,
    login,
    register,
    logout,
    notificationRefreshKey,
    triggerNotificationRefresh
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};