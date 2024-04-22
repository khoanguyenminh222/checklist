// UserContext.js
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  const logout = () => {
    setUser(null); // Xóa thông tin người dùng khi logout
  };

  const isLogin = () => {
    return user !== null;
  };

  return (
    <UserContext.Provider value={{ user, updateUser, logout, isLogin }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
