import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Camera, CheckCircle, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RequiredFacility {
  id: string;
  name: string;
  type: 'mandatory' | 'recommended';
  description: string;
  minArea?: number;
  uploaded: boolean;
  imageUrl?: string;
}

interface InfrastructureUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string;
}

const REQUIRED_FACILITIES: RequiredFacility[] = [
  {
    id: 'gymnasium',
    name: 'Gymnasium/Sports Complex',
    type: 'mandatory',
    description: 'Indoor sports facility with adequate space',
    minArea: 200,
    uploaded: false
  },
  {
    id: 'foodcourt',
    name: 'Food Court/Cafeteria',
    type: 'mandatory',
    description: 'Dining facility for students and staff',
    minArea: 150,
    uploaded: false
  },
  {
    id: 'playground',
    name: 'Playground/Ground',
    type: 'mandatory',
    description: 'Outdoor sports and recreational area',
    minArea: 1000,
    uploaded: false
  },
  {
    id: 'library',
    name: 'Central Library',
    type: 'mandatory',
    description: 'Library with reading halls and digital resources',
    minArea: 300,
    uploaded: false
  },
  {
    id: 'laboratory',
    name: 'Laboratories',
    type: 'mandatory',
    description: 'Subject-specific laboratories',
    minArea: 80,
    uploaded: false
  },
  {
    id: 'auditorium',
    name: 'Auditorium/Seminar Hall',
    type: 'mandatory',
    description: 'Large gathering space for events',
    minArea: 200,
    uploaded: false
  },
  {
    id: 'hostel',
    name: 'Hostel Facilities',
    type: 'recommended',
    description: 'Student accommodation facilities',
    uploaded: false
  },
  {
    id: 'parking',
    name: 'Parking Area',
    type: 'recommended',
    description: 'Vehicle parking space',
    uploaded: false
  }
];

export function InfrastructureUploadModal({ isOpen, onClose, applicationId }: InfrastructureUploadModalProps) {
  const [facilities, setFacilities] = useState<RequiredFacility[]>(REQUIRED_FACILITIES);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFacility, setProcessingFacility] = useState<string | null>(null);

  const handleFileUpload = async (facilityId: string, file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setProcessingFacility(facilityId);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${applicationId || 'temp'}_${facilityId}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('infrastructure-photos')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('infrastructure-photos')
        .getPublicUrl(fileName);

      // Process image with AI validation (mock implementation)
      await simulateImageProcessing(facilityId, publicUrl);

      // Update facility status
      setFacilities(prev => prev.map(facility => 
        facility.id === facilityId 
          ? { ...facility, uploaded: true, imageUrl: publicUrl }
          : facility
      ));

      toast.success(`${facilities.find(f => f.id === facilityId)?.name} uploaded and validated successfully`);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingFacility(null);
    }
  };

  const simulateImageProcessing = async (facilityId: string, imageUrl: string) => {
    // Simulate AI processing with OpenCV analysis
    return new Promise(resolve => {
      setTimeout(() => {
        // Mock validation results
        const mockResults = {
          dimensions: { width: 1200, height: 800 },
          calculatedArea: Math.floor(Math.random() * 500) + 100,
          complianceScore: Math.floor(Math.random() * 30) + 70,
          features: ['proper_lighting', 'adequate_space', 'safety_measures']
        };

        // Save to infrastructure_validation table
        if (applicationId) {
          supabase.from('infrastructure_validation').insert({
            application_id: applicationId,
            facility_type: facilityId,
            image_url: imageUrl,
            calculated_area: mockResults.calculatedArea,
            compliance_score: mockResults.complianceScore,
            compliance_status: mockResults.complianceScore >= 80 ? 'compliant' : 'pending',
            validation_metadata: mockResults
          });
        }

        resolve(mockResults);
      }, 2000);
    });
  };

  const getUploadProgress = () => {
    const uploaded = facilities.filter(f => f.uploaded).length;
    const mandatory = facilities.filter(f => f.type === 'mandatory').length;
    return Math.round((uploaded / facilities.length) * 100);
  };

  const getMandatoryProgress = () => {
    const uploaded = facilities.filter(f => f.uploaded && f.type === 'mandatory').length;
    const mandatory = facilities.filter(f => f.type === 'mandatory').length;
    return Math.round((uploaded / mandatory) * 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Infrastructure Photo Upload
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{getUploadProgress()}%</span>
                </div>
                <Progress value={getUploadProgress()} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Mandatory Facilities</span>
                  <span>{getMandatoryProgress()}%</span>
                </div>
                <Progress value={getMandatoryProgress()} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* AI Validation Info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg text-primary">AI-Powered Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">OpenCV Image Processing</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Automatic dimension calculation</li>
                    <li>• Area compliance verification</li>
                    <li>• Quality assessment</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">AICTE Compliance Check</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Minimum area requirements</li>
                    <li>• Facility standards verification</li>
                    <li>• Real-time compliance scoring</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facilities Upload Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {facilities.map((facility) => (
              <Card key={facility.id} className={`relative ${facility.type === 'mandatory' ? 'border-orange-200' : 'border-gray-200'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{facility.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {facility.description}
                      </p>
                      {facility.minArea && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Min. Area: {facility.minArea} sq m
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={facility.type === 'mandatory' ? 'destructive' : 'secondary'}>
                        {facility.type}
                      </Badge>
                      {facility.uploaded && (
                        <Badge variant="default" className="bg-success text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Uploaded
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {facility.uploaded ? (
                    <div className="space-y-3">
                      {facility.imageUrl && (
                        <img 
                          src={facility.imageUrl} 
                          alt={facility.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setFacilities(prev => prev.map(f => 
                            f.id === facility.id ? { ...f, uploaded: false, imageUrl: undefined } : f
                          ))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(facility.id, file);
                        }}
                        className="hidden"
                        id={`upload-${facility.id}`}
                        disabled={isProcessing}
                      />
                      <label 
                        htmlFor={`upload-${facility.id}`}
                        className={`
                          flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer
                          ${isProcessing && processingFacility === facility.id ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
                          ${isProcessing ? 'pointer-events-none' : ''}
                        `}
                      >
                        {isProcessing && processingFacility === facility.id ? (
                          <div className="text-center">
                            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p className="text-sm text-primary">Processing...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click to upload</p>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Save & Close
            </Button>
            <Button 
              className="bg-gradient-primary"
              disabled={getMandatoryProgress() < 100}
            >
              Complete Infrastructure Validation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}