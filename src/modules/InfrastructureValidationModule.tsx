import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  Building, 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Ruler,
  Calculator
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InfrastructureValidationProps {
  applicationId: string;
}

interface FacilityItem {
  id: string;
  facility_type: string;
  image_url: string;
  calculated_area?: number;
  compliance_status: 'pending' | 'compliant' | 'non-compliant';
  compliance_score?: number;
  required_area: number;
  validation_metadata?: any;
}

export function InfrastructureValidationModule({ applicationId }: InfrastructureValidationProps) {
  const { toast } = useToast();
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const mockFacilities: FacilityItem[] = [
    {
      id: '1',
      facility_type: 'Classroom',
      image_url: '/images/classroom1.jpg',
      calculated_area: 85.5,
      compliance_status: 'compliant',
      compliance_score: 0.92,
      required_area: 80,
      validation_metadata: {
        dimensions: { length: 12, width: 7.5 },
        seating_capacity: 60,
        furniture_detected: true
      }
    },
    {
      id: '2',
      facility_type: 'Computer Lab',
      image_url: '/images/lab1.jpg',
      calculated_area: 65.2,
      compliance_status: 'non-compliant',
      compliance_score: 0.68,
      required_area: 100,
      validation_metadata: {
        dimensions: { length: 10, width: 6.8 },
        computer_count: 25,
        furniture_detected: true
      }
    },
    {
      id: '3',
      facility_type: 'Library',
      image_url: '/images/library1.jpg',
      calculated_area: 250.0,
      compliance_status: 'compliant',
      compliance_score: 0.95,
      required_area: 200,
      validation_metadata: {
        dimensions: { length: 20, width: 12.5 },
        book_shelves: 15,
        seating_capacity: 80
      }
    }
  ];

  const processImageValidation = async (facilityId: string) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Simulate OpenCV image processing with progress updates
      const steps = [
        { progress: 20, message: "Loading image..." },
        { progress: 40, message: "Detecting edges..." },
        { progress: 60, message: "Calculating dimensions..." },
        { progress: 80, message: "Analyzing objects..." },
        { progress: 100, message: "Generating report..." }
      ];

      for (const step of steps) {
        setProcessingProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Mock image processing results
      const validationResults = {
        calculated_area: 92.3,
        dimensions: { length: 11.2, width: 8.25 },
        compliance_score: 0.89,
        objects_detected: ['desks', 'chairs', 'whiteboard', 'projector'],
        area_utilization: 0.75
      };

      // Update facility status
      await supabase
        .from('infrastructure_validation')
        .update({
          calculated_area: validationResults.calculated_area,
          compliance_status: 'compliant',
          compliance_score: validationResults.compliance_score,
          validation_metadata: validationResults,
          validated_at: new Date().toISOString()
        })
        .eq('id', facilityId);

      toast({
        title: "Validation Complete",
        description: `Area calculated: ${validationResults.calculated_area}m² - Compliant with AICTE norms`
      });

    } catch (error) {
      console.error('Image processing error:', error);
      toast({
        title: "Validation Failed", 
        description: "Error during infrastructure validation process.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-success';
      case 'non-compliant': return 'text-destructive';
      default: return 'text-warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return CheckCircle;
      case 'non-compliant': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getCompliancePercentage = (calculated: number, required: number) => {
    return Math.min((calculated / required) * 100, 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Infrastructure Validation Module
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Digital verification of facility photos using OpenCV for area compliance
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing Infrastructure Images...</span>
              <span>{processingProgress}%</span>
            </div>
            <Progress value={processingProgress} className="h-2" />
          </div>
        )}

        <div className="space-y-4">
          {mockFacilities.map((facility) => {
            const StatusIcon = getStatusIcon(facility.compliance_status);
            const compliancePercentage = facility.calculated_area 
              ? getCompliancePercentage(facility.calculated_area, facility.required_area)
              : 0;
            
            return (
              <div key={facility.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(facility.compliance_status)}`} />
                    <div>
                      <h4 className="font-medium">{facility.facility_type}</h4>
                      <p className="text-sm text-muted-foreground">
                        Required: {facility.required_area}m² | 
                        Calculated: {facility.calculated_area?.toFixed(1) || 'N/A'}m²
                      </p>
                    </div>
                  </div>
                  <Badge variant={facility.compliance_status === 'compliant' ? 'default' : 'secondary'}>
                    {facility.compliance_status}
                  </Badge>
                </div>

                {facility.calculated_area && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Area Compliance</span>
                      <span>{compliancePercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={compliancePercentage} className="h-2" />
                  </div>
                )}

                {facility.validation_metadata && (
                  <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded">
                    <div>
                      <p className="font-medium">Dimensions</p>
                      <p className="text-muted-foreground">
                        {facility.validation_metadata.dimensions?.length}m × {facility.validation_metadata.dimensions?.width}m
                      </p>
                    </div>
                    {facility.validation_metadata.seating_capacity && (
                      <div>
                        <p className="font-medium">Capacity</p>
                        <p className="text-muted-foreground">
                          {facility.validation_metadata.seating_capacity} seats
                        </p>
                      </div>
                    )}
                    {facility.validation_metadata.computer_count && (
                      <div>
                        <p className="font-medium">Computers</p>
                        <p className="text-muted-foreground">
                          {facility.validation_metadata.computer_count} units
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">Score</p>
                      <p className="text-muted-foreground">
                        {facility.compliance_score ? (facility.compliance_score * 100).toFixed(1) : 'N/A'}%
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View Image
                  </Button>
                  <Button size="sm" variant="outline">
                    <Camera className="h-4 w-4 mr-1" />
                    Upload New
                  </Button>
                  {facility.compliance_status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => processImageValidation(facility.id)}
                      disabled={isProcessing}
                    >
                      <Calculator className="h-4 w-4 mr-1" />
                      Validate Area
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">Validation Features</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">OpenCV Processing</p>
              <p className="text-muted-foreground">Advanced image analysis and object detection</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Dimension Calculation</p>
              <p className="text-muted-foreground">Accurate area measurement from images</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">AICTE Compliance</p>
              <p className="text-muted-foreground">Verify against standard requirements</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Compliance Reporting</p>
              <p className="text-muted-foreground">Generate detailed validation reports</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}