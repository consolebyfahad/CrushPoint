import { ENV } from "@/config/env";
export const apiCall = async (payload, method = "POST") => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    // Log FormData contents if it's FormData
    if (payload instanceof FormData) {
    } else {
    }

    const BASE_URL = ENV.API_BASE_URL;

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000);

    const response = await fetch(BASE_URL, {
      method,
      body: payload,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

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
    console.log("data", data);
    // Log response data (be careful with sensitive data)
    if (data && typeof data === "object") {
    }

    return data;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestId}] API Error:`, {
      message: error.message,
      name: error.name,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

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
