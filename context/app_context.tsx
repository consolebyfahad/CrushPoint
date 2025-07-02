// app_context.js
import React, { createContext, useContext, useState } from "react";

type User = {
  user_id: string;
  email: string;
  name: string;
  image: string | null;
  created: boolean;
};

type AppContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  return (
    <AppContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};
