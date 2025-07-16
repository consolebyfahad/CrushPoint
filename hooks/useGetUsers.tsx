import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
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

const IMAGE_BASE_URL = "https://7tracking.com/crushpoint/images/";

export default function useGetUsers() {
  const { user } = useAppContext();
  const [users, setUsers] = useState<TransformedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
              return null; // Skip this user if transformation fails
            }
          })
          .filter((user): user is TransformedUser => user !== null); // Remove null entries

        setUsers(transformedUsers);
      } else {
        setError("Failed to fetch users or invalid response format");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching users");
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
      images: parseImages(userData.images, gender), // Pass gender to parseImages
      height: formatHeight(userData.height),
      gender: gender,
      genderInterest: safeString(userData.gender_interest),
      country: safeString(userData.country),
      state: safeString(userData.state),
      city: safeString(userData.city),
      phone: safeString(userData.phone),
      languages: safeString(userData.languages),
      interests: parseJsonArray(userData.interests),
      lookingFor: parseJsonArray(userData.looking_for),
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

  // Helper function to format height with error handling
  const formatHeight = (height: string): string => {
    const heightStr = safeString(height);
    if (!heightStr || heightStr === "0") {
      return "Not specified";
    }

    const heightNum = parseFloat(heightStr);
    if (isNaN(heightNum)) {
      return "Not specified";
    }

    return `${heightNum} cm`;
  };

  // Fixed function to handle double-escaped JSON strings
  const unescapeJsonString = (str: string): string => {
    if (!str) return str;

    // Handle double-escaped quotes by replacing \" with "
    return str.replace(/\\"/g, '"');
  };

  // Helper function to parse images and add base URL
  const parseImages = (imagesStr: string, gender: string): string[] => {
    const safeImagesStr = safeString(imagesStr);

    if (!safeImagesStr) {
      return [getDefaultImage(gender)];
    }

    try {
      // Fix double-escaped JSON string
      const fixedJsonStr = unescapeJsonString(safeImagesStr);
      const parsedImages = JSON.parse(fixedJsonStr);

      if (!Array.isArray(parsedImages)) {
        console.warn("Images field is not an array:", parsedImages);
        return [getDefaultImage(gender)];
      }

      const validImages = parsedImages
        .filter((imageName) => imageName && typeof imageName === "string")
        .map((imageName) => `${IMAGE_BASE_URL}${imageName.trim()}`);

      return validImages.length > 0 ? validImages : [getDefaultImage(gender)];
    } catch (error) {
      console.warn("Error parsing images:", error);
      return [getDefaultImage(gender)];
    }
  };

  // Helper function to parse JSON arrays from strings with fix for double-escaping
  const parseJsonArray = (jsonStr: string): string[] => {
    const safeJsonStr = safeString(jsonStr);

    if (!safeJsonStr) {
      return [];
    }

    try {
      // Fix double-escaped JSON string
      const fixedJsonStr = unescapeJsonString(safeJsonStr);
      const parsed = JSON.parse(fixedJsonStr);

      if (!Array.isArray(parsed)) {
        console.warn("Expected array but got:", typeof parsed);
        return [];
      }

      return parsed.filter((item) => item && typeof item === "string");
    } catch (error) {
      console.warn("Error parsing JSON array:", error);
      return [];
    }
  };

  // Helper function to calculate age from date of birth with improved date parsing
  const calculateAge = (dob: string): number | null => {
    const safeDob = safeString(dob);

    if (!safeDob) {
      return null;
    }

    try {
      const today = new Date();
      let birthDate: Date;

      // Handle MM/DD/YYYY format specifically
      if (safeDob.includes("/")) {
        const [month, day, year] = safeDob
          .split("/")
          .map((num) => parseInt(num, 10));

        // Validate the parsed date components
        if (isNaN(month) || isNaN(day) || isNaN(year)) {
          console.warn("Invalid date components:", safeDob);
          return null;
        }

        // Create date object (month is 0-indexed in JavaScript)
        birthDate = new Date(year, month - 1, day);
      } else {
        // Try parsing as ISO date or other formats
        birthDate = new Date(safeDob);
      }

      if (isNaN(birthDate.getTime())) {
        console.warn("Invalid date format:", safeDob);
        return null;
      }

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      // Sanity check for reasonable age range
      if (age < 0 || age > 150) {
        console.warn("Calculated age seems unreasonable:", age);
        return null;
      }

      return age;
    } catch (error) {
      console.warn("Error calculating age:", error);
      return null;
    }
  };

  // Helper function to get default image based on gender
  const getDefaultImage = (gender: string): string => {
    const normalizedGender = safeString(gender).toLowerCase();

    if (normalizedGender === "female" || normalizedGender === "f") {
      // Female default image
      return `https://i.pinimg.com/736x/8c/1f/82/8c1f82be3fbc9276db0c6431eee2aadd.jpg`;
    } else if (normalizedGender === "male" || normalizedGender === "m") {
      // Male default image
      return `https://i.pinimg.com/736x/30/1c/30/301c3029c36d70b518325f803bba8f09.jpg`;
    } else {
      // Default fallback for unknown/unspecified gender (using female image as fallback)
      return `https://i.pinimg.com/736x/8c/1f/82/8c1f82be3fbc9276db0c6431eee2aadd.jpg`;
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (user?.user_id) {
      fetchUsers();
    }
  }, [user?.user_id]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
}
