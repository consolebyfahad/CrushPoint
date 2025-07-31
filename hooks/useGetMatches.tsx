import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import {
  calculateAge,
  formatTimeAgo,
  parseInterestsWithNames,
  parseLookingForWithLabels,
} from "@/utils/helper";
import { useEffect, useState } from "react";

interface MatchUser {
  id: string;
  name: string;
  age: number;
  distance: string;
  timeAgo: string;
  isOnline: boolean;
  isVerified: boolean;
  image: string;
  images: string[];
  emoji: string;
  status: string;
  match_id: string;
  user_id: string;
  // Profile fields for user profile navigation
  about: string;
  height: string;
  nationality: string;
  religion: string;
  zodiac: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  languages: string[];
  interests: string[];
  lookingFor: string[];
  phone: string;
  dob: string;
  actualLocation: {
    lat: number;
    lng: number;
  };
}

const IMAGE_BASE_URL = "https://7tracking.com/crushpoint/images/";

const useGetMatches = () => {
  const { user } = useAppContext();
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Parse images similar to useGetUsers
  const parseImages = (
    imagesStr: string,
    gender: string,
    imageUrl?: string
  ): string[] => {
    if (!imagesStr) {
      return [getDefaultImage(gender)];
    }

    try {
      // Handle double-escaped JSON string
      const cleanedImagesString = imagesStr
        .replace(/\\\\/g, "\\")
        .replace(/\\\"/g, '"');
      const imageFilenames = JSON.parse(cleanedImagesString);
      const baseImageUrl = imageUrl || IMAGE_BASE_URL;

      if (Array.isArray(imageFilenames) && imageFilenames.length > 0) {
        const validImages = imageFilenames
          .filter((filename) => filename && typeof filename === "string")
          .map((filename) => {
            const cleanFilename = filename.replace(/\\/g, "");
            return `${baseImageUrl}${cleanFilename}`;
          });

        return validImages.length > 0 ? validImages : [getDefaultImage(gender)];
      } else {
        return [getDefaultImage(gender)];
      }
    } catch (error) {
      console.warn("Error parsing images:", error);
      return [getDefaultImage(gender)];
    }
  };

  // Get default image based on gender
  const getDefaultImage = (gender: string): string => {
    const normalizedGender = (gender || "").toLowerCase();
    if (normalizedGender === "female" || normalizedGender === "f") {
      return "https://i.pinimg.com/736x/8c/1f/82/8c1f82be3fbc9276db0c6431eee2aadd.jpg";
    } else if (normalizedGender === "male" || normalizedGender === "m") {
      return "https://i.pinimg.com/736x/30/1c/30/301c3029c36d70b518325f803bba8f09.jpg";
    } else {
      return "https://i.pinimg.com/736x/8c/1f/82/8c1f82be3fbc9276db0c6431eee2aadd.jpg";
    }
  };

  // Parse interests using the same utility function as profile
  const parseUserInterests = (interestsStr: string): string[] => {
    try {
      if (!interestsStr) return [];
      const parsedInterests = parseInterestsWithNames(interestsStr);
      return Array.isArray(parsedInterests) ? parsedInterests : [];
    } catch (error) {
      console.warn("Error parsing user interests:", error);
      return [];
    }
  };

  // Parse looking_for using the same utility function as profile
  const parseUserLookingFor = (lookingForStr: string): string[] => {
    try {
      if (!lookingForStr) return [];
      const parsedLookingFor = parseLookingForWithLabels(lookingForStr);
      return Array.isArray(parsedLookingFor) ? parsedLookingFor : [];
    } catch (error) {
      console.warn("Error parsing user looking_for:", error);
      return [];
    }
  };

  const loadData = async () => {
    if (!user?.user_id) {
      setError("User ID not available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "matches");
      formData.append("user_id", user.user_id);
      console.log("formData", formData);
      const response = await apiCall(formData);

      if (Array.isArray(response?.data)) {
        const formattedMatches = response.data
          .filter((match: any) => match.match_id !== "0" && match.match)
          .map((match: any) => {
            const matchUser = match.match;
            const age = calculateAge(matchUser.dob) || 25;
            const gender = matchUser.gender || "unknown";
            const images = parseImages(
              matchUser.images,
              gender,
              match.image_url
            );

            // Parse languages
            const languages = matchUser.languages
              ? matchUser.languages
                  .split(",")
                  .map((lang: string) => lang.trim())
              : [];

            return {
              // Match-specific data
              id: match.id,
              match_id: match.match_id,
              user_id: match.user_id,
              emoji: match.emoji,
              status: match.status,
              timeAgo: formatTimeAgo(match.date, match.time),
              distance: match.distance ? `${match.distance} km` : "2.5 km",

              // User profile data
              name: matchUser.name || `User ${match.match_id}`,
              age,
              isOnline: matchUser.status === "1",
              isVerified: Math.random() > 0.3,
              image: images[0],
              images,

              about:
                matchUser.about ||
                "This user prefers to keep their bio private.",
              height:
                matchUser.height && matchUser.height !== "0"
                  ? `${matchUser.height} cm`
                  : "Not specified",
              nationality: matchUser.nationality || "Not specified",
              religion: matchUser.religion || "Not specified",
              zodiac: matchUser.zodiac || "Not specified",
              gender: matchUser.gender || "Not specified",
              country: matchUser.country || "Not specified",
              state: matchUser.state || "Not specified",
              city: matchUser.city || "Not specified",
              languages,
              interests: parseUserInterests(matchUser.interests),
              lookingFor: parseUserLookingFor(matchUser.looking_for),
              phone: matchUser.phone || "",
              dob: matchUser.dob || "",
              actualLocation: {
                lat: parseFloat(matchUser.lat) || 0,
                lng: parseFloat(matchUser.lng) || 0,
              },
            };
          });

        setMatches(formattedMatches);

        if (formattedMatches.length === 0) {
          setError("No matches found yet. Keep swiping!");
        }
      } else if (response?.status === "Error") {
        setError(response.message || "Failed to load matches");
      } else {
        setMatches([]);
        setError("No matches found yet. Keep swiping!");
      }
    } catch (error: any) {
      const errorMessage =
        error.message ||
        "Network error occurred. Please check your connection.";
      setError(errorMessage);
      console.error("Fetch matches error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Remove match from local state
  const removeMatch = (matchId: string) => {
    setMatches((prevMatches) =>
      prevMatches.filter((match: MatchUser) => match.id !== matchId)
    );
  };

  // Update match status
  const updateMatchStatus = (matchId: string, newStatus: string) => {
    setMatches((prevMatches) =>
      prevMatches.map((match: MatchUser) =>
        match.id === matchId ? { ...match, status: newStatus } : match
      )
    );
  };

  useEffect(() => {
    if (user?.user_id) {
      loadData();
    }
  }, [user?.user_id]);

  return {
    loading,
    matches,
    error,
    refetch: loadData,
    removeMatch,
    updateMatchStatus,
  };
};

export default useGetMatches;
