import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Mail, Phone, MapPin, User, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegisterModal({ open, onOpenChange }: RegisterModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Basic Info
    instituteName: '',
    instituteType: '',
    establishedYear: '',
    affiliatedUniversity: '',
    
    // Contact Info
    address: '',
    city: '',
    state: '',
    pincode: '',
    website: '',
    phone: '',
    
    // Admin Contact
    principalName: '',
    principalEmail: '',
    principalPhone: '',
    
    // Account Info
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords don't match!",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            institute_name: formData.instituteName,
            user_type: formData.email.endsWith('@aicte.gov.in') ? 'admin' : 'institute'
          }
        }
      });

      if (authError) {
        toast({
          title: "Registration Failed",
          description: authError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (authData.user && !authData.session) {
        // User created but needs email verification
        toast({
          title: "Registration Successful",
          description: "Please check your email to verify your account, then you can login.",
        });
        onOpenChange(false);
        setCurrentStep(1);
        
        // Reset form
        setFormData({
          instituteName: '',
          instituteType: '',
          establishedYear: '',
          affiliatedUniversity: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          website: '',
          phone: '',
          principalName: '',
          principalEmail: '',
          principalPhone: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setIsLoading(false);
        return;
      }

      if (authData.user && authData.session) {
        // User is authenticated, save institute data
        const { error: instituteError } = await supabase
          .from('institutes')
          .insert({
            user_id: authData.user.id,
            institute_name: formData.instituteName,
            institute_type: formData.instituteType,
            establishment_year: formData.establishedYear ? parseInt(formData.establishedYear) : null,
            university_name: formData.affiliatedUniversity || null,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            phone: formData.phone,
            email: formData.email,
            website: formData.website || null,
            director_name: formData.principalName,
            director_phone: formData.principalPhone,
            director_email: formData.principalEmail,
            nodal_officer_name: formData.principalName, // Using same as director for now
            nodal_officer_phone: formData.principalPhone,
            nodal_officer_email: formData.principalEmail
          });

        if (instituteError) {
          toast({
            title: "Registration Failed",
            description: "Failed to save institute data: " + instituteError.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        toast({
          title: "Registration Successful",
          description: "Institute registered successfully! You can now access the dashboard.",
        });
        onOpenChange(false);
        setCurrentStep(1);
        
        // Reset form
        setFormData({
          instituteName: '',
          instituteType: '',
          establishedYear: '',
          affiliatedUniversity: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          website: '',
          phone: '',
          principalName: '',
          principalEmail: '',
          principalPhone: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="instituteName">Institute Name *</Label>
          <Input
            id="instituteName"
            name="instituteName"
            placeholder="Enter institute name"
            value={formData.instituteName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instituteType">Institute Type *</Label>
          <Select 
            value={formData.instituteType} 
            onValueChange={(value) => handleSelectChange('instituteType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="university">University</SelectItem>
              <SelectItem value="deemed-university">Deemed University</SelectItem>
              <SelectItem value="autonomous-college">Autonomous College</SelectItem>
              <SelectItem value="affiliated-college">Affiliated College</SelectItem>
              <SelectItem value="technical-institute">Technical Institute</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="establishedYear">Established Year *</Label>
          <Input
            id="establishedYear"
            name="establishedYear"
            type="number"
            placeholder="YYYY"
            value={formData.establishedYear}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="affiliatedUniversity">Affiliated University</Label>
          <Input
            id="affiliatedUniversity"
            name="affiliatedUniversity"
            placeholder="If applicable"
            value={formData.affiliatedUniversity}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Official Website</Label>
        <Input
          id="website"
          name="website"
          type="url"
          placeholder="https://www.institute.edu"
          value={formData.website}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Complete Address *</Label>
        <Textarea
          id="address"
          name="address"
          placeholder="Enter complete address"
          value={formData.address}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            name="pincode"
            placeholder="000000"
            value={formData.pincode}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Institute Phone *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              name="phone"
              placeholder="+91 XXXXXXXXXX"
              value={formData.phone}
              onChange={handleInputChange}
              className="pl-10"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="principalName">Principal Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="principalName"
              name="principalName"
              placeholder="Dr. Principal Name"
              value={formData.principalName}
              onChange={handleInputChange}
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="principalEmail">Principal Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="principalEmail"
              name="principalEmail"
              type="email"
              placeholder="principal@institute.edu"
              value={formData.principalEmail}
              onChange={handleInputChange}
              className="pl-10"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="principalPhone">Principal Phone *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="principalPhone"
              name="principalPhone"
              placeholder="+91 XXXXXXXXXX"
              value={formData.principalPhone}
              onChange={handleInputChange}
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Login Email *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@institute.edu"
            value={formData.email}
            onChange={handleInputChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleInputChange}
            className="pl-10 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="pl-10 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          By registering, you agree to AICTE's terms and conditions and privacy policy.
          All information provided will be verified during the approval process.
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            New Institute Registration
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress Indicator */}
        <div className="flex items-center space-x-2 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-0.5 ${
                  step < currentStep ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <CardDescription>
              {currentStep === 1 && "Basic institute information"}
              {currentStep === 2 && "Contact details and administration"}
              {currentStep === 3 && "Account setup and credentials"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  Back
                </Button>
                
                {currentStep < 3 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="bg-gradient-primary hover:shadow-glow"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registering..." : "Complete Registration"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}