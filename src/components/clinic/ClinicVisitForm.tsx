
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, User, Stethoscope } from 'lucide-react';
import StudentSelector from '@/components/students/StudentSelector';

interface ClinicVisitFormProps {
  visit?: any;
  student?: any;
  onClose: () => void;
  onSave: () => void;
  userProfile?: any;
}

const ClinicVisitForm = ({ visit, student, onClose, onSave, userProfile }: ClinicVisitFormProps) => {
  const [selectedStudent, setSelectedStudent] = useState<any>(student || null);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(userProfile || null);
  const [formData, setFormData] = useState({
    student_id: student?.id || '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_type: 'routine',
    symptoms: '',
    diagnosis: '',
    treatment_given: '',
    temperature: '',
    blood_pressure: '',
    pulse_rate: '',
    weight: '',
    height: '',
    follow_up_required: false,
    follow_up_date: '',
    notes: '',
    attended_by: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUserProfile) {
      fetchUserProfile();
    }
  }, [currentUserProfile]);

  useEffect(() => {
    if (student) {
      setSelectedStudent(student);
      setFormData(prev => ({ ...prev, student_id: student.id }));
    }
  }, [student]);

  useEffect(() => {
    if (visit) {
      setFormData({
        student_id: visit.student_id || '',
        visit_date: visit.visit_date ? new Date(visit.visit_date).toISOString().split('T')[0] : '',
        visit_type: visit.visit_type || 'routine',
        symptoms: visit.symptoms || '',
        diagnosis: visit.diagnosis || '',
        treatment_given: visit.treatment_given || '',
        temperature: visit.temperature?.toString() || '',
        blood_pressure: visit.blood_pressure || '',
        pulse_rate: visit.pulse_rate?.toString() || '',
        weight: visit.weight?.toString() || '',
        height: visit.height?.toString() || '',
        follow_up_required: visit.follow_up_required || false,
        follow_up_date: visit.follow_up_date || '',
        notes: visit.notes || '',
        attended_by: visit.attended_by || ''
      });

      if (visit.student_id) {
        fetchStudentInfo(visit.student_id);
      }
    }
  }, [visit]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setCurrentUserProfile(profile);
          if (!visit) {
            setFormData(prev => ({ ...prev, attended_by: user.id }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

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
    setFormData(prev => ({ ...prev, student_id: student.id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id) {
      toast.error('Please select a student');
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        ...formData,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        pulse_rate: formData.pulse_rate ? parseInt(formData.pulse_rate) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        visit_date: new Date(formData.visit_date).toISOString(),
        follow_up_date: formData.follow_up_date || null
      };

      if (visit) {
        const { error } = await supabase
          .from('clinic_visits')
          .update(submitData)
          .eq('id', visit.id);
        
        if (error) throw error;
        toast.success('Clinic visit updated successfully');
      } else {
        const { error } = await supabase
          .from('clinic_visits')
          .insert([submitData]);
        
        if (error) throw error;
        toast.success('Clinic visit recorded successfully');
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving clinic visit:', error);
      toast.error('Error saving clinic visit: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3 pb-6">
            <DialogTitle className="flex items-center text-2xl font-bold text-gray-900">
              <Stethoscope className="w-7 h-7 mr-3 text-blue-600" />
              {visit ? 'Edit Clinic Visit' : 'New Clinic Visit'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Student Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Student Information
              </h3>
              {selectedStudent ? (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedStudent.full_name}</h4>
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
                  className="w-full h-16 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                >
                  <User className="w-5 h-5 mr-2" />
                  Select Student
                </Button>
              )}
            </div>

            {/* Visit Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                Visit Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="visit_date">Visit Date *</Label>
                  <Input
                    id="visit_date"
                    type="date"
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
                      <SelectItem value="routine">Routine Check-up</SelectItem>
                      <SelectItem value="sick_visit">Sick Visit</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="screening">Health Screening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms/Chief Complaint</Label>
                <Textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  rows={3}
                  placeholder="Describe the symptoms or reason for visit..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  rows={2}
                  placeholder="Medical diagnosis or assessment..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment_given">Treatment Given</Label>
                <Textarea
                  id="treatment_given"
                  value={formData.treatment_given}
                  onChange={(e) => setFormData({ ...formData, treatment_given: e.target.value })}
                  rows={3}
                  placeholder="Treatment provided, medications dispensed..."
                />
              </div>
            </div>

            {/* Vital Signs */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    placeholder="36.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blood_pressure">Blood Pressure</Label>
                  <Input
                    id="blood_pressure"
                    value={formData.blood_pressure}
                    onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
                    placeholder="120/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pulse_rate">Pulse Rate (bpm)</Label>
                  <Input
                    id="pulse_rate"
                    type="number"
                    value={formData.pulse_rate}
                    onChange={(e) => setFormData({ ...formData, pulse_rate: e.target.value })}
                    placeholder="72"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="65.5"
                  />
                </div>
              </div>

              <div className="w-full md:w-1/4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="170.5"
                  />
                </div>
              </div>
            </div>

            {/* Follow-up */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Follow-up</h3>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="follow_up_required"
                  checked={formData.follow_up_required}
                  onChange={(e) => setFormData({ ...formData, follow_up_required: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <Label htmlFor="follow_up_required">Follow-up visit required</Label>
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
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any additional observations or notes..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
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
