import { ENV } from "@/config/env";
export const apiCall = async (payload, method = "POST") => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    console.log(`🚀 [${requestId}] Starting API call:`, {
      method,
      url: ENV.API_BASE_URL,
      payloadType: payload instanceof FormData ? "FormData" : typeof payload,
      timestamp: new Date().toISOString(),
    });

    // Log FormData contents if it's FormData
    if (payload instanceof FormData) {
      console.log(`📦 [${requestId}] FormData contents:`);
      for (let [key, value] of payload.entries()) {
        console.log(`  ${key}:`, value);
      }
    } else {
      console.log(`📦 [${requestId}] Payload:`, payload);
    }

    const BASE_URL = ENV.API_BASE_URL;

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`⏰ [${requestId}] Request timeout after 30 seconds`);
      controller.abort();
    }, 30000);

    console.log(`🌐 [${requestId}] Making fetch request...`);
    const response = await fetch(BASE_URL, {
      method,
      body: payload,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    console.log(`📡 [${requestId}] Response received:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      duration: `${duration}ms`,
    });

    // Check if response is ok
    if (!response.ok) {
      console.log(`❌ [${requestId}] Response not OK, parsing error...`);
      let errorMessage = "Something went wrong";
      try {
        const errorData = await response.json();
        console.log(`❌ [${requestId}] Error response data:`, errorData);
        errorMessage =
          errorData.message ||
          `HTTP ${response.status}: ${response.statusText}`;
      } catch (parseError) {
        console.log(
          `❌ [${requestId}] Failed to parse error response:`,
          parseError
        );
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    console.log(`📥 [${requestId}] Parsing response JSON...`);
    const data = await response.json();
    console.log(`✅ [${requestId}] API call successful:`, {
      dataType: typeof data,
      hasData: !!data,
      dataKeys: data && typeof data === "object" ? Object.keys(data) : "N/A",
      duration: `${duration}ms`,
    });

    // Log response data (be careful with sensitive data)
    if (data && typeof data === "object") {
      console.log(`📊 [${requestId}] Response data:`, data);
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
      console.log(`⏰ [${requestId}] Request was aborted due to timeout`);
      throw new Error(
        "Request timeout. Please check your connection and try again."
      );
    }

    if (error.message.includes("Network request failed")) {
      console.log(`🌐 [${requestId}] Network request failed`);
      throw new Error("Network error. Please check your internet connection.");
    }

    console.log(`💥 [${requestId}] Re-throwing error:`, error);
    throw error;
  }
};
