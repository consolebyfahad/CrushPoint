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
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function useGetProfile() {
  // Get interests from API for interest name conversion
  const { rawInterests: apiInterests } = useGetInterests();
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const { user, updateUserData, userData: contextUserData } = useAppContext();
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const hasReparsedRef = useRef(false); // Track if we've already re-parsed interests
  const defaultPhoto =
    "https://img.freepik.com/vecteurs-libre/homme-affaires-caractere-avatar-isole_24877-60111.jpg?semt=ais_hybrid&w=740";

  const getUserData = useCallback(async () => {
    if (!user?.user_id) {
      setError(t("hooks.userIdNotAvailable"));
      return;
    }

    setLoading(true);
    setError(null);

    // Capture contextUserData at the start of the callback to avoid linter issues
    const currentContextData = contextUserData;

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
            originalInterestIds = parseJsonString(userData.interests);
            const currentLanguage = i18n.language || "en";
            
            // Get previous data from context (most reliable source)
            const previousIds = currentContextData?.originalInterestIds || userProfile?.originalInterestIds || [];
            const previousParsedInterests = currentContextData?.parsedInterests || userProfile?.parsedInterests || [];
            
            // Check if IDs changed
            const idsChanged = JSON.stringify(previousIds.sort()) !== JSON.stringify(originalInterestIds.sort());
            
            // Only parse if we have API interests loaded
            if (apiInterests && apiInterests.length > 0) {
              // Always parse when API interests are available
              parsedInterests = parseInterestsWithNames(
                userData.interests,
                apiInterests,
                currentLanguage
              );
              // Reset re-parse flag when we successfully parse interests
              hasReparsedRef.current = false;
            } else {
              // API interests not loaded yet - preserve previous parsedInterests if IDs haven't changed
              if (!idsChanged && previousParsedInterests.length > 0) {
                // IDs are the same, safe to keep previous parsedInterests
                parsedInterests = previousParsedInterests;
                console.log("Preserving parsedInterests from context (API interests not loaded yet)");
              } else if (idsChanged) {
                // IDs changed, clear parsedInterests and reset flag to allow re-parsing when API interests load
                parsedInterests = [];
                hasReparsedRef.current = false;
                console.log("IDs changed, clearing parsedInterests (will re-parse when API interests load)");
              } else {
                // No previous data, clear parsedInterests
                parsedInterests = [];
                hasReparsedRef.current = false;
                console.log("No previous parsedInterests, clearing (will re-parse when API interests load)");
              }
            }
          } catch (error) {
            console.warn("Error parsing interests in profile:", error);
            // On error, preserve previous parsedInterests if IDs haven't changed
            const previousIds = currentContextData?.originalInterestIds || userProfile?.originalInterestIds || [];
            const previousParsedInterests = currentContextData?.parsedInterests || userProfile?.parsedInterests || [];
            const idsChanged = JSON.stringify(previousIds.sort()) !== JSON.stringify(originalInterestIds.sort());
            
            if (!idsChanged && previousParsedInterests.length > 0) {
              parsedInterests = previousParsedInterests;
              originalInterestIds = previousIds;
            } else {
              parsedInterests = [];
              originalInterestIds = originalInterestIds.length > 0 ? originalInterestIds : previousIds;
            }
          }
        } else {
          // No interests in userData - clear everything
          parsedInterests = [];
          originalInterestIds = [];
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
          parsedInterests: parsedInterests.length > 0 
            ? parsedInterests 
            : (currentContextData?.parsedInterests && 
               currentContextData.originalInterestIds &&
               JSON.stringify(currentContextData.originalInterestIds.sort()) === JSON.stringify(originalInterestIds.sort())
               ? currentContextData.parsedInterests 
               : []),
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
  }, [user?.user_id, apiInterests, t, i18n.language]);

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  // Re-parse interests when apiInterests become available after they were missing
  // Only trigger when apiInterests change from empty to non-empty AND we have unparsed interests
  useEffect(() => {
    // Check if we need to re-parse: API interests are loaded, we have interest IDs, but no parsed interests
    const needsReparse = 
      apiInterests &&
      apiInterests.length > 0 &&
      (userProfile?.originalInterestIds?.length > 0 || contextUserData?.originalInterestIds?.length > 0) &&
      (!userProfile?.parsedInterests || userProfile.parsedInterests.length === 0) &&
      (!contextUserData?.parsedInterests || contextUserData.parsedInterests.length === 0);
    
    if (needsReparse && !hasReparsedRef.current) {
      console.log("Re-parsing interests now that API interests are loaded");
      hasReparsedRef.current = true; // Mark as re-parsed to prevent loop
      // Use a timeout to avoid calling during render
      setTimeout(() => {
        getUserData();
        // Reset flag after a delay to allow re-parsing if interests change again
        setTimeout(() => {
          hasReparsedRef.current = false;
        }, 2000);
      }, 100);
    }
  }, [apiInterests?.length, userProfile?.originalInterestIds?.length, contextUserData?.originalInterestIds?.length, getUserData]);

  return {
    userProfile,
    loading,
    error,
    refetch: getUserData,
  };
}
