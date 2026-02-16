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

/**
 * Fetches another user's profile for the user_profile screen.
 * API: type: get_data, table_name: users, id: (profile user id), user_id: (logged-in user id)
 */
export default function useGetUserProfile(profileUserId: string | undefined) {
  const { rawInterests: apiInterests } = useGetInterests();
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasReparsedRef = useRef(false);
  const defaultPhoto =
    "https://img.freepik.com/vecteurs-libre/homme-affaires-caractere-avatar-isole_24877-60111.jpg?semt=ais_hybrid&w=740";

  const fetchUserProfile = useCallback(async () => {
    if (!profileUserId) {
      setError(t("hooks.userIdNotAvailable"));
      return;
    }
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
      formData.append("id", profileUserId);
      formData.append("user_id", user.user_id);
      const response = await apiCall(formData);
      if (response?.data && response.data.length > 0) {
        const userData = response.data[0];
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
                const cleanFilename = (filename || "").replace(/\\/g, "");
                return `${baseImageUrl}${cleanFilename}`;
              });
            } else {
              photos = [defaultPhoto];
            }
          } catch {
            photos = [defaultPhoto];
          }
        } else {
          photos = [defaultPhoto];
        }

        const age = calculateAge(userData.dob);

        let parsedInterests: string[] = [];
        let originalInterestIds: string[] = [];
        if (userData.interests) {
          try {
            originalInterestIds = parseJsonString(userData.interests);
            if (apiInterests && apiInterests.length > 0) {
              parsedInterests = parseInterestsWithNames(
                userData.interests,
                apiInterests,
                i18n.language || "en",
              );
            }
          } catch {
            parsedInterests = [];
          }
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
          } catch {
            parsedLookingFor = [];
            originalLookingForIds = [];
          }
        }

        let parsedNationality: string[] = [];
        let originalNationalityValues: string[] = [];
        if (userData.nationality) {
          try {
            if (
              typeof userData.nationality === "string" &&
              userData.nationality.startsWith("[") &&
              userData.nationality.endsWith("]")
            ) {
              const parsed = parseJsonString(userData.nationality);
              if (Array.isArray(parsed) && parsed.length > 0) {
                originalNationalityValues = parsed;
                parsedNationality = parseNationalityWithLabels(
                  userData.nationality,
                  t,
                );
              }
            } else if (
              userData.nationality !== "Not Specified" &&
              String(userData.nationality).trim() !== ""
            ) {
              originalNationalityValues = [userData.nationality];
              parsedNationality = convertNationalityValuesToLabels(
                [userData.nationality],
                t,
              );
            }
          } catch {
            parsedNationality = [];
            originalNationalityValues = [];
          }
        }

        const match_status =
          userData.match_status || (userData as any).match_staus || "";
        const match_emoji = (userData as any).match_emoji ?? "";

        const profile = {
          ...userData,
          id: userData.id || profileUserId,
          age,
          photos,
          images: userData.images,
          parsedInterests,
          originalInterestIds,
          parsedLookingFor,
          originalLookingForIds,
          parsedNationality,
          originalNationalityValues,
          email: userData.email || "",
          gender: userData.gender || "",
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
          match_emoji,
          match_status,
        };

        setUserProfile(profile);
      } else {
        setError(t("hooks.noUserDataFound"));
      }
    } catch {
      setError(t("hooks.failedToFetchUserData"));
    } finally {
      setLoading(false);
    }
  }, [profileUserId, user?.user_id, apiInterests, t, i18n.language]);

  useEffect(() => {
    if (profileUserId && user?.user_id) {
      fetchUserProfile();
    }
  }, [fetchUserProfile, profileUserId, user?.user_id]);

  useEffect(() => {
    const needsReparse =
      apiInterests &&
      apiInterests.length > 0 &&
      userProfile?.originalInterestIds?.length > 0 &&
      (!userProfile?.parsedInterests ||
        userProfile.parsedInterests.length === 0);
    if (needsReparse && !hasReparsedRef.current) {
      hasReparsedRef.current = true;
      setTimeout(() => {
        fetchUserProfile();
        setTimeout(() => {
          hasReparsedRef.current = false;
        }, 2000);
      }, 100);
    }
  }, [
    apiInterests?.length,
    userProfile?.originalInterestIds?.length,
    fetchUserProfile,
  ]);

  return {
    userProfile,
    loading,
    error,
    refetch: fetchUserProfile,
  };
}
