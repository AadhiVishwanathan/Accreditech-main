import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, FileText, Users, Building, CreditCard, Paperclip, DollarSign, Eye } from "lucide-react";
import { SectionPreviewDialog } from "./SectionPreviewDialog";
import { useState } from "react";
interface ReviewSubmitProps {
  data: any;
  updateData: (section: string, data: any) => void;
}
export function ReviewSubmit({
  data,
  updateData
}: ReviewSubmitProps) {
  const [previewDialog, setPreviewDialog] = useState<{
    isOpen: boolean;
    sectionKey: string;
    sectionTitle: string;
    sectionData: any;
  }>({
    isOpen: false,
    sectionKey: '',
    sectionTitle: '',
    sectionData: null
  });

  const handlePreview = (section: any) => {
    setPreviewDialog({
      isOpen: true,
      sectionKey: section.key,
      sectionTitle: section.title,
      sectionData: section.data
    });
  };
  const sections = [{
    key: 'institution',
    title: 'Institution Details',
    icon: Building,
    data: data.institution,
    required: ['institutionName', 'institutionType', 'establishedYear', 'principalName', 'contactNumber', 'email', 'address', 'state', 'district', 'pincode']
  }, {
    key: 'programme',
    title: 'Programme Details',
    icon: FileText,
    data: data.programme,
    required: ['programmes']
  }, {
    key: 'infrastructure',
    title: 'Infrastructure Details',
    icon: Building,
    data: data.infrastructure,
    required: ['landArea', 'builtUpArea', 'classrooms', 'laboratories', 'libraryArea', 'libraryBooks', 'computers', 'internetBandwidth', 'servers']
  }, {
    key: 'faculty',
    title: 'Faculty Details',
    icon: Users,
    data: data.faculty,
    required: ['totalFaculty', 'phdFaculty', 'facultyStudentRatio', 'faculty']
  }, {
    key: 'financial',
    title: 'Financial Details',
    icon: DollarSign,
    data: data.financial,
    required: ['feeCollection', 'facultySalaries', 'maintenanceCost', 'bankBalance', 'auditorFirm', 'auditorRegNumber']
  }, {
    key: 'attachments',
    title: 'Attachments',
    icon: Paperclip,
    data: data.attachments,
    required: ['documents']
  }, {
    key: 'payment',
    title: 'Payment',
    icon: CreditCard,
    data: data.payment,
    required: ['confirmed']
  }];
  const getSectionStatus = (section: any) => {
    if (!section.data) return 'incomplete';
    const hasRequiredFields = section.required.every(field => {
      if (field === 'programmes' && section.data.programmes) {
        return section.data.programmes.length > 0 && section.data.programmes[0].name;
      }
      if (field === 'faculty' && section.data.faculty) {
        return section.data.faculty.length > 0 && section.data.faculty[0].name;
      }
      if (field === 'documents' && section.data.documents) {
        return Object.keys(section.data.documents).length > 0;
      }
      if (field === 'confirmed') {
        return section.data.confirmed === true;
      }
      return section.data[field];
    });
    return hasRequiredFields ? 'complete' : 'incomplete';
  };
  const completedSections = sections.filter(section => getSectionStatus(section) === 'complete').length;
  const totalSections = sections.length;
  const canSubmit = completedSections === totalSections;
  return <div className="space-y-6">
      {/* Submission Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-primary mb-2">
              {completedSections}/{totalSections}
            </div>
            <p className="text-muted-foreground">Sections Completed</p>
            <div className="w-full bg-muted rounded-full h-2 mt-4">
              <div className="bg-primary rounded-full h-2 transition-all duration-300" style={{
              width: `${completedSections / totalSections * 100}%`
            }} />
            </div>
          </div>

          {!canSubmit && <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-warning mr-2" />
                <span className="font-medium text-orange-600">Application Incomplete</span>
              </div>
              <p className="text-sm text-zinc-800 font-semibold">
                Please complete all sections before submitting your application.
              </p>
            </div>}
        </CardContent>
      </Card>

      {/* Section Status */}
      <Card>
        <CardHeader>
          <CardTitle>Section Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sections.map(section => {
          const status = getSectionStatus(section);
          const Icon = section.icon;
          return <div key={section.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{section.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={status === 'complete' ? 'default' : 'secondary'}>
                    {status === 'complete' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                    {status === 'complete' ? 'Complete' : 'Incomplete'}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => handlePreview(section)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>;
        })}
        </CardContent>
      </Card>

      {/* Application Details Summary */}
      {data.institution?.institutionName && <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Institution Name</Label>
                <p className="font-medium">{data.institution.institutionName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Institution Type</Label>
                <p className="font-medium">{data.institution.institutionType}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Principal Name</Label>
                <p className="font-medium">{data.institution.principalName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Contact Email</Label>
                <p className="font-medium">{data.institution.email}</p>
              </div>
            </div>

            <Separator />

            {data.programme?.programmes && data.programme.programmes.length > 0 && <div>
                <Label className="text-muted-foreground">Programmes Applied For</Label>
                <div className="mt-2 space-y-2">
                  {data.programme.programmes.map((prog: any, index: number) => prog.name && <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="font-medium">{prog.name}</span>
                        <Badge variant="outline">{prog.level}</Badge>
                      </div>)}
                </div>
              </div>}

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-lg font-bold text-primary">{data.faculty?.totalFaculty || 0}</p>
                <p className="text-xs text-muted-foreground">Total Faculty</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-lg font-bold text-primary">{data.infrastructure?.classrooms || 0}</p>
                <p className="text-xs text-muted-foreground">Classrooms</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-lg font-bold text-primary">{data.infrastructure?.laboratories || 0}</p>
                <p className="text-xs text-muted-foreground">Laboratories</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-lg font-bold text-primary">
                  {data.attachments?.documents ? Object.keys(data.attachments.documents).length : 0}
                </p>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>}

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p>By submitting this application, I hereby declare that:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>All information provided is true and accurate to the best of my knowledge</li>
              <li>I understand that providing false information may result in rejection of the application</li>
              <li>I agree to comply with all AICTE norms and regulations</li>
              <li>I understand that approval is subject to verification and expert evaluation</li>
              <li>I will maintain the standards prescribed by AICTE throughout the operation</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {canSubmit && <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">Ready to Submit</span>
          </div>
          <p className="text-sm text-green-600">
            Your application is complete and ready for submission. Click the submit button to proceed.
          </p>
        </div>}

      <SectionPreviewDialog
        isOpen={previewDialog.isOpen}
        onClose={() => setPreviewDialog(prev => ({ ...prev, isOpen: false }))}
        sectionKey={previewDialog.sectionKey}
        sectionTitle={previewDialog.sectionTitle}
        sectionData={previewDialog.sectionData}
      />
    </div>;
}
function Label({
  className,
  children,
  ...props
}: any) {
  return <label className={`text-sm font-medium ${className}`} {...props}>
      {children}
    </label>;
}