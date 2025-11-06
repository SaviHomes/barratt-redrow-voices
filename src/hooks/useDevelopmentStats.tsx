import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DevelopmentStats {
  development_name: string;
  homeowner_count: number;
  review_count: number;
  claim_count: number;
  total_estimated_damages: number;
  avg_estimated_damages: number;
  overall_rating: number;
  build_quality_rating: number;
  customer_service_rating: number;
  value_rating: number;
  recommendation_percentage: number;
  top_defects: { category: string; count: number }[];
  claim_status_breakdown: { status: string; count: number }[];
}

export interface AggregateStats {
  total_developments: number;
  total_homeowners: number;
  total_claims: number;
  avg_rating: number;
  total_damages: number;
}

export const useDevelopmentStats = () => {
  return useQuery({
    queryKey: ["development-stats"],
    queryFn: async () => {
      // Get all unique development names from both profiles and claims
      const { data: profileDevs } = await supabase
        .from("profiles")
        .select("development_name")
        .not("development_name", "is", null);

      const { data: claimDevs } = await supabase
        .from("claims")
        .select("development_name")
        .not("development_name", "is", null);

      const uniqueDevNames = new Set([
        ...(profileDevs?.map((p) => p.development_name) || []),
        ...(claimDevs?.map((c) => c.development_name) || []),
      ]);

      const developmentStats: DevelopmentStats[] = [];

      for (const devName of uniqueDevNames) {
        // Count homeowners
        const { count: homeownerCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("development_name", devName);

        // Count reviews (profiles with advice_to_others)
        const { count: reviewCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("development_name", devName)
          .not("advice_to_others", "is", null);

        // Get claims data
        const { data: claims } = await supabase
          .from("claims")
          .select("estimated_damages, defects_categories, status")
          .eq("development_name", devName);

        const claimCount = claims?.length || 0;
        const totalDamages =
          claims?.reduce(
            (sum, c) => sum + (Number(c.estimated_damages) || 0),
            0
          ) || 0;
        const avgDamages = claimCount > 0 ? totalDamages / claimCount : 0;

        // Get defects breakdown
        const defectsMap = new Map<string, number>();
        claims?.forEach((claim) => {
          claim.defects_categories?.forEach((category: string) => {
            defectsMap.set(category, (defectsMap.get(category) || 0) + 1);
          });
        });

        const topDefects = Array.from(defectsMap.entries())
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        // Get claim status breakdown
        const statusMap = new Map<string, number>();
        claims?.forEach((claim) => {
          const status = claim.status || "submitted";
          statusMap.set(status, (statusMap.get(status) || 0) + 1);
        });

        const claimStatusBreakdown = Array.from(statusMap.entries()).map(
          ([status, count]) => ({ status, count })
        );

        // Get ratings
        const { data: ratings } = await supabase
          .from("development_ratings")
          .select(
            "overall_rating, build_quality_rating, customer_service_rating, value_for_money_rating, would_recommend"
          )
          .eq("development_name", devName);

        const ratingsCount = ratings?.length || 0;
        const overallRating =
          ratingsCount > 0
            ? ratings.reduce(
                (sum, r) => sum + (r.overall_rating || 0),
                0
              ) / ratingsCount
            : 0;
        const buildQualityRating =
          ratingsCount > 0
            ? ratings.reduce(
                (sum, r) => sum + (r.build_quality_rating || 0),
                0
              ) / ratingsCount
            : 0;
        const customerServiceRating =
          ratingsCount > 0
            ? ratings.reduce(
                (sum, r) => sum + (r.customer_service_rating || 0),
                0
              ) / ratingsCount
            : 0;
        const valueRating =
          ratingsCount > 0
            ? ratings.reduce(
                (sum, r) => sum + (r.value_for_money_rating || 0),
                0
              ) / ratingsCount
            : 0;

        const recommendCount =
          ratings?.filter((r) => r.would_recommend).length || 0;
        const recommendationPercentage =
          ratingsCount > 0 ? (recommendCount / ratingsCount) * 100 : 0;

        developmentStats.push({
          development_name: devName,
          homeowner_count: homeownerCount || 0,
          review_count: reviewCount || 0,
          claim_count: claimCount,
          total_estimated_damages: totalDamages,
          avg_estimated_damages: avgDamages,
          overall_rating: overallRating,
          build_quality_rating: buildQualityRating,
          customer_service_rating: customerServiceRating,
          value_rating: valueRating,
          recommendation_percentage: recommendationPercentage,
          top_defects: topDefects,
          claim_status_breakdown: claimStatusBreakdown,
        });
      }

      return developmentStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAggregateStats = () => {
  return useQuery({
    queryKey: ["aggregate-stats"],
    queryFn: async () => {
      // Total unique developments
      const { data: profileDevs } = await supabase
        .from("profiles")
        .select("development_name")
        .not("development_name", "is", null);

      const { data: claimDevs } = await supabase
        .from("claims")
        .select("development_name")
        .not("development_name", "is", null);

      const uniqueDevs = new Set([
        ...(profileDevs?.map((p) => p.development_name) || []),
        ...(claimDevs?.map((c) => c.development_name) || []),
      ]);

      // Total homeowners
      const { count: totalHomeowners } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Total claims
      const { count: totalClaims } = await supabase
        .from("claims")
        .select("*", { count: "exact", head: true });

      // Total damages
      const { data: claims } = await supabase
        .from("claims")
        .select("estimated_damages");

      const totalDamages =
        claims?.reduce(
          (sum, c) => sum + (Number(c.estimated_damages) || 0),
          0
        ) || 0;

      // Average rating across all developments
      const { data: ratings } = await supabase
        .from("development_ratings")
        .select("overall_rating");

      const avgRating =
        ratings && ratings.length > 0
          ? ratings.reduce((sum, r) => sum + (r.overall_rating || 0), 0) /
            ratings.length
          : 0;

      const stats: AggregateStats = {
        total_developments: uniqueDevs.size,
        total_homeowners: totalHomeowners || 0,
        total_claims: totalClaims || 0,
        avg_rating: avgRating,
        total_damages: totalDamages,
      };

      return stats;
    },
    staleTime: 5 * 60 * 1000,
  });
};
