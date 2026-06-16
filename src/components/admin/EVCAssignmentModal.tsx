import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Users, UserCheck, Clock, Star } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EVCMember {
  id: string;
  name: string;
  position: string;
  specialization: string;
  experience_years: number;
  is_active: boolean;
  is_available: boolean;
  current_assignments: number;
  max_assignments: number;
}

interface EVCAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  instituteName: string;
}

const EVCAssignmentModal: React.FC<EVCAssignmentModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  instituteName
}) => {
  const { toast } = useToast();
  const [members, setMembers] = useState<EVCMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [chairman, setChairman] = useState<string>('');
  const [visitDate, setVisitDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [existingTeam, setExistingTeam] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchEVCMembers();
      checkExistingTeam();
    }
  }, [isOpen]);

  const fetchEVCMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('evc_members')
        .select('*')
        .eq('is_active', true)
        .order('specialization', { ascending: true });

      if (error) throw error;

      setMembers(data || []);
      
      // Get unique specializations
      const uniqueSpecs = [...new Set(data?.map(m => m.specialization) || [])];
      setSpecializations(uniqueSpecs);
      
      // Set first specialization as active tab
      if (uniqueSpecs.length > 0 && !activeTab) {
        setActiveTab(uniqueSpecs[0]);
      }
    } catch (error) {
      console.error('Error fetching EVC members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch EVC members",
        variant: "destructive"
      });
    }
  };

  const checkExistingTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('evc_teams')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setExistingTeam(data);
        toast({
          title: "EVC Team Already Assigned",
          description: "This application already has an assigned EVC team. You can view the details below.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking existing team:', error);
    }
  };

  const getMembersBySpecialization = (specialization: string) => {
    return members.filter(m => m.specialization === specialization);
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const assignEVC = async () => {
    // Check if EVC team already exists
    if (existingTeam) {
      toast({
        title: "EVC Already Assigned",
        description: "This application already has an assigned EVC team.",
        variant: "destructive"
      });
      return;
    }

    if (selectedMembers.length < 4) {
      toast({
        title: "Invalid Selection",
        description: "Please select at least 4 members for the EVC team",
        variant: "destructive"
      });
      return;
    }

    if (!chairman) {
      toast({
        title: "Invalid Selection",
        description: "Please select a chairman for the EVC team",
        variant: "destructive"
      });
      return;
    }

    if (!visitDate) {
      toast({
        title: "Invalid Date",
        description: "Please select a visit date",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Double-check if team exists before creating
      const { data: existingCheck } = await supabase
        .from('evc_teams')
        .select('id')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (existingCheck) {
        toast({
          title: "EVC Already Assigned",
          description: "This application already has an assigned EVC team.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create EVC team
      const { data: teamData, error: teamError } = await supabase
        .from('evc_teams')
        .insert({
          application_id: applicationId,
          team_name: `EVC Team - ${instituteName}`,
          chairman_id: chairman,
          total_members: selectedMembers.length,
          visit_scheduled_date: visitDate.toISOString(),
          status: 'complete'
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      
      const assignments = selectedMembers.map(memberId => ({
        application_id: applicationId,
        evc_member_id: memberId,
        assignment_type: memberId === chairman ? 'chairman' : 'member',
        assigned_by: userData.user?.id || '',
        visit_date: visitDate.toISOString()
      }));

      const { error: assignmentError } = await supabase
        .from('evc_assignments')
        .insert(assignments);

      if (assignmentError) throw assignmentError;

      // Update member assignment counts
      for (const memberId of selectedMembers) {
        await supabase
          .from('evc_members')
          .update({ 
            current_assignments: members.find(m => m.id === memberId)?.current_assignments + 1 || 1 
          })
          .eq('id', memberId);
      }

      // Update application status
      await supabase
        .from('applications')
        .update({ 
          status: 'expert_visit_scheduled',
          next_step: `Expert visit scheduled for ${format(visitDate, 'PPP')}`
        })
        .eq('id', applicationId);

      // Create detailed notification for institute with EVC team information
      const selectedMemberDetails = members.filter(m => selectedMembers.includes(m.id));
      const chairmanInfo = members.find(m => m.id === chairman);
      
      let notificationMessage = `Your application has been assigned to an Expert Visit Committee.`;

      // Get application number for username generation  
      const { data: appData } = await supabase
        .from('applications')
        .select('application_number')
        .eq('id', applicationId)
        .single();

      // Create EVC chairman login credentials using email format
      if (chairmanInfo) {
        const cleanName = chairmanInfo.name.toLowerCase()
          .replace(/dr\.|prof\.|mr\.|ms\./g, '')
          .replace(/[^a-z]/g, '')
          .trim();
        const username = `${cleanName}@aicte.gov.in`;
        const password = 'adminevc123';
        
        // Hash password (simple approach for demo)
        const passwordHash = btoa(password);
        
        const { error: credError } = await supabase
          .from('evc_chairman_credentials')
          .insert({
            evc_member_id: chairman,
            application_id: applicationId,
            username: username,
            password_hash: passwordHash
          });

        if (credError) {
          console.error('Error creating EVC chairman credentials:', credError);
        } else {
          console.log(`EVC Chairman credentials created - Username: ${username}, Password: ${password}`);
          
          // Show credentials to admin
          toast({
            title: "EVC Credentials Generated",
            description: `Username: ${username}\nPassword: ${password}\n\nShare these credentials with EVC Chairman: ${chairmanInfo.name}`,
            duration: 10000
          });
          
          // Add credentials to notification message
          notificationMessage += `\n\nEVC Chairman Login Credentials:\nUsername: ${username}\nPassword: ${password}\n\nPlease share these credentials with the EVC Chairman (${chairmanInfo.name}) for evaluation dashboard access.`;
        }
      }
      
      const membersList = selectedMemberDetails.map(member => 
        `• ${member.name} (${member.specialization}) - ${member.experience_years} years experience`
      ).join('\n');
      
      const finalNotificationMessage = `An Expert Visit Committee has been assigned to your application for expert visit scheduled on ${format(visitDate, 'PPP')}.

EVC Team Details:
Chairman: ${chairmanInfo?.name} (${chairmanInfo?.specialization})

Team Members:
${membersList}

Please prepare for the expert visit according to AICTE guidelines. The committee will evaluate your infrastructure, faculty, and compliance with accreditation standards.

${notificationMessage.includes('EVC Chairman Login Credentials') ? notificationMessage.split('\n\n').slice(1).join('\n\n') : ''}`;

      // Get the institute's user_id for notification
      const { data: applicationData, error: appError } = await supabase
        .from('applications')
        .select(`
          id,
          institute_id,
          institutes!inner (
            user_id,
            institute_name
          )
        `)
        .eq('id', applicationId)
        .single();

      if (appError) {
        console.error('Error fetching application data:', appError);
      } else if (applicationData?.institutes?.user_id) {
        console.log('Creating notification for user:', applicationData.institutes.user_id);
        
        const { data: notificationData, error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: applicationData.institutes.user_id,
            title: 'Expert Visit Committee Assigned',
            message: finalNotificationMessage,
            type: 'info',
            application_id: applicationId
          })
          .select();

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        } else {
          console.log('Notification created successfully:', notificationData);
        }
      } else {
        console.error('Could not find institute user_id for notification');
      }

      toast({
        title: "Success",
        description: "EVC team assigned successfully and expert visit scheduled",
      });

      onClose();
    } catch (error) {
      console.error('Error assigning EVC:', error);
      toast({
        title: "Error",
        description: "Failed to assign EVC team",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (member: EVCMember) => {
    const workloadPercentage = (member.current_assignments / member.max_assignments) * 100;
    if (workloadPercentage >= 100) return 'bg-red-500';
    if (workloadPercentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Expert Visit Committee - {instituteName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Show existing team warning if applicable */}
          {existingTeam && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">EVC Team Already Assigned</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  This application already has an assigned EVC team: {existingTeam.team_name}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Visit scheduled: {existingTeam.visit_scheduled_date ? new Date(existingTeam.visit_scheduled_date).toLocaleDateString() : 'Not scheduled'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Chairman Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCheck className="h-4 w-4" />
                Select Chairman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={chairman} onValueChange={setChairman} disabled={!!existingTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a chairman" />
                </SelectTrigger>
                <SelectContent>
                  {members
                    .filter(m => m.position === 'Chairman' || m.position === 'AICTE Expert')
                    .map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.specialization} ({member.experience_years} years)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Visit Date Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Schedule Visit Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={!!existingTeam}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {visitDate ? format(visitDate, "PPP") : "Select visit date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={visitDate}
                    onSelect={setVisitDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* Member Selection by Specialization */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select EVC Members (Minimum 4 members required)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Selected: {selectedMembers.length} members
              </p>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-4">
                  {specializations.slice(0, 8).map(spec => (
                    <TabsTrigger key={spec} value={spec} className="text-xs px-2">
                      {spec.length > 10 ? spec.substring(0, 8) + '...' : spec}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {specializations.map(specialization => (
                  <TabsContent key={specialization} value={specialization} className="mt-4">
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        {specialization} Experts ({getMembersBySpecialization(specialization).length} available)
                      </h4>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
                      {getMembersBySpecialization(specialization).map(member => (
                        <Card
                          key={member.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedMembers.includes(member.id)
                              ? 'ring-2 ring-primary bg-primary/5 shadow-md'
                              : 'hover:bg-muted/50'
                          } ${existingTeam ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => !existingTeam && toggleMemberSelection(member.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 min-w-0 flex-1">
                                <h4 className="font-medium text-sm truncate">{member.name}</h4>
                                <Badge variant="secondary" className="text-xs">{member.position}</Badge>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span className="text-xs text-muted-foreground">
                                    {member.experience_years}y exp
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(member)}`} />
                                  <span className="text-xs text-muted-foreground">
                                    {member.current_assignments}/{member.max_assignments}
                                  </span>
                                </div>
                              </div>
                              {selectedMembers.includes(member.id) && (
                                <UserCheck className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {getMembersBySpecialization(specialization).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No experts available in this specialization
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {existingTeam ? 'Close' : 'Cancel'}
            </Button>
            {!existingTeam && (
              <Button 
                onClick={assignEVC} 
                disabled={loading || selectedMembers.length < 4 || !chairman || !visitDate}
              >
                {loading ? 'Assigning...' : 'Assign EVC Team'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EVCAssignmentModal;