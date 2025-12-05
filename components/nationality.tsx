import { color, font } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Nationality({
  onClose,
  onBack,
  filterData,
  setFilterData,
}: any) {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>(
    Array.isArray(filterData.nationality) ? filterData.nationality : []
  );

  const nationalities = [
    { id: "afghan", name: t("nationalities.afghan"), flag: "🇦🇫" },
    { id: "albanian", name: t("nationalities.albanian"), flag: "🇦🇱" },
    { id: "algerian", name: t("nationalities.algerian"), flag: "🇩🇿" },
    { id: "american", name: t("nationalities.american"), flag: "🇺🇸" },
    { id: "andorran", name: t("nationalities.andorran"), flag: "🇦🇩" },
    { id: "angolan", name: t("nationalities.angolan"), flag: "🇦🇴" },
    { id: "antiguan", name: t("nationalities.antiguan"), flag: "🇦🇬" },
    { id: "argentine", name: t("nationalities.argentine"), flag: "🇦🇷" },
    { id: "armenian", name: t("nationalities.armenian"), flag: "🇦🇲" },
    { id: "australian", name: t("nationalities.australian"), flag: "🇦🇺" },
    { id: "austrian", name: t("nationalities.austrian"), flag: "🇦🇹" },
    { id: "azerbaijani", name: t("nationalities.azerbaijani"), flag: "🇦🇿" },
    { id: "bahamian", name: t("nationalities.bahamian"), flag: "🇧🇸" },
    { id: "bahraini", name: t("nationalities.bahraini"), flag: "🇧🇭" },
    { id: "bangladeshi", name: t("nationalities.bangladeshi"), flag: "🇧🇩" },
    { id: "barbadian", name: t("nationalities.barbadian"), flag: "🇧🇧" },
    { id: "belarusian", name: t("nationalities.belarusian"), flag: "🇧🇾" },
    { id: "belgian", name: t("nationalities.belgian"), flag: "🇧🇪" },
    { id: "belizean", name: t("nationalities.belizean"), flag: "🇧🇿" },
    { id: "beninese", name: t("nationalities.beninese"), flag: "🇧🇯" },
    { id: "bhutanese", name: t("nationalities.bhutanese"), flag: "🇧🇹" },
    { id: "bolivian", name: t("nationalities.bolivian"), flag: "🇧🇴" },
    { id: "bosnian", name: t("nationalities.bosnian"), flag: "🇧🇦" },
    { id: "botswanan", name: t("nationalities.botswanan"), flag: "🇧🇼" },
    { id: "brazilian", name: t("nationalities.brazilian"), flag: "🇧🇷" },
    { id: "british", name: t("nationalities.british"), flag: "🇬🇧" },
    { id: "bruneian", name: t("nationalities.bruneian"), flag: "🇧🇳" },
    { id: "bulgarian", name: t("nationalities.bulgarian"), flag: "🇧🇬" },
    { id: "burkinabe", name: t("nationalities.burkinabe"), flag: "🇧🇫" },
    { id: "burmese", name: t("nationalities.burmese"), flag: "🇲🇲" },
    { id: "burundian", name: t("nationalities.burundian"), flag: "🇧🇮" },
    { id: "cambodian", name: t("nationalities.cambodian"), flag: "🇰🇭" },
    { id: "cameroonian", name: t("nationalities.cameroonian"), flag: "🇨🇲" },
    { id: "canadian", name: t("nationalities.canadian"), flag: "🇨🇦" },
    { id: "cape_verdean", name: t("nationalities.cape_verdean"), flag: "🇨🇻" },
    {
      id: "central_african",
      name: t("nationalities.central_african"),
      flag: "🇨🇫",
    },
    { id: "chadian", name: t("nationalities.chadian"), flag: "🇹🇩" },
    { id: "chilean", name: t("nationalities.chilean"), flag: "🇨🇱" },
    { id: "chinese", name: t("nationalities.chinese"), flag: "🇨🇳" },
    { id: "colombian", name: t("nationalities.colombian"), flag: "🇨🇴" },
    { id: "comoran", name: t("nationalities.comoran"), flag: "🇰🇲" },
    { id: "congolese", name: t("nationalities.congolese"), flag: "🇨🇩" },
    { id: "costa_rican", name: t("nationalities.costa_rican"), flag: "🇨🇷" },
    { id: "croatian", name: t("nationalities.croatian"), flag: "🇭🇷" },
    { id: "cuban", name: t("nationalities.cuban"), flag: "🇨🇺" },
    { id: "cypriot", name: t("nationalities.cypriot"), flag: "🇨🇾" },
    { id: "czech", name: t("nationalities.czech"), flag: "🇨🇿" },
    { id: "danish", name: t("nationalities.danish"), flag: "🇩🇰" },
    { id: "djiboutian", name: t("nationalities.djiboutian"), flag: "🇩🇯" },
    { id: "dominican", name: t("nationalities.dominican"), flag: "🇩🇲" },
    { id: "dutch", name: t("nationalities.dutch"), flag: "🇳🇱" },
    { id: "ecuadorian", name: t("nationalities.ecuadorian"), flag: "🇪🇨" },
    { id: "egyptian", name: t("nationalities.egyptian"), flag: "🇪🇬" },
    { id: "emirati", name: t("nationalities.emirati"), flag: "🇦🇪" },
    {
      id: "equatorial_guinean",
      name: t("nationalities.equatorial_guinean"),
      flag: "🇬🇶",
    },
    { id: "eritrean", name: t("nationalities.eritrean"), flag: "🇪🇷" },
    { id: "estonian", name: t("nationalities.estonian"), flag: "🇪🇪" },
    { id: "ethiopian", name: t("nationalities.ethiopian"), flag: "🇪🇹" },
    { id: "fijian", name: t("nationalities.fijian"), flag: "🇫🇯" },
    { id: "filipino", name: t("nationalities.filipino"), flag: "🇵🇭" },
    { id: "finnish", name: t("nationalities.finnish"), flag: "🇫🇮" },
    { id: "french", name: t("nationalities.french"), flag: "🇫🇷" },
    { id: "gabonese", name: t("nationalities.gabonese"), flag: "🇬🇦" },
    { id: "gambian", name: t("nationalities.gambian"), flag: "🇬🇲" },
    { id: "georgian", name: t("nationalities.georgian"), flag: "🇬🇪" },
    { id: "german", name: t("nationalities.german"), flag: "🇩🇪" },
    { id: "ghanaian", name: t("nationalities.ghanaian"), flag: "🇬🇭" },
    { id: "greek", name: t("nationalities.greek"), flag: "🇬🇷" },
    { id: "grenadian", name: t("nationalities.grenadian"), flag: "🇬🇩" },
    { id: "guatemalan", name: t("nationalities.guatemalan"), flag: "🇬🇹" },
    { id: "guinean", name: t("nationalities.guinean"), flag: "🇬🇳" },
    { id: "guyanese", name: t("nationalities.guyanese"), flag: "🇬🇾" },
    { id: "haitian", name: t("nationalities.haitian"), flag: "🇭🇹" },
    { id: "honduran", name: t("nationalities.honduran"), flag: "🇭🇳" },
    { id: "hungarian", name: t("nationalities.hungarian"), flag: "🇭🇺" },
    { id: "icelandic", name: t("nationalities.icelandic"), flag: "🇮🇸" },
    { id: "indian", name: t("nationalities.indian"), flag: "🇮🇳" },
    { id: "indonesian", name: t("nationalities.indonesian"), flag: "🇮🇩" },
    { id: "iranian", name: t("nationalities.iranian"), flag: "🇮🇷" },
    { id: "iraqi", name: t("nationalities.iraqi"), flag: "🇮🇶" },
    { id: "irish", name: t("nationalities.irish"), flag: "🇮🇪" },
    { id: "israeli", name: t("nationalities.israeli"), flag: "🇮🇱" },
    { id: "italian", name: t("nationalities.italian"), flag: "🇮🇹" },
    { id: "ivorian", name: t("nationalities.ivorian"), flag: "🇨🇮" },
    { id: "jamaican", name: t("nationalities.jamaican"), flag: "🇯🇲" },
    { id: "japanese", name: t("nationalities.japanese"), flag: "🇯🇵" },
    { id: "jordanian", name: t("nationalities.jordanian"), flag: "🇯🇴" },
    { id: "kazakhstani", name: t("nationalities.kazakhstani"), flag: "🇰🇿" },
    { id: "kenyan", name: t("nationalities.kenyan"), flag: "🇰🇪" },
    { id: "kiribati", name: t("nationalities.kiribati"), flag: "🇰🇮" },
    { id: "korean", name: t("nationalities.korean"), flag: "🇰🇷" },
    { id: "kuwaiti", name: t("nationalities.kuwaiti"), flag: "🇰🇼" },
    { id: "kyrgyzstani", name: t("nationalities.kyrgyzstani"), flag: "🇰🇬" },
    { id: "laotian", name: t("nationalities.laotian"), flag: "🇱🇦" },
    { id: "latvian", name: t("nationalities.latvian"), flag: "🇱🇻" },
    { id: "lebanese", name: t("nationalities.lebanese"), flag: "🇱🇧" },
    { id: "liberian", name: t("nationalities.liberian"), flag: "🇱🇷" },
    { id: "libyan", name: t("nationalities.libyan"), flag: "🇱🇾" },
    { id: "liechtenstein", name: t("nationalities.liechtenstein"), flag: "🇱🇮" },
    { id: "lithuanian", name: t("nationalities.lithuanian"), flag: "🇱🇹" },
    { id: "luxembourgish", name: t("nationalities.luxembourgish"), flag: "🇱🇺" },
    { id: "macedonian", name: t("nationalities.macedonian"), flag: "🇲🇰" },
    { id: "malagasy", name: t("nationalities.malagasy"), flag: "🇲🇬" },
    { id: "malawian", name: t("nationalities.malawian"), flag: "🇲🇼" },
    { id: "malaysian", name: t("nationalities.malaysian"), flag: "🇲🇾" },
    { id: "maldivian", name: t("nationalities.maldivian"), flag: "🇲🇻" },
    { id: "malian", name: t("nationalities.malian"), flag: "🇲🇱" },
    { id: "maltese", name: t("nationalities.maltese"), flag: "🇲🇹" },
    { id: "marshallese", name: t("nationalities.marshallese"), flag: "🇲🇭" },
    { id: "mauritanian", name: t("nationalities.mauritanian"), flag: "🇲🇷" },
    { id: "mauritian", name: t("nationalities.mauritian"), flag: "🇲🇺" },
    { id: "mexican", name: t("nationalities.mexican"), flag: "🇲🇽" },
    { id: "micronesian", name: t("nationalities.micronesian"), flag: "🇫🇲" },
    { id: "moldovan", name: t("nationalities.moldovan"), flag: "🇲🇩" },
    { id: "monacan", name: t("nationalities.monacan"), flag: "🇲🇨" },
    { id: "mongolian", name: t("nationalities.mongolian"), flag: "🇲🇳" },
    { id: "montenegrin", name: t("nationalities.montenegrin"), flag: "🇲🇪" },
    { id: "moroccan", name: t("nationalities.moroccan"), flag: "🇲🇦" },
    { id: "mozambican", name: t("nationalities.mozambican"), flag: "🇲🇿" },
    { id: "namibian", name: t("nationalities.namibian"), flag: "🇳🇦" },
    { id: "nauruan", name: t("nationalities.nauruan"), flag: "🇳🇷" },
    { id: "nepalese", name: t("nationalities.nepalese"), flag: "🇳🇵" },
    { id: "new_zealand", name: t("nationalities.new_zealand"), flag: "🇳🇿" },
    { id: "nicaraguan", name: t("nationalities.nicaraguan"), flag: "🇳🇮" },
    { id: "nigerian", name: t("nationalities.nigerian"), flag: "🇳🇬" },
    { id: "nigerien", name: t("nationalities.nigerien"), flag: "🇳🇪" },
    { id: "north_korean", name: t("nationalities.north_korean"), flag: "🇰🇵" },
    { id: "norwegian", name: t("nationalities.norwegian"), flag: "🇳🇴" },
    { id: "omani", name: t("nationalities.omani"), flag: "🇴🇲" },
    { id: "pakistani", name: t("nationalities.pakistani"), flag: "🇵🇰" },
    { id: "palauan", name: t("nationalities.palauan"), flag: "🇵🇼" },
    { id: "palestinian", name: t("nationalities.palestinian"), flag: "🇵🇸" },
    { id: "panamanian", name: t("nationalities.panamanian"), flag: "🇵🇦" },
    {
      id: "papua_new_guinean",
      name: t("nationalities.papua_new_guinean"),
      flag: "🇵🇬",
    },
    { id: "paraguayan", name: t("nationalities.paraguayan"), flag: "🇵🇾" },
    { id: "peruvian", name: t("nationalities.peruvian"), flag: "🇵🇪" },
    { id: "polish", name: t("nationalities.polish"), flag: "🇵🇱" },
    { id: "portuguese", name: t("nationalities.portuguese"), flag: "🇵🇹" },
    { id: "qatari", name: t("nationalities.qatari"), flag: "🇶🇦" },
    { id: "romanian", name: t("nationalities.romanian"), flag: "🇷🇴" },
    { id: "russian", name: t("nationalities.russian"), flag: "🇷🇺" },
    { id: "rwandan", name: t("nationalities.rwandan"), flag: "🇷🇼" },
    { id: "saint_kitts", name: t("nationalities.saint_kitts"), flag: "🇰🇳" },
    { id: "saint_lucian", name: t("nationalities.saint_lucian"), flag: "🇱🇨" },
    {
      id: "saint_vincentian",
      name: t("nationalities.saint_vincentian"),
      flag: "🇻🇨",
    },
    { id: "samoan", name: t("nationalities.samoan"), flag: "🇼🇸" },
    { id: "san_marinese", name: t("nationalities.san_marinese"), flag: "🇸🇲" },
    { id: "sao_tomean", name: t("nationalities.sao_tomean"), flag: "🇸🇹" },
    { id: "saudi_arabian", name: t("nationalities.saudi_arabian"), flag: "🇸🇦" },
    { id: "senegalese", name: t("nationalities.senegalese"), flag: "🇸🇳" },
    { id: "serbian", name: t("nationalities.serbian"), flag: "🇷🇸" },
    { id: "seychellois", name: t("nationalities.seychellois"), flag: "🇸🇨" },
    {
      id: "sierra_leonean",
      name: t("nationalities.sierra_leonean"),
      flag: "🇸🇱",
    },
    { id: "singaporean", name: t("nationalities.singaporean"), flag: "🇸🇬" },
    { id: "slovak", name: t("nationalities.slovak"), flag: "🇸🇰" },
    { id: "slovenian", name: t("nationalities.slovenian"), flag: "🇸🇮" },
    {
      id: "solomon_islander",
      name: t("nationalities.solomon_islander"),
      flag: "🇸🇧",
    },
    { id: "somali", name: t("nationalities.somali"), flag: "🇸🇴" },
    { id: "south_african", name: t("nationalities.south_african"), flag: "🇿🇦" },
    { id: "south_korean", name: t("nationalities.south_korean"), flag: "🇰🇷" },
    {
      id: "south_sudanese",
      name: t("nationalities.south_sudanese"),
      flag: "🇸🇸",
    },
    { id: "spanish", name: t("nationalities.spanish"), flag: "🇪🇸" },
    { id: "sri_lankan", name: t("nationalities.sri_lankan"), flag: "🇱🇰" },
    { id: "sudanese", name: t("nationalities.sudanese"), flag: "🇸🇩" },
    { id: "surinamese", name: t("nationalities.surinamese"), flag: "🇸🇷" },
    { id: "swazi", name: t("nationalities.swazi"), flag: "🇸🇿" },
    { id: "swedish", name: t("nationalities.swedish"), flag: "🇸🇪" },
    { id: "swiss", name: t("nationalities.swiss"), flag: "🇨🇭" },
    { id: "syrian", name: t("nationalities.syrian"), flag: "🇸🇾" },
    { id: "taiwanese", name: t("nationalities.taiwanese"), flag: "🇹🇼" },
    { id: "tajikistani", name: t("nationalities.tajikistani"), flag: "🇹🇯" },
    { id: "tanzanian", name: t("nationalities.tanzanian"), flag: "🇹🇿" },
    { id: "thai", name: t("nationalities.thai"), flag: "🇹🇭" },
    { id: "timorese", name: t("nationalities.timorese"), flag: "🇹🇱" },
    { id: "togolese", name: t("nationalities.togolese"), flag: "🇹🇬" },
    { id: "tongan", name: t("nationalities.tongan"), flag: "🇹🇴" },
    { id: "trinidadian", name: t("nationalities.trinidadian"), flag: "🇹🇹" },
    { id: "tunisian", name: t("nationalities.tunisian"), flag: "🇹🇳" },
    { id: "turkish", name: t("nationalities.turkish"), flag: "🇹🇷" },
    { id: "turkmenistani", name: t("nationalities.turkmenistani"), flag: "🇹🇲" },
    { id: "tuvaluan", name: t("nationalities.tuvaluan"), flag: "🇹🇻" },
    { id: "ugandan", name: t("nationalities.ugandan"), flag: "🇺🇬" },
    { id: "ukrainian", name: t("nationalities.ukrainian"), flag: "🇺🇦" },
    { id: "uruguayan", name: t("nationalities.uruguayan"), flag: "🇺🇾" },
    { id: "uzbekistani", name: t("nationalities.uzbekistani"), flag: "🇺🇿" },
    { id: "vanuatuan", name: t("nationalities.vanuatuan"), flag: "🇻🇺" },
    { id: "vatican", name: t("nationalities.vatican"), flag: "🇻🇦" },
    { id: "venezuelan", name: t("nationalities.venezuelan"), flag: "🇻🇪" },
    { id: "vietnamese", name: t("nationalities.vietnamese"), flag: "🇻🇳" },
    { id: "yemeni", name: t("nationalities.yemeni"), flag: "🇾🇪" },
    { id: "zambian", name: t("nationalities.zambian"), flag: "🇿🇲" },
    { id: "zimbabwean", name: t("nationalities.zimbabwean"), flag: "🇿🇼" },
  ];

  const filteredNationalities = nationalities.filter((nationality) =>
    nationality.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleNationalitySelect = (nationalityId: string) => {
    setSelectedNationalities((prev) => {
      if (prev.includes(nationalityId)) {
        // Remove nationality if already selected
        return prev.filter((n) => n !== nationalityId);
      } else {
        // Add nationality if not selected
        return [...prev, nationalityId];
      }
    });
  };

  const handleSave = () => {
    setFilterData({
      ...filterData,
      nationality: selectedNationalities,
    });
    onClose();
  };

  // Check if nationality is selected
  const isSelected = (nationalityId: string) => {
    return selectedNationalities.includes(nationalityId);
  };

  const renderNationalityItem = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.nationalityItem,
        isSelected(item.id) && styles.selectedNationalityItem,
      ]}
      onPress={() => handleNationalitySelect(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.nationalityContent}>
        <Text style={styles.flag}>{item.flag}</Text>
        <Text
          style={[
            styles.nationalityText,
            isSelected(item.id) && styles.selectedNationalityText,
          ]}
        >
          {item.name}
        </Text>
      </View>
      {isSelected(item.id) && (
        <Ionicons name="checkmark" size={20} color={color.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={color.black} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("filters.nationality")}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={color.black} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color={color.gray14}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t("filters.searchNationality")}
            placeholderTextColor={color.gray14}
          />
        </View>
      </View>

      {/* Nationality List */}
      <FlatList
        data={filteredNationalities}
        renderItem={renderNationalityItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Bottom Save Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            selectedNationalities.length === 0 && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={selectedNationalities.length === 0}
        >
          <Text
            style={[
              styles.saveButtonText,
              selectedNationalities.length === 0 &&
                styles.saveButtonTextDisabled,
            ]}
          >
            {t("save")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  title: {
    fontSize: 20,
    fontFamily: font.semiBold,
    color: color.black,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  nationalityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  nationalityContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flag: {
    fontSize: 20,
    marginRight: 16,
  },
  nationalityText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginLeft: 52, // Aligns with text after flag
  },
  selectedNationalityItem: {
    backgroundColor: "#F0F9FF",
  },
  selectedNationalityText: {
    color: color.primary,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  saveButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: color.primary,
  },
  saveButtonDisabled: {
    backgroundColor: "#E5E5E5",
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
  saveButtonTextDisabled: {
    color: "#9CA3AF",
  },
});
