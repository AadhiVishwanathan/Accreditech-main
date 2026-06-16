import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building, FileText, Users, DollarSign, Paperclip, CreditCard } from "lucide-react";

interface SectionPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sectionKey: string;
  sectionTitle: string;
  sectionData: any;
}

export function SectionPreviewDialog({ 
  isOpen, 
  onClose, 
  sectionKey, 
  sectionTitle, 
  sectionData 
}: SectionPreviewDialogProps) {
  const renderSectionContent = () => {
    if (!sectionData) {
      return <p className="text-muted-foreground">No data available for this section.</p>;
    }

    switch (sectionKey) {
      case 'institution':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Institution Name</label>
                <p className="mt-1 font-medium">{sectionData.institutionName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Institution Type</label>
                <p className="mt-1 font-medium">{sectionData.institutionType || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Established Year</label>
                <p className="mt-1 font-medium">{sectionData.establishedYear || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Principal Name</label>
                <p className="mt-1 font-medium">{sectionData.principalName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                <p className="mt-1 font-medium">{sectionData.contactNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="mt-1 font-medium">{sectionData.email || 'Not provided'}</p>
              </div>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <p className="mt-1 font-medium">{sectionData.address || 'Not provided'}</p>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <label className="text-sm text-muted-foreground">State</label>
                  <p className="font-medium">{sectionData.state || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">District</label>
                  <p className="font-medium">{sectionData.district || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Pincode</label>
                  <p className="font-medium">{sectionData.pincode || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'programme':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Programmes Applied For</label>
              <div className="mt-2 space-y-2">
                {sectionData.programmes && sectionData.programmes.length > 0 ? (
                  sectionData.programmes.map((prog: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{prog.name || 'Unnamed Programme'}</p>
                        <p className="text-sm text-muted-foreground">Duration: {prog.duration || 'Not specified'}</p>
                      </div>
                      <Badge variant="outline">{prog.level || 'Not specified'}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No programmes added yet.</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'infrastructure':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Land Area (sq ft)</label>
                <p className="mt-1 font-medium">{sectionData.landArea || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Built-up Area (sq ft)</label>
                <p className="mt-1 font-medium">{sectionData.builtUpArea || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Classrooms</label>
                <p className="mt-1 font-medium">{sectionData.classrooms || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Laboratories</label>
                <p className="mt-1 font-medium">{sectionData.laboratories || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Library Area (sq ft)</label>
                <p className="mt-1 font-medium">{sectionData.libraryArea || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Library Books</label>
                <p className="mt-1 font-medium">{sectionData.libraryBooks || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Computers</label>
                <p className="mt-1 font-medium">{sectionData.computers || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Internet Bandwidth (Mbps)</label>
                <p className="mt-1 font-medium">{sectionData.internetBandwidth || 'Not provided'}</p>
              </div>
            </div>
          </div>
        );

      case 'faculty':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Faculty</label>
                <p className="mt-1 font-medium">{sectionData.totalFaculty || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">PhD Faculty</label>
                <p className="mt-1 font-medium">{sectionData.phdFaculty || 'Not provided'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Faculty-Student Ratio</label>
                <p className="mt-1 font-medium">{sectionData.facultyStudentRatio || 'Not provided'}</p>
              </div>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Faculty Details</label>
              <div className="mt-2 space-y-2">
                {sectionData.faculty && sectionData.faculty.length > 0 ? (
                  sectionData.faculty.map((faculty: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium">{faculty.name || 'Unnamed Faculty'}</p>
                          <p className="text-sm text-muted-foreground">{faculty.designation || 'No designation'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Experience: {faculty.experience || 'Not specified'} years</p>
                          <p className="text-sm text-muted-foreground">Qualification: {faculty.qualification || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No faculty details added yet.</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fee Collection (₹)</label>
                <p className="mt-1 font-medium">{sectionData.feeCollection ? `₹${Number(sectionData.feeCollection).toLocaleString()}` : 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Faculty Salaries (₹)</label>
                <p className="mt-1 font-medium">{sectionData.facultySalaries ? `₹${Number(sectionData.facultySalaries).toLocaleString()}` : 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Maintenance Cost (₹)</label>
                <p className="mt-1 font-medium">{sectionData.maintenanceCost ? `₹${Number(sectionData.maintenanceCost).toLocaleString()}` : 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bank Balance (₹)</label>
                <p className="mt-1 font-medium">{sectionData.bankBalance ? `₹${Number(sectionData.bankBalance).toLocaleString()}` : 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Auditor Firm</label>
                <p className="mt-1 font-medium">{sectionData.auditorFirm || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Auditor Registration Number</label>
                <p className="mt-1 font-medium">{sectionData.auditorRegNumber || 'Not provided'}</p>
              </div>
            </div>
          </div>
        );

      case 'attachments':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Uploaded Documents</label>
              <div className="mt-2 space-y-2">
                {sectionData.documents && Object.keys(sectionData.documents).length > 0 ? (
                  Object.entries(sectionData.documents).map(([key, file]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                          <p className="text-sm text-muted-foreground">{file?.name || 'File uploaded'}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Uploaded</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No documents uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                <p className="mt-1">
                  <Badge variant={sectionData.confirmed ? "default" : "secondary"}>
                    {sectionData.confirmed ? "Payment Confirmed" : "Payment Pending"}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Amount</label>
                <p className="mt-1 font-medium">₹25,000</p>
              </div>
            </div>
            {sectionData.bankDetails && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bank Details</label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Bank Name</p>
                      <p className="font-medium">{sectionData.bankDetails.bankName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Number</p>
                      <p className="font-medium">{sectionData.bankDetails.accountNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">UTR Number</p>
                      <p className="font-medium">{sectionData.utrNumber || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      default:
        return <p className="text-muted-foreground">Preview not available for this section.</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {sectionKey === 'institution' && <Building className="h-5 w-5" />}
            {sectionKey === 'programme' && <FileText className="h-5 w-5" />}
            {sectionKey === 'infrastructure' && <Building className="h-5 w-5" />}
            {sectionKey === 'faculty' && <Users className="h-5 w-5" />}
            {sectionKey === 'financial' && <DollarSign className="h-5 w-5" />}
            {sectionKey === 'attachments' && <Paperclip className="h-5 w-5" />}
            {sectionKey === 'payment' && <CreditCard className="h-5 w-5" />}
            <span>{sectionTitle} Preview</span>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {renderSectionContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}