import { useAppContext } from "@/context/app_context";
import useGetInterests from "@/hooks/useGetInterests";
import { apiCall } from "@/utils/api";
import {
  calculateAge,
  parseInterestsWithNames,
  parseJsonString,
  parseNationalityWithLabels,
  parseUserImages
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
  private_spots?: Array<{
    lat: string | number;
    lng: string | number;
    radius: string | number;
  }>; // Optional: private spots array
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
  private_spots?: Array<{
    lat: number | string;
    lng: number | string;
    radius: number | string;
  }>; // Array of private spots
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
  lookingFor?: string | string[]; // Accept both string and array
  height?: { from?: string; to?: string };
  nationality?: string | string[]; // Accept both string and array
  religion?: string | string[]; // Accept both string and array
  zodiacSign?: string | string[]; // Accept both string and array
}

export default function useGetUsers(filters: UserFilters = {}) {
  // Get interests from API for interest name conversion
  const { rawInterests: apiInterests } = useGetInterests();
  const { user, userData } = useAppContext();
  const { t, i18n } = useTranslation();
  const [rawUserData, setRawUserData] = useState<ApiUserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const filtersString = useMemo(() => JSON.stringify(filters), [filters]);

  // Convert translated gender values to backend API values (male/female/both)
  const normalizeGenderToEnglish = (gender: string): string => {
    if (!gender) return "";

    const normalized = gender.toLowerCase().trim();

    // Map UI values to backend API values
    const genderMap: { [key: string]: string } = {
      // English UI values
      both: "both",
      men: "male",
      male: "male",
      women: "female",
      female: "female",
      // German UI values
      beide: "both",
      männer: "male",
      frauen: "female",
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

    // Default to both if we can't determine
    return "both";
  };

  // Normalize looking_for values to English IDs
  const normalizeLookingForToEnglish = (
    lookingFor: string | string[]
  ): string => {
    if (!lookingFor) return "";

    // If it's already an array of IDs, join them
    if (Array.isArray(lookingFor)) {
      // Return empty string for empty array
      if (lookingFor.length === 0) return "";

      // Check if first element is already an ID (not translated)
      const validIds = [
        "serious",
        "casual",
        "friendship",
        "open",
        "prefer-not",
      ];
      if (
        lookingFor.length > 0 &&
        validIds.includes(lookingFor[0].toLowerCase())
      ) {
        return lookingFor.join(",");
      }

      // Otherwise, it might be translated values - normalize each
      return lookingFor
        .map((item) => {
          const normalized = item.toLowerCase().trim();
          const lookingForMap: { [key: string]: string } = {
            // English
            serious: "serious",
            "serious relationship": "serious",
            casual: "casual",
            "casual dating": "casual",
            friendship: "friendship",
            open: "open",
            "open to possibilities": "open",
            "prefer-not": "prefer-not",
            "prefer not to say": "prefer-not",
            // German
            "ernsthafte beziehung": "serious",
            "lockeres dating": "casual",
            freundschaft: "friendship",
            "offen für möglichkeiten": "open",
            "möchte ich nicht sagen": "prefer-not",
          };
          return lookingForMap[normalized] || item;
        })
        .join(",");
    }

    // If it's a string, return as is (should already be IDs)
    return lookingFor;
  };

  // Normalize religion values to English IDs
  const normalizeReligionToEnglish = (religion: string | string[]): string => {
    if (!religion) return "";

    // If it's already an array of IDs, join them
    if (Array.isArray(religion)) {
      // Return empty string for empty array
      if (religion.length === 0) return "";

      // Check if first element is already an ID
      const validIds = [
        "christianity",
        "islam",
        "hinduism",
        "buddhism",
        "judaism",
        "sikhism",
        "others",
      ];
      if (religion.length > 0 && validIds.includes(religion[0].toLowerCase())) {
        return religion.join(",");
      }

      // Otherwise, normalize each
      return religion
        .map((item) => {
          const normalized = item.toLowerCase().trim();
          const religionMap: { [key: string]: string } = {
            // English
            christianity: "christianity",
            christian: "christianity",
            islam: "islam",
            muslim: "islam",
            hinduism: "hinduism",
            hindu: "hinduism",
            buddhism: "buddhism",
            buddhist: "buddhism",
            judaism: "judaism",
            jewish: "judaism",
            sikhism: "sikhism",
            sikh: "sikhism",
            others: "others",
            other: "others",
            // German
            christentum: "christianity",
            muslimisch: "islam",
            hinduistisch: "hinduism",
            buddhistisch: "buddhism",
            jüdisch: "judaism",
            sikhismus: "sikhism",
            andere: "others",
          };
          return religionMap[normalized] || item;
        })
        .join(",");
    }

    return religion;
  };

  // Normalize nationality values to English IDs
  const normalizeNationalityToEnglish = (
    nationality: string | string[]
  ): string => {
    if (!nationality) return "";

    // If it's already an array of IDs, join them
    if (Array.isArray(nationality)) {
      // Return empty string for empty array
      if (nationality.length === 0) return "";

      // IDs are lowercase like "american", "british", etc.
      // If already IDs (all lowercase, no spaces), return as is
      if (
        nationality.length > 0 &&
        nationality[0].toLowerCase() === nationality[0] &&
        !nationality[0].includes(" ")
      ) {
        return nationality.join(",");
      }

      // Otherwise, normalize each (translated names to IDs)
      return nationality
        .map((item) => {
          // Convert to lowercase and replace spaces with underscores for ID format
          return item.toLowerCase().replace(/\s+/g, "_");
        })
        .join(",");
    }

    return nationality;
  };

  // Normalize zodiac values to English IDs
  const normalizeZodiacToEnglish = (zodiac: string | string[]): string => {
    if (!zodiac) return "";

    // If it's already an array of IDs, join them
    if (Array.isArray(zodiac)) {
      // Return empty string for empty array
      if (zodiac.length === 0) return "";

      // Check if first element is already an ID
      const validIds = [
        "aries",
        "taurus",
        "gemini",
        "cancer",
        "leo",
        "virgo",
        "libra",
        "scorpio",
        "sagittarius",
        "capricorn",
        "aquarius",
        "pisces",
      ];
      if (zodiac.length > 0 && validIds.includes(zodiac[0].toLowerCase())) {
        return zodiac.join(",");
      }

      // Otherwise, normalize each
      return zodiac
        .map((item) => {
          const normalized = item.toLowerCase().trim();
          const zodiacMap: { [key: string]: string } = {
            // English
            aries: "aries",
            taurus: "taurus",
            gemini: "gemini",
            cancer: "cancer",
            leo: "leo",
            virgo: "virgo",
            libra: "libra",
            scorpio: "scorpio",
            sagittarius: "sagittarius",
            capricorn: "capricorn",
            aquarius: "aquarius",
            pisces: "pisces",
            // German
            widder: "aries",
            stier: "taurus",
            zwillinge: "gemini",
            krebs: "cancer",
            löwe: "leo",
            jungfrau: "virgo",
            waage: "libra",
            skorpion: "scorpio",
            schütze: "sagittarius",
            steinbock: "capricorn",
            wassermann: "aquarius",
            fische: "pisces",
          };
          return zodiacMap[normalized] || item;
        })
        .join(",");
    }

    return zodiac;
  };

  const fetchUsers = async (): Promise<void> => {
    if (!user?.user_id) {
      setError(t("users.userIdNotAvailable"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("type", "get_map_users");
      formData.append("user_id", user.user_id);

      // Build payload with only required fields
      const payload: any = {
        type: "get_map_users",
        user_id: user.user_id,
      };

      // Add current user's location for distance calculation (only if valid)
      if (
        userData?.lat &&
        userData?.lng &&
        userData.lat !== 0 &&
        userData.lng !== 0
      ) {
        formData.append("lat", userData.lat.toString());
        formData.append("lng", userData.lng.toString());
        payload.lat = userData.lat;
        payload.lng = userData.lng;
      }

      // Normalize gender to English before sending
      if (filters.gender) {
        const normalizedGender = normalizeGenderToEnglish(filters.gender);
        // Only send if not empty
        if (normalizedGender && normalizedGender.trim() !== "") {
          formData.append("gender", normalizedGender);
          payload.gender = normalizedGender;
        }
      }

      // Only send age_from if it has a value
      if (filters.ageFrom && filters.ageFrom.trim() !== "") {
        formData.append("age_from", filters.ageFrom);
        payload.age_from = filters.ageFrom;
      }

      // Only send age_to if it has a value
      if (filters.ageTo && filters.ageTo.trim() !== "") {
        formData.append("age_to", filters.ageTo);
        payload.age_to = filters.ageTo;
      }

      // Only send distance if it has a valid value
      if (filters.distance && filters.distance > 0) {
        formData.append("distance", filters.distance.toString());
        payload.distance = filters.distance.toString();
      }
      // Normalize looking_for to English IDs before sending
      if (filters.lookingFor) {
        const normalizedLookingFor = normalizeLookingForToEnglish(
          filters.lookingFor
        );
        // Only send if not empty
        if (normalizedLookingFor && normalizedLookingFor.trim() !== "") {
          // Convert comma-separated string to array
          const lookingForArray = normalizedLookingFor
            .split(",")
            .map((item) => item.trim());
          formData.append("looking_for", JSON.stringify(lookingForArray));
          payload.looking_for = lookingForArray;
        }
      }
      // Only send height filters if they have values
      if (filters.height) {
        if (filters.height.from && filters.height.from.trim() !== "") {
          formData.append("height_from", filters.height.from);
          payload.height_from = filters.height.from;
        }
        if (filters.height.to && filters.height.to.trim() !== "") {
          formData.append("height_to", filters.height.to);
          payload.height_to = filters.height.to;
        }
      }
      // Normalize nationality to English IDs before sending
      if (filters.nationality) {
        const normalizedNationality = normalizeNationalityToEnglish(
          filters.nationality
        );
        // Only send if not empty
        if (normalizedNationality && normalizedNationality.trim() !== "") {
          // Convert comma-separated string to array
          const nationalityArray = normalizedNationality
            .split(",")
            .map((item) => item.trim());
          formData.append("nationality", JSON.stringify(nationalityArray));
          payload.nationality = nationalityArray;
        }
      }
      // Normalize religion to English IDs before sending
      if (filters.religion) {
        const normalizedReligion = normalizeReligionToEnglish(filters.religion);
        // Only send if not empty
        if (normalizedReligion && normalizedReligion.trim() !== "") {
          // Convert comma-separated string to array
          const religionArray = normalizedReligion
            .split(",")
            .map((item) => item.trim());
          formData.append("religion", JSON.stringify(religionArray));
          payload.religion = religionArray;
        }
      }
      // Normalize zodiac to English IDs before sending
      if (filters.zodiacSign) {
        const normalizedZodiac = normalizeZodiacToEnglish(filters.zodiacSign);
        // Only send if not empty
        if (normalizedZodiac && normalizedZodiac.trim() !== "") {
          // Convert comma-separated string to array
          const zodiacArray = normalizedZodiac
            .split(",")
            .map((item) => item.trim());
          formData.append("zodiac", JSON.stringify(zodiacArray));
          payload.zodiac = zodiacArray;
        }
      }

      const response: ApiResponse = await apiCall(formData);

      if (response.result && response.data && Array.isArray(response.data)) {
        setRawUserData(response.data);
        // Always clear error on successful response (even if empty)
        setError(null);
      } else {
        // API returned error or invalid response
        setRawUserData([]);
        setError(t("users.noUsersFoundOrServerError"));
      }
    } catch (err: any) {
      const errorMessage = err.message || t("users.networkError");
      setError(errorMessage);

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
      // Include private_spots array if available from API
      private_spots: userData.private_spots || undefined,
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

      // Use the same utility function that works in profile, with API interests
      const currentLanguage = i18n.language || "en";
      const parsedInterests = parseInterestsWithNames(
        interestsStr,
        apiInterests,
        currentLanguage
      );
      return Array.isArray(parsedInterests) ? parsedInterests : [];
    } catch (error) {

      return [];
    }
  };

  // Parse looking_for to get raw IDs (not formatted strings) for dynamic formatting
  const parseUserLookingFor = (
    lookingForStr: string,
    t?: (key: string) => string
  ): string[] => {
    try {
      if (!lookingForStr) return [];

      // Parse to get raw IDs, not formatted strings
      const rawIds = parseJsonString(lookingForStr);
      return Array.isArray(rawIds) ? rawIds : [];
    } catch (error) {

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

  // Derive users from raw data so interests resolve when apiInterests loads (fixes empty interests on first list view load)
  const users = useMemo(() => {
    if (!rawUserData || rawUserData.length === 0) return [];
    return rawUserData
      .map((userData: ApiUserData) => {
        try {
          return transformUser(userData);
        } catch (transformError) {
          return null;
        }
      })
      .filter((user): user is TransformedUser => user !== null);
  }, [rawUserData, apiInterests, i18n.language]);

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
