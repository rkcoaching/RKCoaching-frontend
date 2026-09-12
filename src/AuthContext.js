import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const stored = localStorage.getItem('rk_user');
  const [user, setUser] = useState(stored ? JSON.parse(stored) : null);

  const login = (token, userData) => {
    localStorage.setItem('rk_token', token);
    localStorage.setItem('rk_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('rk_token');
    localStorage.removeItem('rk_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
