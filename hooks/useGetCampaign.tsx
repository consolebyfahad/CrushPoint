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
  console.log("userData campaign", userData);
  const contextUserData = userData as unknown as UserData;
  const userLat = contextUserData?.lat;
  const userLng = contextUserData?.lng;
  const loadCampaign = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "campaign");
      formData.append("limit", "1");
      formData.append("rand", "1");
      formData.append("lat", userLat?.toString() || "0");
      formData.append("lng", userLng?.toString() || "0");
      console.log("formData campaign", formData);
      const response = await apiCall(formData);
      console.log("response campaign", response);

      if (
        response?.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        // Filter active campaigns (status === "1")
        const activeCampaigns = response.data.filter(
          (item: any) => item.status === "1" || item.status === 1,
        );

        if (activeCampaigns.length === 0) {
          setCampaign(null);
          return;
        }

        // If multiple campaigns, prioritize video over image
        // If only one campaign, use it (whether image or video)
        let selectedCampaign = activeCampaigns[0];

        if (activeCampaigns.length > 1) {
          // Find video campaign first, otherwise use first one
          const videoCampaign = activeCampaigns.find(
            (item: any) => item.ad_type === "video",
          );
          if (videoCampaign) {
            selectedCampaign = videoCampaign;
          }
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
    loadCampaign();
  }, []);

  return {
    campaign,
    loading,
    error,
    refetch: loadCampaign,
  };
};

export default useGetCampaign;
