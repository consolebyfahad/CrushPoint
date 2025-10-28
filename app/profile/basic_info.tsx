import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BasicInfo() {
  const { t } = useTranslation();
  const { user, userData, updateUserData } = useAppContext();
  const { showToast } = useToast();
  const params = useLocalSearchParams();

  // Initialize state properly from params
  const [basicInfo, setBasicInfo] = useState({
    interestedIn: userData.gender_interest || "",
    height: userData.height || "",
    nationality: userData.originalNationalityValues || [],
    religion: userData.religion || "",
    zodiacSign: userData.zodiac || "",
  });

  // Changed to array for multi-select
  const [relationshipGoals, setRelationshipGoals] = useState<string[]>(
    userData.originalLookingForIds || []
  );
  const [isLoading, setIsLoading] = useState(false);

  // Options for dropdowns
  const interestedInOptions = [
    { label: t("basicInfo.interestedIn.men"), value: "male" },
    { label: t("basicInfo.interestedIn.women"), value: "female" },
    { label: t("basicInfo.interestedIn.both"), value: "other" },
  ];

  const relationshipGoalOptions = [
    {
      label: `🩵 ${t("basicInfo.relationshipGoals.serious")}`,
      value: "serious",
    },
    { label: `😘 ${t("basicInfo.relationshipGoals.casual")}`, value: "casual" },
    {
      label: `🤝 ${t("basicInfo.relationshipGoals.friendship")}`,
      value: "friendship",
    },
    { label: `🔥 ${t("basicInfo.relationshipGoals.open")}`, value: "open" },
    {
      label: `🤫 ${t("basicInfo.relationshipGoals.preferNot")}`,
      value: "prefer-not",
    },
  ];

  // Nationality options
  const nationalityOptions = [
    { label: `🇦🇫 ${t("nationalities.afghan")}`, value: "afghan" },
    { label: `🇦🇱 ${t("nationalities.albanian")}`, value: "albanian" },
    { label: `🇩🇿 ${t("nationalities.algerian")}`, value: "algerian" },
    { label: `🇺🇸 ${t("nationalities.american")}`, value: "american" },
    { label: `🇦🇩 ${t("nationalities.andorran")}`, value: "andorran" },
    { label: `🇦🇴 ${t("nationalities.angolan")}`, value: "angolan" },
    { label: `🇦🇬 ${t("nationalities.antiguan")}`, value: "antiguan" },
    { label: `🇦🇷 ${t("nationalities.argentine")}`, value: "argentine" },
    { label: `🇦🇲 ${t("nationalities.armenian")}`, value: "armenian" },
    { label: `🇦🇺 ${t("nationalities.australian")}`, value: "australian" },
    { label: `🇦🇹 ${t("nationalities.austrian")}`, value: "austrian" },
    { label: `🇦🇿 ${t("nationalities.azerbaijani")}`, value: "azerbaijani" },
    { label: `🇧🇸 ${t("nationalities.bahamian")}`, value: "bahamian" },
    { label: `🇧🇭 ${t("nationalities.bahraini")}`, value: "bahraini" },
    { label: `🇧🇩 ${t("nationalities.bangladeshi")}`, value: "bangladeshi" },
    { label: `🇧🇧 ${t("nationalities.barbadian")}`, value: "barbadian" },
    { label: `🇧🇾 ${t("nationalities.belarusian")}`, value: "belarusian" },
    { label: `🇧🇪 ${t("nationalities.belgian")}`, value: "belgian" },
    { label: `🇧🇿 ${t("nationalities.belizean")}`, value: "belizean" },
    { label: `🇧🇯 ${t("nationalities.beninese")}`, value: "beninese" },
    { label: `🇧🇹 ${t("nationalities.bhutanese")}`, value: "bhutanese" },
    { label: `🇧🇴 ${t("nationalities.bolivian")}`, value: "bolivian" },
    { label: `🇧🇦 ${t("nationalities.bosnian")}`, value: "bosnian" },
    { label: `🇧🇼 ${t("nationalities.botswanan")}`, value: "botswanan" },
    { label: `🇧🇷 ${t("nationalities.brazilian")}`, value: "brazilian" },
    { label: `🇬🇧 ${t("nationalities.british")}`, value: "british" },
    { label: `🇧🇳 ${t("nationalities.bruneian")}`, value: "bruneian" },
    { label: `🇧🇬 ${t("nationalities.bulgarian")}`, value: "bulgarian" },
    { label: `🇧🇫 ${t("nationalities.burkinabe")}`, value: "burkinabe" },
    { label: `🇲🇲 ${t("nationalities.burmese")}`, value: "burmese" },
    { label: `🇧🇮 ${t("nationalities.burundian")}`, value: "burundian" },
    { label: `🇰🇭 ${t("nationalities.cambodian")}`, value: "cambodian" },
    { label: `🇨🇲 ${t("nationalities.cameroonian")}`, value: "cameroonian" },
    { label: `🇨🇦 ${t("nationalities.canadian")}`, value: "canadian" },
    { label: `🇨🇻 ${t("nationalities.cape_verdean")}`, value: "cape_verdean" },
    {
      label: `🇨🇫 ${t("nationalities.central_african")}`,
      value: "central_african",
    },
    { label: `🇹🇩 ${t("nationalities.chadian")}`, value: "chadian" },
    { label: `🇨🇱 ${t("nationalities.chilean")}`, value: "chilean" },
    { label: `🇨🇳 ${t("nationalities.chinese")}`, value: "chinese" },
    { label: `🇨🇴 ${t("nationalities.colombian")}`, value: "colombian" },
    { label: `🇰🇲 ${t("nationalities.comoran")}`, value: "comoran" },
    { label: `🇨🇩 ${t("nationalities.congolese")}`, value: "congolese" },
    { label: `🇨🇷 ${t("nationalities.costa_rican")}`, value: "costa_rican" },
    { label: `🇭🇷 ${t("nationalities.croatian")}`, value: "croatian" },
    { label: `🇨🇺 ${t("nationalities.cuban")}`, value: "cuban" },
    { label: `🇨🇾 ${t("nationalities.cypriot")}`, value: "cypriot" },
    { label: `🇨🇿 ${t("nationalities.czech")}`, value: "czech" },
    { label: `🇩🇰 ${t("nationalities.danish")}`, value: "danish" },
    { label: `🇩🇯 ${t("nationalities.djiboutian")}`, value: "djiboutian" },
    { label: `🇩🇲 ${t("nationalities.dominican")}`, value: "dominican" },
    { label: `🇳🇱 ${t("nationalities.dutch")}`, value: "dutch" },
    { label: `🇪🇨 ${t("nationalities.ecuadorian")}`, value: "ecuadorian" },
    { label: `🇪🇬 ${t("nationalities.egyptian")}`, value: "egyptian" },
    { label: `🇦🇪 ${t("nationalities.emirati")}`, value: "emirati" },
    {
      label: `🇬🇶 ${t("nationalities.equatorial_guinean")}`,
      value: "equatorial_guinean",
    },
    { label: `🇪🇷 ${t("nationalities.eritrean")}`, value: "eritrean" },
    { label: `🇪🇪 ${t("nationalities.estonian")}`, value: "estonian" },
    { label: `🇪🇹 ${t("nationalities.ethiopian")}`, value: "ethiopian" },
    { label: `🇫🇯 ${t("nationalities.fijian")}`, value: "fijian" },
    { label: `🇵🇭 ${t("nationalities.filipino")}`, value: "filipino" },
    { label: `🇫🇮 ${t("nationalities.finnish")}`, value: "finnish" },
    { label: `🇫🇷 ${t("nationalities.french")}`, value: "french" },
    { label: `🇬🇦 ${t("nationalities.gabonese")}`, value: "gabonese" },
    { label: `🇬🇲 ${t("nationalities.gambian")}`, value: "gambian" },
    { label: `🇬🇪 ${t("nationalities.georgian")}`, value: "georgian" },
    { label: `🇩🇪 ${t("nationalities.german")}`, value: "german" },
    { label: `🇬🇭 ${t("nationalities.ghanaian")}`, value: "ghanaian" },
    { label: `🇬🇷 ${t("nationalities.greek")}`, value: "greek" },
    { label: `🇬🇩 ${t("nationalities.grenadian")}`, value: "grenadian" },
    { label: `🇬🇹 ${t("nationalities.guatemalan")}`, value: "guatemalan" },
    { label: `🇬🇳 ${t("nationalities.guinean")}`, value: "guinean" },
    { label: `🇬🇾 ${t("nationalities.guyanese")}`, value: "guyanese" },
    { label: `🇭🇹 ${t("nationalities.haitian")}`, value: "haitian" },
    { label: `🇭🇳 ${t("nationalities.honduran")}`, value: "honduran" },
    { label: `🇭🇺 ${t("nationalities.hungarian")}`, value: "hungarian" },
    { label: `🇮🇸 ${t("nationalities.icelandic")}`, value: "icelandic" },
    { label: `🇮🇳 ${t("nationalities.indian")}`, value: "indian" },
    { label: `🇮🇩 ${t("nationalities.indonesian")}`, value: "indonesian" },
    { label: `🇮🇷 ${t("nationalities.iranian")}`, value: "iranian" },
    { label: `🇮🇶 ${t("nationalities.iraqi")}`, value: "iraqi" },
    { label: `🇮🇪 ${t("nationalities.irish")}`, value: "irish" },
    { label: `🇮🇱 ${t("nationalities.israeli")}`, value: "israeli" },
    { label: `🇮🇹 ${t("nationalities.italian")}`, value: "italian" },
    { label: `🇨🇮 ${t("nationalities.ivorian")}`, value: "ivorian" },
    { label: `🇯🇲 ${t("nationalities.jamaican")}`, value: "jamaican" },
    { label: `🇯🇵 ${t("nationalities.japanese")}`, value: "japanese" },
    { label: `🇯🇴 ${t("nationalities.jordanian")}`, value: "jordanian" },
    { label: `🇰🇿 ${t("nationalities.kazakhstani")}`, value: "kazakhstani" },
    { label: `🇰🇪 ${t("nationalities.kenyan")}`, value: "kenyan" },
    { label: `🇰🇮 ${t("nationalities.kiribati")}`, value: "kiribati" },
    { label: `🇰🇷 ${t("nationalities.korean")}`, value: "korean" },
    { label: `🇰🇼 ${t("nationalities.kuwaiti")}`, value: "kuwaiti" },
    { label: `🇰🇬 ${t("nationalities.kyrgyzstani")}`, value: "kyrgyzstani" },
    { label: `🇱🇦 ${t("nationalities.laotian")}`, value: "laotian" },
    { label: `🇱🇻 ${t("nationalities.latvian")}`, value: "latvian" },
    { label: `🇱🇧 ${t("nationalities.lebanese")}`, value: "lebanese" },
    { label: `🇱🇷 ${t("nationalities.liberian")}`, value: "liberian" },
    { label: `🇱🇾 ${t("nationalities.libyan")}`, value: "libyan" },
    { label: `🇱🇮 ${t("nationalities.liechtenstein")}`, value: "liechtenstein" },
    { label: `🇱🇹 ${t("nationalities.lithuanian")}`, value: "lithuanian" },
    { label: `🇱🇺 ${t("nationalities.luxembourgish")}`, value: "luxembourgish" },
    { label: `🇲🇰 ${t("nationalities.macedonian")}`, value: "macedonian" },
    { label: `🇲🇬 ${t("nationalities.malagasy")}`, value: "malagasy" },
    { label: `🇲🇼 ${t("nationalities.malawian")}`, value: "malawian" },
    { label: `🇲🇾 ${t("nationalities.malaysian")}`, value: "malaysian" },
    { label: `🇲🇻 ${t("nationalities.maldivian")}`, value: "maldivian" },
    { label: `🇲🇱 ${t("nationalities.malian")}`, value: "malian" },
    { label: `🇲🇹 ${t("nationalities.maltese")}`, value: "maltese" },
    { label: `🇲🇭 ${t("nationalities.marshallese")}`, value: "marshallese" },
    { label: `🇲🇷 ${t("nationalities.mauritanian")}`, value: "mauritanian" },
    { label: `🇲🇺 ${t("nationalities.mauritian")}`, value: "mauritian" },
    { label: `🇲🇽 ${t("nationalities.mexican")}`, value: "mexican" },
    { label: `🇫🇲 ${t("nationalities.micronesian")}`, value: "micronesian" },
    { label: `🇲🇩 ${t("nationalities.moldovan")}`, value: "moldovan" },
    { label: `🇲🇨 ${t("nationalities.monacan")}`, value: "monacan" },
    { label: `🇲🇳 ${t("nationalities.mongolian")}`, value: "mongolian" },
    { label: `🇲🇪 ${t("nationalities.montenegrin")}`, value: "montenegrin" },
    { label: `🇲🇦 ${t("nationalities.moroccan")}`, value: "moroccan" },
    { label: `🇲🇿 ${t("nationalities.mozambican")}`, value: "mozambican" },
    { label: `🇳🇦 ${t("nationalities.namibian")}`, value: "namibian" },
    { label: `🇳🇷 ${t("nationalities.nauruan")}`, value: "nauruan" },
    { label: `🇳🇵 ${t("nationalities.nepalese")}`, value: "nepalese" },
    { label: `🇳🇿 ${t("nationalities.new_zealand")}`, value: "new_zealand" },
    { label: `🇳🇮 ${t("nationalities.nicaraguan")}`, value: "nicaraguan" },
    { label: `🇳🇬 ${t("nationalities.nigerian")}`, value: "nigerian" },
    { label: `🇳🇪 ${t("nationalities.nigerien")}`, value: "nigerien" },
    { label: `🇰🇵 ${t("nationalities.north_korean")}`, value: "north_korean" },
    { label: `🇳🇴 ${t("nationalities.norwegian")}`, value: "norwegian" },
    { label: `🇴🇲 ${t("nationalities.omani")}`, value: "omani" },
    { label: `🇵🇰 ${t("nationalities.pakistani")}`, value: "pakistani" },
    { label: `🇵🇼 ${t("nationalities.palauan")}`, value: "palauan" },
    { label: `🇵🇸 ${t("nationalities.palestinian")}`, value: "palestinian" },
    { label: `🇵🇦 ${t("nationalities.panamanian")}`, value: "panamanian" },
    {
      label: `🇵🇬 ${t("nationalities.papua_new_guinean")}`,
      value: "papua_new_guinean",
    },
    { label: `🇵🇾 ${t("nationalities.paraguayan")}`, value: "paraguayan" },
    { label: `🇵🇪 ${t("nationalities.peruvian")}`, value: "peruvian" },
    { label: `🇵🇱 ${t("nationalities.polish")}`, value: "polish" },
    { label: `🇵🇹 ${t("nationalities.portuguese")}`, value: "portuguese" },
    { label: `🇶🇦 ${t("nationalities.qatari")}`, value: "qatari" },
    { label: `🇷🇴 ${t("nationalities.romanian")}`, value: "romanian" },
    { label: `🇷🇺 ${t("nationalities.russian")}`, value: "russian" },
    { label: `🇷🇼 ${t("nationalities.rwandan")}`, value: "rwandan" },
    { label: `🇰🇳 ${t("nationalities.saint_kitts")}`, value: "saint_kitts" },
    { label: `🇱🇨 ${t("nationalities.saint_lucian")}`, value: "saint_lucian" },
    {
      label: `🇻🇨 ${t("nationalities.saint_vincentian")}`,
      value: "saint_vincentian",
    },
    { label: `🇼🇸 ${t("nationalities.samoan")}`, value: "samoan" },
    { label: `🇸🇲 ${t("nationalities.san_marinese")}`, value: "san_marinese" },
    { label: `🇸🇹 ${t("nationalities.sao_tomean")}`, value: "sao_tomean" },
    { label: `🇸🇦 ${t("nationalities.saudi_arabian")}`, value: "saudi_arabian" },
    { label: `🇸🇳 ${t("nationalities.senegalese")}`, value: "senegalese" },
    { label: `🇷🇸 ${t("nationalities.serbian")}`, value: "serbian" },
    { label: `🇸🇨 ${t("nationalities.seychellois")}`, value: "seychellois" },
    {
      label: `🇸🇱 ${t("nationalities.sierra_leonean")}`,
      value: "sierra_leonean",
    },
    { label: `🇸🇬 ${t("nationalities.singaporean")}`, value: "singaporean" },
    { label: `🇸🇰 ${t("nationalities.slovak")}`, value: "slovak" },
    { label: `🇸🇮 ${t("nationalities.slovenian")}`, value: "slovenian" },
    {
      label: `🇸🇧 ${t("nationalities.solomon_islander")}`,
      value: "solomon_islander",
    },
    { label: `🇸🇴 ${t("nationalities.somali")}`, value: "somali" },
    { label: `🇿🇦 ${t("nationalities.south_african")}`, value: "south_african" },
    { label: `🇰🇷 ${t("nationalities.south_korean")}`, value: "south_korean" },
    {
      label: `🇸🇸 ${t("nationalities.south_sudanese")}`,
      value: "south_sudanese",
    },
    { label: `🇪🇸 ${t("nationalities.spanish")}`, value: "spanish" },
    { label: `🇱🇰 ${t("nationalities.sri_lankan")}`, value: "sri_lankan" },
    { label: `🇸🇩 ${t("nationalities.sudanese")}`, value: "sudanese" },
    { label: `🇸🇷 ${t("nationalities.surinamese")}`, value: "surinamese" },
    { label: `🇸🇿 ${t("nationalities.swazi")}`, value: "swazi" },
    { label: `🇸🇪 ${t("nationalities.swedish")}`, value: "swedish" },
    { label: `🇨🇭 ${t("nationalities.swiss")}`, value: "swiss" },
    { label: `🇸🇾 ${t("nationalities.syrian")}`, value: "syrian" },
    { label: `🇹🇼 ${t("nationalities.taiwanese")}`, value: "taiwanese" },
    { label: `🇹🇯 ${t("nationalities.tajikistani")}`, value: "tajikistani" },
    { label: `🇹🇿 ${t("nationalities.tanzanian")}`, value: "tanzanian" },
    { label: `🇹🇭 ${t("nationalities.thai")}`, value: "thai" },
    { label: `🇹🇱 ${t("nationalities.timorese")}`, value: "timorese" },
    { label: `🇹🇬 ${t("nationalities.togolese")}`, value: "togolese" },
    { label: `🇹🇴 ${t("nationalities.tongan")}`, value: "tongan" },
    { label: `🇹🇹 ${t("nationalities.trinidadian")}`, value: "trinidadian" },
    { label: `🇹🇳 ${t("nationalities.tunisian")}`, value: "tunisian" },
    { label: `🇹🇷 ${t("nationalities.turkish")}`, value: "turkish" },
    { label: `🇹🇲 ${t("nationalities.turkmenistani")}`, value: "turkmenistani" },
    { label: `🇹🇻 ${t("nationalities.tuvaluan")}`, value: "tuvaluan" },
    { label: `🇺🇬 ${t("nationalities.ugandan")}`, value: "ugandan" },
    { label: `🇺🇦 ${t("nationalities.ukrainian")}`, value: "ukrainian" },
    { label: `🇺🇾 ${t("nationalities.uruguayan")}`, value: "uruguayan" },
    { label: `🇺🇿 ${t("nationalities.uzbekistani")}`, value: "uzbekistani" },
    { label: `🇻🇺 ${t("nationalities.vanuatuan")}`, value: "vanuatuan" },
    { label: `🇻🇦 ${t("nationalities.vatican")}`, value: "vatican" },
    { label: `🇻🇪 ${t("nationalities.venezuelan")}`, value: "venezuelan" },
    { label: `🇻🇳 ${t("nationalities.vietnamese")}`, value: "vietnamese" },
    { label: `🇾🇪 ${t("nationalities.yemeni")}`, value: "yemeni" },
    { label: `🇿🇲 ${t("nationalities.zambian")}`, value: "zambian" },
    { label: `🇿🇼 ${t("nationalities.zimbabwean")}`, value: "zimbabwean" },
  ];

  // Religion options
  const religionOptions = [
    { label: `✝️ ${t("religions.christianity")}`, value: "christianity" },
    { label: `☪️ ${t("religions.islam")}`, value: "islam" },
    { label: `✡️ ${t("religions.judaism")}`, value: "judaism" },
    { label: `🕉️ ${t("religions.hinduism")}`, value: "hinduism" },
    { label: `☸️ ${t("religions.buddhism")}`, value: "buddhism" },
    { label: `🌍 ${t("religions.others")}`, value: "others" },
  ];

  // Zodiac options
  const zodiacOptions = [
    { label: `♈ ${t("zodiac.aries")}`, value: "aries" },
    { label: `♉ ${t("zodiac.taurus")}`, value: "taurus" },
    { label: `♊ ${t("zodiac.gemini")}`, value: "gemini" },
    { label: `♋ ${t("zodiac.cancer")}`, value: "cancer" },
    { label: `♌ ${t("zodiac.leo")}`, value: "leo" },
    { label: `♍ ${t("zodiac.virgo")}`, value: "virgo" },
    { label: `♎ ${t("zodiac.libra")}`, value: "libra" },
    { label: `♏ ${t("zodiac.scorpio")}`, value: "scorpio" },
    { label: `♐ ${t("zodiac.sagittarius")}`, value: "sagittarius" },
    { label: `♑ ${t("zodiac.capricorn")}`, value: "capricorn" },
    { label: `♒ ${t("zodiac.aquarius")}`, value: "aquarius" },
    { label: `♓ ${t("zodiac.pisces")}`, value: "pisces" },
  ];

  const handleSave = async () => {
    if (!user?.user_id) {
      Alert.alert(t("common.error"), t("basicInfo.validation.sessionExpired"));
      return;
    }

    // Validation: require at least one relationship goal
    if (relationshipGoals.length === 0) {
      Alert.alert(
        t("common.error"),
        t("basicInfo.validation.relationshipGoalRequired")
      );
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("id", user.user_id);
      formData.append("table_name", "users");

      // Append all basic info fields
      formData.append("gender_interest", basicInfo.interestedIn);
      formData.append("looking_for", JSON.stringify(relationshipGoals));
      formData.append("height", basicInfo.height);

      // Handle nationality properly - ensure it's a clean array
      const cleanNationality = Array.isArray(basicInfo.nationality)
        ? basicInfo.nationality.filter((n) => n && n !== "Not Specified")
        : [];
      formData.append("nationality", JSON.stringify(cleanNationality));

      formData.append("religion", basicInfo.religion);
      formData.append("zodiac", basicInfo.zodiacSign);
      const response = await apiCall(formData);

      if (response.result) {
        updateUserData({
          gender_interest: basicInfo.interestedIn,
          looking_for: relationshipGoals,
          originalLookingForIds: relationshipGoals,
          height: basicInfo.height,
          nationality: cleanNationality,
          originalNationalityValues: cleanNationality,
          religion: basicInfo.religion,
          zodiac: basicInfo.zodiacSign,
        });
        router.back();
      } else {
        showToast(
          response.message || t("profile.failedToUpdateBasicInfo"),
          "error"
        );
      }
    } catch (error) {
      console.error("Update error:", error);
      showToast(t("profile.failedToUpdateBasicInfoRetry"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setBasicInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function to handle relationship goal selection
  const toggleRelationshipGoal = (value: string) => {
    setRelationshipGoals((prev: string[]) => {
      // Check if "prefer-not" is being selected
      if (value === "prefer-not") {
        // If "prefer not to say" is selected, only keep that option
        return ["prefer-not"];
      } else {
        // If any other option is selected, remove "prefer not to say" if it exists
        const filteredPrev = prev.filter(
          (goal: string) => goal !== "prefer-not"
        );

        if (filteredPrev.includes(value)) {
          // Remove if already selected
          return filteredPrev.filter((goal: string) => goal !== value);
        } else {
          // Add if not selected
          return [...filteredPrev, value];
        }
      }
    });
  };

  const renderRelationshipGoalItem = (option: {
    label: string;
    value: string;
  }) => {
    const isSelected = relationshipGoals.includes(option.value);

    return (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.relationshipGoalItem,
          isSelected && styles.relationshipGoalItemSelected,
        ]}
        onPress={() => toggleRelationshipGoal(option.value)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.relationshipGoalText,
            isSelected && styles.relationshipGoalTextSelected,
          ]}
        >
          {option.label}
        </Text>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color={color.white} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title={t("profile.basicInfo")} divider />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Interested in */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{t("profile.interestedIn")}</Text>
          <Dropdown
            style={[
              styles.dropdown,
              !basicInfo.interestedIn && styles.errorBorder,
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={interestedInOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={t("profile.selectInterestedIn")}
            value={basicInfo.interestedIn}
            onChange={(item) => {
              updateField("interestedIn", item.value);
            }}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={20} color={color.gray55} />
            )}
          />
        </View>

        {/* Relationship Goals - Custom Multi Select */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {t("profile.relationshipGoals")}
          </Text>
          <Text style={styles.fieldSubLabel}>
            {t("profile.selectOneOrMoreGoals")}
          </Text>
          <View
            style={[
              styles.relationshipGoalsContainer,
              relationshipGoals.length === 0 && styles.errorBorder,
            ]}
          >
            {relationshipGoalOptions.map((option) =>
              renderRelationshipGoalItem(option)
            )}
          </View>
        </View>

        {/* Height */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{t("profile.height")}</Text>
          <View style={styles.heightInputContainer}>
            <TextInput
              style={styles.heightInput}
              placeholder="170"
              value={basicInfo.height}
              onChangeText={(value) => updateField("height", value)}
              keyboardType="numeric"
            />
            <Text style={styles.heightUnit}>{t("basicInfo.heightUnit")}</Text>
          </View>
        </View>

        {/* Nationality - Multi Select */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{t("profile.nationality")}</Text>
          <Text style={styles.fieldSubLabel}>
            {t("profile.selectUpTo3Nationalities")}
          </Text>
          <MultiSelect
            style={[
              styles.dropdown,
              // basicInfo.nationality.length === 0 && styles.errorBorder,
            ]}
            placeholderStyle={styles.placeholderStyle}
            iconStyle={styles.iconStyle}
            data={nationalityOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={t("profile.selectNationalities")}
            value={basicInfo.nationality}
            onChange={(items) => {
              // Limit to 3 nationalities
              const limitedItems = items.slice(0, 3);
              setBasicInfo((prev) => ({
                ...prev,
                nationality: limitedItems,
              }));
            }}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={20} color={color.gray55} />
            )}
            search
            searchPlaceholder={t("profile.searchNationalities")}
            selectedStyle={styles.selectedItem}
            activeColor={color.primary100}
            itemTextStyle={styles.itemTextStyle}
            selectedTextStyle={styles.selectedDropdowntItemText}
            renderSelectedItem={(item, unSelect) => (
              <TouchableOpacity
                style={styles.selectedItem}
                onPress={() => unSelect && unSelect(item)}
              >
                <Text style={styles.selectedItemText}>{item.label}</Text>
                <Ionicons name="close" size={16} color={color.white} />
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Religion */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{t("profile.religion")}</Text>
          <Dropdown
            style={[
              styles.dropdown,
              // !basicInfo.religion && styles.errorBorder
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={religionOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={t("profile.selectReligion")}
            value={basicInfo.religion}
            onChange={(item) => {
              updateField("religion", item.value);
            }}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={20} color={color.gray55} />
            )}
          />
        </View>

        {/* Zodiac Sign */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{t("profile.zodiacSign")}</Text>
          <Dropdown
            style={[
              styles.dropdown,
              // !basicInfo.zodiacSign && styles.errorBorder,
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={zodiacOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={t("profile.selectZodiacSign")}
            value={basicInfo.zodiacSign}
            onChange={(item) => {
              updateField("zodiacSign", item.value);
            }}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={20} color={color.gray55} />
            )}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <CustomButton
          title={isLoading ? t("profile.saving") : t("profile.saveChanges")}
          onPress={handleSave}
          isDisabled={isLoading}
          isLoading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginTop: 24,
    zIndex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray700,
    marginBottom: 8,
  },
  fieldSubLabel: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    marginBottom: 12,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: color.gray600,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: color.white,
  },
  errorBorder: {
    borderColor: "#FF6B6B",
    borderWidth: 1.5,
  },
  placeholderStyle: {
    fontSize: 16,
    color: color.gray14,
    fontFamily: font.medium,
  },
  selectedTextStyle: {
    // backgroundColor: color.primary,
    fontSize: 16,
    color: color.black,
    fontFamily: font.medium,
    flex: 1,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  // Multi-select dropdown styles
  selectedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    marginRight: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: color.primary || "#5FB3D4",
  },
  selectedItemText: {
    fontSize: 12,
    fontFamily: font.regular,
    color: color.white,
    marginRight: 4,
  },
  itemTextStyle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
  },
  selectedDropdowntItemText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.primary,
  },
  // Text input styles
  textInput: {
    borderWidth: 1,
    borderColor: color.gray600,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    backgroundColor: color.white,
  },
  bottomSpacing: {
    height: 100,
  },
  saveContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  // Relationship goal styles
  relationshipGoalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.gray600,
    backgroundColor: color.white,
  },
  relationshipGoalItemSelected: {
    borderColor: color.primary,
    backgroundColor: "#F0F9FF",
  },
  relationshipGoalText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    flex: 1,
  },
  relationshipGoalTextSelected: {
    color: color.primary,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: color.gray600,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: color.primary,
    borderColor: color.primary,
  },
  relationshipGoalsContainer: {
    borderWidth: 1,
    borderColor: color.gray600,
    borderRadius: 12,
    padding: 8,
    backgroundColor: color.white,
  },
  // Height field styles
  heightInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.gray600,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: color.white,
  },
  heightInput: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.black,
    flex: 1,
  },
  heightUnit: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
    marginLeft: 8,
  },
});
