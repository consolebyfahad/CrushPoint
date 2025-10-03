import { ENV } from "@/config/env";
export const apiCall = async (payload, method = "POST") => {
  try {
    const BASE_URL = ENV.API_BASE_URL;

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(BASE_URL, {
      method,
      body: payload,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check if response is ok
    if (!response.ok) {
      let errorMessage = "Something went wrong";
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.message ||
          `HTTP ${response.status}: ${response.statusText}`;
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ API Error:", error.message);

    // Handle specific error types
    if (error.name === "AbortError") {
      throw new Error(
        "Request timeout. Please check your connection and try again."
      );
    }

    if (error.message.includes("Network request failed")) {
      throw new Error("Network error. Please check your internet connection.");
    }

    throw error;
  }
};
