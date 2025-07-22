// import { useAppContext } from "@/context/app_context";
import { BASE_URL } from "@env";

export const apiCall = async (payload, method = "POST") => {
    // const { logout } = useAppContext();
    try {
        console.log("📡 API Request:", { url: BASE_URL, method, payload });
        const response = await fetch(BASE_URL, {
            method,
            body: payload,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        console.log("✅ API Response:", JSON.stringify(data));
        return data;
    } catch (error) {
        console.error("❌ API Error:", error.message);
        // const success = await logout();
        // if (success) {
        //     router.replace("/welcome");
        // } else {
        //     showToast("Error logging out. Please try again.", "error");
        // }
        throw error;
    }
};