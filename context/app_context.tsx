import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  user_id: string;
  email: string;
  phone?: string;
  name: string;
  image: string | null;
  created: boolean;
  new: boolean;
}

export interface NotificationSetting {
  key: string;
  enabled: boolean;
  title: string;
  description: string;
}

export interface UserData {
  gender: string;
  gender_interest: string;
  interests: any[];
  name: string;
  dob: string;
  images: string[];
  looking_for: string[];
  radius: number;
  height: string;
  nationality: string | string[];
  religion: string;
  zodiac: string;
  lat: any;
  lng: any;
  phone?: string;
  email?: string;
  notification_settings?: NotificationSetting[];
  age?: number;
  photos?: string[];
  parsedInterests?: string[];
  parsedLookingFor?: string[];
  parsedNationality?: string[];
  originalLookingForIds: any;
  originalNationalityValues?: string[];
  country?: string;
  state?: string;
  city?: string;
  languages?: string;
  about?: string;
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

  // Notification settings
  updateNotificationSettings: (settings: NotificationSetting[]) => void;
  getNotificationSetting: (key: string) => boolean;

  // Utilities
  logout: () => Promise<boolean>;
  isHydrated: boolean;
}

const defaultNotificationSettings: NotificationSetting[] = [
  {
    key: "newMatches",
    enabled: true,
    title: "New Matches",
    description: "When you get a new match",
  },
  {
    key: "emojiReceived",
    enabled: true,
    title: "Emoji Received",
    description: "When someone sends you an emoji",
  },
  {
    key: "nearbyMatches",
    enabled: true,
    title: "Nearby Matches",
    description: "When your matches are nearby",
  },
  {
    key: "nearbyUsers",
    enabled: false,
    title: "Nearby Users",
    description: "When new users are in your area",
  },
  {
    key: "profileVisits",
    enabled: false,
    title: "Profile Visits",
    description: "When someone views your profile",
  },
  {
    key: "newEventPosted",
    enabled: false,
    title: "New Event Posted",
    description: "When a new event is posted in your area",
  },
  {
    key: "eventInvitationAccepted",
    enabled: false,
    title: "Event Invitation Accepted",
    description: "When someone accepts event invitation",
  },
  {
    key: "eventReminder",
    enabled: true,
    title: "Event Reminder",
    description: "Reminders for upcoming events",
  },
  {
    key: "offersPromotions",
    enabled: false,
    title: "Offers & Promotions",
    description: "Special offers and promotions",
  },
];

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
  lat: 0,
  lng: 0,
  phone: "",
  email: "",
  notification_settings: defaultNotificationSettings,
  age: 0,
  photos: [],
  parsedInterests: [],
  parsedLookingFor: [],
  parsedNationality: [],
  originalLookingForIds: [],
  originalNationalityValues: [],
  country: "",
  state: "",
  city: "",
  languages: "",
  about: "",
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

          // Merge with default notification settings if they don't exist
          const hydratedUserData = {
            ...defaultUserData,
            ...parsed.userData,
            notification_settings:
              parsed.userData?.notification_settings ||
              defaultNotificationSettings,
          };
          setUserData(hydratedUserData);
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

  const updateNotificationSettings = (settings: NotificationSetting[]) => {
    setUserData((prev) => ({
      ...prev,
      notification_settings: settings,
    }));
  };

  const getNotificationSetting = (key: string): boolean => {
    const setting = userData.notification_settings?.find((s) => s.key === key);
    return setting?.enabled ?? false;
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
    updateNotificationSettings,
    getNotificationSetting,
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
