import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface AIScoreIndicatorProps {
  score: number | null;
  applicationId: string;
  showRefresh?: boolean;
}

export function AIScoreIndicator({ score, applicationId, showRefresh = false }: AIScoreIndicatorProps) {
  const [isRecalculating, setIsRecalculating] = useState(false);

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    // Convert 0-10 scale to percentage for display comparison
    const percentage = score * 10;
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadgeVariant = (score: number | null): "default" | "destructive" | "outline" | "secondary" => {
    if (!score) return 'outline';
    // Convert 0-10 scale to percentage for display comparison
    const percentage = score * 10;
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  const recalculateScore = async () => {
    setIsRecalculating(true);
    try {
      // Trigger a recalculation by updating the application's updated_at field
      const { error } = await supabase
        .from('applications')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', applicationId);

      if (error) throw error;
      
      toast.success('AI score recalculated successfully');
    } catch (error) {
      console.error('Error recalculating AI score:', error);
      toast.error('Failed to recalculate AI score');
    } finally {
      setIsRecalculating(false);
    }
  };

  if (score === null) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">
          {showRefresh ? 'Calculating...' : 'N/A'}
        </span>
        {showRefresh && (
          <Button
            size="sm"
            variant="ghost"
            onClick={recalculateScore}
            disabled={isRecalculating}
            className="h-6 w-6 p-0"
          >
            {isRecalculating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getScoreBadgeVariant(score)} className="font-mono">
        {(score * 10).toFixed(1)}%
      </Badge>
      {showRefresh && (
        <Button
          size="sm"
          variant="ghost"
          onClick={recalculateScore}
          disabled={isRecalculating}
          className="h-6 w-6 p-0"
        >
          {isRecalculating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
}