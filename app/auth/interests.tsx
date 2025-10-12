import AnimatedInterestGrid from "@/components/AnimatedInterestGrid";
import CustomButton from "@/components/custom_button";
import Header from "@/components/header";
import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import useGetInterests from "@/hooks/useGetInterests";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import Feather from "@expo/vector-icons/Feather";
import Octicons from "@expo/vector-icons/Octicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Interests() {
  const { t } = useTranslation();
  const { interests, loading, error, refetch } = useGetInterests();
  const { updateUserData, user, userData } = useAppContext();
  const { showToast } = useToast();
  const params = useLocalSearchParams();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const minSelections = 2;
  const isButtonDisabled = selectedInterests.length < minSelections;

  const counterProgress = useSharedValue(0);

  // Load existing interests when in edit mode
  useEffect(() => {
    if (params.isEdit && userData?.originalInterestIds) {
      try {
        // Use the already parsed interest IDs from the profile
        const interestIds = userData.originalInterestIds;
        console.log("Loading existing interests:", interestIds);

        const finalInterests = Array.isArray(interestIds)
          ? interestIds
          : [interestIds];
        console.log("Setting selected interests:", finalInterests);
        setSelectedInterests(finalInterests);
      } catch (error) {
        console.error("Error loading existing interests:", error);
        setSelectedInterests([]);
      }
    }
  }, [params.isEdit, userData?.originalInterestIds]);

  useEffect(() => {
    counterProgress.value = withSpring(
      selectedInterests.length >= minSelections ? 1 : 0,
      {
        damping: 15,
        stiffness: 200,
      }
    );
  }, [selectedInterests.length]);

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedInterests(newSelection);
  };

  const handleContinue = () => {
    updateUserData({ interests: selectedInterests });
    router.push("/auth/private_spot");
  };

  const handleSaveChanges = async () => {
    if (!user?.user_id) {
      Alert.alert(t("common.error"), t("interests.errorSessionExpired"));
      return;
    }

    if (selectedInterests.length === 0) {
      Alert.alert(
        t("interests.validationError"),
        t("interests.selectAtLeastOne")
      );
      return;
    }
    console.log("selectedInterests", selectedInterests);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("table_name", "users");
      formData.append("id", user.user_id);
      formData.append("interests", JSON.stringify(selectedInterests));

      const response = await apiCall(formData);

      if (response.result) {
        updateUserData({ interests: selectedInterests });
        setTimeout(() => {
          router.back();
        }, 1000);
      } else {
        showToast(t("interests.updateFailed"), "error");
      }
    } catch (error) {
      showToast(t("interests.updateFailedRetry"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRetry = () => {
    refetch();
  };

  const animatedCounterStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(
      counterProgress.value,
      [0, 1],
      [color.gray55, color.primary]
    );

    return {
      color: textColor,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[color.primary]}
            tintColor={color.primary}
            title={t("common.retry")}
            titleColor={color.gray55}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              {params.isEdit
                ? t("interests.interests")
                : t("interests.interests")}
            </Text>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>
                <Octicons name="info" size={14} color={color.gray55} />{" "}
                {params.isEdit
                  ? t("interests.updateInterestsSubtitle")
                  : t("interests.selectAtLeast", { count: 3 })}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.searchContainer,
              Platform.OS === "ios" && { paddingVertical: 14 },
            ]}
          >
            <View style={styles.searchIcon}>
              <Feather name="search" size={20} color={color.gray55} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder={t("interests.searchInterests")}
              placeholderTextColor={color.gray55}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {error && interests.length === 0 ? (
            <View style={styles.errorContainer}>
              <Octicons name="alert" size={48} color={color.gray55} />
              <Text style={styles.errorTitle}>{t("common.error")}</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <Text style={styles.retryButtonText}>
                  {t("common.tryAgain")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : loading && interests.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={color.primary} />
              <Text style={styles.loadingText}>{t("common.loading")}</Text>
            </View>
          ) : (
            <AnimatedInterestGrid
              interests={interests}
              selectedInterests={selectedInterests}
              onSelectionChange={handleSelectionChange}
              searchQuery={searchQuery}
              minSelections={minSelections}
              staggerAnimation={true}
              staggerDelay={30}
              containerStyle={styles.interestsContainer}
            />
          )}
        </View>
      </ScrollView>

      {!params.isEdit ? (
        <View style={styles.bottomSection}>
          <Animated.Text style={[styles.selectedCount, animatedCounterStyle]}>
            {t("interests.selectedCount", {
              count: selectedInterests.length,
              min: minSelections,
            })}
          </Animated.Text>
          <CustomButton
            title={t("interests.continue")}
            onPress={handleContinue}
            isDisabled={isButtonDisabled}
          />
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <Text style={styles.selectedCountEdit}>
            {selectedInterests.length === 1
              ? t("interests.selectedCountEdit", {
                  count: selectedInterests.length,
                })
              : t("interests.selectedCountEditPlural", {
                  count: selectedInterests.length,
                })}
          </Text>
          <CustomButton
            title={isLoading ? t("common.loading") : t("common.save")}
            onPress={handleSaveChanges}
            isDisabled={isButtonDisabled || isLoading}
            isLoading={isLoading}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleSection: {
    paddingTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: font.bold,
    color: color.black,
    marginBottom: 12,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    lineHeight: 22,
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: color.gray87,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
    overflow: "hidden",
  },
  searchIcon: {
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.black,
  },
  interestsContainer: {
    flex: 1,
  },
  bottomSection: {
    borderTopWidth: 1,
    padding: 16,
    borderColor: color.gray87,
    gap: 12,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: color.gray87,
    gap: 12,
  },
  selectedCount: {
    fontSize: 16,
    fontFamily: font.regular,
    textAlign: "center",
  },
  selectedCountEdit: {
    fontSize: 16,
    fontFamily: font.regular,
    textAlign: "center",
    color: color.gray55,
  },
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
  },
  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: font.bold,
    color: color.black,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: color.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.white,
  },
});
