import { useAppContext } from "@/context/app_context";
import { apiCall } from "@/utils/api";
import { useEffect, useState } from "react";

interface Campaign {
  id: string;
  ad_type: "image" | "video";
  image: string | null;
  thumb: string;
  image_url: string;
  link: string;
  start_date: string;
  end_date: string;
  status: string;
  distance: number;
  created_at: string;
  button_text: string;
  skip?: string;
}

const useGetCampaign = () => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userData } = useAppContext();

  const contextUserData = userData as unknown as UserData;
  const userLat = contextUserData?.lat;
  const userLng = contextUserData?.lng;
  const userId = contextUserData?.id; // ← use id as the "userData is ready" signal

  const loadCampaign = async () => {
    if (!userLat || !userLng) {
      console.log("skipping campaign load - no coords", { userLat, userLng });
      return;
    }
    console.log("loadCampaign called with", { userLat, userLng }); // ← add this
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "campaign");
      formData.append("limit", "1");
      formData.append("rand", "1");
      formData.append("lat", userLat.toString());
      formData.append("lng", userLng.toString());

      const response = await apiCall(formData);

      if (
        response?.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const activeCampaigns = response.data.filter(
          (item: any) => item.status === "1" || item.status === 1,
        );
        if (activeCampaigns.length === 0) {
          setCampaign(null);
          return;
        }
        let selectedCampaign = activeCampaigns[0];
        if (activeCampaigns.length > 1) {
          const videoCampaign = activeCampaigns.find(
            (item: any) => item.ad_type === "video",
          );
          if (videoCampaign) selectedCampaign = videoCampaign;
        }
        setCampaign(selectedCampaign);
      } else {
        setCampaign(null);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load campaign");
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait until userData is fully loaded (has a real id + coords)
    if (!userId || !userLat || !userLng) {
      console.log("waiting for userData...", { userId, userLat, userLng });
      return;
    }
    loadCampaign();
  }, [userId, userLat, userLng]); // ← depend on userId too

  return { campaign, loading, error, refetch: loadCampaign };
};

export default useGetCampaign;
