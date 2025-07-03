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
import useGetUsers from "@/hooks/useGetUsers";
import { apiCall } from "@/utils/api";
export default function Matches() {
  const { user } = useAppContext();
  const [searchText, setSearchText] = useState("");
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);
  const [showReportUser, setShowReportUser] = useState(false);
  const [showRemoveMatch, setShowRemoveMatch] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // const [matches, setMatches] = useState([
  //   {
  //     id: "1",
  //     name: "Alex",
  //     age: 25,
  //     distance: "0.5 km",
  //     timeAgo: "2 hours ago",
  //     isOnline: true,
  //     isVerified: true,
  //     image:
  //       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  //   },
  //   {
  //     id: "2",
  //     name: "Sophia",
  //     age: 28,
  //     distance: "1.2 km",
  //     timeAgo: "1 day ago",
  //     isOnline: false,
  //     isVerified: true,
  //     image:
  //       "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
  //   },
  //   {
  //     id: "3",
  //     name: "Julia",
  //     age: 24,
  //     distance: "2.1 km",
  //     timeAgo: "3 days ago",
  //     isOnline: true,
  //     isVerified: false,
  //     image:
  //       "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  //   },
  // ]);

  // Filter matches based on search text

  const { users, loading, error, refetch } = useGetUsers();

  const filteredMatches = users.filter((match) =>
    match.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleViewProfile = (match: any) => {
    console.log("View profile for:", match.name);
    // Navigate to profile screen
    // navigation.navigate('UserProfile', { user: match });
  };

  const handleMatchOptions = (match: any) => {
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
  const handleRemoveMatch = () => {
    console.log("Remove match:", selectedMatch?.name);
    // Remove match from the list
    if (selectedMatch) {
      setMatches((prevMatches) =>
        prevMatches.filter((match) => match.id !== selectedMatch.id)
      );
    }
    setShowRemoveMatch(false);
    setSelectedMatch(null);
  };

  const handleConfirmBlock = async () => {
    try {
      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("user_id", user?.user_id ? user?.user_id : "");
      formData.append("table_name", "blocked_users");
      formData.append("block_id", selectedMatch?.id);

      const response = await apiCall(formData);

      if (response.result) {
        if (selectedMatch) {
          setMatches((prevMatches) =>
            prevMatches.filter((match) => match.id !== selectedMatch.id)
          );
        }
        setShowBlockConfirmation(false);
        setSelectedMatch(null);
      }
    } catch (error) {
      console.error("Block Error:", response.message);
    }
  };

  const handleSubmitReport = (reportData: any) => {
    console.log("Report submitted:", reportData);
    // Handle report submission logic here
    setShowReportUser(false);
    setSelectedMatch(null);
  };

  const renderMatchCard = ({ item }: any) => (
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <MatchesTabsHeader title="Your Matches" matches={users} />

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
        ListEmptyComponent={renderEmptyState}
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
