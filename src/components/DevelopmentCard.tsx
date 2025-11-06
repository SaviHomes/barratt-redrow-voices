import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  AlertTriangle,
  DollarSign,
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { DevelopmentStats } from "@/hooks/useDevelopmentStats";

interface DevelopmentCardProps {
  stats: DevelopmentStats;
  onClick: () => void;
}

export default function DevelopmentCard({ stats, onClick }: DevelopmentCardProps) {
  const getRatingBadgeColor = (rating: number) => {
    if (rating >= 4) return "bg-green-500/10 text-green-700 dark:text-green-400";
    if (rating >= 3) return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    if (rating > 0) return "bg-red-500/10 text-red-700 dark:text-red-400";
    return "bg-muted text-muted-foreground";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {stats.development_name}
            </CardTitle>
          </div>
          {stats.overall_rating > 0 && (
            <Badge className={getRatingBadgeColor(stats.overall_rating)}>
              <Star className="h-3 w-3 mr-1 fill-current" />
              {stats.overall_rating.toFixed(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-semibold text-foreground">{stats.homeowner_count}</p>
              <p className="text-xs text-muted-foreground">Homeowners</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-semibold text-foreground">{stats.claim_count}</p>
              <p className="text-xs text-muted-foreground">Claims</p>
            </div>
          </div>
        </div>

        {/* Damages */}
        {stats.total_estimated_damages > 0 && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Total Damages:</span>
              </div>
              <span className="font-semibold text-destructive">
                {formatCurrency(stats.total_estimated_damages)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted-foreground">Avg per claim:</span>
              <span className="font-medium text-muted-foreground">
                {formatCurrency(stats.avg_estimated_damages)}
              </span>
            </div>
          </div>
        )}

        {/* Ratings Breakdown */}
        {stats.overall_rating > 0 && (
          <div className="pt-3 border-t border-border space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Rating Breakdown</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build Quality:</span>
                <span className="font-medium">{stats.build_quality_rating.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">{stats.customer_service_rating.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Value:</span>
                <span className="font-medium">{stats.value_rating.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recommend:</span>
                <span className="font-medium flex items-center gap-1">
                  {stats.recommendation_percentage.toFixed(0)}%
                  {stats.recommendation_percentage >= 50 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Top Defects */}
        {stats.top_defects.length > 0 && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Common Issues</p>
            <div className="flex flex-wrap gap-1">
              {stats.top_defects.map((defect) => (
                <Badge key={defect.category} variant="outline" className="text-xs">
                  {defect.category}: {defect.count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* View Details Button */}
        <Button variant="outline" className="w-full mt-4" size="sm">
          View Full Details
        </Button>
      </CardContent>
    </Card>
  );
}
