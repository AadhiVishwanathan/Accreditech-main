import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Upload, FileSpreadsheet, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface FacultyDetailsProps {
  data: any;
  updateData: (section: string, data: any) => void;
}

export function FacultyDetails({ data, updateData }: FacultyDetailsProps) {
  const { toast } = useToast();
  const faculty = data.faculty?.faculty || [{ id: 1 }];

  const handleFacultyChange = (index: number, field: string, value: string) => {
    const updatedFaculty = [...faculty];
    updatedFaculty[index] = { ...updatedFaculty[index], [field]: value };
    updateData('faculty', { faculty: updatedFaculty });
  };

  const addFaculty = () => {
    const newFaculty = { id: Date.now() };
    updateData('faculty', { faculty: [...faculty, newFaculty] });
  };

  const removeFaculty = (index: number) => {
    if (faculty.length > 1) {
      const updatedFaculty = faculty.filter((_: any, i: number) => i !== index);
      updateData('faculty', { faculty: updatedFaculty });
    }
  };

  const handleSummaryChange = (field: string, value: string) => {
    updateData('faculty', { [field]: value });
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Faculty Name': 'Dr. John Smith',
        'Designation': 'professor',
        'Qualification': 'phd',
        'Specialization': 'Computer Science',
        'Experience (Years)': '10',
        'Employment Type': 'permanent',
        'Contact Email': 'john.smith@example.com',
        'Contact Number': '9876543210'
      },
      {
        'Faculty Name': 'Dr. Jane Doe',
        'Designation': 'associate-professor',
        'Qualification': 'phd',
        'Specialization': 'Data Science',
        'Experience (Years)': '8',
        'Employment Type': 'permanent',
        'Contact Email': 'jane.doe@example.com',
        'Contact Number': '9876543211'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Faculty Template');
    XLSX.writeFile(wb, 'faculty_template.xlsx');
    
    toast({
      title: "Template Downloaded",
      description: "Faculty template has been downloaded. Fill in your faculty details and upload.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Invalid File Format",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast({
            title: "Empty File",
            description: "The uploaded file contains no data.",
            variant: "destructive",
          });
          return;
        }

        // Map Excel data to faculty format
        const mappedFaculty = jsonData.map((row: any, index: number) => ({
          id: Date.now() + index,
          name: row['Faculty Name'] || '',
          designation: row['Designation'] || '',
          qualification: row['Qualification'] || '',
          specialization: row['Specialization'] || '',
          experience: row['Experience (Years)']?.toString() || '',
          employmentType: row['Employment Type'] || '',
          email: row['Contact Email'] || '',
          contact: row['Contact Number']?.toString() || ''
        }));

        // Validate required fields
        const invalidRows = mappedFaculty.filter((member: any) => 
          !member.name || !member.designation || !member.qualification || 
          !member.specialization || !member.experience || !member.employmentType
        );

        if (invalidRows.length > 0) {
          toast({
            title: "Validation Error",
            description: `${invalidRows.length} rows have missing required fields. Please check the template format.`,
            variant: "destructive",
          });
          return;
        }

        updateData('faculty', { faculty: mappedFaculty });
        
        toast({
          title: "Faculty Data Imported",
          description: `Successfully imported ${mappedFaculty.length} faculty members.`,
        });

        // Reset file input
        event.target.value = '';
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast({
          title: "Import Failed",
          description: "Failed to parse the Excel file. Please check the format and try again.",
          variant: "destructive",
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      {/* Faculty Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Faculty Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Total Faculty Count *</Label>
              <Input
                type="number"
                placeholder="Enter total faculty"
                value={data.faculty?.totalFaculty || ''}
                onChange={(e) => handleSummaryChange('totalFaculty', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>PhD Faculty Count *</Label>
              <Input
                type="number"
                placeholder="Enter PhD faculty count"
                value={data.faculty?.phdFaculty || ''}
                onChange={(e) => handleSummaryChange('phdFaculty', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Faculty to Student Ratio *</Label>
              <Input
                placeholder="e.g., 1:15"
                value={data.faculty?.facultyStudentRatio || ''}
                onChange={(e) => handleSummaryChange('facultyStudentRatio', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Excel Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Import Faculty Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              You can upload faculty details in bulk using an Excel file. Download the template below, fill in your faculty data, and upload it.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={downloadTemplate} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            
            <div className="flex-1">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="faculty-upload"
              />
              <Button asChild variant="secondary" className="w-full">
                <label htmlFor="faculty-upload" className="cursor-pointer flex items-center justify-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Faculty Excel
                </label>
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p><strong>Required columns:</strong> Faculty Name, Designation, Qualification, Specialization, Experience (Years), Employment Type</p>
            <p><strong>Optional columns:</strong> Contact Email, Contact Number</p>
          </div>
        </CardContent>
      </Card>

      {/* Individual Faculty Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Faculty Members</h3>
          <Button onClick={addFaculty} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Faculty
          </Button>
        </div>

        {faculty.map((member: any, index: number) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Faculty Member {index + 1}</CardTitle>
                {faculty.length > 1 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeFaculty(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Faculty Name *</Label>
                  <Input
                    placeholder="Enter faculty name"
                    value={member.name || ''}
                    onChange={(e) => handleFacultyChange(index, 'name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Designation *</Label>
                  <Select 
                    value={member.designation || ''} 
                    onValueChange={(value) => handleFacultyChange(index, 'designation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professor">Professor</SelectItem>
                      <SelectItem value="associate-professor">Associate Professor</SelectItem>
                      <SelectItem value="assistant-professor">Assistant Professor</SelectItem>
                      <SelectItem value="lecturer">Lecturer</SelectItem>
                      <SelectItem value="principal">Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Highest Qualification *</Label>
                  <Select 
                    value={member.qualification || ''} 
                    onValueChange={(value) => handleFacultyChange(index, 'qualification', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="masters">Masters</SelectItem>
                      <SelectItem value="bachelors">Bachelors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Specialization *</Label>
                  <Input
                    placeholder="Enter specialization"
                    value={member.specialization || ''}
                    onChange={(e) => handleFacultyChange(index, 'specialization', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Experience (Years) *</Label>
                  <Input
                    type="number"
                    placeholder="Enter experience"
                    value={member.experience || ''}
                    onChange={(e) => handleFacultyChange(index, 'experience', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Employment Type *</Label>
                  <Select 
                    value={member.employmentType || ''} 
                    onValueChange={(value) => handleFacultyChange(index, 'employmentType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="visiting">Visiting</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter email"
                    value={member.email || ''}
                    onChange={(e) => handleFacultyChange(index, 'email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input
                    placeholder="Enter contact number"
                    value={member.contact || ''}
                    onChange={(e) => handleFacultyChange(index, 'contact', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}