import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import {
  calculateAge,
  parseInterestsWithNames,
  parseLookingForWithLabels,
  parseNationalityWithLabels,
  parseUserImages,
} from "@/utils/helper";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

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
  match_staus: string;
  match_emoji: string;
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
  nationality: string[];
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
  match_status: string;
  match_emoji: string;
  loc: LocationData | null;
  // Add direct lat/lng properties for map display
  lat: string;
  lng: string;
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

export default function useGetUsers(filters: UserFilters = {}) {
  const { user } = useAppContext();
  const { t } = useTranslation();
  const [users, setUsers] = useState<TransformedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const filtersString = useMemo(() => JSON.stringify(filters), [filters]);

  // Convert translated gender values back to English API values
  const normalizeGenderToEnglish = (gender: string): string => {
    if (!gender) return "";

    const normalized = gender.toLowerCase().trim();

    // Map common translations back to English
    const genderMap: { [key: string]: string } = {
      // English
      both: "Both",
      men: "Men",
      male: "Men",
      women: "Women",
      female: "Women",
      // German
      beide: "Both",
      männer: "Men",
      frauen: "Women",
      // Add other languages as needed
    };

    // Check exact match first
    if (genderMap[normalized]) {
      return genderMap[normalized];
    }

    // Check if it contains any of the map keys
    for (const [key, value] of Object.entries(genderMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }

    // Default to Both if we can't determine
    return "Both";
  };

  const fetchUsers = async (): Promise<void> => {
    if (!user?.user_id) {
      setError(t("users.userIdNotAvailable"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Log the incoming filters
      console.log("🔍 Filters received:", JSON.stringify(filters, null, 2));

      const formData = new FormData();
      formData.append("type", "get_map_users");
      formData.append("user_id", user.user_id);

      const payload: any = {
        type: "get_map_users",
        user_id: user.user_id,
      };

      // Normalize gender to English before sending
      if (filters.gender) {
        const normalizedGender = normalizeGenderToEnglish(filters.gender);
        // Always send normalized gender to API (Both means show both genders)
        formData.append("gender", normalizedGender);
        payload.gender = normalizedGender;
      }
      if (filters.ageFrom) {
        formData.append("age_from", filters.ageFrom);
        payload.age_from = filters.ageFrom;
      }
      if (filters.ageTo) {
        formData.append("age_to", filters.ageTo);
        payload.age_to = filters.ageTo;
      }
      if (filters.distance) {
        formData.append("distance", filters.distance.toString());
        payload.distance = filters.distance.toString();
      }
      if (filters.lookingFor) {
        formData.append("looking_for", filters.lookingFor);
        payload.looking_for = filters.lookingFor;
      }
      if (filters.height) {
        formData.append("height_from", filters.height.from || "");
        formData.append("height_to", filters.height.to || "");
        payload.height_from = filters.height.from || "";
        payload.height_to = filters.height.to || "";
      }
      if (filters.nationality) {
        formData.append("nationality", filters.nationality);
        payload.nationality = filters.nationality;
      }
      if (filters.religion) {
        formData.append("religion", filters.religion);
        payload.religion = filters.religion;
      }
      if (filters.zodiacSign) {
        formData.append("zodiac", filters.zodiacSign);
        payload.zodiac = filters.zodiacSign;
      }

      // Log the payload being sent
      console.log("📤 API Payload:", JSON.stringify(payload, null, 2));

      const response: ApiResponse = await apiCall(formData);
      if (response.result && response.data && Array.isArray(response.data)) {
        const transformedUsers: TransformedUser[] = response.data
          .map((userData: ApiUserData) => {
            try {
              return transformUser(userData);
            } catch (transformError) {
              console.warn(
                `${t("hooks.failedToTransformUser")} ${
                  userData?.id || "unknown"
                }:`,
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
          setError(t("users.noUsersFoundInArea"));
        }
      } else {
        setError(t("users.noUsersFoundOrServerError"));
      }
    } catch (err: any) {
      const errorMessage = err.message || t("users.networkError");
      setError(errorMessage);
      console.error("Fetch Users Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Safe transformation function with comprehensive error handling
  const transformUser = (userData: ApiUserData): TransformedUser => {
    if (!userData || !userData.id) {
      throw new Error(t("hooks.invalidUserData"));
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
      match_status: safeString(userData.match_staus),
      match_emoji: safeString(userData.match_emoji),
      // Fixed: Use proper parsing functions for interests and looking_for with translation
      interests: parseUserInterests(userData.interests, t),
      lookingFor: parseUserLookingFor(userData.looking_for, t),
      religion: safeString(userData.religion),
      zodiac: safeString(userData.zodiac),
      nationality: parseUserNationality(userData.nationality, t),
      about: safeString(userData.about),
      dob: safeString(userData.dob),
      actualLocation: parseActualLocation(userData.loc),
      privateSpot: parsePrivateSpot(
        userData.lat,
        userData.lng,
        userData.radius
      ),
      loc: userData.loc,
      // Add direct lat/lng properties for map display
      lat: userData.lat,
      lng: userData.lng,
    };
  };

  // Fixed: Parse interests using the same utility function as profile
  const parseUserInterests = (
    interestsStr: string,
    t?: (key: string) => string
  ): string[] => {
    try {
      if (!interestsStr) return [];

      // Use the same utility function that works in profile
      const parsedInterests = parseInterestsWithNames(interestsStr, t);
      return Array.isArray(parsedInterests) ? parsedInterests : [];
    } catch (error) {
      console.warn("Error parsing user interests:", error);
      return [];
    }
  };

  // Fixed: Parse looking_for using the same utility function as profile
  const parseUserLookingFor = (
    lookingForStr: string,
    t?: (key: string) => string
  ): string[] => {
    try {
      if (!lookingForStr) return [];

      // Use the same utility function that works in profile
      const parsedLookingFor = parseLookingForWithLabels(lookingForStr, t);
      return Array.isArray(parsedLookingFor) ? parsedLookingFor : [];
    } catch (error) {
      console.warn("Error parsing user looking_for:", error);
      return [];
    }
  };

  // Parse nationality using the same utility function as profile
  const parseUserNationality = (
    nationalityStr: string,
    t?: (key: string) => string
  ): string[] => {
    try {
      if (!nationalityStr) return [];

      // Use the same utility function that works in profile
      const parsedNationality = parseNationalityWithLabels(nationalityStr, t);
      return Array.isArray(parsedNationality) ? parsedNationality : [];
    } catch (error) {
      console.warn("Error parsing user nationality:", error);
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
