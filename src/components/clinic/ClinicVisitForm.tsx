
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, User, Stethoscope } from 'lucide-react';
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
            <DialogTitle className="flex items-center text-xl">
              <Stethoscope className="w-6 h-6 mr-2 text-blue-600" />
              {visit ? 'Edit Clinic Visit' : 'New Clinic Visit'}
            </DialogTitle>
            <DialogDescription>
              {visit ? 'Update the clinic visit details' : 'Record a new clinic visit for a student'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
              {selectedStudent ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{selectedStudent.full_name}</h4>
                      <div className="text-sm text-gray-600">
                        <span>ID: {selectedStudent.student_id}</span>
                        {selectedStudent.admission_number && (
                          <span className="ml-4">Adm: {selectedStudent.admission_number}</span>
                        )}
                        <span className="ml-4">{selectedStudent.form_level?.replace('_', ' ')} {selectedStudent.stream}</span>
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
            </div>

            <Separator />

            {/* Visit Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Visit Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visit_date">Visit Date & Time</Label>
                  <Input
                    id="visit_date"
                    type="datetime-local"
                    value={formData.visit_date}
                    onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms/Complaints</Label>
                <Textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  placeholder="Describe the symptoms or complaints"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="Enter diagnosis"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment_given">Treatment Given</Label>
                <Textarea
                  id="treatment_given"
                  value={formData.treatment_given}
                  onChange={(e) => setFormData({ ...formData, treatment_given: e.target.value })}
                  placeholder="Describe treatment provided"
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Vital Signs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Vital Signs & Measurements</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="35"
                    max="45"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    placeholder="36.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pulse_rate">Pulse Rate (bpm)</Label>
                  <Input
                    id="pulse_rate"
                    type="number"
                    min="40"
                    max="200"
                    value={formData.pulse_rate}
                    onChange={(e) => setFormData({ ...formData, pulse_rate: e.target.value })}
                    placeholder="80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blood_pressure">Blood Pressure</Label>
                  <Input
                    id="blood_pressure"
                    placeholder="120/80"
                    value={formData.blood_pressure}
                    onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="65.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="170"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Follow-up and Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Follow-up & Notes</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="follow_up_required"
                  checked={formData.follow_up_required}
                  onCheckedChange={(checked) => setFormData({ ...formData, follow_up_required: !!checked })}
                />
                <Label htmlFor="follow_up_required">Follow-up required</Label>
              </div>

              {formData.follow_up_required && (
                <div className="space-y-2">
                  <Label htmlFor="follow_up_date">Follow-up Date</Label>
                  <Input
                    id="follow_up_date"
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional observations or notes"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-6 border-t">
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
