import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import {
  calculateAge,
  parseInterestsWithNames,
  parseLookingForWithLabels,
  parseUserImages
} from "@/utils/helper";
import { useEffect, useState } from "react";

interface LocationData {
  id: string;
  user_id: string;
  lat: string;
  lng: string;
  timestamp: string;
}

interface ApiUserData {
  id: string;
  email: string;
  password: string;
  name: string;
  dob: string;
  images: string;
  phone: string;
  gender: string;
  gender_interest: string;
  lat: string;
  lng: string;
  country: string;
  state: string;
  city: string;
  status: string;
  languages: string;
  interests: string;
  looking_for: string;
  radius: string;
  height: string;
  nationality: string;
  religion: string;
  zodiac: string;
  about: string;
  social_token: string;
  notification_settings: string;
  timestamp: string;
  loc: LocationData | null;
}

interface TransformedUser {
  id: string;
  name: string;
  age: number;
  isOnline: boolean;
  images: string[];
  height: string;
  gender: string;
  genderInterest: string;
  country: string;
  state: string;
  city: string;
  phone: string;
  languages: string;
  interests: string[];
  lookingFor: string[];
  religion: string;
  zodiac: string;
  nationality: string;
  about: string;
  actualLocation: {
    lat: number;
    lng: number;
  };
  privateSpot: {
    lat: number;
    lng: number;
    radius: number;
  };
  dob: string;
  loc: LocationData | null;
}

interface ApiResponse {
  result: boolean;
  data: ApiUserData[];
}
interface UserFilters {
  gender?: string;
  ageFrom?: string;
  ageTo?: string;
  distance?: number;
  lookingFor?: string;
  height?: { from?: string; to?: string };
  nationality?: string;
  religion?: string;
  zodiacSign?: string;
}

const IMAGE_BASE_URL = "https://7tracking.com/crushpoint/images/";

export default function useGetUsers(filters: UserFilters = {}) {
  const { user } = useAppContext();
  const [users, setUsers] = useState<TransformedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const filtersString = JSON.stringify(filters);
  console.log("filters", filters);
  console.log("filtersString", filtersString);
  const fetchUsers = async (): Promise<void> => {
    if (!user?.user_id) {
      setError("User ID not available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("type", "get_map_users");
      formData.append("id", user.user_id);

      if (filters.gender && filters.gender !== "Both") {
        formData.append("gender", filters.gender);
      }
      if (filters.ageFrom) {
        formData.append("age_from", filters.ageFrom);
      }
      if (filters.ageTo) {
        formData.append("age_to", filters.ageTo);
      }
      if (filters.distance) {
        formData.append("distance", filters.distance.toString());
      }
      if (filters.lookingFor) {
        formData.append("looking_for", filters.lookingFor);
      }
      if (filters.height) {
        formData.append("height_from", filters.height.from || "");
        formData.append("height_to", filters.height.to || "");
      }
      if (filters.nationality) {
        formData.append("nationality", filters.nationality);
      }
      if (filters.religion) {
        formData.append("religion", filters.religion);
      }
      if (filters.zodiacSign) {
        formData.append("zodiac", filters.zodiacSign);
      }
      console.log("formData filter", formData);
      const response: ApiResponse = await apiCall(formData);

      if (response.result && response.data && Array.isArray(response.data)) {
        const transformedUsers: TransformedUser[] = response.data
          .map((userData: ApiUserData) => {
            try {
              return transformUser(userData);
            } catch (transformError) {
              console.warn(
                `Failed to transform user ${userData?.id || "unknown"}:`,
                transformError
              );
              return null;
            }
          })
          .filter((user): user is TransformedUser => user !== null);

        setUsers(transformedUsers);

        // Clear error if successful
        if (transformedUsers.length > 0) {
          setError(null);
        } else if (transformedUsers.length === 0) {
          setError("No users found in your area");
        }
      } else {
        setError("No users found or server error occurred");
      }
    } catch (err: any) {
      const errorMessage =
        err.message || "Network error occurred. Please check your connection.";
      setError(errorMessage);
      console.error("Fetch Users Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Safe transformation function with comprehensive error handling
  const transformUser = (userData: ApiUserData): TransformedUser => {
    if (!userData || !userData.id) {
      throw new Error("Invalid user data: missing required fields");
    }

    const gender = safeString(userData.gender);

    return {
      id: safeString(userData.id),
      name: safeString(userData.name) || "Unknown",
      age: calculateAge(userData.dob) || 25,
      isOnline: safeString(userData.status) === "1",
      images: parseImages(userData.images, gender),
      height: formatHeight(userData.height),
      gender: gender,
      genderInterest: safeString(userData.gender_interest),
      country: safeString(userData.country),
      state: safeString(userData.state),
      city: safeString(userData.city),
      phone: safeString(userData.phone),
      languages: safeString(userData.languages),
      // Fixed: Use proper parsing functions for interests and looking_for
      interests: parseUserInterests(userData.interests),
      lookingFor: parseUserLookingFor(userData.looking_for),
      religion: safeString(userData.religion),
      zodiac: safeString(userData.zodiac),
      nationality: safeString(userData.nationality),
      about: safeString(userData.about),
      dob: safeString(userData.dob),
      actualLocation: parseActualLocation(userData.loc),
      privateSpot: parsePrivateSpot(
        userData.lat,
        userData.lng,
        userData.radius
      ),
      loc: userData.loc,
    };
  };

  // Fixed: Parse interests using the same utility function as profile
  const parseUserInterests = (interestsStr: string): string[] => {
    try {
      if (!interestsStr) return [];

      // Use the same utility function that works in profile
      const parsedInterests = parseInterestsWithNames(interestsStr);
      return Array.isArray(parsedInterests) ? parsedInterests : [];
    } catch (error) {
      console.warn("Error parsing user interests:", error);
      return [];
    }
  };

  // Fixed: Parse looking_for using the same utility function as profile
  const parseUserLookingFor = (lookingForStr: string): string[] => {
    try {
      if (!lookingForStr) return [];

      // Use the same utility function that works in profile
      const parsedLookingFor = parseLookingForWithLabels(lookingForStr);
      return Array.isArray(parsedLookingFor) ? parsedLookingFor : [];
    } catch (error) {
      console.warn("Error parsing user looking_for:", error);
      return [];
    }
  };

  const safeString = (value: any): string => {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  };

  const parseActualLocation = (
    loc: LocationData | null
  ): { lat: number; lng: number } => {
    const defaultLocation = { lat: 0, lng: 0 };

    if (!loc || typeof loc !== "object") {
      return defaultLocation;
    }

    const lat = parseFloat(safeString(loc.lat));
    const lng = parseFloat(safeString(loc.lng));

    if (isNaN(lat) || isNaN(lng)) {
      return defaultLocation;
    }

    return { lat, lng };
  };

  const parsePrivateSpot = (
    lat: string,
    lng: string,
    radius: string
  ): { lat: number; lng: number; radius: number } => {
    const defaultSpot = { lat: 0, lng: 0, radius: 1000 };

    const parsedLat = parseFloat(safeString(lat));
    const parsedLng = parseFloat(safeString(lng));
    const parsedRadius = parseInt(safeString(radius));

    return {
      lat: isNaN(parsedLat) ? defaultSpot.lat : parsedLat,
      lng: isNaN(parsedLng) ? defaultSpot.lng : parsedLng,
      radius:
        isNaN(parsedRadius) || parsedRadius <= 0
          ? defaultSpot.radius
          : parsedRadius,
    };
  };

  const formatHeight = (height: string): string => {
    const heightStr = safeString(height);
    if (!heightStr || heightStr === "0") {
      return "";
    }

    const heightNum = parseFloat(heightStr);
    if (isNaN(heightNum)) {
      return "";
    }

    return `${heightNum} cm`;
  };

  const unescapeJsonString = (str: string): string => {
    if (!str) return str;
    return str.replace(/\\"/g, '"');
  };

  // Use the enhanced parseUserImages function from helper
  const parseImages = (imagesStr: string, gender: string): string[] => {
    return parseUserImages(imagesStr, gender);
  };

  // Using calculateAge from helper.ts

  // Using getDefaultImage from helper.ts

  useEffect(() => {
    if (user?.user_id) {
      fetchUsers();
    }
  }, [user?.user_id, filtersString]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
}
