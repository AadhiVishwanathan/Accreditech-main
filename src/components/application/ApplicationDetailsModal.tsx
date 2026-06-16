import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, Download, MapPin, Phone, Mail, User, Building, GraduationCap, DollarSign, FileText, Users, Database } from "lucide-react";
import { RealtimeApplication } from "@/hooks/useRealtimeApplications";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from "sonner";
import { useRef } from "react";

interface ApplicationDetailsModalProps {
  application: RealtimeApplication;
  trigger?: React.ReactNode;
}

export function ApplicationDetailsModal({ application, trigger }: ApplicationDetailsModalProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object' && Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'processing': return 'secondary';
      case 'document_review': return 'secondary';
      case 'evaluation': return 'secondary';
      default: return 'outline';
    }
  };

  const generatePDF = async () => {
    if (!pdfRef.current) {
      toast.error('Unable to generate PDF');
      return;
    }

    try {
      toast.info('Generating PDF...');
      
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${application.application_number}_application.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Application Details - {application.application_number}</span>
            <Badge variant={getStatusColor(application.status)}>
              {application.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6" ref={pdfRef}>
          {/* PDF Header for generated document */}
          <div className="hidden print:block">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-primary">AICTE Application Details</h1>
              <p className="text-muted-foreground">Application Number: {application.application_number}</p>
              <p className="text-xs text-muted-foreground">Generated on: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          {/* Application Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Application Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Application Number</p>
                <p className="text-sm text-muted-foreground">{application.application_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Programme</p>
                <p className="text-sm text-muted-foreground">{application.programme_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Programme Type</p>
                <p className="text-sm text-muted-foreground">{application.programme_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Progress</p>
                <p className="text-sm text-muted-foreground">{application.progress_percentage}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">AI Score</p>
                <p className="text-sm text-muted-foreground">{application.ai_score ? `${application.ai_score}%` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Submitted</p>
                <p className="text-sm text-muted-foreground">{new Date(application.submission_date).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Institute Information */}
          {application.institute && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Institute Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Institute Name</p>
                  <p className="text-sm text-muted-foreground">{application.institute.institute_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Director Name</p>
                  <p className="text-sm text-muted-foreground">{application.institute.director_name}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{application.institute.email}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Institution Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Institute Type</p>
                <p className="text-sm text-muted-foreground">Technical Institute</p>
              </div>
              <div>
                <p className="text-sm font-medium">Establishment Year</p>
                <p className="text-sm text-muted-foreground">N/A</p>
              </div>
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">N/A</p>
              </div>
              <div>
                <p className="text-sm font-medium">Affiliation</p>
                <p className="text-sm text-muted-foreground">N/A</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Faculty Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Total Faculty</p>
                  <p className="text-sm text-muted-foreground">N/A</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Qualified Faculty</p>
                  <p className="text-sm text-muted-foreground">N/A</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Faculty-Student Ratio</p>
                  <p className="text-sm text-muted-foreground">N/A</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Infrastructure Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Total Area (sq ft)</p>
                  <p className="text-sm text-muted-foreground">N/A</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Built-up Area (sq ft)</p>
                  <p className="text-sm text-muted-foreground">N/A</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Laboratories</p>
                  <p className="text-sm text-muted-foreground">N/A</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Library</p>
                  <p className="text-sm text-muted-foreground">N/A</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Annual Income</p>
                  <p className="text-sm text-muted-foreground">N/A</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Fund Available</p>
                  <p className="text-sm text-muted-foreground">N/A</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Fee Structure</p>
                  <p className="text-sm text-muted-foreground">N/A</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Scholarship Provision</p>
                  <p className="text-sm text-muted-foreground">N/A</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {application.payment_status && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Payment Status</p>
                    <Badge variant={application.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {application.payment_status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={generatePDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}