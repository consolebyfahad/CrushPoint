import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  user_id: string;
  email: string;
  phone?: string;
  name: string;
  image: string | null;
  created: boolean;
}

export interface UserData {
  gender: string;
  gender_interest: string;
  interests: string[];
  name: string;
  dob: string;
  images: string[];
  looking_for: string[];
  radius: number;
  height: string;
  nationality: string;
  religion: string;
  zodiac: string;
  latitude: number;
  longitude: number;
}

interface AppContextType {
  // Authentication
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;

  // User profile
  user: User | null;
  setUser: (user: User | null) => void;

  // User data
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  clearUserData: () => void;

  // User images
  userImages: string[];
  addUserImage: (fileName: string) => void;
  removeUserImage: (fileName: string) => void;
  clearUserImages: () => void;

  // Utilities
  logout: () => Promise<boolean>;
  isHydrated: boolean;
}

const defaultUserData: UserData = {
  gender: "",
  gender_interest: "",
  interests: [],
  name: "",
  dob: "",
  images: [],
  looking_for: [],
  radius: 100,
  height: "",
  nationality: "",
  religion: "",
  zodiac: "",
  latitude: 0,
  longitude: 0,
};

const STORAGE_KEY = "@AppContext";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [userImages, setUserImages] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate state from AsyncStorage on app start
  useEffect(() => {
    const hydrateContext = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setIsLoggedIn(parsed.isLoggedIn ?? false);
          setUser(parsed.user ?? null);
          setUserData(parsed.userData ?? defaultUserData);
          setUserImages(parsed.userImages ?? []);
        }
      } catch (error) {
        console.warn("Failed to parse context state:", error);
      } finally {
        setIsHydrated(true);
      }
    };

    hydrateContext();
  }, []);

  // Save state to AsyncStorage whenever it changes (after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    const saveContext = async () => {
      try {
        const data = {
          isLoggedIn,
          user,
          userData,
          userImages,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.warn("Failed to save context state:", error);
      }
    };

    saveContext();
  }, [isLoggedIn, user, userData, userImages, isHydrated]);

  const updateUserData = (data: Partial<UserData>) => {
    setUserData((prev) => ({ ...prev, ...data }));
  };

  const clearUserData = () => {
    setUserData(defaultUserData);
  };

  const addUserImage = (fileName: string) => {
    setUserImages((prev) => {
      if (prev.includes(fileName)) return prev;
      return [...prev, fileName];
    });
  };

  const removeUserImage = (fileName: string) => {
    setUserImages((prev) => prev.filter((img) => img !== fileName));
  };

  const clearUserImages = () => {
    setUserImages([]);
  };

  const logout = async (): Promise<boolean> => {
    try {
      setIsLoggedIn(false);
      setUser(null);
      clearUserData();
      clearUserImages();

      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log("✅ User logged out successfully");
      return true;
    } catch (error) {
      console.error("❌ Logout error:", error);
      return false;
    }
  };

  const contextValue: AppContextType = {
    isLoggedIn,
    setIsLoggedIn,
    user,
    setUser,
    userData,
    updateUserData,
    clearUserData,
    userImages,
    addUserImage,
    removeUserImage,
    clearUserImages,
    logout,
    isHydrated,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
