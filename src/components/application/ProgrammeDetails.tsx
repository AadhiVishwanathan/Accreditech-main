import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface ProgrammeDetailsProps {
  data: any;
  updateData: (section: string, data: any) => void;
}

export function ProgrammeDetails({ data, updateData }: ProgrammeDetailsProps) {
  const programmes = data.programme?.programmes || [{ id: 1 }];

  const handleProgrammeChange = (index: number, field: string, value: string) => {
    const updatedProgrammes = [...programmes];
    updatedProgrammes[index] = { ...updatedProgrammes[index], [field]: value };
    updateData('programme', { programmes: updatedProgrammes });
  };

  const handleInstituteDataChange = (field: string, value: string) => {
    updateData('programme', { ...data.programme, [field]: value });
  };

  const addProgramme = () => {
    const newProgramme = { id: Date.now() };
    updateData('programme', { programmes: [...programmes, newProgramme] });
  };

  const removeProgramme = (index: number) => {
    if (programmes.length > 1) {
      const updatedProgrammes = programmes.filter((_: any, i: number) => i !== index);
      updateData('programme', { programmes: updatedProgrammes });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Institute Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Number of Students in Institute *</Label>
              <Input
                type="number"
                placeholder="Enter total number of students"
                value={data.programme?.totalStudents || ''}
                onChange={(e) => handleInstituteDataChange('totalStudents', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {programmes.map((programme: any, index: number) => (
        <Card key={programme.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Programme {index + 1}</CardTitle>
              {programmes.length > 1 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeProgramme(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Programme Name *</Label>
                <Input
                  placeholder="e.g., B.Tech Computer Science"
                  value={programme.name || ''}
                  onChange={(e) => handleProgrammeChange(index, 'name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Level *</Label>
                <Select 
                  value={programme.level || ''} 
                  onValueChange={(value) => handleProgrammeChange(index, 'level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="undergraduate">Under Graduate</SelectItem>
                    <SelectItem value="postgraduate">Post Graduate</SelectItem>
                    <SelectItem value="doctoral">Doctoral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration (Years) *</Label>
                <Input
                  type="number"
                  placeholder="Enter duration"
                  value={programme.duration || ''}
                  onChange={(e) => handleProgrammeChange(index, 'duration', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Intake Capacity *</Label>
                <Input
                  type="number"
                  placeholder="Enter intake capacity"
                  value={programme.intake || ''}
                  onChange={(e) => handleProgrammeChange(index, 'intake', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Course Type *</Label>
                <Select 
                  value={programme.courseType || ''} 
                  onValueChange={(value) => handleProgrammeChange(index, 'courseType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="distance">Distance Learning</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fee per Year (₹) *</Label>
                <Input
                  type="number"
                  placeholder="Enter annual fee"
                  value={programme.fee || ''}
                  onChange={(e) => handleProgrammeChange(index, 'fee', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Programme Objectives</Label>
              <Textarea
                placeholder="Enter programme objectives"
                value={programme.objectives || ''}
                onChange={(e) => handleProgrammeChange(index, 'objectives', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Curriculum Details</Label>
              <Textarea
                placeholder="Enter curriculum details"
                value={programme.curriculum || ''}
                onChange={(e) => handleProgrammeChange(index, 'curriculum', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addProgramme} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Another Programme
      </Button>
    </div>
  );
}