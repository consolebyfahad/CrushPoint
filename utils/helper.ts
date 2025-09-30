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
    const cleanedString = jsonString.replace(/\\\"/g, '"');
    return JSON.parse(cleanedString);
  } catch (error) {
    console.error("Error parsing JSON string:", error);
    return [];
  }
};

export const parseInterestsWithNames = (jsonString: string): string[] => {
  try {
    const cleanedString = jsonString.replace(/\\\"/g, '"');
    const interestIds = JSON.parse(cleanedString);
    return convertInterestIdsToNames(interestIds);
  } catch (error) {
    console.error("Error parsing interests:", error);
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
    const cleanedString = jsonString.replace(/\\\"/g, '"');
    const lookingForIds = JSON.parse(cleanedString);
    return convertLookingForIdsToLabels(lookingForIds);
  } catch (error) {
    console.error("Error parsing looking_for:", error);
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
