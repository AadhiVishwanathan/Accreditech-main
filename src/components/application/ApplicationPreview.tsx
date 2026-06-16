import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Building, 
  GraduationCap, 
  Users, 
  DollarSign, 
  FileText, 
  CheckCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe
} from "lucide-react";

interface ApplicationData {
  id: string;
  applicationNumber: string;
  programmeType: string;
  programmeName: string;
  status: string;
  progress: number;
  submissionDate: string;
  application_data: any;
}

interface ApplicationPreviewProps {
  application: ApplicationData;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationPreview({ application, isOpen, onClose }: ApplicationPreviewProps) {
  const data = application.application_data || {};

  const sections = [
    {
      title: "Institution Details",
      icon: Building,
      data: data.institution || {},
      fields: [
        { label: "Institution Name", key: "institutionName" },
        { label: "Type", key: "institutionType" },
        { label: "Established Year", key: "establishedYear" },
        { label: "Principal Name", key: "principalName" },
        { label: "Contact Number", key: "contactNumber" },
        { label: "Email", key: "email" },
        { label: "Website", key: "website" },
        { label: "Address", key: "address" },
        { label: "City", key: "city" },
        { label: "State", key: "state" },
        { label: "Pincode", key: "pincode" },
        { label: "Affiliated University", key: "affiliatedUniversity" }
      ]
    },
    {
      title: "Programme Details",
      icon: GraduationCap,
      data: data.programme || {},
      fields: [
        { label: "Programme Type", key: "programmeType" },
        { label: "Programme Name", key: "programmeName" },
        { label: "Duration", key: "duration" },
        { label: "Intake Capacity", key: "intakeCapacity" },
        { label: "Mode of Delivery", key: "modeOfDelivery" },
        { label: "Academic Session", key: "academicSession" }
      ]
    },
    {
      title: "Faculty Details",
      icon: Users,
      data: data.faculty || {},
      fields: [
        { label: "Total Faculty", key: "totalFaculty" },
        { label: "PhD Faculty", key: "phdFaculty" },
        { label: "Regular Faculty", key: "regularFaculty" },
        { label: "Visiting Faculty", key: "visitingFaculty" },
        { label: "Student Faculty Ratio", key: "studentFacultyRatio" }
      ]
    },
    {
      title: "Infrastructure Details",
      icon: Building,
      data: data.infrastructure || {},
      fields: [
        { label: "Total Area (sq ft)", key: "totalArea" },
        { label: "Built-up Area (sq ft)", key: "builtUpArea" },
        { label: "Classrooms", key: "classrooms" },
        { label: "Laboratories", key: "laboratories" },
        { label: "Library Area (sq ft)", key: "libraryArea" },
        { label: "Computer Lab", key: "computerLab" },
        { label: "Auditorium Capacity", key: "auditoriumCapacity" }
      ]
    },
    {
      title: "Financial Details",
      icon: DollarSign,
      data: data.financial || {},
      fields: [
        { label: "Total Investment", key: "totalInvestment" },
        { label: "Land Value", key: "landValue" },
        { label: "Building Value", key: "buildingValue" },
        { label: "Equipment Value", key: "equipmentValue" },
        { label: "Fee Structure", key: "feeStructure" },
        { label: "Tuition Fee", key: "tuitionFee" }
      ]
    }
  ];

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return 'Not provided';
    if (typeof value === 'number') return value.toLocaleString();
    return value.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold">Application Preview</h2>
                <p className="text-sm text-muted-foreground">
                  {application.applicationNumber} • {application.programmeType} - {application.programmeName}
                </p>
              </div>
            </div>
            <Badge variant={application.status === 'submitted' ? 'default' : 'secondary'}>
              {application.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Application Header */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Submission Date</p>
                    <p className="text-sm text-muted-foreground">{application.submissionDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm font-medium">Progress</p>
                    <p className="text-sm text-muted-foreground">{application.progress}% Complete</p>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Application Sections */}
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <section.icon className="h-5 w-5" />
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
                      <p className="text-sm font-medium">
                        {formatValue(section.data[field.key])}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Documents Section */}
          {data.attachments?.documents && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Attached Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.attachments.documents).map(([key, doc]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded on {doc.uploadDate}
                            {doc.isDigitallyVerified && (
                              <Badge variant="default" className="ml-2 text-xs">
                                Verified
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}