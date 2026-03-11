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
  
  const { rawInterests: apiInterests } = useGetInterests();
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const { user, updateUserData, userData: contextUserData } = useAppContext();
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const hasReparsedRef = useRef(false);  
  const defaultPhoto =
    "https://img.freepik.com/vecteurs-libre/homme-affaires-caractere-avatar-isole_24877-60111.jpg?semt=ais_hybrid&w=740";

  const getUserData = useCallback(async () => {
    if (!user?.user_id) {
      setError(t("hooks.userIdNotAvailable"));
      return;
    }

    setLoading(true);
    setError(null);

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
            const previousIds =
              currentContextData?.originalInterestIds ||
              userProfile?.originalInterestIds ||
              [];
            const previousParsedInterests =
              currentContextData?.parsedInterests ||
              userProfile?.parsedInterests ||
              [];

            // Check if IDs changed
            const idsChanged =
              JSON.stringify(previousIds.sort()) !==
              JSON.stringify(originalInterestIds.sort());

            // Only parse if we have API interests loaded
            if (apiInterests && apiInterests.length > 0) {
              // Always parse when API interests are available
              parsedInterests = parseInterestsWithNames(
                userData.interests,
                apiInterests,
                currentLanguage,
              );
              // Reset re-parse flag when we successfully parse interests
              hasReparsedRef.current = false;
            } else {
              // API interests not loaded yet - preserve previous parsedInterests if IDs haven't changed
              if (!idsChanged && previousParsedInterests.length > 0) {
                
                parsedInterests = previousParsedInterests;
              } else if (idsChanged) {
                
                parsedInterests = [];
                hasReparsedRef.current = false;
              } else {
                
                parsedInterests = [];
                hasReparsedRef.current = false;
              }
            }
          } catch (error) {
            
            const previousIds =
              currentContextData?.originalInterestIds ||
              userProfile?.originalInterestIds ||
              [];
            const previousParsedInterests =
              currentContextData?.parsedInterests ||
              userProfile?.parsedInterests ||
              [];
            const idsChanged =
              JSON.stringify(previousIds.sort()) !==
              JSON.stringify(originalInterestIds.sort());

            if (!idsChanged && previousParsedInterests.length > 0) {
              parsedInterests = previousParsedInterests;
              originalInterestIds = previousIds;
            } else {
              parsedInterests = [];
              originalInterestIds =
                originalInterestIds.length > 0
                  ? originalInterestIds
                  : previousIds;
            }
          }
        } else {
          
          parsedInterests = [];
          originalInterestIds = [];
        }

        let parsedLookingFor: string[] = [];
        let originalLookingForIds: string[] = [];

        if (userData.looking_for) {
          try {
            parsedLookingFor = parseLookingForWithLabels(
              userData.looking_for,
              t,
            );
            originalLookingForIds = parseJsonString(userData.looking_for);
          } catch (error) {
            parsedLookingFor = [];
            originalLookingForIds = [];
          }
        }

        let parsedNationality: string[] = [];
        let originalNationalityValues: string[] = [];

        if (userData.nationality) {
          
          if (
            userData.nationality.startsWith("[") &&
            userData.nationality.endsWith("]")
          ) {
            try {
              
              const parsed = parseJsonString(userData.nationality);
              if (Array.isArray(parsed) && parsed.length > 0) {
                originalNationalityValues = parsed;
                parsedNationality = parseNationalityWithLabels(
                  userData.nationality,
                  t,
                );
              } else {
                
                const matches = userData.nationality.match(/"([^"]+)"/g);
                if (matches) {
                  const values = matches.map((match: string) =>
                    match.replace(/"/g, ""),
                  );
                  originalNationalityValues = values.filter(
                    (v) => v && v !== "Not Specified" && v.trim() !== "",
                  );
                  parsedNationality = convertNationalityValuesToLabels(
                    originalNationalityValues,
                    t,
                  );
                }
              }
            } catch (error) {
              
              if (
                typeof userData.nationality === "string" &&
                userData.nationality !== "Not Specified" &&
                userData.nationality.trim() !== ""
              ) {
                originalNationalityValues = [userData.nationality];
                parsedNationality = convertNationalityValuesToLabels(
                  [userData.nationality],
                  t,
                );
              }
            }
          } else {
            
            if (
              userData.nationality !== "Not Specified" &&
              userData.nationality.trim() !== ""
            ) {
              originalNationalityValues = [userData.nationality];
              parsedNationality = convertNationalityValuesToLabels(
                [userData.nationality],
                t,
              );
            }
          }
        }

        const profileId =
          userData.id ?? (userData as any).user_id ?? user?.user_id ?? "";
        const localUserData: any = {
          ...userData,
          id: profileId,  
          images: userData.images,  
          age,
          photos,  
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
          
          name_change_date: (userData as any)?.name_change_date || "2025-11-01",
          dob_change_date: (userData as any)?.dob_change_date || "2025-11-01",
        };

        const contextUserData = {
          ...userData,
          id: profileId,  
          images: userData.images ? [userData.images] : [],  
          looking_for: userData.looking_for
            ? parseJsonString(userData.looking_for)
            : [],  
          radius: parseInt(userData.radius) || 100,  
          age,
          photos,  
          parsedInterests:
            parsedInterests.length > 0
              ? parsedInterests
              : currentContextData?.parsedInterests &&
                  currentContextData.originalInterestIds &&
                  JSON.stringify(
                    currentContextData.originalInterestIds.sort(),
                  ) === JSON.stringify(originalInterestIds.sort())
                ? currentContextData.parsedInterests
                : [],
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
          
          name_change_date: (userData as any)?.name_change_date || "2025-11-01",
          dob_change_date: (userData as any)?.dob_change_date || "2025-11-01",
        };

        setUserProfile(localUserData);
        updateUserData(contextUserData);
      } else {
        setError(t("hooks.noUserDataFound"));
      }
    } catch (error) {
      setError(t("hooks.failedToFetchUserData"));
    } finally {
      setLoading(false);
    }
  }, [user?.user_id, apiInterests, t, i18n.language]);

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  useEffect(() => {
    
    const needsReparse =
      apiInterests &&
      apiInterests.length > 0 &&
      (userProfile?.originalInterestIds?.length > 0 ||
        contextUserData?.originalInterestIds?.length > 0) &&
      (!userProfile?.parsedInterests ||
        userProfile.parsedInterests.length === 0) &&
      (!contextUserData?.parsedInterests ||
        contextUserData.parsedInterests.length === 0);

    if (needsReparse && !hasReparsedRef.current) {
      hasReparsedRef.current = true;  
      
      setTimeout(() => {
        getUserData();
        
        setTimeout(() => {
          hasReparsedRef.current = false;
        }, 2000);
      }, 100);
    }
  }, [
    apiInterests?.length,
    userProfile?.originalInterestIds?.length,
    contextUserData?.originalInterestIds?.length,
    getUserData,
  ]);

  return {
    userProfile,
    loading,
    error,
    refetch: getUserData,
  };
}
