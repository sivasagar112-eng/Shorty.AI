import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shorty_user');
      return saved ? JSON.parse(saved) : {
        id: 'usr_demo_1',
        name: 'Siva Sagar',
        email: 'sivasagar1309@outlook.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedAt: 'November 2026',
        credits: 100,
      };
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!user);

  useEffect(() => {
    if (user) {
      localStorage.setItem('shorty_user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('shorty_user');
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = async (email, password) => {
    // Client-side authentication logic with persistent session
    if (!email || !password) throw new Error('Please enter email and password');
    const newUser = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      credits: 100,
    };
    setUser(newUser);
    return newUser;
  };

  const signup = async (name, email, password) => {
    if (!name || !email || !password) throw new Error('All fields are required');
    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      credits: 100,
    };
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  const forgotPassword = async (email) => {
    if (!email) throw new Error('Please enter your email');
    return true;
  };

  const updateProfile = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, forgotPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

