import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import {
  filterOutPastDates,
  formatTimeAgo,
  formatTimeForDisplay,
  sortRequestsByDate,
} from "@/utils/helper";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface RequestUser {
  id: string;
  name: string;
  image: string;
}

interface MeetupRequest {
  id: string;
  user: RequestUser;
  status: string;
  timestamp: string;
  date: string;
  time: string;
  location: string;
  message: string;
  hasChanges?: boolean;
  responseMessage?: string;
  type: "incoming" | "outgoing";
}

const IMAGE_BASE_URL = "https://7tracking.com/crushpoint/images/";

const useGetRequests = () => {
  const { t } = useTranslation();
  const { user, userData } = useAppContext();
  const [incomingRequests, setIncomingRequests] = useState<MeetupRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<MeetupRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const parseImages = (
    imagesStr: string,
    gender: string,
    imageUrl?: string
  ): string => {
    if (!imagesStr) {
      return getDefaultImage(gender);
    }

    try {
      // Clean the escaped JSON string
      let cleanedImagesString = imagesStr;

      // Handle various escape patterns
      if (cleanedImagesString.includes('\\"')) {
        cleanedImagesString = cleanedImagesString.replace(/\\"/g, '"');
      }
      if (cleanedImagesString.includes("\\\\")) {
        cleanedImagesString = cleanedImagesString.replace(/\\\\/g, "\\");
      }

      // Parse the JSON
      const imageFilenames = JSON.parse(cleanedImagesString);
      const baseImageUrl = imageUrl || IMAGE_BASE_URL;

      if (Array.isArray(imageFilenames) && imageFilenames.length > 0) {
        const validImages = imageFilenames
          .filter((filename) => filename && typeof filename === "string")
          .map((filename) => {
            const cleanFilename = filename.replace(/\\/g, "");
            return `${baseImageUrl}${cleanFilename}`;
          });

        return validImages.length > 0
          ? validImages[0]
          : getDefaultImage(gender);
      } else {
        return getDefaultImage(gender);
      }
    } catch (error) {
      console.warn(
        "Error parsing images:",
        error,
        "Original string:",
        imagesStr
      );
      return getDefaultImage(gender);
    }
  };

  const getDefaultImage = (gender: string): string => {
    const normalizedGender = (gender || "").toLowerCase();
    if (normalizedGender === "female" || normalizedGender === "f") {
      return "https://i.pinimg.com/736x/8c/1f/82/8c1f82be3fbc9276db0c6431eee2aadd.jpg";
    } else if (normalizedGender === "male" || normalizedGender === "m") {
      return "https://i.pinimg.com/736x/30/1c/30/301c3029c36d70b518325f803bba8f09.jpg";
    } else {
      return "https://i.pinimg.com/736x/8c/1f/82/8c1f82be3fbc9276db0c6431eee2aadd.jpg";
    }
  };

  const getResponseMessage = (status: string): string => {
    switch (status) {
      case "accepted":
        return "Your request was accepted!";
      case "rejected":
      case "declined":
        return "Your request was declined.";
      case "change":
        return "Changes were requested.";
      case "pending":
        return "Waiting for response...";
      case "cancelled":
        return "Request was cancelled.";
      default:
        return "Status unknown";
    }
  };

  const loadData = async () => {
    if (!user?.user_id) {
      setError(t("hooks.userIdNotAvailable"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "meetup_requests");
      formData.append("user_id", user.user_id);

      const response = await apiCall(formData);
      if (response?.data && Array.isArray(response.data)) {
        const incomingList: MeetupRequest[] = [];
        const outgoingList: MeetupRequest[] = [];

        response.data.forEach((request: any) => {
          try {
            // Determine if it's incoming or outgoing based on the current user's ID
            const isIncoming = request.date_id === userData?.id;

            // Get the other user's information
            let otherUser;
            if (isIncoming) {
              // For incoming requests, the other user is the sender (user object)
              otherUser = request.user || {};
            } else {
              // For outgoing requests, the other user is the recipient (date object)
              otherUser = request.date || {};
            }

            // Safely get user data with fallbacks
            const userId = otherUser.id || otherUser.user_id || "unknown";
            const userName = otherUser.name || "Unknown User";
            const userGender = otherUser.gender || "unknown";
            const userImages = otherUser.images || "";

            // Parse and get the user's image
            const userImage = parseImages(
              userImages,
              userGender,
              request.image_url
            );

            // Create the formatted request
            const formattedRequest: MeetupRequest = {
              id: String(request.id || request.request_id || ""),
              user: {
                id: String(userId),
                name: String(userName),
                image: String(userImage),
              },
              status: String(request.status || "pending"),
              timestamp: String(
                formatTimeAgo(
                  request.created_at || request.timestamp,
                  request.time
                )
              ),
              date: String(request.new_date || request.meetup_date || "TBD"),
              time: String(
                formatTimeForDisplay(
                  request.time || request.meetup_time || "TBD"
                )
              ),
              location: String(request.location || "Location TBD"),
              message: String(request.message || "Would love to meet up!"),
              hasChanges:
                request.status === "change" || request.has_changes === "1",
              type: isIncoming ? "incoming" : "outgoing",
            };

            // Add response message for outgoing requests
            if (!isIncoming) {
              formattedRequest.responseMessage = String(
                getResponseMessage(request.status)
              );
            }

            // Add to appropriate list
            if (isIncoming) {
              incomingList.push(formattedRequest);
            } else {
              outgoingList.push(formattedRequest);
            }
          } catch (itemError) {
            console.warn("Error processing request item:", itemError, request);
          }
        });

        // Filter out past dates and sort by date
        const filteredIncomingList = filterOutPastDates(incomingList);
        const filteredOutgoingList = filterOutPastDates(outgoingList);

        const sortedIncomingList = sortRequestsByDate(filteredIncomingList);
        const sortedOutgoingList = sortRequestsByDate(filteredOutgoingList);

        setIncomingRequests(sortedIncomingList);
        setOutgoingRequests(sortedOutgoingList);

        if (
          sortedIncomingList.length === 0 &&
          sortedOutgoingList.length === 0
        ) {
          setError(t("hooks.noMeetupRequestsFound"));
        }
      } else {
        setIncomingRequests([]);
        setOutgoingRequests([]);
        setError(t("hooks.noMeetupRequestsFound"));
      }
    } catch (error: any) {
      const errorMessage =
        error.message || t("hooks.networkErrorCheckConnection");
      setError(errorMessage);
      console.error("Fetch requests error:", error);
      setIncomingRequests([]);
      setOutgoingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Remove request from local state
  const removeRequest = (requestId: string, type: "incoming" | "outgoing") => {
    if (type === "incoming") {
      setIncomingRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      );
    } else {
      setOutgoingRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      );
    }
  };

  // Update request status
  const updateRequestStatus = (
    requestId: string,
    newStatus: string,
    type: "incoming" | "outgoing"
  ) => {
    if (type === "incoming") {
      setIncomingRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: newStatus,
                hasChanges: newStatus === "change",
              }
            : request
        )
      );
    } else {
      setOutgoingRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: newStatus,
                responseMessage: getResponseMessage(newStatus),
              }
            : request
        )
      );
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      loadData();
    }
  }, [user?.user_id]);

  return {
    loading,
    incomingRequests,
    outgoingRequests,
    error,
    refetch: loadData,
    removeRequest,
    updateRequestStatus,
  };
};

export default useGetRequests;
