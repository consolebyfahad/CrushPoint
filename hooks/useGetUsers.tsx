import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { useEffect, useState } from "react";

export default function useGetUsers() {
  const { user } = useAppContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    if (!user?.user_id) {
      setError("User ID not available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("type", "get_map_users");
      formData.append("id", user.user_id);

      const response = await apiCall(formData);

      if (response.result && response.data) {
        // Transform API data to match MatchCard format
        const transformedUsers = response.data.map((userData: any) => ({
          id: userData.id,
          name: userData.name || "Unknown",
          age: calculateAge(userData.dob) || 25, // Calculate age from dob or default
          distance: calculateDistance(userData.lat, userData.lng) || "N/A",
          timeAgo: getTimeAgo(userData.timestamp) || "Recently",
          isOnline: userData.status === "1", // Assuming status 1 means online
          isVerified: userData.email ? true : false, // Basic verification check
          image: userData.images || getDefaultImage(userData.gender),
          // Keep original data for reference
          originalData: userData,
        }));

        setUsers(transformedUsers);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching users");
      console.error("Fetch Users Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dob: any) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Helper function to calculate distance (you'll need to implement based on your logic)
  const calculateDistance = (lat: any, lng: any) => {
    if (!lat || !lng) return "N/A";
    // Implement your distance calculation logic here
    // For now, returning a random distance for demo
    return `${Math.floor(Math.random() * 10) + 1}.${Math.floor(
      Math.random() * 9
    )} km`;
  };

  // Helper function to get time ago from timestamp
  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Recently";

    const now = new Date();
    const past = new Date(timestamp);
    const diffInMs = now - past;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return "1 day ago";
    } else {
      return `${diffInDays} days ago`;
    }
  };

  // Helper function to get default image based on gender
  const getDefaultImage = (gender: any) => {
    if (gender === "male") {
      return "https://www.pinterest.com/pin/pin-de-kamilahjune-em-profile-picture--5488830791654030/";
    } else {
      return "https://pin.it/2owxB6Wvm";
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchUsers();
  }, [user?.user_id]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
}
