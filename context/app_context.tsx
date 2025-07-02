import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  user_id: string;
  email: string;
  phone?: string;
  name: string;
  image: string | null;
  created: boolean;
};

type UserData = {
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
};

type AppContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  clearUserData: () => void;
  userImages: string[];
  addUserImage: (fileName: string) => void;
  removeUserImage: (fileName: string) => void;
  clearUserImages: () => void;
};

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

  // Hydrate state from AsyncStorage
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setIsLoggedIn(parsed.isLoggedIn ?? false);
          setUser(parsed.user ?? null);
          setUserData(parsed.userData ?? defaultUserData);
          setUserImages(parsed.userImages ?? []);
        } catch (e) {
          console.warn("Failed to parse context state:", e);
        }
      }
      setIsHydrated(true);
    })();
  }, []);

  // Save state to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return; // Avoid saving before hydration
    const data = {
      isLoggedIn,
      user,
      userData,
      userImages,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(console.warn);
  }, [isLoggedIn, user, userData, userImages, isHydrated]);

  const updateUserData = (data: Partial<UserData>) => {
    setUserData((prev) => ({ ...prev, ...data }));
  };

  const clearUserData = () => {
    setUserData(defaultUserData);
  };

  const addUserImage = (fileName: string) => {
    setUserImages((prev) => [...prev, fileName]);
  };

  const removeUserImage = (fileName: string) => {
    setUserImages((prev) => prev.filter((img) => img !== fileName));
  };

  const clearUserImages = () => {
    setUserImages([]);
  };

  return (
    <AppContext.Provider
      value={{
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};
