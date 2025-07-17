const parseMMDDYYYY = (dateStr: string): Date => {
  const [month, day, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

const INTEREST_MAPPING: { [key: string]: string } = {
  "1": "💻 Tech",
  "2": "🎨 Art",
  "3": "🧪 Test",
  "4": "Music",
  "5": "Sports",
  "6": "Travel",
  "7": "Food",
  "8": "Movies",
  "9": "Books",
  "10": "Gaming",
  // Add more mappings as needed
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
