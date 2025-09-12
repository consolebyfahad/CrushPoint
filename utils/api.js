// import { useAppContext } from "@/context/app_context";
import { BASE_URL } from "@env";

export const apiCall = async (payload, method = "POST") => {
    try {
        console.log("📡 API Request:", { url: BASE_URL, method });

        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
                errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
            } catch (parseError) {
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("✅ API Response:", JSON.stringify(data));
        return data;
    } catch (error) {
        console.error("❌ API Error:", error.message);

        // Handle specific error types
        if (error.name === 'AbortError') {
            throw new Error("Request timeout. Please check your connection and try again.");
        }

        if (error.message.includes('Network request failed')) {
            throw new Error("Network error. Please check your internet connection.");
        }

        throw error;
    }
};