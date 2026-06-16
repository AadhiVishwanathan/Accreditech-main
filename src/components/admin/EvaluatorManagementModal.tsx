import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Evaluator {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  expertise: string[];
  experience_years?: number;
  workload: number;
  max_workload: number;
  is_active: boolean;
}

interface EvaluatorManagementModalProps {
  trigger: React.ReactNode;
}

const EvaluatorManagementModal: React.FC<EvaluatorManagementModalProps> = ({ trigger }) => {
  const { toast } = useToast();
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvaluator, setNewEvaluator] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    expertise: '',
    experience_years: '',
    max_workload: '10'
  });

  const fetchEvaluators = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('evaluators')
        .select('*')
        .order('name');

      if (error) throw error;
      setEvaluators(data || []);
    } catch (error) {
      console.error('Error fetching evaluators:', error);
      toast({
        title: "Error",
        description: "Failed to fetch evaluators",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvaluator = async () => {
    try {
      const expertiseArray = newEvaluator.expertise.split(',').map(e => e.trim()).filter(e => e);
      
      const { data, error } = await supabase
        .from('evaluators')
        .insert({
          name: newEvaluator.name,
          email: newEvaluator.email,
          phone: newEvaluator.phone || null,
          location: newEvaluator.location || null,
          expertise: expertiseArray,
          experience_years: newEvaluator.experience_years ? parseInt(newEvaluator.experience_years) : null,
          max_workload: parseInt(newEvaluator.max_workload),
          workload: 0,
          is_active: true,
          user_id: '00000000-0000-0000-0000-000000000000' // Temporary user_id for manual entries
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Evaluator added successfully"
      });

      setNewEvaluator({
        name: '',
        email: '',
        phone: '',
        location: '',
        expertise: '',
        experience_years: '',
        max_workload: '10'
      });
      setShowAddForm(false);
      fetchEvaluators();
    } catch (error) {
      console.error('Error adding evaluator:', error);
      toast({
        title: "Error",
        description: "Failed to add evaluator",
        variant: "destructive"
      });
    }
  };

  const toggleEvaluatorStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('evaluators')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Evaluator ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });

      fetchEvaluators();
    } catch (error) {
      console.error('Error updating evaluator status:', error);
      toast({
        title: "Error",
        description: "Failed to update evaluator status",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchEvaluators();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Evaluator Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Evaluator Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Add New Evaluator</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showAddForm ? 'Cancel' : 'Add Manually'}
                </Button>
              </CardTitle>
            </CardHeader>
            {showAddForm && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newEvaluator.name}
                      onChange={(e) => setNewEvaluator(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEvaluator.email}
                      onChange={(e) => setNewEvaluator(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john.doe@aicte.gov.in"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newEvaluator.phone}
                      onChange={(e) => setNewEvaluator(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newEvaluator.location}
                      onChange={(e) => setNewEvaluator(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Delhi, India"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience (Years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={newEvaluator.experience_years}
                      onChange={(e) => setNewEvaluator(prev => ({ ...prev, experience_years: e.target.value }))}
                      placeholder="15"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxWorkload">Max Workload</Label>
                    <Input
                      id="maxWorkload"
                      type="number"
                      value={newEvaluator.max_workload}
                      onChange={(e) => setNewEvaluator(prev => ({ ...prev, max_workload: e.target.value }))}
                      placeholder="10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="expertise">Expertise (comma-separated) *</Label>
                  <Textarea
                    id="expertise"
                    value={newEvaluator.expertise}
                    onChange={(e) => setNewEvaluator(prev => ({ ...prev, expertise: e.target.value }))}
                    placeholder="Computer Science, Engineering, Artificial Intelligence, Machine Learning"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleAddEvaluator}
                  disabled={!newEvaluator.name || !newEvaluator.email || !newEvaluator.expertise}
                >
                  Add Evaluator
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Evaluators Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Evaluators ({evaluators.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : evaluators.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No evaluators found. Add some evaluators to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Expertise</TableHead>
                        <TableHead>Workload</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evaluators.map((evaluator) => (
                        <TableRow key={evaluator.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{evaluator.name}</div>
                              {evaluator.experience_years && (
                                <div className="text-sm text-muted-foreground">
                                  {evaluator.experience_years} years exp.
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                {evaluator.email}
                              </div>
                              {evaluator.phone && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {evaluator.phone}
                                </div>
                              )}
                              {evaluator.location && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {evaluator.location}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {evaluator.expertise.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {evaluator.expertise.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{evaluator.expertise.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {evaluator.workload}/{evaluator.max_workload}
                              <div className="w-full bg-muted rounded-full h-2 mt-1">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{
                                    width: `${Math.min((evaluator.workload / evaluator.max_workload) * 100, 100)}%`
                                  }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={evaluator.is_active ? "default" : "secondary"}>
                              {evaluator.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleEvaluatorStatus(evaluator.id, evaluator.is_active)}
                            >
                              {evaluator.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvaluatorManagementModal;