import CustomButton from "@/components/custom_button";
import CustomSearchBar from "@/components/custom_search";
import useGetRequests from "@/hooks/useGetRequests";
import { color, font } from "@/utils/constants";
import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import IncomingMeetup from "./incoming_meetup";
import OutgoingMeetup from "./outgoing_meetup";

export default function Requests() {
  const [activeTab, setActiveTab] = useState("incoming");
  const [searchText, setSearchText] = useState("");

  const {
    loading,
    incomingRequests,
    outgoingRequests,
    error,
    refetch,
    removeRequest,
    updateRequestStatus,
  } = useGetRequests();

  const totalRequests = incomingRequests.length + outgoingRequests.length;
  const incomingCount = incomingRequests.length;
  const outgoingCount = outgoingRequests.length;

  // Filter requests based on search text
  const filterRequests = (requests: any[]) => {
    if (!searchText.trim()) return requests;

    return requests.filter(
      (request) =>
        request.user?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        request.location?.toLowerCase().includes(searchText.toLowerCase()) ||
        request.message?.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const filteredIncomingRequests = filterRequests(incomingRequests);
  const filteredOutgoingRequests = filterRequests(outgoingRequests);

  // Handle refresh
  const onRefresh = () => {
    refetch();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          colors={[color.primary]}
          tintColor={color.primary}
        />
      }
    >
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <CustomSearchBar
          searchText={searchText}
          onChangeText={setSearchText}
          placeholder="Search requests..."
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <CustomButton
          title={`Incoming`}
          count={incomingCount}
          style={[styles.tab, activeTab === "incoming" && styles.activeTab]}
          fontstyle={[
            styles.tabText,
            activeTab === "incoming" && styles.activeTabText,
          ]}
          onPress={() => setActiveTab("incoming")}
        />
        <CustomButton
          title={`Outgoing`}
          count={outgoingCount}
          style={[styles.tab, activeTab === "outgoing" && styles.activeTab]}
          fontstyle={[
            styles.tabText,
            activeTab === "outgoing" && styles.activeTabText,
          ]}
          onPress={() => setActiveTab("outgoing")}
        />
      </View>

      {/* Tab Content */}
      {error && totalRequests === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : loading && totalRequests === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.primary} />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : (
        <View style={styles.tabContent}>
          {activeTab === "incoming" ? (
            <IncomingMeetup
              requests={filteredIncomingRequests}
              searchText={searchText}
              onUpdateStatus={(requestId, status) =>
                updateRequestStatus(requestId, status, "incoming")
              }
              onRemoveRequest={(requestId) =>
                removeRequest(requestId, "incoming")
              }
              onRefresh={onRefresh}
              isRefreshing={loading}
            />
          ) : (
            <OutgoingMeetup
              requests={filteredOutgoingRequests}
              searchText={searchText}
              onUpdateStatus={(requestId, status) =>
                updateRequestStatus(requestId, status, "outgoing")
              }
              onRemoveRequest={(requestId) =>
                removeRequest(requestId, "outgoing")
              }
              onRefresh={onRefresh}
              isRefreshing={loading}
            />
          )}
        </View>
      )}
      {/* Show message when no requests found after search */}
      {searchText.trim() &&
        ((activeTab === "incoming" && filteredIncomingRequests.length === 0) ||
          (activeTab === "outgoing" &&
            filteredOutgoingRequests.length === 0)) && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No requests found matching "{searchText}"
            </Text>
          </View>
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  searchContainer: {
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    width: "50%",
    paddingVertical: 12,
    backgroundColor: color.white,
    borderWidth: 1,
    borderColor: color.gray87,
  },
  activeTab: {
    backgroundColor: color.primary,
    borderColor: color.white,
  },
  tabText: {
    fontSize: 14,
    fontFamily: font.medium,
    color: color.gray55,
  },
  activeTabText: {
    color: color.white,
    fontFamily: font.semiBold,
  },
  tabContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray55,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray55,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: color.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: color.white,
    fontSize: 14,
    fontFamily: font.semiBold,
  },
  noResultsContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray55,
    textAlign: "center",
  },
});
