import { ENV } from "@/config/env";
import AsyncStorage from "@react-native-async-storage/async-storage";

const logout = async () => {
  try {
    await AsyncStorage.removeItem("@AppContext");
    return true;
  } catch (error) {

    return false;
  }
};

export const apiCall = async (payload, method = "POST") => {
  const requestId = Math.random().toString(36).substring(7);
  try {
    const BASE_URL = ENV.API_BASE_URL;

    // Add timeout to prevent hanging requests
    const controller = new AbortController();

    const response = await fetch(BASE_URL, {
      method,
      body: payload,
      signal: controller.signal,
    });
    // 
    const data = await response.json();
    // 

    return data;
  } catch (error) {

    if (error.message.includes("Network request failed")) {
      await logout();
      throw new Error("Network error. Please check your internet connection.");
    }

    throw error;
  }
};
