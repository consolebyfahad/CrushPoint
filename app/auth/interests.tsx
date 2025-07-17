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
  const { interests, loading, error, refetch } = useGetInterests();
  const { updateUserData, user, userData } = useAppContext();
  const { showToast } = useToast();
  const params = useLocalSearchParams();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const minSelections = 3;
  const isButtonDisabled = selectedInterests.length < minSelections;

  const counterProgress = useSharedValue(0);

  // Load existing interests when in edit mode
  useEffect(() => {
    if (params.isEdit && userData?.interests) {
      try {
        // Parse the interests if they're passed as JSON string
        const interestIds =
          typeof userData.interests === "string"
            ? JSON.parse(userData.interests)
            : userData.interests;

        setSelectedInterests(
          Array.isArray(interestIds) ? interestIds : [interestIds]
        );
      } catch (error) {
        console.error("Error parsing interests:", error);
        setSelectedInterests([]);
      }
    }
  }, [params.isEdit, userData?.interests]);

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
      Alert.alert("Error", "User session expired. Please login again.");
      return;
    }

    if (selectedInterests.length === 0) {
      Alert.alert("Validation Error", "Please select at least one interest.");
      return;
    }

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
        showToast("Interests updated successfully!", "success");
        setTimeout(() => {
          router.back();
        }, 1000);
      } else {
        showToast("Failed to update interests", "error");
      }
    } catch (error) {
      console.error("Update error:", error);
      showToast("Failed to update interests. Please try again.", "error");
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
            title="Pull to refresh interests"
            titleColor={color.gray55}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              {params.isEdit
                ? "Edit your interests"
                : "What are your interests?"}
            </Text>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>
                <Octicons name="info" size={14} color={color.gray55} />
                {params.isEdit
                  ? " Update your interests to get better matches"
                  : " Select at least 3 interests to help us find better matches for you"}
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
              placeholder="Search interests..."
              placeholderTextColor={color.gray55}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {error && interests.length === 0 ? (
            <View style={styles.errorContainer}>
              <Octicons name="alert" size={48} color={color.gray55} />
              <Text style={styles.errorTitle}>Unable to load interests</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : loading && interests.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={color.primary} />
              <Text style={styles.loadingText}>Loading interests...</Text>
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
            Selected: {selectedInterests.length} (minimum {minSelections})
          </Animated.Text>
          <CustomButton
            title="Continue"
            onPress={handleContinue}
            isDisabled={isButtonDisabled}
          />
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <Text style={styles.selectedCountEdit}>
            Selected: {selectedInterests.length} interest
            {selectedInterests.length !== 1 ? "s" : ""}
          </Text>
          <CustomButton
            title={isLoading ? "Saving..." : "Save Changes"}
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
