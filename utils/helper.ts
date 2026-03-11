const parseMMDDYYYY = (dateStr: string): Date => {
  const [month, day, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

// Format gender interest for display
export const formatGenderInterest = (
  genderInterest: string,
  t?: (key: string, options?: any) => string,
): string => {
  if (!genderInterest) return t ? t("filters.both") : "Both";

  const normalized = genderInterest.toLowerCase().trim();

  if (normalized === "female" || normalized === "f") {
    return t ? t("filters.women") : "Women";
  } else if (normalized === "male" || normalized === "m") {
    return t ? t("filters.men") : "Men";
  } else if (
    normalized === "both" ||
    normalized === "all" ||
    normalized === "other"
  ) {
    return t ? t("filters.both") : "Both";
  }

  // Fallback for any other values
  return t ? t("filters.both") : "Both";
};

// Capitalize first letter of a string
export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Format religion with correct emoji - handles all variations
export const formatReligion = (
  religion: string,
  t?: (key: string) => string,
): string => {
  if (!religion || religion.trim() === "") return "";

  // Normalize religion string (lowercase, trim)
  const normalized = religion.toLowerCase().trim();

  // Comprehensive religion mapping with correct emojis
  const religionMap: {
    [key: string]: { emoji: string; key: string; display: string };
  } = {
    // Christianity variations
    christian: { emoji: "✝️", key: "christianity", display: "Christianity" },
    christianity: { emoji: "✝️", key: "christianity", display: "Christianity" },
    christianism: { emoji: "✝️", key: "christianity", display: "Christianity" },

    // Islam variations
    islam: { emoji: "☪️", key: "islam", display: "Islam" },
    muslim: { emoji: "☪️", key: "islam", display: "Islam" },
    islamic: { emoji: "☪️", key: "islam", display: "Islam" },

    // Hinduism
    hindu: { emoji: "🕉️", key: "hinduism", display: "Hinduism" },
    hinduism: { emoji: "🕉️", key: "hinduism", display: "Hinduism" },

    // Buddhism
    buddhist: { emoji: "☸️", key: "buddhism", display: "Buddhism" },
    buddhism: { emoji: "☸️", key: "buddhism", display: "Buddhism" },

    // Judaism
    jewish: { emoji: "✡️", key: "judaism", display: "Judaism" },
    judaism: { emoji: "✡️", key: "judaism", display: "Judaism" },

    // Sikhism
    sikh: { emoji: "☬", key: "sikhism", display: "Sikhism" },
    sikhism: { emoji: "☬", key: "sikhism", display: "Sikhism" },

    // Other
    other: { emoji: "🙏", key: "others", display: "Other" },
    others: { emoji: "🙏", key: "others", display: "Other" },
  };

  // Find matching religion
  const religionData = religionMap[normalized];

  if (!religionData) {
    // Fallback: try to capitalize and use as-is
    const capitalized = capitalizeFirstLetter(religion);
    return `🙏 ${capitalized}`;
  }

  // Get translated name if translation function provided
  if (t) {
    // Try religions.* first (for display names), then religion.* (for variations)
    const translationKey = `religions.${religionData.key}`;
    let translatedValue = t(translationKey);
    // If not found, try religion.* as fallback
    if (!translatedValue || translatedValue === translationKey) {
      const fallbackKey = `religion.${religionData.key}`;
      translatedValue = t(fallbackKey);
    }
    // If translation exists and is different from the key, use it
    if (
      translatedValue &&
      translatedValue !== translationKey &&
      translatedValue !== `religion.${religionData.key}`
    ) {
      return `${religionData.emoji} ${translatedValue}`;
    }
  }

  // Return with emoji and display name
  return `${religionData.emoji} ${religionData.display}`;
};

// Format zodiac with correct symbol - handles all variations
export const formatZodiac = (
  zodiac: string,
  t?: (key: string) => string,
): string => {
  if (!zodiac || zodiac.trim() === "") return "";

  // Normalize zodiac string (lowercase, trim)
  const normalized = zodiac.toLowerCase().trim();

  // Comprehensive zodiac mapping with correct symbols
  const zodiacMap: {
    [key: string]: { symbol: string; key: string; display: string };
  } = {
    // Aries variations
    aries: { symbol: "♈", key: "aries", display: "Aries" },

    // Taurus variations
    taurus: { symbol: "♉", key: "taurus", display: "Taurus" },

    // Gemini variations
    gemini: { symbol: "♊", key: "gemini", display: "Gemini" },

    // Cancer variations
    cancer: { symbol: "♋", key: "cancer", display: "Cancer" },

    // Leo variations
    leo: { symbol: "♌", key: "leo", display: "Leo" },

    // Virgo variations
    virgo: { symbol: "♍", key: "virgo", display: "Virgo" },

    // Libra variations
    libra: { symbol: "♎", key: "libra", display: "Libra" },

    // Scorpio variations
    scorpio: { symbol: "♏", key: "scorpio", display: "Scorpio" },

    // Sagittarius variations
    sagittarius: { symbol: "♐", key: "sagittarius", display: "Sagittarius" },

    // Capricorn variations
    capricorn: { symbol: "♑", key: "capricorn", display: "Capricorn" },

    // Aquarius variations
    aquarius: { symbol: "♒", key: "aquarius", display: "Aquarius" },

    // Pisces variations
    pisces: { symbol: "♓", key: "pisces", display: "Pisces" },
  };

  // Find matching zodiac
  const zodiacData = zodiacMap[normalized];

  if (!zodiacData) {
    // Fallback: try to capitalize and use as-is
    const capitalized = capitalizeFirstLetter(zodiac);
    return `♈ ${capitalized}`;
  }

  // Get translated name if translation function provided
  if (t) {
    const translationKey = `zodiac.${zodiacData.key}`;
    const translatedValue = t(translationKey);
    // If translation exists and is different from the key, use it
    if (translatedValue && translatedValue !== translationKey) {
      return `${zodiacData.symbol} ${translatedValue}`;
    }
  }

  // Return with symbol and display name
  return `${zodiacData.symbol} ${zodiacData.display}`;
};

// Comprehensive nationality options with flags - single source of truth
export const NATIONALITY_OPTIONS = [
  { id: "afghan", flag: "🇦🇫", display: "Afghan" },
  { id: "albanian", flag: "🇦🇱", display: "Albanian" },
  { id: "algerian", flag: "🇩🇿", display: "Algerian" },
  { id: "american", flag: "🇺🇸", display: "American" },
  { id: "andorran", flag: "🇦🇩", display: "Andorran" },
  { id: "angolan", flag: "🇦🇴", display: "Angolan" },
  { id: "antiguan", flag: "🇦🇬", display: "Antiguan" },
  { id: "argentine", flag: "🇦🇷", display: "Argentine" },
  { id: "armenian", flag: "🇦🇲", display: "Armenian" },
  { id: "australian", flag: "🇦🇺", display: "Australian" },
  { id: "austrian", flag: "🇦🇹", display: "Austrian" },
  { id: "azerbaijani", flag: "🇦🇿", display: "Azerbaijani" },
  { id: "bahamian", flag: "🇧🇸", display: "Bahamian" },
  { id: "bahraini", flag: "🇧🇭", display: "Bahraini" },
  { id: "bangladeshi", flag: "🇧🇩", display: "Bangladeshi" },
  { id: "barbadian", flag: "🇧🇧", display: "Barbadian" },
  { id: "belarusian", flag: "🇧🇾", display: "Belarusian" },
  { id: "belgian", flag: "🇧🇪", display: "Belgian" },
  { id: "belizean", flag: "🇧🇿", display: "Belizean" },
  { id: "beninese", flag: "🇧🇯", display: "Beninese" },
  { id: "bhutanese", flag: "🇧🇹", display: "Bhutanese" },
  { id: "bolivian", flag: "🇧🇴", display: "Bolivian" },
  { id: "bosnian", flag: "🇧🇦", display: "Bosnian" },
  { id: "botswanan", flag: "🇧🇼", display: "Botswanan" },
  { id: "brazilian", flag: "🇧🇷", display: "Brazilian" },
  { id: "british", flag: "🇬🇧", display: "British" },
  { id: "bruneian", flag: "🇧🇳", display: "Bruneian" },
  { id: "bulgarian", flag: "🇧🇬", display: "Bulgarian" },
  { id: "burkinabe", flag: "🇧🇫", display: "Burkinabe" },
  { id: "burmese", flag: "🇲🇲", display: "Burmese" },
  { id: "burundian", flag: "🇧🇮", display: "Burundian" },
  { id: "cambodian", flag: "🇰🇭", display: "Cambodian" },
  { id: "cameroonian", flag: "🇨🇲", display: "Cameroonian" },
  { id: "canadian", flag: "🇨🇦", display: "Canadian" },
  { id: "cape_verdean", flag: "🇨🇻", display: "Cape Verdean" },
  { id: "central_african", flag: "🇨🇫", display: "Central African" },
  { id: "chadian", flag: "🇹🇩", display: "Chadian" },
  { id: "chilean", flag: "🇨🇱", display: "Chilean" },
  { id: "chinese", flag: "🇨🇳", display: "Chinese" },
  { id: "colombian", flag: "🇨🇴", display: "Colombian" },
  { id: "comoran", flag: "🇰🇲", display: "Comoran" },
  { id: "congolese", flag: "🇨🇩", display: "Congolese" },
  { id: "costa_rican", flag: "🇨🇷", display: "Costa Rican" },
  { id: "croatian", flag: "🇭🇷", display: "Croatian" },
  { id: "cuban", flag: "🇨🇺", display: "Cuban" },
  { id: "cypriot", flag: "🇨🇾", display: "Cypriot" },
  { id: "czech", flag: "🇨🇿", display: "Czech" },
  { id: "danish", flag: "🇩🇰", display: "Danish" },
  { id: "djiboutian", flag: "🇩🇯", display: "Djiboutian" },
  { id: "dominican", flag: "🇩🇲", display: "Dominican" },
  { id: "dutch", flag: "🇳🇱", display: "Dutch" },
  { id: "ecuadorian", flag: "🇪🇨", display: "Ecuadorian" },
  { id: "egyptian", flag: "🇪🇬", display: "Egyptian" },
  { id: "emirati", flag: "🇦🇪", display: "Emirati" },
  { id: "equatorial_guinean", flag: "🇬🇶", display: "Equatorial Guinean" },
  { id: "eritrean", flag: "🇪🇷", display: "Eritrean" },
  { id: "estonian", flag: "🇪🇪", display: "Estonian" },
  { id: "ethiopian", flag: "🇪🇹", display: "Ethiopian" },
  { id: "fijian", flag: "🇫🇯", display: "Fijian" },
  { id: "filipino", flag: "🇵🇭", display: "Filipino" },
  { id: "finnish", flag: "🇫🇮", display: "Finnish" },
  { id: "french", flag: "🇫🇷", display: "French" },
  { id: "gabonese", flag: "🇬🇦", display: "Gabonese" },
  { id: "gambian", flag: "🇬🇲", display: "Gambian" },
  { id: "georgian", flag: "🇬🇪", display: "Georgian" },
  { id: "german", flag: "🇩🇪", display: "German" },
  { id: "ghanaian", flag: "🇬🇭", display: "Ghanaian" },
  { id: "greek", flag: "🇬🇷", display: "Greek" },
  { id: "grenadian", flag: "🇬🇩", display: "Grenadian" },
  { id: "guatemalan", flag: "🇬🇹", display: "Guatemalan" },
  { id: "guinean", flag: "🇬🇳", display: "Guinean" },
  { id: "guyanese", flag: "🇬🇾", display: "Guyanese" },
  { id: "haitian", flag: "🇭🇹", display: "Haitian" },
  { id: "honduran", flag: "🇭🇳", display: "Honduran" },
  { id: "hungarian", flag: "🇭🇺", display: "Hungarian" },
  { id: "icelandic", flag: "🇮🇸", display: "Icelandic" },
  { id: "indian", flag: "🇮🇳", display: "Indian" },
  { id: "indonesian", flag: "🇮🇩", display: "Indonesian" },
  { id: "iranian", flag: "🇮🇷", display: "Iranian" },
  { id: "iraqi", flag: "🇮🇶", display: "Iraqi" },
  { id: "irish", flag: "🇮🇪", display: "Irish" },
  { id: "israeli", flag: "🇮🇱", display: "Israeli" },
  { id: "italian", flag: "🇮🇹", display: "Italian" },
  { id: "ivorian", flag: "🇨🇮", display: "Ivorian" },
  { id: "jamaican", flag: "🇯🇲", display: "Jamaican" },
  { id: "japanese", flag: "🇯🇵", display: "Japanese" },
  { id: "jordanian", flag: "🇯🇴", display: "Jordanian" },
  { id: "kazakhstani", flag: "🇰🇿", display: "Kazakhstani" },
  { id: "kenyan", flag: "🇰🇪", display: "Kenyan" },
  { id: "kiribati", flag: "🇰🇮", display: "Kiribati" },
  { id: "korean", flag: "🇰🇷", display: "Korean" },
  { id: "kuwaiti", flag: "🇰🇼", display: "Kuwaiti" },
  { id: "kyrgyzstani", flag: "🇰🇬", display: "Kyrgyzstani" },
  { id: "laotian", flag: "🇱🇦", display: "Laotian" },
  { id: "latvian", flag: "🇱🇻", display: "Latvian" },
  { id: "lebanese", flag: "🇱🇧", display: "Lebanese" },
  { id: "liberian", flag: "🇱🇷", display: "Liberian" },
  { id: "libyan", flag: "🇱🇾", display: "Libyan" },
  { id: "liechtenstein", flag: "🇱🇮", display: "Liechtenstein" },
  { id: "lithuanian", flag: "🇱🇹", display: "Lithuanian" },
  { id: "luxembourgish", flag: "🇱🇺", display: "Luxembourgish" },
  { id: "macedonian", flag: "🇲🇰", display: "Macedonian" },
  { id: "malagasy", flag: "🇲🇬", display: "Malagasy" },
  { id: "malawian", flag: "🇲🇼", display: "Malawian" },
  { id: "malaysian", flag: "🇲🇾", display: "Malaysian" },
  { id: "maldivian", flag: "🇲🇻", display: "Maldivian" },
  { id: "malian", flag: "🇲🇱", display: "Malian" },
  { id: "maltese", flag: "🇲🇹", display: "Maltese" },
  { id: "marshallese", flag: "🇲🇭", display: "Marshallese" },
  { id: "mauritanian", flag: "🇲🇷", display: "Mauritanian" },
  { id: "mauritian", flag: "🇲🇺", display: "Mauritian" },
  { id: "mexican", flag: "🇲🇽", display: "Mexican" },
  { id: "micronesian", flag: "🇫🇲", display: "Micronesian" },
  { id: "moldovan", flag: "🇲🇩", display: "Moldovan" },
  { id: "monacan", flag: "🇲🇨", display: "Monacan" },
  { id: "mongolian", flag: "🇲🇳", display: "Mongolian" },
  { id: "montenegrin", flag: "🇲🇪", display: "Montenegrin" },
  { id: "moroccan", flag: "🇲🇦", display: "Moroccan" },
  { id: "mozambican", flag: "🇲🇿", display: "Mozambican" },
  { id: "namibian", flag: "🇳🇦", display: "Namibian" },
  { id: "nauruan", flag: "🇳🇷", display: "Nauruan" },
  { id: "nepalese", flag: "🇳🇵", display: "Nepalese" },
  { id: "new_zealand", flag: "🇳🇿", display: "New Zealand" },
  { id: "nicaraguan", flag: "🇳🇮", display: "Nicaraguan" },
  { id: "nigerian", flag: "🇳🇬", display: "Nigerian" },
  { id: "nigerien", flag: "🇳🇪", display: "Nigerien" },
  { id: "north_korean", flag: "🇰🇵", display: "North Korean" },
  { id: "norwegian", flag: "🇳🇴", display: "Norwegian" },
  { id: "omani", flag: "🇴🇲", display: "Omani" },
  { id: "pakistani", flag: "🇵🇰", display: "Pakistani" },
  { id: "palauan", flag: "🇵🇼", display: "Palauan" },
  { id: "palestinian", flag: "🇵🇸", display: "Palestinian" },
  { id: "panamanian", flag: "🇵🇦", display: "Panamanian" },
  { id: "papua_new_guinean", flag: "🇵🇬", display: "Papua New Guinean" },
  { id: "paraguayan", flag: "🇵🇾", display: "Paraguayan" },
  { id: "peruvian", flag: "🇵🇪", display: "Peruvian" },
  { id: "polish", flag: "🇵🇱", display: "Polish" },
  { id: "portuguese", flag: "🇵🇹", display: "Portuguese" },
  { id: "qatari", flag: "🇶🇦", display: "Qatari" },
  { id: "romanian", flag: "🇷🇴", display: "Romanian" },
  { id: "russian", flag: "🇷🇺", display: "Russian" },
  { id: "rwandan", flag: "🇷🇼", display: "Rwandan" },
  { id: "saint_kitts", flag: "🇰🇳", display: "Saint Kitts" },
  { id: "saint_lucian", flag: "🇱🇨", display: "Saint Lucian" },
  { id: "saint_vincentian", flag: "🇻🇨", display: "Saint Vincentian" },
  { id: "samoan", flag: "🇼🇸", display: "Samoan" },
  { id: "san_marinese", flag: "🇸🇲", display: "San Marinese" },
  { id: "sao_tomean", flag: "🇸🇹", display: "Sao Tomean" },
  { id: "saudi_arabian", flag: "🇸🇦", display: "Saudi Arabian" },
  { id: "senegalese", flag: "🇸🇳", display: "Senegalese" },
  { id: "serbian", flag: "🇷🇸", display: "Serbian" },
  { id: "seychellois", flag: "🇸🇨", display: "Seychellois" },
  { id: "sierra_leonean", flag: "🇸🇱", display: "Sierra Leonean" },
  { id: "singaporean", flag: "🇸🇬", display: "Singaporean" },
  { id: "slovak", flag: "🇸🇰", display: "Slovak" },
  { id: "slovenian", flag: "🇸🇮", display: "Slovenian" },
  { id: "solomon_islander", flag: "🇸🇧", display: "Solomon Islander" },
  { id: "somali", flag: "🇸🇴", display: "Somali" },
  { id: "south_african", flag: "🇿🇦", display: "South African" },
  { id: "south_korean", flag: "🇰🇷", display: "South Korean" },
  { id: "south_sudanese", flag: "🇸🇸", display: "South Sudanese" },
  { id: "spanish", flag: "🇪🇸", display: "Spanish" },
  { id: "sri_lankan", flag: "🇱🇰", display: "Sri Lankan" },
  { id: "sudanese", flag: "🇸🇩", display: "Sudanese" },
  { id: "surinamese", flag: "🇸🇷", display: "Surinamese" },
  { id: "swazi", flag: "🇸🇿", display: "Swazi" },
  { id: "swedish", flag: "🇸🇪", display: "Swedish" },
  { id: "swiss", flag: "🇨🇭", display: "Swiss" },
  { id: "syrian", flag: "🇸🇾", display: "Syrian" },
  { id: "taiwanese", flag: "🇹🇼", display: "Taiwanese" },
  { id: "tajikistani", flag: "🇹🇯", display: "Tajikistani" },
  { id: "tanzanian", flag: "🇹🇿", display: "Tanzanian" },
  { id: "thai", flag: "🇹🇭", display: "Thai" },
  { id: "timorese", flag: "🇹🇱", display: "Timorese" },
  { id: "togolese", flag: "🇹🇬", display: "Togolese" },
  { id: "tongan", flag: "🇹🇴", display: "Tongan" },
  { id: "trinidadian", flag: "🇹🇹", display: "Trinidadian" },
  { id: "tunisian", flag: "🇹🇳", display: "Tunisian" },
  { id: "turkish", flag: "🇹🇷", display: "Turkish" },
  { id: "turkmenistani", flag: "🇹🇲", display: "Turkmenistani" },
  { id: "tuvaluan", flag: "🇹🇻", display: "Tuvaluan" },
  { id: "ugandan", flag: "🇺🇬", display: "Ugandan" },
  { id: "ukrainian", flag: "🇺🇦", display: "Ukrainian" },
  { id: "uruguayan", flag: "🇺🇾", display: "Uruguayan" },
  { id: "uzbekistani", flag: "🇺🇿", display: "Uzbekistani" },
  { id: "vanuatuan", flag: "🇻🇺", display: "Vanuatuan" },
  { id: "vatican", flag: "🇻🇦", display: "Vatican" },
  { id: "venezuelan", flag: "🇻🇪", display: "Venezuelan" },
  { id: "vietnamese", flag: "🇻🇳", display: "Vietnamese" },
  { id: "yemeni", flag: "🇾🇪", display: "Yemeni" },
  { id: "zambian", flag: "🇿🇲", display: "Zambian" },
  { id: "zimbabwean", flag: "🇿🇼", display: "Zimbabwean" },
];

// Format nationality with correct flag - handles all variations
export const formatNationality = (
  nationality: string,
  t?: (key: string) => string,
): string => {
  if (!nationality || nationality.trim() === "") return "";

  // Normalize nationality string (lowercase, trim, handle underscores)
  const normalized = nationality.toLowerCase().trim().replace(/_/g, "_");

  // Find matching nationality
  const nationalityData = NATIONALITY_OPTIONS.find(
    (opt) => opt.id === normalized,
  );

  if (!nationalityData) {
    // Fallback: try to capitalize and use as-is with default flag
    const capitalized = capitalizeFirstLetter(nationality);
    return ` ${capitalized}`;
  }

  // Get translated name if translation function provided
  if (t) {
    const translationKey = `nationalities.${nationalityData.id}`;
    const translatedValue = t(translationKey);
    // If translation exists and is different from the key, use it
    if (translatedValue && translatedValue !== translationKey) {
      return `${nationalityData.flag} ${translatedValue}`;
    }
  }

  // Return with flag and display name
  return `${nationalityData.flag} ${nationalityData.display}`;
};

// Interface for API interest
interface ApiInterest {
  id: string;
  name: string;
  name_languages?: string;
  image_url?: string;
  distance?: number;
  date?: string;
  time?: string;
}

// Get localized name from API interest using name_languages
// Returns the name exactly as provided by backend (with emoji if included)
const getLocalizedNameFromApi = (
  interest: ApiInterest,
  currentLanguage: string = "en",
): string => {
  if (!interest.name_languages) {
    return interest.name || "";
  }

  try {
    const nameLanguages =
      typeof interest.name_languages === "string"
        ? JSON.parse(interest.name_languages)
        : interest.name_languages;

    const langCode = currentLanguage.split("-")[0]; // Get "en" from "en-US"

    // Try current language, fallback to English, then to original name
    // Return exactly as provided by backend (includes emoji if present)
    return (
      nameLanguages[langCode] || nameLanguages["en"] || interest.name || ""
    );
  } catch (error) {
    return interest.name || "";
  }
};

// Convert interest IDs to display names using API interests only
// Returns names exactly as provided by backend (with emoji if included)
const convertInterestIdsToNames = (
  interestIds: string[],
  apiInterests: ApiInterest[],
  currentLanguage: string = "en",
): string[] => {
  if (!apiInterests || apiInterests.length === 0) {
    return [];
  }

  return interestIds
    .map((id) => {
      // Convert ID to string for comparison (handle both string and number IDs)
      const idStr = String(id).trim();

      // Find interest in API interests by ID (compare as strings)
      const apiInterest = apiInterests.find(
        (interest) => String(interest.id).trim() === idStr,
      );

      if (apiInterest) {
        // Return localized name exactly as provided by backend (includes emoji if present)
        return getLocalizedNameFromApi(apiInterest, currentLanguage);
      }

      // If interest not found in API, log warning with more details
      console.warn(
        `Interest with ID ${idStr} not found in API interests. Available IDs:`,
        apiInterests.map((i) => i.id).join(", "),
      );
      return null;
    })
    .filter((name): name is string => name !== null);
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
    if (jsonString.startsWith("[") && jsonString.endsWith("]")) {
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
        return [];
      }
    } else {
      // It's not a JSON array, treat as a simple string
      return [jsonString];
    }
  } catch (error) {
    // Fallback: try to extract values manually if JSON parsing fails
    try {
      // Extract values between quotes
      const matches = jsonString.match(/"([^"]+)"/g);
      if (matches) {
        const values = matches.map((match) => match.replace(/"/g, ""));
        return values;
      }
    } catch (fallbackError) {}
    // Final fallback: return as single string
    return [jsonString];
  }
};

// Parse interests JSON string and convert IDs to display names using API interests
export const parseInterestsWithNames = (
  jsonString: string,
  apiInterests: ApiInterest[],
  currentLanguage: string = "en",
): string[] => {
  try {
    if (!jsonString) return [];

    // Check if it's a JSON array string
    if (jsonString.startsWith("[") && jsonString.endsWith("]")) {
      // Handle heavily escaped JSON strings like the one in the API response
      let cleanedString = jsonString;

      // Remove excessive backslashes and quotes
      cleanedString = cleanedString.replace(/\\\\+/g, "\\");
      cleanedString = cleanedString.replace(/\\\"/g, '"');

      // Parse the JSON
      const interestIds = JSON.parse(cleanedString);

      if (Array.isArray(interestIds)) {
        return convertInterestIdsToNames(
          interestIds,
          apiInterests,
          currentLanguage,
        );
      } else {
        return [];
      }
    } else {
      // It's not a JSON array, might be a single interest ID or comma-separated values

      // Try to parse as comma-separated values
      if (jsonString.includes(",")) {
        const values = jsonString.split(",").map((v) => v.trim());
        return convertInterestIdsToNames(values, apiInterests, currentLanguage);
      } else {
        // Single value
        return convertInterestIdsToNames(
          [jsonString.trim()],
          apiInterests,
          currentLanguage,
        );
      }
    }
  } catch (error) {
    // Fallback: try to extract values manually if JSON parsing fails
    try {
      // Extract values between quotes
      const matches = jsonString.match(/"([^"]+)"/g);
      if (matches) {
        const values = matches.map((match) => match.replace(/"/g, ""));
        return convertInterestIdsToNames(values, apiInterests, currentLanguage);
      }

      // Try comma-separated values
      if (jsonString.includes(",")) {
        const values = jsonString.split(",").map((v) => v.trim());
        return convertInterestIdsToNames(values, apiInterests, currentLanguage);
      } else {
        // Single value
        return convertInterestIdsToNames(
          [jsonString.trim()],
          apiInterests,
          currentLanguage,
        );
      }
    } catch (fallbackError) {}
    return [];
  }
};

// Single source of truth for looking for options
export const LOOKING_FOR_OPTIONS = [
  { id: "serious", emoji: "🩵", translationKey: "lookingFor.serious" },
  { id: "casual", emoji: "😘", translationKey: "lookingFor.casual" },
  { id: "friendship", emoji: "🤝", translationKey: "lookingFor.friendship" },
  { id: "open", emoji: "🔥", translationKey: "lookingFor.open" },
  { id: "prefer-not", emoji: "🤫", translationKey: "lookingFor.preferNot" },
];

// Format a single looking for ID to display string (similar to formatReligion/formatZodiac)
export const formatLookingFor = (
  lookingForId: string,
  t?: (key: string) => string,
): string => {
  if (!lookingForId || lookingForId.trim() === "") return "";

  // Normalize looking for ID (lowercase, trim)
  const normalized = lookingForId.toLowerCase().trim();

  // Find matching option
  const option = LOOKING_FOR_OPTIONS.find((opt) => opt.id === normalized);

  if (!option) {
    // Fallback: capitalize and return as-is
    const capitalized = capitalizeFirstLetter(lookingForId);
    return `🤫 ${capitalized}`;
  }

  // Get translated name if translation function provided
  if (t) {
    const translatedValue = t(option.translationKey);
    // If translation exists and is different from the key, use it
    if (translatedValue && translatedValue !== option.translationKey) {
      return `${option.emoji} ${translatedValue}`;
    }
  }

  // Fallback to English labels
  const fallbackLabels: { [key: string]: string } = {
    serious: "Serious relationship",
    casual: "Casual dating",
    friendship: "Friendship",
    open: "Open to possibilities",
    "prefer-not": "Prefer not to say",
  };

  return `${option.emoji} ${fallbackLabels[normalized] || option.id}`;
};

// Convert array of looking for IDs to display labels
const convertLookingForIdsToLabels = (
  lookingForIds: string[],
  t?: (key: string, options?: any) => string,
): string[] => {
  return lookingForIds
    .map((id) => formatLookingFor(id, t))
    .filter((label) => label && label.trim() !== "");
};

// Add new function specifically for looking_for
export const parseLookingForWithLabels = (
  jsonString: string,
  t?: (key: string) => string,
): string[] => {
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
      return convertLookingForIdsToLabels(lookingForIds, t);
    } else {
      return [];
    }
  } catch (error) {
    // Fallback: try to extract values manually if JSON parsing fails
    try {
      // Extract values between quotes
      const matches = jsonString.match(/"([^"]+)"/g);
      if (matches) {
        const values = matches.map((match) => match.replace(/"/g, ""));
        return convertLookingForIdsToLabels(values, t);
      }
    } catch (fallbackError) {}
    return [];
  }
};

// Export nationality options for dropdowns (with labels for display)
export const nationalityOptions = NATIONALITY_OPTIONS.map((option) => ({
  label: `${option.flag} ${option.display}`,
  value: option.id,
}));

// Convert array of nationality IDs to display labels
export const convertNationalityValuesToLabels = (
  nationalityValues: string[],
  t?: (key: string) => string,
): string[] => {
  return nationalityValues
    .map((value) => formatNationality(value, t))
    .filter(
      (label) => label && label.trim() !== "" && label !== "Not Specified",
    );
};

export const parseNationalityWithLabels = (
  jsonString: string,
  t?: (key: string) => string,
): string[] => {
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
        return convertNationalityValuesToLabels(nationalityValues, t);
      }
    }

    // Try to parse as regular JSON array
    const nationalityValues = JSON.parse(cleanedString);
    if (Array.isArray(nationalityValues)) {
      return convertNationalityValuesToLabels(nationalityValues, t);
    }

    return [];
  } catch (error) {
    return [];
  }
};

export const religionOptions = [
  { label: "✝️ Christianity", value: "christianity" },
  { label: "☪️ Islam", value: "islam" },
  { label: "✡️ Judaism", value: "judaism" },
  { label: "🕉️ Hinduism", value: "hinduism" },
  { label: "☸️ Buddhism", value: "buddhism" },
  { label: "☬ Sikhism", value: "sikhism" },
  { label: "🙏 Other", value: "others" },
];

export const zodiacOptions = [
  { label: "♈ Aries", value: "aries" },
  { label: "♉ Taurus", value: "taurus" },
  { label: "♊ Gemini", value: "gemini" },
  { label: "♋ Cancer", value: "cancer" },
  { label: "♌ Leo", value: "leo" },
  { label: "♍ Virgo", value: "virgo" },
  { label: "♎ Libra", value: "libra" },
  { label: "♏ Scorpio", value: "scorpio" },
  { label: "♐ Sagittarius", value: "sagittarius" },
  { label: "♑ Capricorn", value: "capricorn" },
  { label: "♒ Aquarius", value: "aquarius" },
  { label: "♓ Pisces", value: "pisces" },
];

// Format time for display, handling timezone conversion
export const formatTimeForDisplay = (time: string, locale?: string) => {
  try {
    // Get current language from AsyncStorage or use passed locale
    const currentLocale = locale || "en-US";
    const isGerman = currentLocale.includes("de") || currentLocale === "de";

    // If time is already in 12-hour format with AM/PM, return as is (for English)
    if (!isGerman && (time.includes("AM") || time.includes("PM"))) {
      return time;
    }

    // Parse time
    const [hours, minutes] = time.split(":").map(Number);

    // German uses 24-hour format, English uses 12-hour format
    if (isGerman) {
      // Return 24-hour format for German (e.g., "18:31")
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    } else {
      // Return 12-hour format for English (e.g., "6:31 PM")
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");
      return `${displayHours}:${displayMinutes} ${ampm}`;
    }
  } catch (error) {
    return time;
  }
};

export const formatTimeAgo = (
  date: string,
  time: string,
  t?: (key: string, options?: any) => string,
) => {
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
      return t ? t("helper.time.recently") : "Recently";
    }

    const now = new Date();
    const diffInMs = now.getTime() - matchDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return t ? t("helper.time.justNow") : "Just now";
    } else if (diffInHours < 24) {
      return t
        ? t(
            diffInHours > 1
              ? "helper.time.hoursAgo_plural"
              : "helper.time.hoursAgo",
            { count: diffInHours },
          )
        : `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInDays === 1) {
      return t ? t("helper.time.dayAgo") : "1 day ago";
    } else {
      return t
        ? t("helper.time.daysAgo", { count: diffInDays })
        : `${diffInDays} days ago`;
    }
  } catch (error) {
    return t ? t("helper.time.recently") : "Recently";
  }
};

/**
 * Parse created_at timestamp and add timezone offset (e.g., 3 hours)
 * Format: "Oct 11, 2025 10:24 PM"
 */
export const parseCreatedAtWithOffset = (
  createdAtStr: string,
  hoursOffset: number = 3,
): Date => {
  try {
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
    return new Date();
  }
};

/**
 * Calculate time ago from a Date object
 */
export const calculateTimeAgo = (
  date: Date,
  t?: (key: string, options?: any) => string,
): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return t ? t("helper.time.justNow") : "Just now";
  } else if (diffInHours < 1) {
    return t
      ? t(
          diffInMinutes > 1
            ? "helper.time.minutesAgo_plural"
            : "helper.time.minutesAgo",
          { count: diffInMinutes },
        )
      : `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  } else if (diffInHours < 24) {
    return t
      ? t(
          diffInHours > 1
            ? "helper.time.hoursAgo_plural"
            : "helper.time.hoursAgo",
          { count: diffInHours },
        )
      : `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInDays === 1) {
    return t ? t("helper.time.dayAgo") : "1 day ago";
  } else {
    return t
      ? t("helper.time.daysAgo", { count: diffInDays })
      : `${diffInDays} days ago`;
  }
};

// ==================== IMAGE PARSING UTILITIES ====================

const IMAGE_BASE_URL = "https://api.andra-dating.com/images/";
const DEFAULT_IMAGE_MALE =
  "https://i.pinimg.com/736x/30/1c/30/301c3029c36d70b518325f803bba8f09.jpg";
const DEFAULT_IMAGE_FEMALE =
  "https://i.pinimg.com/736x/8c/1f/82/8c1f82be3fbc9276db0c6431eee2aadd.jpg";

/**
 * Parse user images from API response
 * Handles the complex escaped JSON format from the API
 */
export const parseUserImages = (
  imagesStr: string,
  gender: string = "unknown",
): string[] => {
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
    return "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=400&fit=crop";
  }
};

// ==================== DISTANCE UTILITIES ====================

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number },
): string => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

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
export const getUserLocationString = (
  city: string,
  state: string,
  country: string,
  t?: (key: string, options?: any) => string,
): string => {
  const parts = [city, state, country].filter(Boolean);
  return parts.length > 0
    ? parts.join(", ")
    : t
      ? t("helper.location.notSpecified")
      : "Location not specified";
};

/**
 * Get user online status
 */
export const getUserOnlineStatus = (
  status: string,
  t?: (key: string, options?: any) => string,
): string => {
  return status === "1"
    ? t
      ? t("helper.status.online")
      : "Online"
    : t
      ? t("helper.status.offline")
      : "Offline";
};

/**
 * Format height for display
 */
export const formatHeight = (
  heightStr: string,
  t?: (key: string, options?: any) => string,
): string => {
  if (!heightStr || heightStr === "0") return "";

  const height = parseFloat(heightStr);
  if (isNaN(height)) return "";

  const unit = t ? t("helper.height.unit") : "cm";
  return `${height} ${unit}`;
};

/**
 * Format date for meetup requests (e.g., "Thu, Feb 15")
 */
export const formatMeetupDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  } catch (error) {
    return dateString;
  }
};

/**
 * Format date for display in cards (e.g., "Sun, Feb 18")
 */
export const formatCardDate = (dateString: string, locale?: string): string => {
  try {
    const date = new Date(dateString);
    const currentLocale = locale || "en-US";

    // Use German locale for date formatting
    const localeToUse =
      currentLocale.includes("de") || currentLocale === "de"
        ? "de-DE"
        : "en-US";

    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString(localeToUse, options);
  } catch (error) {
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
    date.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

    return date < today;
  } catch (error) {
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
      return 0;
    }
  });
};

/**
 * Filter out past dates
 * Keep accepted requests regardless of date
 * Keep pending requests for today and future
 */
export const filterOutPastDates = (requests: any[]): any[] => {
  return requests.filter((request) => {
    if (!request.date) return false;

    // Keep accepted requests regardless of date
    const status = String(request.status || "").toLowerCase();
    if (status === "accept" || status === "accepted") {
      return true;
    }

    // Keep pending requests regardless of date (they need to be shown)
    if (status === "pending") {
      return true;
    }

    // Don't filter out requests with placeholder dates like "TBD", "N/A", "0000-00-00"
    const date = String(request.date).toUpperCase();
    if (date === "TBD" || date === "N/A" || date === "0000-00-00") {
      return true;
    }

    return !isDateInPast(request.date);
  });
};
