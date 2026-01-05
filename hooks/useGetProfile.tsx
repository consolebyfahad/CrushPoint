import { useAppContext } from "@/context/app_context";
import useGetInterests from "@/hooks/useGetInterests";
import { apiCall } from "@/utils/api";
import {
  calculateAge,
  convertNationalityValuesToLabels,
  parseInterestsWithNames,
  parseJsonString,
  parseLookingForWithLabels,
  parseNationalityWithLabels,
} from "@/utils/helper";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function useGetProfile() {
  // Get interests from API for interest name conversion
  const { interests: apiInterests } = useGetInterests();
  const { t } = useTranslation();
  const { user, updateUserData } = useAppContext();
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const defaultPhoto =
    "https://img.freepik.com/vecteurs-libre/homme-affaires-caractere-avatar-isole_24877-60111.jpg?semt=ais_hybrid&w=740";

  const getUserData = useCallback(async () => {
    if (!user?.user_id) {
      setError(t("hooks.userIdNotAvailable"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "users");
      formData.append("id", user.user_id);

      const response = await apiCall(formData);
      if (response.data && response.data.length > 0) {
        const userData: UserData = response.data[0];
        let photos: string[] = [];

        if (userData.images) {
          try {
            const cleanedImagesString = userData.images
              .replace(/\\\\/g, "\\")
              .replace(/\\\"/g, '"');
            const imageFilenames = JSON.parse(cleanedImagesString);
            const baseImageUrl = userData.image_url || "";

            if (Array.isArray(imageFilenames) && imageFilenames.length > 0) {
              photos = imageFilenames.map((filename: string) => {
                const cleanFilename = filename.replace(/\\/g, "");
                return `${baseImageUrl}${cleanFilename}`;
              });
            } else {
              photos = [defaultPhoto];
            }
          } catch (error) {
            console.error("Error parsing images:", error);
            photos = [defaultPhoto];
          }
        } else {
          photos = [defaultPhoto];
        }

        const age = calculateAge(userData.dob);

        // Debug interests data

        let parsedInterests: string[] = [];
        let originalInterestIds: string[] = [];

        if (userData.interests) {
          try {
            parsedInterests = parseInterestsWithNames(
              userData.interests,
              t,
              apiInterests
            );
            originalInterestIds = parseJsonString(userData.interests);
          } catch (error) {
            console.warn("Error parsing interests in profile:", error);
            parsedInterests = [];
            originalInterestIds = [];
          }
        }
        // Debug looking_for data

        let parsedLookingFor: string[] = [];
        let originalLookingForIds: string[] = [];

        if (userData.looking_for) {
          try {
            parsedLookingFor = parseLookingForWithLabels(
              userData.looking_for,
              t
            );
            originalLookingForIds = parseJsonString(userData.looking_for);
          } catch (error) {
            console.warn("Error parsing looking_for in profile:", error);
            parsedLookingFor = [];
            originalLookingForIds = [];
          }
        }

        // Handle nationality parsing more carefully
        let parsedNationality: string[] = [];
        let originalNationalityValues: string[] = [];

        if (userData.nationality) {
          // Check if it's a JSON string first
          if (
            userData.nationality.startsWith("[") &&
            userData.nationality.endsWith("]")
          ) {
            try {
              // Try to parse as JSON
              const parsed = parseJsonString(userData.nationality);
              if (Array.isArray(parsed) && parsed.length > 0) {
                originalNationalityValues = parsed;
                parsedNationality = parseNationalityWithLabels(
                  userData.nationality,
                  t
                );
              } else {
                // If parsing fails, try to extract values manually
                const matches = userData.nationality.match(/"([^"]+)"/g);
                if (matches) {
                  const values = matches.map((match: string) =>
                    match.replace(/"/g, "")
                  );
                  originalNationalityValues = values.filter(
                    (v) => v && v !== "Not Specified" && v.trim() !== ""
                  );
                  parsedNationality = convertNationalityValuesToLabels(
                    originalNationalityValues,
                    t
                  );
                }
              }
            } catch (error) {
              console.warn("Error parsing nationality JSON:", error);
              // Fallback to simple string handling
              if (
                typeof userData.nationality === "string" &&
                userData.nationality !== "Not Specified" &&
                userData.nationality.trim() !== ""
              ) {
                originalNationalityValues = [userData.nationality];
                parsedNationality = convertNationalityValuesToLabels(
                  [userData.nationality],
                  t
                );
              }
            }
          } else {
            // It's a simple string, not JSON
            if (
              userData.nationality !== "Not Specified" &&
              userData.nationality.trim() !== ""
            ) {
              originalNationalityValues = [userData.nationality];
              parsedNationality = convertNationalityValuesToLabels(
                [userData.nationality],
                t
              );
            }
          }
        }

        // Create data for local state (using types/userData.d.ts interface)
        const localUserData: any = {
          ...userData,
          images: userData.images, // Keep original format for local state
          age,
          photos, // This now contains full URLs
          parsedInterests,
          parsedLookingFor,
          originalLookingForIds,
          originalInterestIds,
          parsedNationality,
          originalNationalityValues,
          email: userData.email || "",
          gender: userData.gender || "",
          gender_interest: userData.gender_interest || "",
          country: userData.country || "",
          state: userData.state || "",
          city: userData.city || "",
          languages: userData.languages || "",
          height: userData.height !== "0" ? userData.height : "",
          nationality: userData.nationality || "",
          religion: userData.religion || "",
          zodiac: userData.zodiac || "",
          about: userData.about || "",
          phone: userData.phone || "",
          status: userData.status || "",
          // Include change dates from API
          name_change_date: (userData as any)?.name_change_date || "2025-11-01",
          dob_change_date: (userData as any)?.dob_change_date || "2025-11-01",
        };

        // Create data for context (using context/app_context.tsx interface)
        const contextUserData = {
          ...userData,
          images: userData.images ? [userData.images] : [], // Convert to array format expected by context
          looking_for: userData.looking_for
            ? parseJsonString(userData.looking_for)
            : [], // Convert to array
          radius: parseInt(userData.radius) || 100, // Convert string to number
          age,
          photos, // This now contains full URLs
          parsedInterests,
          parsedLookingFor,
          originalLookingForIds,
          originalInterestIds,
          parsedNationality,
          originalNationalityValues,
          email: userData.email || "",
          gender: userData.gender || "",
          gender_interest: userData.gender_interest || "",
          country: userData.country || "",
          state: userData.state || "",
          city: userData.city || "",
          languages: userData.languages || "",
          height: userData.height !== "0" ? userData.height : "",
          nationality: userData.nationality || "",
          religion: userData.religion || "",
          zodiac: userData.zodiac || "",
          about: userData.about || "",
          phone: userData.phone || "",
          status: userData.status || "",
          // Include change dates from API
          name_change_date: (userData as any)?.name_change_date || "2025-11-01",
          dob_change_date: (userData as any)?.dob_change_date || "2025-11-01",
        };

        setUserProfile(localUserData);
        updateUserData(contextUserData);
      } else {
        setError(t("hooks.noUserDataFound"));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(t("hooks.failedToFetchUserData"));
    } finally {
      setLoading(false);
    }
  }, [user?.user_id, apiInterests, t]);

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  return {
    userProfile,
    loading,
    error,
    refetch: getUserData,
  };
}
