import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InstitutionDetailsProps {
  data: any;
  updateData: (section: string, data: any) => void;
}

export function InstitutionDetails({ data, updateData }: InstitutionDetailsProps) {
  const handleChange = (field: string, value: string) => {
    updateData('institution', { [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="institutionName">Institution Name *</Label>
          <Input
            id="institutionName"
            placeholder="Enter institution name"
            value={data.institution?.institutionName || ''}
            onChange={(e) => handleChange('institutionName', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="institutionType">Institution Type *</Label>
          <Select 
            value={data.institution?.institutionType || ''} 
            onValueChange={(value) => handleChange('institutionType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select institution type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="deemed">Deemed University</SelectItem>
              <SelectItem value="autonomous">Autonomous</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="establishedYear">Year Established *</Label>
          <Input
            id="establishedYear"
            type="number"
            placeholder="Enter year"
            value={data.institution?.establishedYear || ''}
            onChange={(e) => handleChange('establishedYear', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="affiliatedUniversity">Affiliated University</Label>
          <Input
            id="affiliatedUniversity"
            placeholder="Enter university name"
            value={data.institution?.affiliatedUniversity || ''}
            onChange={(e) => handleChange('affiliatedUniversity', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="principalName">Principal Name *</Label>
          <Input
            id="principalName"
            placeholder="Enter principal name"
            value={data.institution?.principalName || ''}
            onChange={(e) => handleChange('principalName', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactNumber">Contact Number *</Label>
          <Input
            id="contactNumber"
            placeholder="Enter contact number"
            value={data.institution?.contactNumber || ''}
            onChange={(e) => handleChange('contactNumber', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={data.institution?.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website URL</Label>
          <Input
            id="website"
            placeholder="Enter website URL"
            value={data.institution?.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Complete Address *</Label>
        <Textarea
          id="address"
          placeholder="Enter complete address"
          value={data.institution?.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Select 
            value={data.institution?.state || ''} 
            onValueChange={(value) => handleChange('state', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="andhra-pradesh">Andhra Pradesh</SelectItem>
              <SelectItem value="karnataka">Karnataka</SelectItem>
              <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
              <SelectItem value="telangana">Telangana</SelectItem>
              <SelectItem value="maharashtra">Maharashtra</SelectItem>
              {/* Add more states as needed */}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">District *</Label>
          <Input
            id="district"
            placeholder="Enter district"
            value={data.institution?.district || ''}
            onChange={(e) => handleChange('district', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pincode">PIN Code *</Label>
          <Input
            id="pincode"
            placeholder="Enter PIN code"
            value={data.institution?.pincode || ''}
            onChange={(e) => handleChange('pincode', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}