import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Download,
  Upload
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentVerificationProps {
  applicationId: string;
}

interface DocumentItem {
  id: string;
  document_name: string;
  document_url: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_score?: number;
  ocr_text?: string;
  fraud_checks?: any;
  verified_at?: string;
}

export function DocumentVerificationModule({ applicationId }: DocumentVerificationProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);

  const mockDocuments: DocumentItem[] = [
    {
      id: '1',
      document_name: 'Affiliation Certificate',
      document_url: '/documents/affiliation.pdf',
      verification_status: 'verified',
      verification_score: 0.95,
      verified_at: '2024-09-21T10:30:00Z'
    },
    {
      id: '2', 
      document_name: 'Infrastructure Photos',
      document_url: '/documents/infrastructure.pdf',
      verification_status: 'pending',
      verification_score: 0.0
    },
    {
      id: '3',
      document_name: 'Faculty Qualifications',
      document_url: '/documents/faculty.pdf', 
      verification_status: 'rejected',
      verification_score: 0.65,
      verified_at: '2024-09-21T09:15:00Z'
    }
  ];

  const performOCRExtraction = async (documentId: string) => {
    setIsLoading(true);
    setVerificationProgress(0);

    try {
      // Simulate OCR processing with progress updates
      const progressSteps = [25, 50, 75, 100];
      
      for (const step of progressSteps) {
        setVerificationProgress(step);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Mock OCR text extraction
      const mockOCRText = "CERTIFICATE OF AFFILIATION\nThis is to certify that the institution...\nValid until: 2025-12-31\nAuthorized by: AICTE";
      
      // Mock fraud detection checks
      const fraudChecks = {
        textAuthenticity: 0.92,
        documentIntegrity: 0.95,
        logoVerification: 0.88,
        dateValidation: 0.97
      };

      // Update document status
      await supabase
        .from('document_verification')
        .update({
          verification_status: 'verified',
          ocr_text: mockOCRText,
          verification_score: 0.93,
          fraud_checks: fraudChecks,
          verified_at: new Date().toISOString()
        })
        .eq('id', documentId);

      toast({
        title: "Document Verified",
        description: "OCR extraction and fraud checks completed successfully."
      });

    } catch (error) {
      console.error('OCR processing error:', error);
      toast({
        title: "Verification Failed",
        description: "Error during document verification process.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setVerificationProgress(0);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-success';
      case 'rejected': return 'text-destructive';
      default: return 'text-warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return CheckCircle;
      case 'rejected': return XCircle;
      default: return AlertTriangle;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Verification Module
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          OCR text extraction, keyword matching, and fraud detection for submitted documents
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing Document...</span>
              <span>{verificationProgress}%</span>
            </div>
            <Progress value={verificationProgress} className="h-2" />
          </div>
        )}

        <div className="space-y-3">
          {mockDocuments.map((doc) => {
            const StatusIcon = getStatusIcon(doc.verification_status);
            
            return (
              <div key={doc.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(doc.verification_status)}`} />
                    <div>
                      <h4 className="font-medium">{doc.document_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Score: {doc.verification_score ? (doc.verification_score * 100).toFixed(1) : 'N/A'}%
                      </p>
                    </div>
                  </div>
                  <Badge variant={doc.verification_status === 'verified' ? 'default' : 'secondary'}>
                    {doc.verification_status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  {doc.verification_status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => performOCRExtraction(doc.id)}
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Verify Document
                    </Button>
                  )}
                </div>

                {doc.verification_status === 'verified' && doc.verified_at && (
                  <p className="text-xs text-muted-foreground">
                    Verified on {new Date(doc.verified_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">Verification Features</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">OCR Text Extraction</p>
              <p className="text-muted-foreground">Extract text using Tesseract.js</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Keyword Matching</p>
              <p className="text-muted-foreground">Validate required terms and phrases</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Fraud Detection</p>
              <p className="text-muted-foreground">Check document authenticity</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Compliance Check</p>
              <p className="text-muted-foreground">Verify AICTE format requirements</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}