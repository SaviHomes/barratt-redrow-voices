import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, AlertTriangle, Star, DollarSign } from "lucide-react";
import { AggregateStats } from "@/hooks/useDevelopmentStats";

interface DevelopmentStatsCardProps {
  stats: AggregateStats;
}

export default function DevelopmentStatsCard({ stats }: DevelopmentStatsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="text-center">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold text-foreground">{stats.total_developments}</p>
            <p className="text-sm text-muted-foreground">Developments</p>
          </div>
          <div className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold text-foreground">{stats.total_homeowners}</p>
            <p className="text-sm text-muted-foreground">Homeowners</p>
          </div>
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold text-foreground">{stats.total_claims}</p>
            <p className="text-sm text-muted-foreground">Claims</p>
          </div>
          <div className="text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-primary fill-primary" />
            <p className="text-3xl font-bold text-foreground">
              {stats.avg_rating > 0 ? stats.avg_rating.toFixed(1) : "N/A"}
            </p>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
          </div>
          <div className="text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <p className="text-3xl font-bold text-destructive">
              {formatCurrency(stats.total_damages)}
            </p>
            <p className="text-sm text-muted-foreground">Total Damages</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
