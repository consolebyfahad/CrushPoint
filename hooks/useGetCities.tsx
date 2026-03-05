import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export interface CityOption {
  label: string;
  value: string;
}

interface UseGetCitiesReturn {
  cities: CityOption[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function normalizeCityOption(item: any): CityOption | null {
  const name =
    item?.name ?? item?.city ?? item?.city_name ?? item?.label ?? "";
  if (!name || typeof name !== "string") return null;
  const trimmed = name.trim();
  return trimmed ? { label: trimmed, value: trimmed } : null;
}

export default function useGetCities(): UseGetCitiesReturn {
  const { user } = useAppContext();
  const { t } = useTranslation();
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(async () => {
    if (!user) {
      setError(t("hooks.userNotAuthenticated"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "cities");

      const response = await apiCall(formData);

      if (response?.data && Array.isArray(response.data)) {
        const options: CityOption[] = [];
        const seen = new Set<string>();
        for (const item of response.data) {
          const option = normalizeCityOption(item);
          if (option && !seen.has(option.value)) {
            seen.add(option.value);
            options.push(option);
          }
        }
        setCities(options);
      } else {
        setCities([]);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("hooks.failedToFetchCities");
      setError(message);
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  return {
    cities,
    loading,
    error,
    refetch: fetchCities,
  };
}
