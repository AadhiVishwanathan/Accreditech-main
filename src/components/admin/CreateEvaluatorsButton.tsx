import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CreateEvaluatorsButton: React.FC = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createEvaluators = async () => {
    try {
      setIsCreating(true);
      
      console.log('Creating evaluator users...');
      
      // Call the edge function to create evaluator users
      const { data, error } = await supabase.functions.invoke('create-evaluator-users', {
        body: {}
      });

      if (error) {
        console.error('Error calling create-evaluator-users function:', error);
        toast({
          title: "Error",
          description: `Failed to create evaluators: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Create evaluators response:', data);

      if (data.success) {
        const successCount = data.results.filter((r: any) => r.status === 'success').length;
        const errorCount = data.results.filter((r: any) => r.status === 'error').length;
        
        toast({
          title: "Evaluators Created",
          description: `Successfully created ${successCount} evaluators. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
        });

        // Show detailed results
        console.log('Detailed results:', data.results);
        
        if (errorCount > 0) {
          const errorEmails = data.results
            .filter((r: any) => r.status === 'error')
            .map((r: any) => r.email)
            .join(', ');
          
          toast({
            title: "Some Errors Occurred",
            description: `Failed to create: ${errorEmails}`,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create evaluators",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error creating evaluators:', error);
      toast({
        title: "Error",
        description: "Failed to create evaluator users",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button 
      onClick={createEvaluators} 
      disabled={isCreating}
      variant="outline" 
      size="sm"
    >
      {isCreating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Users className="h-4 w-4 mr-2" />
      )}
      Create Evaluator Logins
    </Button>
  );
};

export default CreateEvaluatorsButton;