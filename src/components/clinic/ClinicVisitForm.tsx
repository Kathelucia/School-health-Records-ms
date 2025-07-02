
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, User, Plus } from 'lucide-react';
import StudentSelector from '@/components/students/StudentSelector';

interface ClinicVisitFormProps {
  visit?: any;
  onClose: () => void;
  onSave: () => void;
  userProfile: any;
}

const ClinicVisitForm = ({ visit, onClose, onSave, userProfile }: ClinicVisitFormProps) => {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    visit_type: 'routine',
    symptoms: '',
    diagnosis: '',
    treatment_given: '',
    temperature: '',
    pulse_rate: '',
    blood_pressure: '',
    weight: '',
    height: '',
    follow_up_required: false,
    follow_up_date: '',
    notes: '',
    visit_date: new Date().toISOString().slice(0, 16)
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visit) {
      setFormData({
        student_id: visit.student_id || '',
        visit_type: visit.visit_type || 'routine',
        symptoms: visit.symptoms || '',
        diagnosis: visit.diagnosis || '',
        treatment_given: visit.treatment_given || '',
        temperature: visit.temperature?.toString() || '',
        pulse_rate: visit.pulse_rate?.toString() || '',
        blood_pressure: visit.blood_pressure || '',
        weight: visit.weight?.toString() || '',
        height: visit.height?.toString() || '',
        follow_up_required: visit.follow_up_required || false,
        follow_up_date: visit.follow_up_date || '',
        notes: visit.notes || '',
        visit_date: visit.visit_date ? new Date(visit.visit_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
      });

      // Fetch student info if editing
      if (visit.student_id) {
        fetchStudentInfo(visit.student_id);
      }
    }
  }, [visit]);

  const fetchStudentInfo = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, full_name, student_id, admission_number, form_level, stream')
        .eq('id', studentId)
        .single();

      if (!error && data) {
        setSelectedStudent(data);
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    }
  };

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setFormData({ ...formData, student_id: student.id });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id) {
      toast.error('Please select a student');
      return;
    }

    setSaving(true);

    try {
      const visitData = {
        ...formData,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        pulse_rate: formData.pulse_rate ? parseInt(formData.pulse_rate) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        attended_by: userProfile?.id,
        visit_date: new Date(formData.visit_date).toISOString()
      };

      if (visit) {
        const { error } = await supabase
          .from('clinic_visits')
          .update(visitData)
          .eq('id', visit.id);
        
        if (error) throw error;
        toast.success('Visit updated successfully');
      } else {
        const { error } = await supabase
          .from('clinic_visits')
          .insert([visitData]);
        
        if (error) throw error;
        toast.success('Visit recorded successfully');
      }
      
      onSave();
    } catch (error: any) {
      console.error('Error saving visit:', error);
      toast.error('Error saving visit: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const visitTypes = [
    { value: 'routine', label: 'Routine Check-up' },
    { value: 'sick', label: 'Sick Visit' },
    { value: 'injury', label: 'Injury' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'medication', label: 'Medication' },
    { value: 'follow_up', label: 'Follow-up' }
  ];

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {visit ? 'Edit Clinic Visit' : 'New Clinic Visit'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{selectedStudent.full_name}</h3>
                        <div className="text-sm text-gray-600 space-x-4">
                          <span>ID: {selectedStudent.student_id}</span>
                          {selectedStudent.admission_number && (
                            <span>Adm: {selectedStudent.admission_number}</span>
                          )}
                          <span>{selectedStudent.form_level?.replace('_', ' ')} {selectedStudent.stream}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowStudentSelector(true)}
                    >
                      Change Student
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowStudentSelector(true)}
                    className="w-full h-16 border-dashed"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Select Student
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Visit Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visit Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="visit_date">Visit Date & Time</Label>
                    <Input
                      id="visit_date"
                      type="datetime-local"
                      value={formData.visit_date}
                      onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="visit_type">Visit Type</Label>
                    <Select value={formData.visit_type} onValueChange={(value) => setFormData({ ...formData, visit_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {visitTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="symptoms">Symptoms/Complaints</Label>
                    <Textarea
                      id="symptoms"
                      value={formData.symptoms}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Textarea
                      id="diagnosis"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="treatment_given">Treatment Given</Label>
                    <Textarea
                      id="treatment_given"
                      value={formData.treatment_given}
                      onChange={(e) => setFormData({ ...formData, treatment_given: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vital Signs & Measurements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        min="35"
                        max="45"
                        value={formData.temperature}
                        onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="pulse_rate">Pulse Rate (bpm)</Label>
                      <Input
                        id="pulse_rate"
                        type="number"
                        min="40"
                        max="200"
                        value={formData.pulse_rate}
                        onChange={(e) => setFormData({ ...formData, pulse_rate: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="blood_pressure">Blood Pressure</Label>
                      <Input
                        id="blood_pressure"
                        placeholder="e.g., 120/80"
                        value={formData.blood_pressure}
                        onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="follow_up_required"
                        checked={formData.follow_up_required}
                        onCheckedChange={(checked) => setFormData({ ...formData, follow_up_required: !!checked })}
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
                          onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : visit ? 'Update Visit' : 'Record Visit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <StudentSelector
        isOpen={showStudentSelector}
        onClose={() => setShowStudentSelector(false)}
        onSelect={handleStudentSelect}
        title="Select Student for Clinic Visit"
      />
    </>
  );
};

export default ClinicVisitForm;
