
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Save, X, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClinicVisitFormProps {
  visit?: any;
  onClose: () => void;
  onSave: () => void;
  userProfile: any;
}

const ClinicVisitForm = ({ visit, onClose, onSave, userProfile }: ClinicVisitFormProps) => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    student_id: visit?.student_id || '',
    visit_type: visit?.visit_type || 'routine',
    symptoms: visit?.symptoms || '',
    diagnosis: visit?.diagnosis || '',
    treatment_given: visit?.treatment_given || '',
    notes: visit?.notes || '',
    temperature: visit?.temperature || '',
    pulse_rate: visit?.pulse_rate || '',
    blood_pressure: visit?.blood_pressure || '',
    weight: visit?.weight || '',
    height: visit?.height || '',
    follow_up_required: visit?.follow_up_required || false,
    follow_up_date: visit?.follow_up_date || '',
    attended_by: visit?.attended_by || userProfile?.id
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, full_name, student_id, form_level, stream')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast.error('Error loading students');
    }
  };

  const filteredStudents = students.filter((student: any) =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const visitData = {
        ...formData,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        pulse_rate: formData.pulse_rate ? parseInt(formData.pulse_rate) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        follow_up_date: formData.follow_up_date || null,
        visit_date: visit?.visit_date || new Date().toISOString()
      };

      if (visit?.id) {
        const { error } = await supabase
          .from('clinic_visits')
          .update(visitData)
          .eq('id', visit.id);

        if (error) throw error;
        toast.success('Clinic visit updated successfully');
      } else {
        const { error } = await supabase
          .from('clinic_visits')
          .insert(visitData);

        if (error) throw error;
        toast.success('Clinic visit recorded successfully');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving clinic visit:', error);
      toast.error(`Error saving visit: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{visit ? 'Edit Clinic Visit' : 'New Clinic Visit'}</CardTitle>
              <CardDescription>
                {visit ? 'Update visit information' : 'Record new student clinic visit'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Selection */}
            <div>
              <Label htmlFor="student_search">Select Student *</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search for student..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={formData.student_id} onValueChange={(value) => setFormData({...formData, student_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents.map((student: any) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} - {student.student_id} ({student.form_level?.replace('_', ' ')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Visit Type */}
            <div>
              <Label htmlFor="visit_type">Visit Type</Label>
              <Select value={formData.visit_type} onValueChange={(value) => setFormData({...formData, visit_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine Check-up</SelectItem>
                  <SelectItem value="sick">Sick Visit</SelectItem>
                  <SelectItem value="injury">Injury</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vital Signs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vital Signs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                    placeholder="36.5"
                  />
                </div>
                <div>
                  <Label htmlFor="pulse_rate">Pulse Rate (bpm)</Label>
                  <Input
                    id="pulse_rate"
                    type="number"
                    value={formData.pulse_rate}
                    onChange={(e) => setFormData({...formData, pulse_rate: e.target.value})}
                    placeholder="70"
                  />
                </div>
                <div>
                  <Label htmlFor="blood_pressure">Blood Pressure</Label>
                  <Input
                    id="blood_pressure"
                    value={formData.blood_pressure}
                    onChange={(e) => setFormData({...formData, blood_pressure: e.target.value})}
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="50.0"
                  />
                </div>
              </div>
            </div>

            {/* Symptoms and Assessment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Assessment</h3>
              <div>
                <Label htmlFor="symptoms">Symptoms/Complaints</Label>
                <Textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  placeholder="Describe the student's symptoms or complaints..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="diagnosis">Diagnosis/Assessment</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                  placeholder="Clinical assessment or diagnosis..."
                  rows={3}
                />
              </div>
            </div>

            {/* Treatment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Treatment & Care</h3>
              <div>
                <Label htmlFor="treatment_given">Treatment Given</Label>
                <Textarea
                  id="treatment_given"
                  value={formData.treatment_given}
                  onChange={(e) => setFormData({...formData, treatment_given: e.target.value})}
                  placeholder="Describe treatment, medications given, or care provided..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional observations or notes..."
                  rows={2}
                />
              </div>
            </div>

            {/* Follow-up */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Follow-up Care</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="follow_up_required"
                  checked={formData.follow_up_required}
                  onCheckedChange={(checked) => setFormData({...formData, follow_up_required: checked})}
                />
                <Label htmlFor="follow_up_required">Follow-up required</Label>
              </div>
              {formData.follow_up_required && (
                <div>
                  <Label htmlFor="follow_up_date">Follow-up Date</Label>
                  <Input
                    id="follow_up_date"
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({...formData, follow_up_date: e.target.value})}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.student_id}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Visit'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicVisitForm;
