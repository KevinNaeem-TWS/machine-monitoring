import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "success" | "warning" | "destructive";
}

export const MetricCard = ({ title, value, icon: Icon, trend, variant = "default" }: MetricCardProps) => {
  const variantStyles = {
    default: "border-primary/20 bg-card",
    success: "border-success/20 bg-success/5",
    warning: "border-warning/20 bg-warning/5",
    destructive: "border-destructive/20 bg-destructive/5",
  };

  const iconStyles = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  return (
    <Card className={`p-4 md:p-6 ${variantStyles[variant]} border transition-all hover:shadow-lg hover:shadow-primary/5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 md:space-y-2 flex-1 min-w-0">
          <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl md:text-3xl font-mono-data font-bold truncate">{value}</p>
          {trend && <p className="text-xs text-muted-foreground truncate">{trend}</p>}
        </div>
        <div className={`p-2 md:p-3 rounded-lg bg-background/50 flex-shrink-0 ${iconStyles[variant]}`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>
    </Card>
  );
};
