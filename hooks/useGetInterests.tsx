import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { useCallback, useEffect, useState } from "react";

interface Interest {
  id: string;
  name: string;
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
  const { user } = useAppContext();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInterests = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
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
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch interests";
      setError(errorMessage);
      console.error("Error fetching interests:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInterests();
  }, [fetchInterests]);

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
