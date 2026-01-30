import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { calculateAge, formatTimeAgo, parseJsonString } from "@/utils/helper";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface BlockedUser {
  id: string;
  name: string;
  age: number;
  image: string;
  blockedDate: string;
  block_id: string;
}

interface ApiBlockedUser {
  id: string;
  user_id: string;
  block_id: string;
  reason: string;
  timestamp: string;
  distance: number;
  date: string;
  time: string;
  block_user: any;
  image_url: string;
}

export default function useGetBlockedUsers() {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const { showToast } = useToast();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);

  const formatTimestamp = (timestamp: string): string => {
    try {
      // Parse timestamp format "Jan 21, 2026 07:26 PM"
      // Split into date and time parts
      const parts = timestamp.split(" ");
      if (parts.length >= 4) {
        // Extract date part (e.g., "Jan 21, 2026")
        const datePart = `${parts[0]} ${parts[1]} ${parts[2]}`;
        // Extract time part (e.g., "07:26 PM")
        const timePart = `${parts[3]} ${parts[4] || ""}`;
        
        return formatTimeAgo(datePart, timePart, t);
      }
      return formatTimeAgo(timestamp, "", t);
    } catch (error) {
      return t("helper.time.recently") || "Recently";
    }
  };

  const transformApiData = (apiData: ApiBlockedUser[]): BlockedUser[] => {
    return apiData.map((item) => {
      // Calculate age from DOB
      const age = item.block_user?.dob ? calculateAge(item.block_user.dob) : 25;

      // Get first image from images array
      let imageUrl = `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face`;
      if (item.block_user?.images) {
        try {
          const images = parseJsonString(item.block_user.images);
          if (images && images.length > 0) {
            const firstImage = images[0];
            imageUrl = `${item.image_url}${firstImage}`;
          }
        } catch (error) {
          // Use default image
        }
      }

      return {
        id: item.id,
        name: item.block_user?.name || `User ${item.block_id}`,
        age: age,
        image: imageUrl,
        blockedDate: formatTimestamp(item.timestamp),
        block_id: item.block_id,
      };
    });
  };

  const fetchBlockedUsers = async () => {
    if (!user?.user_id) {
      showToast(t("hooks.userSessionExpired"), "error");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "blocked_users");
      formData.append("user_id", user.user_id);
      const response = await apiCall(formData);
      if (response.data) {
        const transformedData = transformApiData(response.data);
        setBlockedUsers(transformedData);
      } else {
        setBlockedUsers([]);
        if (response.message) {
          showToast(response.message, "error");
        }
      }
    } catch (error) {

      showToast(t("hooks.failedToLoadBlockedUsers"), "error");
      setBlockedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (blockedUserId: string, blockId: string) => {
    if (!user?.user_id) {
      showToast(t("hooks.userSessionExpired"), "error");
      return false;
    }

    try {
      const formData = new FormData();
      formData.append("type", "unblock_user");
      formData.append("user_id", user.user_id);
      formData.append("block_id", blockId);
      const response = await apiCall(formData);
      if (response.result) {
        // Remove user from local state
        setBlockedUsers((prev) =>
          prev.filter((user) => user.id !== blockedUserId)
        );
        return true;
      } else {
        showToast(response.message || t("hooks.failedToUnblockUser"), "error");
        return false;
      }
    } catch (error) {

      showToast(t("hooks.failedToUnblockUser"), "error");
      return false;
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, [user?.user_id]);

  return {
    blockedUsers,
    loading,
    fetchBlockedUsers,
    unblockUser,
  };
}
