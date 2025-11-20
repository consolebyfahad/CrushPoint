import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Interest {
  id: string;
  name: string;
  name_languages?: string; // JSON string with translations like {"en":"Science","de":"Wissenschaft"}
  distance: number;
  date: string;
  time: string;
  image_url: string;
}

interface UseGetInterestsReturn {
  interests: Interest[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export default function useGetInterests(): UseGetInterestsReturn {
  const { t, i18n } = useTranslation();
  const { user } = useAppContext();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get localized name from name_languages
  const getLocalizedName = (interest: any): string => {
    if (!interest.name_languages) {
      return interest.name || "";
    }

    try {
      // Parse the JSON string from name_languages
      const nameLanguages =
        typeof interest.name_languages === "string"
          ? JSON.parse(interest.name_languages)
          : interest.name_languages;

      // Get current language (defaults to "en" if not found)
      const currentLang = i18n.language || "en";
      const langCode = currentLang.split("-")[0]; // Get "en" from "en-US"

      // Try to get the name for current language, fallback to "en", then to original name
      return (
        nameLanguages[langCode] || nameLanguages["en"] || interest.name || ""
      );
    } catch (error) {
      console.warn("Error parsing name_languages:", error);
      return interest.name || "";
    }
  };

  const fetchInterests = useCallback(async () => {
    if (!user) {
      setError(t("hooks.userNotAuthenticated"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "interests");

      const response = await apiCall(formData);
      const result = await response;

      if (result.data && Array.isArray(result.data)) {
        // Transform interests to use localized names
        const localizedInterests = result.data.map((interest: Interest) => ({
          ...interest,
          name: getLocalizedName(interest),
        }));
        setInterests(localizedInterests);
      } else {
        throw new Error(t("hooks.invalidResponseFormat"));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("hooks.failedToFetchInterests");
      setError(errorMessage);
      console.error("Error fetching interests:", err);
    } finally {
      setLoading(false);
    }
  }, [user, i18n.language]);

  useEffect(() => {
    fetchInterests();
  }, [fetchInterests, i18n.language]);

  const refetch = useCallback(() => {
    fetchInterests();
  }, [fetchInterests]);

  return {
    interests,
    loading,
    error,
    refetch,
  };
}
