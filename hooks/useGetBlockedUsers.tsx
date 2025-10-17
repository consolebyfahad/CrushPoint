import { useToast } from "@/components/toast_provider";
import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
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
      const date = new Date(timestamp);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return "1 day ago";
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
      } else {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? "1 month ago" : `${months} months ago`;
      }
    } catch (error) {
      return "recently";
    }
  };

  const transformApiData = (apiData: ApiBlockedUser[]): BlockedUser[] => {
    return apiData.map((item) => ({
      id: item.id,
      name: item.block_user?.name || `User ${item.block_id}`,
      age: item.block_user?.age || 25,
      image: item.block_user?.image
        ? `${item.image_url}${item.block_user.image}`
        : `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face`,
      blockedDate: formatTimestamp(item.timestamp),
      block_id: item.block_id,
    }));
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
      // console.log("formData", formData);
      const response = await apiCall(formData);
      // console.log("response", response);
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
      console.error("Error fetching blocked users:", error);
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
      formData.append("block_id", blockedUserId);
      console.log("unblock formData", formData);
      const response = await apiCall(formData);
      console.log("unblock response", response);
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
      console.error("Error unblocking user:", error);
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
