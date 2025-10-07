import ReportUser from "@/components//report_user";
import BlockConfirmation from "@/components/block_option";
import CustomSearchBar from "@/components/custom_search";
import MatchCard from "@/components/match_card";
import ProfileOptions from "@/components/profile_options";
import RemoveMatch from "@/components/remove_match";
import { useAppContext } from "@/context/app_context";
import useGetMatches from "@/hooks/useGetMatches";
import { apiCall } from "@/utils/api";
import { color, font } from "@/utils/constants";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Match {
  id: string;
  name: string;
  age: number;
}

export default function Matches() {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [searchText, setSearchText] = useState("");
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);
  const [showReportUser, setShowReportUser] = useState(false);
  const [showRemoveMatch, setShowRemoveMatch] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  // Use the useGetMatches hook
  const { matches, loading, error, refetch, removeMatch, updateMatchStatus } =
    useGetMatches();

  // Filter matches based on search text
  const filteredMatches = matches.filter((match) =>
    match.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleViewProfile = useCallback((match: any) => {
    console.log("View profile for:", match.name);

    const userProfileData = {
      id: match.match_id || match.id,
      name: match.name,
      age: match.age,
      images: match.images,
      about: match.about,
      height: match.height,
      nationality: match.nationality,
      religion: match.religion,
      zodiac: match.zodiac,
      gender: match.gender,
      country: match.country,
      state: match.state,
      city: match.city,
      languages: match.languages,
      interests: match.interests,
      lookingFor: match.lookingFor,
      isOnline: match.isOnline,
      phone: match.phone,
      dob: match.dob,
      actualLocation: match.actualLocation,
      email: "",
    };

    router.push({
      pathname: "/profile/user_profile",
      params: { user: JSON.stringify(userProfileData) },
    });
  }, []);

  const handleMatchOptions = useCallback((match: any) => {
    setSelectedMatch(match);
    setShowProfileOptions(true);
  }, []);

  // Navigation handlers (same pattern as UserProfile)
  const handleNavigateToRemoveMatch = useCallback(() => {
    setShowProfileOptions(false);
    setShowRemoveMatch(true);
  }, []);

  const handleNavigateToBlock = useCallback(() => {
    setShowProfileOptions(false);
    setShowBlockConfirmation(true);
  }, []);

  const handleNavigateToReport = useCallback(() => {
    setShowProfileOptions(false);
    setShowReportUser(true);
  }, []);

  // Back to profile options handler
  const handleBackToProfileOptions = useCallback(() => {
    setShowBlockConfirmation(false);
    setShowReportUser(false);
    setShowRemoveMatch(false);
    setShowProfileOptions(true);
  }, []);

  // Action handlers
  const handleRemoveMatch = useCallback(async () => {
    try {
      if (selectedMatch) {
        console.log("selectedMatch", selectedMatch);
        // Call API to remove match
        const formData = new FormData();
        formData.append("type", "delete_data");
        formData.append("table_name", "matches");
        formData.append("id", selectedMatch.match_id);
        console.log("Remove match", JSON.stringify(formData));
        const response = await apiCall(formData);

        if (response.result) {
          // Remove from local state using the hook function
          removeMatch(selectedMatch.match_id);
        } else {
          console.error("Failed to remove match:", response.message);
        }
      }
    } catch (error) {
      console.error("Remove match error:", error);
    } finally {
      setShowRemoveMatch(false);
      setSelectedMatch(null);
    }
  }, [selectedMatch, removeMatch]);

  const handleConfirmBlock = useCallback(async () => {
    try {
      if (selectedMatch) {
        // Add to blocked users
        const blockFormData = new FormData();
        blockFormData.append("type", "add_data");
        blockFormData.append("user_id", user?.user_id || "");
        blockFormData.append("table_name", "blocked_users");
        blockFormData.append("block_id", selectedMatch.match_id);

        const blockResponse = await apiCall(blockFormData);

        if (blockResponse.result) {
          // Remove match from matches table
          const removeFormData = new FormData();
          removeFormData.append("type", "delete_data");
          removeFormData.append("table_name", "matches");
          removeFormData.append("id", selectedMatch.match_id);

          const removeResponse = await apiCall(removeFormData);

          if (removeResponse.result) {
            // Remove from local state using the hook function
            removeMatch(selectedMatch.match_id);
          }
        } else {
          console.error("Block failed:", blockResponse.message);
        }
      }
    } catch (error) {
      console.error("Block Error:", error);
    } finally {
      setShowBlockConfirmation(false);
      setSelectedMatch(null);
    }
  }, [selectedMatch, user?.user_id, removeMatch]);

  const handleSubmitReport = useCallback(
    async (reportData: any) => {
      try {
        if (selectedMatch) {
          // Submit report to API
          const formData = new FormData();
          formData.append("type", "add_data");
          formData.append("table_name", "reports");
          formData.append("user_id", user?.user_id || "");
          formData.append("reported_user_id", selectedMatch.match_id);
          formData.append("reason", reportData.reason);
          formData.append("description", reportData.description || "");

          const response = await apiCall(formData);

          if (response.result) {
            // Optionally remove the match after reporting
            removeMatch(selectedMatch.match_id);
          } else {
            console.error("Report submission failed:", response.message);
          }
        }
      } catch (error) {
        console.error("Report submission error:", error);
      } finally {
        setShowReportUser(false);
        setSelectedMatch(null);
      }
    },
    [selectedMatch, user?.user_id, removeMatch]
  );

  // Memoized render function for better performance
  const renderMatchCard: ListRenderItem<Match> = useCallback(
    ({ item }) => (
      <MatchCard
        match={item}
        onViewProfile={handleViewProfile}
        onOptions={handleMatchOptions}
      />
    ),
    [handleViewProfile, handleMatchOptions]
  );

  // Memoized key extractor
  const keyExtractor = useCallback((item: Match) => `match-${item.id}`, []);

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>💕</Text>
        <Text style={styles.emptyTitle}>{t("matches.noMatchesYet")}</Text>
        <Text style={styles.emptyText}>{t("matches.startSwiping")}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>{t("matches.refresh")}</Text>
        </TouchableOpacity>
      </View>
    ),
    [refetch, t]
  );

  const renderErrorState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>😔</Text>
        <Text style={styles.emptyTitle}>
          {t("matches.errorLoadingMatches")}
        </Text>
        <Text style={styles.emptyText}>
          {error || t("matches.somethingWentWrong")}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, loading && styles.retryButtonDisabled]}
          onPress={refetch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={color.white} />
          ) : (
            <Text style={styles.retryButtonText}>{t("common.tryAgain")}</Text>
          )}
        </TouchableOpacity>
      </View>
    ),
    [error, loading, refetch, t]
  );

  const renderLoadingState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={color.primary} />
        <Text style={styles.loadingText}>{t("matches.loadingMatches")}</Text>
      </View>
    ),
    [t]
  );

  // Handle different states
  if (loading && matches.length === 0) {
    return renderLoadingState();
  }

  return (
    <View style={styles.container}>
      {/* Search Bar - only show if there are matches */}
      {matches.length > 0 && (
        <CustomSearchBar
          searchText={searchText}
          onChangeText={setSearchText}
          placeholder={t("matches.searchMatches")}
        />
      )}

      {/* Matches List */}
      <FlatList
        data={filteredMatches}
        renderItem={renderMatchCard}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          filteredMatches.length === 0 && { flex: 1 },
        ]}
        ListEmptyComponent={error ? renderErrorState : renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            colors={[color.primary]}
            tintColor={color.primary}
          />
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={30}
        initialNumToRender={3}
        windowSize={10}
      />

      {/* Profile Options Modal */}
      <ProfileOptions
        visible={showProfileOptions}
        onClose={() => {
          setShowProfileOptions(false);
          setSelectedMatch(null);
        }}
        onRemoveMatch={handleNavigateToRemoveMatch}
        onBlock={handleNavigateToBlock}
        onReport={handleNavigateToReport}
        userData={selectedMatch}
        isMatch={true}
      />

      {/* Remove Match Modal */}
      <RemoveMatch
        visible={showRemoveMatch}
        onClose={() => setShowRemoveMatch(false)}
        onBack={handleBackToProfileOptions}
        onConfirm={handleRemoveMatch}
        userName={selectedMatch?.name}
      />

      {/* Block Confirmation Modal */}
      <BlockConfirmation
        visible={showBlockConfirmation}
        onClose={() => setShowBlockConfirmation(false)}
        onBack={handleBackToProfileOptions}
        onConfirm={handleConfirmBlock}
        userName={selectedMatch?.name}
      />

      {/* Report User Modal */}
      <ReportUser
        visible={showReportUser}
        onClose={() => setShowReportUser(false)}
        onBack={handleBackToProfileOptions}
        onSubmit={handleSubmitReport}
        userName={selectedMatch?.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 100,
    flexGrow: 1,
  },
  // Loading state
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
  },
  // Empty/Error states
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: font.semiBold,
    color: color.black,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: font.regular,
    color: color.gray55,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: color.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonDisabled: {
    opacity: 0.7,
  },
  retryButtonText: {
    color: color.white,
    fontSize: 16,
    fontFamily: font.semiBold,
  },
});
