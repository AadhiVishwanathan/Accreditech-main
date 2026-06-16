import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarIcon, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Building, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star,
  FileText,
  Camera,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  LogOut,
  AlertTriangle,
  UserCheck,
  Calendar as CalendarLucide
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeEVCData } from '@/hooks/useRealtimeEVCData';

const EVCDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    sessionData, 
    assignment, 
    evaluation, 
    teamMembers,
    infrastructurePhotos,
    loading, 
    error, 
    logout, 
    refreshData,
    submitEvaluation,
    isAuthenticated 
  } = useRealtimeEVCData();

  // Form states for evaluation
  const [remarks, setRemarks] = useState(evaluation?.remarks || '');
  const [pros, setPros] = useState<string[]>(evaluation?.pros || []);
  const [cons, setCons] = useState<string[]>(evaluation?.cons || []);
  const [infrastructureRating, setInfrastructureRating] = useState(evaluation?.infrastructure_rating || 0);
  const [facultyRating, setFacultyRating] = useState(evaluation?.faculty_rating || 0);
  const [overallRating, setOverallRating] = useState(evaluation?.overall_rating || 0);
  const [isApproved, setIsApproved] = useState(evaluation?.is_approved || false);
  const [requiresRescheduling, setRequiresRescheduling] = useState(evaluation?.requires_rescheduling || false);
  const [rescheduleReason, setRescheduleReason] = useState(evaluation?.reschedule_reason || '');
  const [newVisitDate, setNewVisitDate] = useState<Date | undefined>(
    evaluation?.new_proposed_date ? new Date(evaluation.new_proposed_date) : undefined
  );
  const [submitting, setSubmitting] = useState(false);

  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">Please log in as an EVC Chairman to access this dashboard.</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading evaluation dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error || 'No assignment found'}</p>
            <div className="flex gap-2">
              <Button onClick={refreshData} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button onClick={logout} variant="destructive" className="flex-1">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const addPro = () => {
    if (newPro.trim() && !pros.includes(newPro.trim())) {
      setPros([...pros, newPro.trim()]);
      setNewPro('');
    }
  };

  const removePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const addCon = () => {
    if (newCon.trim() && !cons.includes(newCon.trim())) {
      setCons([...cons, newCon.trim()]);
      setNewCon('');
    }
  };

  const removeCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleSubmitEvaluation = async () => {
    if (!remarks.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide remarks for the evaluation",
        variant: "destructive"
      });
      return;
    }

    if (infrastructureRating === 0 || facultyRating === 0 || overallRating === 0) {
      toast({
        title: "Validation Error", 
        description: "Please provide all ratings",
        variant: "destructive"
      });
      return;
    }

    if (requiresRescheduling && !rescheduleReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for rescheduling",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitEvaluation({
        remarks: remarks.trim(),
        pros,
        cons,
        infrastructure_rating: infrastructureRating,
        faculty_rating: facultyRating,
        overall_rating: overallRating,
        is_approved: isApproved,
        requires_rescheduling: requiresRescheduling,
        reschedule_reason: rescheduleReason.trim(),
        new_proposed_date: newVisitDate?.toISOString() || null
      });

      if (result?.success) {
        toast({
          title: "Success",
          description: "Evaluation submitted successfully",
        });
      } else {
        throw new Error(result?.error || 'Failed to submit evaluation');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      toast({
        title: "Error",
        description: "Failed to submit evaluation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = (rating: number, onRatingChange: (rating: number) => void, label: string) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`p-1 rounded transition-colors ${
              star <= rating 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {rating === 0 ? 'No rating' : `${rating}/5 stars`}
      </p>
    </div>
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'assigned': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'in_progress': { color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw },
      'completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'rescheduled': { color: 'bg-orange-100 text-orange-800', icon: CalendarLucide }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.assigned;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">EVC Evaluation Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome, {sessionData?.member_name} ({sessionData?.position})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={refreshData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={logout} variant="destructive" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Assignment Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Assignment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Application Number</Label>
                  <p className="font-mono text-lg">{assignment.application.application_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Programme</Label>
                  <p className="font-medium">{assignment.application.programme_name}</p>
                  <p className="text-sm text-muted-foreground">{assignment.application.programme_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Visit Date</Label>
                  <p className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {assignment.visit_date ? format(new Date(assignment.visit_date), 'PPP') : 'Not scheduled'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(assignment.status)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Institute Name</Label>
                  <p className="font-medium">{assignment.application.institute.institute_name}</p>
                  <p className="text-sm text-muted-foreground">{assignment.application.institute.institute_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      {assignment.application.institute.address}, {assignment.application.institute.city}, {assignment.application.institute.state} - {assignment.application.institute.pincode}
                    </span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {assignment.application.institute.phone}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {assignment.application.institute.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Institute Leadership */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Institute Leadership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Director</Label>
                  <p className="font-medium">{assignment.application.institute.director_name}</p>
                  <div className="space-y-1 mt-2">
                    <p className="text-sm flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {assignment.application.institute.director_email}
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {assignment.application.institute.director_phone}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nodal Officer</Label>
                  <p className="font-medium">{assignment.application.institute.nodal_officer_name}</p>
                  <div className="space-y-1 mt-2">
                    <p className="text-sm flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {assignment.application.institute.nodal_officer_email}
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {assignment.application.institute.nodal_officer_phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EVC Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              EVC Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.name}</p>
                      <Badge variant={member.assignment_type === 'chairman' ? 'default' : 'secondary'}>
                        {member.assignment_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{member.position}</p>
                    <p className="text-sm text-muted-foreground">{member.specialization}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{member.experience_years} years</p>
                    <p className="text-xs text-muted-foreground">Experience</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure Photos */}
        {infrastructurePhotos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Infrastructure Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {infrastructurePhotos.map((photo) => (
                  <div key={photo.id} className="border rounded-lg overflow-hidden">
                    <img 
                      src={photo.image_url} 
                      alt={photo.facility_type}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3 space-y-2">
                      <h4 className="font-medium">{photo.facility_type}</h4>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Compliance: {photo.compliance_score}%
                        </span>
                        <Badge 
                          variant={photo.compliance_status === 'compliant' ? 'default' : 'destructive'}
                        >
                          {photo.compliance_status}
                        </Badge>
                      </div>
                      {photo.calculated_area > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Area: {photo.calculated_area} sq ft
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Evaluation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Expert Evaluation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ratings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="ratings">Ratings</TabsTrigger>
                <TabsTrigger value="pros-cons">Pros & Cons</TabsTrigger>
                <TabsTrigger value="remarks">Remarks</TabsTrigger>
                <TabsTrigger value="decision">Decision</TabsTrigger>
              </TabsList>

              <TabsContent value="ratings" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {renderStarRating(infrastructureRating, setInfrastructureRating, "Infrastructure Rating")}
                  {renderStarRating(facultyRating, setFacultyRating, "Faculty Rating")}
                  {renderStarRating(overallRating, setOverallRating, "Overall Rating")}
                </div>
              </TabsContent>

              <TabsContent value="pros-cons" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <Label className="font-medium">Strengths/Pros</Label>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newPro}
                        onChange={(e) => setNewPro(e.target.value)}
                        placeholder="Add a positive point..."
                        onKeyPress={(e) => e.key === 'Enter' && addPro()}
                      />
                      <Button onClick={addPro} size="sm">Add</Button>
                    </div>
                    <div className="space-y-2">
                      {pros.map((pro, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm">{pro}</span>
                          <Button
                            onClick={() => removePro(index)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <Label className="font-medium">Weaknesses/Cons</Label>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newCon}
                        onChange={(e) => setNewCon(e.target.value)}
                        placeholder="Add an area for improvement..."
                        onKeyPress={(e) => e.key === 'Enter' && addCon()}
                      />
                      <Button onClick={addCon} size="sm">Add</Button>
                    </div>
                    <div className="space-y-2">
                      {cons.map((con, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <span className="text-sm">{con}</span>
                          <Button
                            onClick={() => removeCon(index)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="remarks" className="space-y-4">
                <div>
                  <Label htmlFor="remarks">Detailed Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Provide detailed evaluation remarks..."
                    className="min-h-[200px] mt-2"
                  />
                </div>
              </TabsContent>

              <TabsContent value="decision" className="space-y-6">
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="approve"
                        name="decision"
                        checked={isApproved && !requiresRescheduling}
                        onChange={() => {
                          setIsApproved(true);
                          setRequiresRescheduling(false);
                        }}
                      />
                      <Label htmlFor="approve" className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Approve Application
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="reject"
                        name="decision"
                        checked={!isApproved && !requiresRescheduling}
                        onChange={() => {
                          setIsApproved(false);
                          setRequiresRescheduling(false);
                        }}
                      />
                      <Label htmlFor="reject" className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Reject Application
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="reschedule"
                        name="decision"
                        checked={requiresRescheduling}
                        onChange={() => {
                          setRequiresRescheduling(true);
                          setIsApproved(false);
                        }}
                      />
                      <Label htmlFor="reschedule" className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-yellow-600" />
                        Reschedule Visit
                      </Label>
                    </div>
                  </div>

                  {requiresRescheduling && (
                    <div className="space-y-4 p-4 border rounded-lg bg-yellow-50">
                      <div>
                        <Label htmlFor="reschedule-reason">Reason for Rescheduling</Label>
                        <Textarea
                          id="reschedule-reason"
                          value={rescheduleReason}
                          onChange={(e) => setRescheduleReason(e.target.value)}
                          placeholder="Please provide the reason for rescheduling..."
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Proposed New Visit Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal mt-2">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newVisitDate ? format(newVisitDate, "PPP") : "Select new date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newVisitDate}
                              onSelect={setNewVisitDate}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            <div className="flex justify-end gap-4">
              <Button
                onClick={handleSubmitEvaluation}
                disabled={submitting}
                className="px-8"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Evaluation'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Evaluation Status */}
        {evaluation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Current Evaluation Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <p className="font-medium capitalize">{evaluation.evaluation_status?.replace('_', ' ') || 'Unknown'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                    <p>{format(new Date(evaluation.updated_at), 'PPP pp')}</p>
                  </div>
                </div>
                
                {evaluation.is_approved && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Application Approved</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      The accreditation process has been completed successfully.
                    </p>
                  </div>
                )}

                {evaluation.requires_rescheduling && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Visit Rescheduled</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Reason: {evaluation.reschedule_reason}
                    </p>
                    {evaluation.new_proposed_date && (
                      <p className="text-sm text-yellow-700">
                        New proposed date: {format(new Date(evaluation.new_proposed_date), 'PPP')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EVCDashboard;