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
  interests: Interest[]; // Localized interests for display
  rawInterests: Interest[]; // Raw interests with name_languages for conversion
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
        // Keep raw interests with name_languages for dynamic localization
        // Don't transform here - let components get localized names when needed
        setInterests(result.data);
      } else {
        throw new Error(t("hooks.invalidResponseFormat"));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("hooks.failedToFetchInterests");
      setError(errorMessage);

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

  // Get localized interests for display (used by components)
  const getLocalizedInterests = useCallback((): Interest[] => {
    return interests.map((interest) => ({
      ...interest,
      name: getLocalizedName(interest),
    }));
  }, [interests, i18n.language]);

  return {
    interests: getLocalizedInterests(), // Return localized interests for display
    rawInterests: interests, // Return raw interests with name_languages for conversion
    loading,
    error,
    refetch,
  };
}
