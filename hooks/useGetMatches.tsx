import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { useEffect, useState } from "react";

const useGetMatches = () => {
  const { user } = useAppContext();
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const formatTimeAgo = (dateString: any) => {
    const matchDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - matchDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInDays === 1) {
      return "1 day ago";
    } else {
      return `${diffInDays} days ago`;
    }
  };

  const loadData = async () => {
    if (!user?.user_id) {
      setError("User ID not available");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "matches");
      formData.append("user_id", user.user_id);

      const response = await apiCall(formData);

      if (Array.isArray(response?.data)) {
        const formattedMatches = response.data
          .filter((match: any) => match.match_id !== "0") // Filter out invalid matches
          .map((match: any) => {
            const profileImage = match.image_url
              ? `${match.image_url}default-profile.jpg` // Use a default image or construct the image URL
              : "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face";

            return {
              id: match.id,
              name: `User ${match.match_id}`, // You might want to get actual names differently
              age: 25, // Default age or calculate based on available data
              distance: match.distance ? `${match.distance} km` : "Unknown",
              timeAgo: formatTimeAgo(match.created_at),
              isOnline: Math.random() > 0.5, // Random for now
              isVerified: Math.random() > 0.3, // Random for now
              image: profileImage,
              emoji: match.emoji,
              status: match.status,
              match_id: match.match_id,
              user_id: match.user_id,
            };
          });
        setMatches(formattedMatches);
      } else if (response?.status === "Error") {
        setError(response.message);
      } else {
        setMatches([]);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove match from local state
  const removeMatch = (matchId: any) => {
    setMatches((prevMatches) =>
      prevMatches.filter((match: any) => match.id !== matchId)
    );
  };

  // Update match status
  const updateMatchStatus = (matchId: any, newStatus: any) => {
    setMatches((prevMatches: any) =>
      prevMatches.map((match: any) =>
        match.id === matchId ? { ...match, status: newStatus } : match
      )
    );
  };

  useEffect(() => {
    loadData();
  }, [user?.user_id]);

  return {
    loading,
    matches,
    error,
    refetch: loadData,
    removeMatch,
    updateMatchStatus,
  };
};

export default useGetMatches;
