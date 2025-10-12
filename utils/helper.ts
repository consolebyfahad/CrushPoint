const parseMMDDYYYY = (dateStr: string): Date => {
  const [month, day, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

// Format gender interest for display
export const formatGenderInterest = (genderInterest: string): string => {
  if (!genderInterest) return "All";
  
  const normalized = genderInterest.toLowerCase().trim();
  
  if (normalized === "female" || normalized === "f") {
    return "Women";
  } else if (normalized === "male" || normalized === "m") {
    return "Men";
  } else if (normalized === "both" || normalized === "all" || normalized === "other") {
    return "All";
  }
  
  // Fallback for any other values
  return "All";
};

// Capitalize first letter of a string
export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Add symbol to religion
export const formatReligion = (religion: string): string => {
  if (!religion) return "";
  const capitalized = capitalizeFirstLetter(religion);
  
  const religionSymbols: { [key: string]: string } = {
    "Christian": "✝️",
    "Islam": "☪️",
    "Muslim": "☪️",
    "Hindu": "🕉️",
    "Buddhist": "☸️",
    "Jewish": "✡️",
    "Judaism": "✡️",
    "Sikh": "☬",
    "Atheist": "🚫",
    "Agnostic": "❓",
    "Spiritual": "✨",
    "Other": "🙏",
  };
  
  const symbol = religionSymbols[capitalized] || "🙏";
  return `${symbol} ${capitalized}`;
};

// Add symbol to zodiac
export const formatZodiac = (zodiac: string): string => {
  if (!zodiac) return "";
  const capitalized = capitalizeFirstLetter(zodiac);
  
  const zodiacSymbols: { [key: string]: string } = {
    "Aries": "♈",
    "Taurus": "♉",
    "Gemini": "♊",
    "Cancer": "♋",
    "Leo": "♌",
    "Virgo": "♍",
    "Libra": "♎",
    "Scorpio": "♏",
    "Sagittarius": "♐",
    "Capricorn": "♑",
    "Aquarius": "♒",
    "Pisces": "♓",
  };
  
  const symbol = zodiacSymbols[capitalized] || "⭐";
  return `${symbol} ${capitalized}`;
};

// Add symbol to nationality
export const formatNationality = (nationality: string): string => {
  if (!nationality) return "";
  const capitalized = capitalizeFirstLetter(nationality);
  
  const nationalitySymbols: { [key: string]: string } = {
    "American": "🇺🇸",
    "British": "🇬🇧",
    "Canadian": "🇨🇦",
    "Australian": "🇦🇺",
    "French": "🇫🇷",
    "German": "🇩🇪",
    "Spanish": "🇪🇸",
    "Italian": "🇮🇹",
    "Japanese": "🇯🇵",
    "Chinese": "🇨🇳",
    "Korean": "🇰🇷",
    "Indian": "🇮🇳",
    "Brazilian": "🇧🇷",
    "Mexican": "🇲🇽",
    "Russian": "🇷🇺",
    "Dutch": "🇳🇱",
    "Swedish": "🇸🇪",
    "Norwegian": "🇳🇴",
    "Danish": "🇩🇰",
    "Finnish": "🇫🇮",
    "Polish": "🇵🇱",
    "Greek": "🇬🇷",
    "Turkish": "🇹🇷",
    "Egyptian": "🇪🇬",
    "South African": "🇿🇦",
    "Nigerian": "🇳🇬",
    "Pakistani": "🇵🇰",
    "Bangladeshi": "🇧🇩",
    "Indonesian": "🇮🇩",
    "Thai": "🇹🇭",
    "Vietnamese": "🇻🇳",
    "Filipino": "🇵🇭",
    "Malaysian": "🇲🇾",
    "Singaporean": "🇸🇬",
  };
  
  const symbol = nationalitySymbols[capitalized] || "🌍";
  return `${symbol} ${capitalized}`;
};

const INTEREST_MAPPING: { [key: string]: string } = {
  "1": "💻 Tech",
  "2": "🎨 Art",
  "3": "🧪 Test",
  "4": "🎵 Music",
  "5": "⚽ Sports",
  "6": "✈️ Travel",
  "7": "🍔 Food",
  "8": "🎬 Movies",
  "9": "📚 Books",
  "10": "🎮 Gaming",
  // skipping 11–17
  "18": "💃 Dancing",
  "19": "✍️ Writing",
  "20": "⚽ Sports",
  "21": "👗 Fashion",
  "22": "🧘‍♀️ Yoga",
  "23": "☕ Coffee",
  "24": "🍷 Wine",
  "25": "🥾 Hiking",
  "26": "🗣️ Languages",
  "27": "🔬 Science",
};

const convertInterestIdsToNames = (interestIds: string[]): string[] => {
  return interestIds
    .map((id) => INTEREST_MAPPING[id] || `Unknown Interest (${id})`)
    .filter((name) => name !== `Unknown Interest (${interestIds})`); // Optional: filter out unknown interests
};

export const calculateAge = (dob: string): number => {
  const birthDate = parseMMDDYYYY(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

export const parseJsonString = (jsonString: string): string[] => {
  try {
    if (!jsonString) return [];
    
    // Check if it's a JSON array string
    if (jsonString.startsWith('[') && jsonString.endsWith(']')) {
      // Handle heavily escaped JSON strings like the one in the API response
      let cleanedString = jsonString;
      
      // Remove excessive backslashes and quotes
      cleanedString = cleanedString.replace(/\\\\+/g, "\\");
      cleanedString = cleanedString.replace(/\\\"/g, '"');
      
      // Parse the JSON
      const parsed = JSON.parse(cleanedString);
      
      if (Array.isArray(parsed)) {
        return parsed;
      } else {
        console.warn("JSON data is not an array:", parsed);
        return [];
      }
    } else {
      // It's not a JSON array, treat as a simple string
      return [jsonString];
    }
  } catch (error) {
    console.warn("Error parsing JSON string:", error);
    // Fallback: try to extract values manually if JSON parsing fails
    try {
      // Extract values between quotes
      const matches = jsonString.match(/"([^"]+)"/g);
      if (matches) {
        const values = matches.map((match) => match.replace(/"/g, ""));
        return values;
      }
    } catch (fallbackError) {
      console.warn("Fallback parsing also failed:", fallbackError);
    }
    // Final fallback: return as single string
    return [jsonString];
  }
};

export const parseInterestsWithNames = (jsonString: string): string[] => {
  try {
    if (!jsonString) return [];
    
    // Check if it's a JSON array string
    if (jsonString.startsWith('[') && jsonString.endsWith(']')) {
      // Handle heavily escaped JSON strings like the one in the API response
      let cleanedString = jsonString;
      
      // Remove excessive backslashes and quotes
      cleanedString = cleanedString.replace(/\\\\+/g, "\\");
      cleanedString = cleanedString.replace(/\\\"/g, '"');
      
      // Parse the JSON
      const interestIds = JSON.parse(cleanedString);
      
      if (Array.isArray(interestIds)) {
        return convertInterestIdsToNames(interestIds);
      } else {
        console.warn("Interests data is not an array:", interestIds);
        return [];
      }
    } else {
      // It's not a JSON array, might be a single interest ID or comma-separated values
      console.warn("Interests data is not JSON array format:", jsonString);
      
      // Try to parse as comma-separated values
      if (jsonString.includes(',')) {
        const values = jsonString.split(',').map(v => v.trim());
        return convertInterestIdsToNames(values);
      } else {
        // Single value
        return convertInterestIdsToNames([jsonString.trim()]);
      }
    }
  } catch (error) {
    console.warn("Error parsing interests:", error);
    // Fallback: try to extract values manually if JSON parsing fails
    try {
      // Extract values between quotes
      const matches = jsonString.match(/"([^"]+)"/g);
      if (matches) {
        const values = matches.map((match) => match.replace(/"/g, ""));
        return convertInterestIdsToNames(values);
      }
      
      // Try comma-separated values
      if (jsonString.includes(',')) {
        const values = jsonString.split(',').map(v => v.trim());
        return convertInterestIdsToNames(values);
      } else {
        // Single value
        return convertInterestIdsToNames([jsonString.trim()]);
      }
    } catch (fallbackError) {
      console.warn("Fallback parsing also failed:", fallbackError);
    }
    return [];
  }
};

const LOOKING_FOR_OPTIONS = [
  { id: "serious", label: "🩵 Serious relationship" },
  { id: "casual", label: "😘 Casual dating" },
  { id: "friendship", label: "🤝 Friendship" },
  { id: "open", label: "🔥 Open to possibilities" },
  { id: "prefer-not", label: "🤫 Prefer not to say" },
];

const LOOKING_FOR_MAPPING: { [key: string]: string } =
  LOOKING_FOR_OPTIONS.reduce((acc, option) => {
    acc[option.id] = option.label;
    return acc;
  }, {} as { [key: string]: string });

const convertLookingForIdsToLabels = (lookingForIds: string[]): string[] => {
  return lookingForIds
    .map((id) => LOOKING_FOR_MAPPING[id] || `Unknown Option (${id})`)
    .filter((label) => !label.startsWith("Unknown Option")); // Optional: filter out unknown options
};

// Add new function specifically for looking_for
export const parseLookingForWithLabels = (jsonString: string): string[] => {
  try {
    if (!jsonString) return [];
    
    // Handle heavily escaped JSON strings like the one in the API response
    let cleanedString = jsonString;
    
    // Remove excessive backslashes and quotes
    cleanedString = cleanedString.replace(/\\\\+/g, "\\");
    cleanedString = cleanedString.replace(/\\\"/g, '"');
    
    // Parse the JSON
    const lookingForIds = JSON.parse(cleanedString);
    
    if (Array.isArray(lookingForIds)) {
      return convertLookingForIdsToLabels(lookingForIds);
    } else {
      console.warn("Looking for data is not an array:", lookingForIds);
      return [];
    }
  } catch (error) {
    console.error("Error parsing looking_for:", error);
    // Fallback: try to extract values manually if JSON parsing fails
    try {
      // Extract values between quotes
      const matches = jsonString.match(/"([^"]+)"/g);
      if (matches) {
        const values = matches.map((match) => match.replace(/"/g, ""));
        return convertLookingForIdsToLabels(values);
      }
    } catch (fallbackError) {
      console.error("Fallback parsing also failed:", fallbackError);
    }
    return [];
  }
};

export const nationalityOptions = [
  { label: "🇺🇸 American", value: "American" },
  { label: "🇨🇦 Canadian", value: "Canadian" },
  { label: "🇬🇧 British", value: "British" },
  { label: "🇦🇺 Australian", value: "Australian" },
  { label: "🇩🇪 German", value: "German" },
  { label: "🇫🇷 French", value: "French" },
  { label: "🇮🇹 Italian", value: "Italian" },
  { label: "🇪🇸 Spanish", value: "Spanish" },
  { label: "🇯🇵 Japanese", value: "Japanese" },
  { label: "🇨🇳 Chinese", value: "Chinese" },
  { label: "🇮🇳 Indian", value: "Indian" },
  { label: "🇧🇷 Brazilian", value: "Brazilian" },
  { label: "🇲🇽 Mexican", value: "Mexican" },
  { label: "🇷🇺 Russian", value: "Russian" },
  { label: "🇰🇷 Korean", value: "Korean" },
];

const NATIONALITY_MAPPING: { [key: string]: string } =
  nationalityOptions.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {} as { [key: string]: string });

export const convertNationalityValuesToLabels = (
  nationalityValues: string[]
): string[] => {
  return nationalityValues
    .map((value) => NATIONALITY_MAPPING[value] || value) // Fallback to original value if not found
    .filter((label) => label && label !== "Not Specified"); // Filter out empty or "Not Specified" values
};

// Add new function specifically for nationality
export const parseNationalityWithLabels = (jsonString: string): string[] => {
  try {
    // Handle heavily escaped JSON strings like the one in the data
    let cleanedString = jsonString;

    // Remove excessive backslashes and quotes
    cleanedString = cleanedString.replace(/\\\\+/g, "\\");
    cleanedString = cleanedString.replace(/\\\"/g, '"');

    // If the string starts with [ and contains nested arrays, extract the inner array
    if (cleanedString.startsWith('["[') && cleanedString.endsWith('"]')) {
      // Extract the inner array string
      const innerArrayMatch = cleanedString.match(/\["\[(.*)\]"\]/);
      if (innerArrayMatch) {
        const innerArrayString = `[${innerArrayMatch[1]}]`;
        const nationalityValues = JSON.parse(innerArrayString);
        return convertNationalityValuesToLabels(nationalityValues);
      }
    }

    // Try normal parsing
    const nationalityValues = JSON.parse(cleanedString);
    return convertNationalityValuesToLabels(nationalityValues);
  } catch (error) {
    console.error("Error parsing nationality:", error);
    // Fallback: try to extract values manually if JSON parsing fails
    try {
      // Extract values between quotes
      const matches = jsonString.match(/"([^"]+)"/g);
      if (matches) {
        const values = matches.map((match) => match.replace(/"/g, ""));
        return convertNationalityValuesToLabels(values);
      }
    } catch (fallbackError) {
      console.error("Fallback parsing also failed:", fallbackError);
    }
    return [];
  }
};

export const religionOptions = [
  { label: "✝️ Christianity", value: "Christianity" },
  { label: "☪️ Islam", value: "Islam" },
  { label: "✡️ Judaism", value: "Judaism" },
  { label: "🕉️ Hinduism", value: "Hinduism" },
  { label: "☸️ Buddhism", value: "Buddhism" },
  { label: "🔮 Atheist", value: "Atheist" },
  { label: "🔮 Agnostic", value: "Agnostic" },
  { label: "🔮 Other", value: "Other" },
  { label: "🔮 Prefer not to say", value: "Prefer not to say" },
];

export const zodiacOptions = [
  { label: "♈️ Aries", value: "Aries" },
  { label: "♉️ Taurus", value: "Taurus" },
  { label: "♊️ Gemini", value: "Gemini" },
  { label: "♋️ Cancer", value: "Cancer" },
  { label: "♌️ Leo", value: "Leo" },
  { label: "♍️ Virgo", value: "Virgo" },
  { label: "♎️ Libra", value: "Libra" },
  { label: "♏️ Scorpio", value: "Scorpio" },
  { label: "♐️ Sagittarius", value: "Sagittarius" },
  { label: "♑️ Capricorn", value: "Capricorn" },
  { label: "♒️ Aquarius", value: "Aquarius" },
  { label: "♓️ Pisces", value: "Pisces" },
];

// Format time for display, handling timezone conversion
export const formatTimeForDisplay = (time: string) => {
  try {
    // If time is already in 12-hour format with AM/PM, return as is
    if (time.includes("AM") || time.includes("PM")) {
      return time;
    }

    // If time is in 24-hour format (e.g., "18:31"), convert to 12-hour format
    const [hours, minutes] = time.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");

    return `${displayHours}:${displayMinutes} ${ampm}`;
  } catch (error) {
    console.warn("Error formatting time for display:", error);
    return time;
  }
};

export const formatTimeAgo = (date: string, time: string) => {
  try {
    // Parse the date format "Jul 22, 2025" or "Sep 12, 2025 06:31 PM"
    const monthMap: { [key: string]: number } = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    let dateParts, timeParts;

    // Check if date string contains time (e.g., "Sep 12, 2025 06:31 PM")
    if (date.includes(":") && (date.includes("AM") || date.includes("PM"))) {
      const spaceIndex = date.lastIndexOf(" ");
      const dateOnly = date.substring(0, spaceIndex);
      const timeOnly = date.substring(spaceIndex + 1);

      dateParts = dateOnly.split(" ");
      timeParts = timeOnly.split(" ");
    } else {
      // Original format "Jul 22, 2025"
      dateParts = date.split(" ");
      timeParts = time.split(" ");
    }

    const month = monthMap[dateParts[0]]; // Convert month name to number (0-11)
    const day = parseInt(dateParts[1].replace(",", "")); // Remove comma and convert to number
    const year = parseInt(dateParts[2]);

    // Parse time "10:04 PM" or "06:31 PM"
    const timeValue = timeParts[0];
    const ampm = timeParts[1];
    const [hours, minutes] = timeValue.split(":").map(Number);

    // Convert to 24-hour format
    let hour24 = hours;
    if (ampm === "PM" && hours !== 12) {
      hour24 += 12;
    } else if (ampm === "AM" && hours === 12) {
      hour24 = 0;
    }

    // Create the date object
    const matchDate = new Date(year, month, day, hour24, minutes);

    if (isNaN(matchDate.getTime())) {
      return "Recently";
    }

    const now = new Date();
    const diffInMs = now.getTime() - matchDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInDays === 1) {
      return "1 day ago";
    } else {
      return `${diffInDays} days ago`;
    }
  } catch (error) {
    console.warn("Error formatting time ago:", error);
    return "Recently";
  }
};

/**
 * Parse created_at timestamp and add timezone offset (e.g., 3 hours)
 * Format: "Oct 11, 2025 10:24 PM"
 */
export const parseCreatedAtWithOffset = (
  createdAtStr: string,
  hoursOffset: number = 3
): Date => {
  try {
    const monthMap: { [key: string]: number } = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };

    // Parse "Oct 11, 2025 10:24 PM"
    const parts = createdAtStr.split(" ");
    const month = monthMap[parts[0]];
    const day = parseInt(parts[1].replace(",", ""));
    const year = parseInt(parts[2]);
    const timeValue = parts[3];
    const ampm = parts[4];

    const [hours, minutes] = timeValue.split(":").map(Number);

    // Convert to 24-hour format
    let hour24 = hours;
    if (ampm === "PM" && hours !== 12) {
      hour24 += 12;
    } else if (ampm === "AM" && hours === 12) {
      hour24 = 0;
    }

    // Create date and add offset
    const date = new Date(year, month, day, hour24, minutes);
    date.setHours(date.getHours() + hoursOffset);

    return date;
  } catch (error) {
    console.warn("Error parsing created_at:", error);
    return new Date();
  }
};

/**
 * Calculate time ago from a Date object
 */
export const calculateTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInHours < 1) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInDays === 1) {
    return "1 day ago";
  } else {
    return `${diffInDays} days ago`;
  }
};

// ==================== IMAGE PARSING UTILITIES ====================

const IMAGE_BASE_URL = "https://7tracking.com/crushpoint/images/";
const DEFAULT_IMAGE_MALE = "https://i.pinimg.com/736x/30/1c/30/301c3029c36d70b518325f803bba8f09.jpg";
const DEFAULT_IMAGE_FEMALE = "https://i.pinimg.com/736x/8c/1f/82/8c1f82be3fbc9276db0c6431eee2aadd.jpg";

/**
 * Parse user images from API response
 * Handles the complex escaped JSON format from the API
 */
export const parseUserImages = (imagesStr: string, gender: string = "unknown"): string[] => {
  if (!imagesStr || imagesStr.trim() === "") {
    return [getDefaultImage(gender)];
  }

  try {
    // Clean the heavily escaped JSON string
    let cleanedString = imagesStr;
    
    // Remove excessive backslashes
    cleanedString = cleanedString.replace(/\\\\+/g, "\\");
    cleanedString = cleanedString.replace(/\\\"/g, '"');
    
    // Parse the JSON
    const imageFilenames = JSON.parse(cleanedString);
    
    if (Array.isArray(imageFilenames) && imageFilenames.length > 0) {
      const validImages = imageFilenames
        .filter((filename: string) => filename && typeof filename === "string")
        .map((filename: string) => {
          const cleanFilename = filename.replace(/\\/g, "");
          return `${IMAGE_BASE_URL}${cleanFilename}`;
        });
      
      return validImages.length > 0 ? validImages : [getDefaultImage(gender)];
    }
    
    return [getDefaultImage(gender)];
  } catch (error) {
    console.warn("Error parsing user images:", error);
    return [getDefaultImage(gender)];
  }
};

/**
 * Get default image based on gender
 */
export const getDefaultImage = (gender: string): string => {
  const normalizedGender = (gender || "").toLowerCase();
  if (normalizedGender === "female" || normalizedGender === "f") {
    return DEFAULT_IMAGE_FEMALE;
  } else if (normalizedGender === "male" || normalizedGender === "m") {
    return DEFAULT_IMAGE_MALE;
  }
  return DEFAULT_IMAGE_FEMALE; // Default fallback
};

/**
 * Parse event image from API response
 */
export const parseEventImage = (imageStr: string): string => {
  if (!imageStr) {
    return "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=400&fit=crop";
  }

  try {
    // If it's already a full URL, return as is
    if (imageStr.startsWith("http")) {
      return imageStr;
    }
    
    // Otherwise, construct URL with base path
    return `${IMAGE_BASE_URL}${imageStr}`;
  } catch (error) {
    console.warn("Error parsing event image:", error);
    return "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=400&fit=crop";
  }
};

// ==================== DISTANCE UTILITIES ====================

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): string => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) * 
    Math.cos(coord2.lat * (Math.PI / 180)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${Math.round(distance * 10) / 10}km`;
  }
};

// ==================== UI DISPLAY UTILITIES ====================

/**
 * Get user display name with age
 */
export const getUserDisplayName = (name: string, age: number): string => {
  return `${name}, ${age}`;
};

/**
 * Get user location string
 */
export const getUserLocationString = (city: string, state: string, country: string): string => {
  const parts = [city, state, country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Location not specified";
};

/**
 * Get user online status
 */
export const getUserOnlineStatus = (status: string): string => {
  return status === "1" ? "Online" : "Offline";
};

/**
 * Format height for display
 */
export const formatHeight = (heightStr: string): string => {
  if (!heightStr || heightStr === "0") return "";
  
  const height = parseFloat(heightStr);
  if (isNaN(height)) return "";
  
  return `${height} cm`;
};

/**
 * Format date for meetup requests (e.g., "Thu, Feb 15")
 */
export const formatMeetupDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.warn('Error formatting meetup date:', error);
    return dateString;
  }
};

/**
 * Format date for display in cards (e.g., "Sun, Feb 18")
 */
export const formatCardDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.warn('Error formatting card date:', error);
    return dateString;
  }
};

/**
 * Check if a date is in the past
 */
export const isDateInPast = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return date < today;
  } catch (error) {
    console.warn('Error checking if date is in past:', error);
    return false;
  }
};

/**
 * Sort requests by date (newest first)
 */
export const sortRequestsByDate = (requests: any[]): any[] => {
  return requests.sort((a, b) => {
    try {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime(); // Newest first
    } catch (error) {
      console.warn('Error sorting requests by date:', error);
      return 0;
    }
  });
};

/**
 * Filter out past dates
 */
export const filterOutPastDates = (requests: any[]): any[] => {
  return requests.filter(request => {
    if (!request.date) return false;
    return !isDateInPast(request.date);
  });
};
