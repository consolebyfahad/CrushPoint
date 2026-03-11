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
  }>;  
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
  }>;  
  dob: string;
  match_status: string;
  match_emoji: string;
  loc: LocationData | null;
  
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
  lookingFor?: string | string[];  
  height?: { from?: string; to?: string };
  nationality?: string | string[];  
  religion?: string | string[];  
  zodiacSign?: string | string[];  
}

export default function useGetUsers(filters: UserFilters = {}) {
  
  const { rawInterests: apiInterests } = useGetInterests();
  const { user, userData } = useAppContext();
  const { t, i18n } = useTranslation();
  const [rawUserData, setRawUserData] = useState<ApiUserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const filtersString = useMemo(() => JSON.stringify(filters), [filters]);

  const normalizeGenderToEnglish = (gender: string): string => {
    if (!gender) return "";

    const normalized = gender.toLowerCase().trim();

    const genderMap: { [key: string]: string } = {
      
      both: "both",
      men: "male",
      male: "male",
      women: "female",
      female: "female",
      
      beide: "both",
      männer: "male",
      frauen: "female",
      
    };

    if (genderMap[normalized]) {
      return genderMap[normalized];
    }

    for (const [key, value] of Object.entries(genderMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }

    return "both";
  };

  const normalizeLookingForToEnglish = (
    lookingFor: string | string[]
  ): string => {
    if (!lookingFor) return "";

    if (Array.isArray(lookingFor)) {
      
      if (lookingFor.length === 0) return "";

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

      return lookingFor
        .map((item) => {
          const normalized = item.toLowerCase().trim();
          const lookingForMap: { [key: string]: string } = {
            
            serious: "serious",
            "serious relationship": "serious",
            casual: "casual",
            "casual dating": "casual",
            friendship: "friendship",
            open: "open",
            "open to possibilities": "open",
            "prefer-not": "prefer-not",
            "prefer not to say": "prefer-not",
            
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

    return lookingFor;
  };

  const normalizeReligionToEnglish = (religion: string | string[]): string => {
    if (!religion) return "";

    if (Array.isArray(religion)) {
      
      if (religion.length === 0) return "";

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

      return religion
        .map((item) => {
          const normalized = item.toLowerCase().trim();
          const religionMap: { [key: string]: string } = {
            
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

  const normalizeNationalityToEnglish = (
    nationality: string | string[]
  ): string => {
    if (!nationality) return "";

    if (Array.isArray(nationality)) {
      
      if (nationality.length === 0) return "";

      if (
        nationality.length > 0 &&
        nationality[0].toLowerCase() === nationality[0] &&
        !nationality[0].includes(" ")
      ) {
        return nationality.join(",");
      }

      return nationality
        .map((item) => {
          
          return item.toLowerCase().replace(/\s+/g, "_");
        })
        .join(",");
    }

    return nationality;
  };

  const normalizeZodiacToEnglish = (zodiac: string | string[]): string => {
    if (!zodiac) return "";

    if (Array.isArray(zodiac)) {
      
      if (zodiac.length === 0) return "";

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

      return zodiac
        .map((item) => {
          const normalized = item.toLowerCase().trim();
          const zodiacMap: { [key: string]: string } = {
            
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

      const payload: any = {
        type: "get_map_users",
        user_id: user.user_id,
      };

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

      if (filters.gender) {
        const normalizedGender = normalizeGenderToEnglish(filters.gender);
        
        if (normalizedGender && normalizedGender.trim() !== "") {
          formData.append("gender", normalizedGender);
          payload.gender = normalizedGender;
        }
      }

      if (filters.ageFrom && filters.ageFrom.trim() !== "") {
        formData.append("age_from", filters.ageFrom);
        payload.age_from = filters.ageFrom;
      }

      if (filters.ageTo && filters.ageTo.trim() !== "") {
        formData.append("age_to", filters.ageTo);
        payload.age_to = filters.ageTo;
      }

      if (filters.distance && filters.distance > 0) {
        formData.append("distance", filters.distance.toString());
        payload.distance = filters.distance.toString();
      }
      
      if (filters.lookingFor) {
        const normalizedLookingFor = normalizeLookingForToEnglish(
          filters.lookingFor
        );
        
        if (normalizedLookingFor && normalizedLookingFor.trim() !== "") {
          
          const lookingForArray = normalizedLookingFor
            .split(",")
            .map((item) => item.trim());
          formData.append("looking_for", JSON.stringify(lookingForArray));
          payload.looking_for = lookingForArray;
        }
      }
      
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
      
      if (filters.nationality) {
        const normalizedNationality = normalizeNationalityToEnglish(
          filters.nationality
        );
        
        if (normalizedNationality && normalizedNationality.trim() !== "") {
          
          const nationalityArray = normalizedNationality
            .split(",")
            .map((item) => item.trim());
          formData.append("nationality", JSON.stringify(nationalityArray));
          payload.nationality = nationalityArray;
        }
      }
      
      if (filters.religion) {
        const normalizedReligion = normalizeReligionToEnglish(filters.religion);
        
        if (normalizedReligion && normalizedReligion.trim() !== "") {
          
          const religionArray = normalizedReligion
            .split(",")
            .map((item) => item.trim());
          formData.append("religion", JSON.stringify(religionArray));
          payload.religion = religionArray;
        }
      }
      
      if (filters.zodiacSign) {
        const normalizedZodiac = normalizeZodiacToEnglish(filters.zodiacSign);
        
        if (normalizedZodiac && normalizedZodiac.trim() !== "") {
          
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
        
        setError(null);
      } else {
        
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
      
      private_spots: userData.private_spots || undefined,
      loc: userData.loc,
      
      lat: userData.lat,
      lng: userData.lng,
    };
  };

  const parseUserInterests = (
    interestsStr: string,
    t?: (key: string) => string
  ): string[] => {
    try {
      if (!interestsStr) return [];

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

  const parseUserLookingFor = (
    lookingForStr: string,
    t?: (key: string) => string
  ): string[] => {
    try {
      if (!lookingForStr) return [];

      const rawIds = parseJsonString(lookingForStr);
      return Array.isArray(rawIds) ? rawIds : [];
    } catch (error) {

      return [];
    }
  };

  const parseUserNationality = (
    nationalityStr: string,
    t?: (key: string) => string
  ): string[] => {
    try {
      if (!nationalityStr) return [];

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
