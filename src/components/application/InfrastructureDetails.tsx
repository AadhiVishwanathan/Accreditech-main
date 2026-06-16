import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InfrastructureDetailsProps {
  data: any;
  updateData: (section: string, data: any) => void;
}

export function InfrastructureDetails({ data, updateData }: InfrastructureDetailsProps) {
  const handleChange = (field: string, value: string) => {
    updateData('infrastructure', { [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Land and Building */}
      <Card>
        <CardHeader>
          <CardTitle>Land and Building Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Land Area (in acres) *</Label>
              <Input
                type="number"
                placeholder="Enter land area"
                value={data.infrastructure?.landArea || ''}
                onChange={(e) => handleChange('landArea', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Built-up Area (in sq. ft) *</Label>
              <Input
                type="number"
                placeholder="Enter built-up area"
                value={data.infrastructure?.builtUpArea || ''}
                onChange={(e) => handleChange('builtUpArea', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Number of Classrooms *</Label>
              <Input
                type="number"
                placeholder="Enter number of classrooms"
                value={data.infrastructure?.classrooms || ''}
                onChange={(e) => handleChange('classrooms', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Number of Laboratories *</Label>
              <Input
                type="number"
                placeholder="Enter number of laboratories"
                value={data.infrastructure?.laboratories || ''}
                onChange={(e) => handleChange('laboratories', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Library Area (in sq. ft) *</Label>
              <Input
                type="number"
                placeholder="Enter library area"
                value={data.infrastructure?.libraryArea || ''}
                onChange={(e) => handleChange('libraryArea', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Number of Books in Library *</Label>
              <Input
                type="number"
                placeholder="Enter number of books"
                value={data.infrastructure?.libraryBooks || ''}
                onChange={(e) => handleChange('libraryBooks', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Computing Infrastructure */}
      <Card>
        <CardHeader>
          <CardTitle>Computing Infrastructure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Number of Computer Systems *</Label>
              <Input
                type="number"
                placeholder="Enter number of computers"
                value={data.infrastructure?.computers || ''}
                onChange={(e) => handleChange('computers', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Internet Bandwidth (Mbps) *</Label>
              <Input
                type="number"
                placeholder="Enter bandwidth"
                value={data.infrastructure?.internetBandwidth || ''}
                onChange={(e) => handleChange('internetBandwidth', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Number of Servers *</Label>
              <Input
                type="number"
                placeholder="Enter number of servers"
                value={data.infrastructure?.servers || ''}
                onChange={(e) => handleChange('servers', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Software Licenses</Label>
              <Input
                placeholder="Enter software details"
                value={data.infrastructure?.softwareLicenses || ''}
                onChange={(e) => handleChange('softwareLicenses', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Other Facilities */}
      <Card>
        <CardHeader>
          <CardTitle>Other Facilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Auditorium Capacity</Label>
              <Input
                type="number"
                placeholder="Enter auditorium capacity"
                value={data.infrastructure?.auditoriumCapacity || ''}
                onChange={(e) => handleChange('auditoriumCapacity', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Cafeteria Capacity</Label>
              <Input
                type="number"
                placeholder="Enter cafeteria capacity"
                value={data.infrastructure?.cafeteriaCapacity || ''}
                onChange={(e) => handleChange('cafeteriaCapacity', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Hostel Capacity (Boys)</Label>
              <Input
                type="number"
                placeholder="Enter boys hostel capacity"
                value={data.infrastructure?.hostelBoys || ''}
                onChange={(e) => handleChange('hostelBoys', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Hostel Capacity (Girls)</Label>
              <Input
                type="number"
                placeholder="Enter girls hostel capacity"
                value={data.infrastructure?.hostelGirls || ''}
                onChange={(e) => handleChange('hostelGirls', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Parking Capacity</Label>
              <Input
                type="number"
                placeholder="Enter parking capacity"
                value={data.infrastructure?.parkingCapacity || ''}
                onChange={(e) => handleChange('parkingCapacity', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Power Backup (KVA)</Label>
              <Input
                type="number"
                placeholder="Enter power backup capacity"
                value={data.infrastructure?.powerBackup || ''}
                onChange={(e) => handleChange('powerBackup', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Additional Facilities</Label>
            <Textarea
              placeholder="Mention any additional facilities like sports complex, medical facility, etc."
              value={data.infrastructure?.additionalFacilities || ''}
              onChange={(e) => handleChange('additionalFacilities', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
