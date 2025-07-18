import ReportUser from "@/components//report_user";
import BlockConfirmation from "@/components/block_option";
import MatchCard from "@/components/match_card";
import ProfileOptions from "@/components/profile_options";
import RemoveMatch from "@/components/remove_match";
import { color, font } from "@/utils/constants";
import React, { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomSearchBar from "@/components/custom_search";
import { MatchesTabsHeader } from "@/components/tabs_header";
import { useAppContext } from "@/context/app_context";
import useGetMatches from "@/hooks/useGetMatches";
import { apiCall } from "@/utils/api";
import { router } from "expo-router";

export default function Matches() {
  const { user } = useAppContext();
  const [searchText, setSearchText] = useState("");
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);
  const [showReportUser, setShowReportUser] = useState(false);
  const [showRemoveMatch, setShowRemoveMatch] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Use the useGetMatches hook
  const { matches, loading, error, refetch, removeMatch, updateMatchStatus } =
    useGetMatches();
  // Filter matches based on search text
  const filteredMatches = matches.filter((match) =>
    match.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleViewProfile = (match) => {
    console.log("View profile for:", match.name);
    router.push({
      pathname: "/profile/user_profile",
      params: { user: JSON.stringify(match) },
    });
    // Navigate to profile screen
    // navigation.navigate('UserProfile', { user: match });
  };

  const handleMatchOptions = (match) => {
    setSelectedMatch(match);
    setShowProfileOptions(true);
  };

  // Navigation handlers (same pattern as UserProfile)
  const handleNavigateToRemoveMatch = () => {
    setShowProfileOptions(false);
    setShowRemoveMatch(true);
  };

  const handleNavigateToBlock = () => {
    setShowProfileOptions(false);
    setShowBlockConfirmation(true);
  };

  const handleNavigateToReport = () => {
    setShowProfileOptions(false);
    setShowReportUser(true);
  };

  // Back to profile options handler
  const handleBackToProfileOptions = () => {
    setShowBlockConfirmation(false);
    setShowReportUser(false);
    setShowRemoveMatch(false);
    setShowProfileOptions(true);
  };

  // Action handlers
  const handleRemoveMatch = async () => {
    try {
      if (selectedMatch) {
        // Call API to remove match
        const formData = new FormData();
        formData.append("type", "delete_data");
        formData.append("table_name", "matches");
        formData.append("id", selectedMatch.id);

        const response = await apiCall(formData);

        if (response.result) {
          // Remove from local state using the hook function
          removeMatch(selectedMatch.id);
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
  };

  const handleConfirmBlock = async () => {
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
          removeFormData.append("id", selectedMatch.id);

          const removeResponse = await apiCall(removeFormData);

          if (removeResponse.result) {
            // Remove from local state using the hook function
            removeMatch(selectedMatch.id);
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
  };

  const handleSubmitReport = async (reportData) => {
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
          removeMatch(selectedMatch.id);
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
  };

  const renderMatchCard = ({ item }) => (
    <MatchCard
      match={item}
      onViewProfile={handleViewProfile}
      onOptions={handleMatchOptions}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No matches yet</Text>
      <Text style={styles.emptyText}>
        Start swiping to find your perfect match!
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Error loading matches</Text>
      <Text style={styles.emptyText}>
        {error || "Something went wrong. Pull to refresh."}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <MatchesTabsHeader title="Your Matches" matches={matches} />

      {/* Search Bar */}
      <CustomSearchBar
        searchText={searchText}
        onChangeText={setSearchText}
        placeholder="Search matches"
      />

      {/* Matches List */}
      <FlatList
        data={filteredMatches}
        renderItem={renderMatchCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={error ? renderErrorState : renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            colors={[color.primary]}
          />
        }
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 26,
    fontFamily: font.bold,
    color: color.black,
  },
  matchCount: {
    fontSize: 14,
    fontFamily: font.regular,
    color: color.gray55,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.gray94,
    borderRadius: 14,
    paddingHorizontal: 16,
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
  clearButton: {
    marginLeft: 8,
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
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
    color: color.gray14,
    textAlign: "center",
    lineHeight: 24,
  },
});
