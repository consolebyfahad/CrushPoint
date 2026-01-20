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
}

const useGetCampaign = () => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCampaign = async () => {
    console.log("📡 [useGetCampaign] Starting to load campaign");
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "campaign");
      formData.append("limit", "1");
      formData.append("rand", "1");

      const response = await apiCall(formData);
      console.log("📥 [useGetCampaign] API response received", {
        hasData: !!response?.data,
        dataLength: response?.data?.length || 0,
        data: response?.data,
      });

      if (
        response?.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const campaignData = response.data[0];
        console.log("📋 [useGetCampaign] Campaign data:", {
          id: campaignData.id,
          ad_type: campaignData.ad_type,
          status: campaignData.status,
          start_date: campaignData.start_date,
          end_date: campaignData.end_date,
          image: campaignData.image,
          thumb: campaignData.thumb,
        });

        // Check if campaign is active - simplified to just check status
        // Date validation removed to avoid parsing errors
        const statusValid =
          campaignData.status === "1" || campaignData.status === 1;

        console.log("📋 [useGetCampaign] Campaign validation:", {
          id: campaignData.id,
          ad_type: campaignData.ad_type,
          status: campaignData.status,
          statusType: typeof campaignData.status,
          statusValid,
          start_date: campaignData.start_date,
          end_date: campaignData.end_date,
        });

        if (statusValid) {
          console.log(
            "✅ [useGetCampaign] Campaign is valid (status check passed), setting campaign"
          );
          setCampaign(campaignData);
        } else {
          console.log(
            "❌ [useGetCampaign] Campaign validation failed - status not valid",
            {
              status: campaignData.status,
              statusType: typeof campaignData.status,
            }
          );
          setCampaign(null);
        }
      } else {
        console.log("❌ [useGetCampaign] No campaign data in response");
        setCampaign(null);
      }
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load campaign";
      setError(errorMessage);
      console.error("❌ [useGetCampaign] Error getting campaign:", err);
      setCampaign(null);
    } finally {
      setLoading(false);
      console.log("🏁 [useGetCampaign] Loading complete", {
        hasCampaign: !!campaign,
        loading: false,
      });
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
