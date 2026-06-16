import { Button } from "@/components/ui/button";
import { Calculator, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export function RecalculateScoresButton() {
  const [isRecalculating, setIsRecalculating] = useState(false);

  const recalculateAllScores = async () => {
    setIsRecalculating(true);
    try {
      // Trigger recalculation for all applications by updating their updated_at field
      // This will trigger the database trigger that calculates AI scores
      const { error } = await supabase
        .from('applications')
        .update({ updated_at: new Date().toISOString() })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all applications

      if (error) throw error;
      
      toast.success('AI scores recalculated for all applications');
    } catch (error) {
      console.error('Error recalculating AI scores:', error);
      toast.error('Failed to recalculate AI scores');
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <Button
      onClick={recalculateAllScores}
      disabled={isRecalculating}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {isRecalculating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Calculator className="h-4 w-4" />
      )}
      {isRecalculating ? 'Recalculating...' : 'Recalculate AI Scores'}
    </Button>
  );
}