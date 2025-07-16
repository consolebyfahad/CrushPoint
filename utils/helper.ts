const parseMMDDYYYY = (dateStr: string): Date => {
  const [month, day, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
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

export const getInterestIcon = (interest: string) => {
  switch (interest.toLowerCase()) {
    case "travel":
      return "✈️";
    case "art":
      return "🎨";
    case "cooking":
      return "🍳";
    case "fashion":
      return "👗";
    case "music":
      return "🎵";
    case "wine":
      return "🍷";
    case "coffee":
      return "☕";
    case "hiking":
      return "🥾";
    case "photography":
      return "📸";
    case "fitness":
      return "💪";
    case "reading":
      return "📚";
    case "tech":
      return "💻";
    case "test":
      return "🧪";
    default:
      return "🎯";
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
