import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import {
  calculateAge,
  parseInterestsWithNames,
  parseJsonString,
  parseLookingForWithLabels,
  parseNationalityWithLabels,
} from "@/utils/helper";
import { useEffect, useState } from "react";

export default function useGetProfile() {
  const { user, updateUserData } = useAppContext();
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const defaultPhoto =
    "https://img.freepik.com/vecteurs-libre/homme-affaires-caractere-avatar-isole_24877-60111.jpg?semt=ais_hybrid&w=740";

  const getUserData = async () => {
    if (!user?.user_id) {
      setError("User ID not available");
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
        const parsedInterests = userData.interests
          ? parseInterestsWithNames(userData.interests)
          : [];
        const originalInterestIds = userData.interests
          ? parseJsonString(userData.interests)
          : [];
        const parsedLookingFor = userData.looking_for
          ? parseLookingForWithLabels(userData.looking_for)
          : [];
        const originalLookingForIds = userData.looking_for
          ? parseJsonString(userData.looking_for)
          : [];
        const parsedNationality = userData.nationality
          ? parseNationalityWithLabels(userData.nationality)
          : [];
        const originalNationalityValues = userData.nationality
          ? parseJsonString(userData.nationality)
          : [];

        const { images, ...userDataWithoutImages } = userData;
        const extendedUserData = {
          ...userDataWithoutImages,
          age,
          photos, // This now contains full URLs
          parsedInterests,
          parsedLookingFor,
          originalLookingForIds,
          originalInterestIds,
          parsedNationality,
          originalNationalityValues,
          email: userData.email || "Not Specified",
          gender: userData.gender || "Not Specified",
          gender_interest: userData.gender_interest || "Not Specified",
          country: userData.country || "Not Specified",
          state: userData.state || "Not Specified",
          city: userData.city || "Not Specified",
          languages: userData.languages || "Not Specified",
          height: userData.height !== "0" ? userData.height : "0.0",
          nationality: userData.nationality || "Not Specified",
          religion: userData.religion || "Not Specified",
          zodiac: userData.zodiac || "Not Specified",
          about: userData.about || "Not Specified",
          phone: userData.phone || "Not Specified",
        };

        setUserProfile(extendedUserData);
        updateUserData(extendedUserData);
      } else {
        setError("No user data found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, [user?.user_id]);

  return {
    userProfile,
    loading,
    error,
    refetch: getUserData,
  };
}
