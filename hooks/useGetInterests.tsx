import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Interest {
  id: string;
  name: string;
  name_languages?: string;  
  distance: number;
  date: string;
  time: string;
  image_url: string;
}

interface UseGetInterestsReturn {
  interests: Interest[];  
  rawInterests: Interest[];  
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

  const getLocalizedName = (interest: any): string => {
    if (!interest.name_languages) {
      return interest.name || "";
    }

    try {
      
      const nameLanguages =
        typeof interest.name_languages === "string"
          ? JSON.parse(interest.name_languages)
          : interest.name_languages;

      const currentLang = i18n.language || "en";
      const langCode = currentLang.split("-")[0];  

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

  const getLocalizedInterests = useCallback((): Interest[] => {
    return interests.map((interest) => ({
      ...interest,
      name: getLocalizedName(interest),
    }));
  }, [interests, i18n.language]);

  return {
    interests: getLocalizedInterests(),  
    rawInterests: interests,  
    loading,
    error,
    refetch,
  };
}
