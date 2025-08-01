
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, User, Stethoscope, FileText, Clock } from 'lucide-react';
import StudentSelector from '@/components/students/StudentSelector';
import VisitTypeSelector from './VisitTypeSelector';
import VitalSignsForm from './VitalSignsForm';
import { VisitFormData } from './types';

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
  const [formData, setFormData] = useState<VisitFormData>({
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

    if (!formData.symptoms && !formData.diagnosis) {
      toast.error('Please provide either symptoms or diagnosis');
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
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="space-y-3 pb-6">
            <DialogTitle className="flex items-center text-2xl font-bold text-gray-900">
              <Stethoscope className="w-7 h-7 mr-3 text-blue-600" />
              {visit ? 'Edit Clinic Visit' : 'New Clinic Visit Record'}
            </DialogTitle>
            <p className="text-gray-600">
              Complete medical documentation for student health assessment
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{selectedStudent.full_name}</h4>
                        <div className="text-sm text-gray-600 space-x-4">
                          <span>Student ID: {selectedStudent.student_id}</span>
                          {selectedStudent.admission_number && (
                            <span>Admission: {selectedStudent.admission_number}</span>
                          )}
                          <span className="capitalize">
                            {selectedStudent.form_level?.replace('_', ' ')} {selectedStudent.stream}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowStudentSelector(true)}
                    >
                      Change Patient
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowStudentSelector(true)}
                    className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  >
                    <div className="text-center">
                      <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <span className="text-gray-600">Select Patient</span>
                    </div>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Visit Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Visit Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="visit_date" className="text-sm font-medium">
                      Visit Date & Time *
                    </Label>
                    <Input
                      id="visit_date"
                      type="date"
                      value={formData.visit_date}
                      onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Visit Type *</Label>
                    <VisitTypeSelector
                      value={formData.visit_type}
                      onChange={(value) => setFormData({ ...formData, visit_type: value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Clinical Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="symptoms" className="text-sm font-medium">
                    Chief Complaint / Presenting Symptoms
                  </Label>
                  <Textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    rows={3}
                    placeholder="Describe the primary reason for the visit and presenting symptoms..."
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis" className="text-sm font-medium">
                    Clinical Diagnosis / Assessment
                  </Label>
                  <Textarea
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    rows={2}
                    placeholder="Medical diagnosis, assessment, or clinical impression..."
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment_given" className="text-sm font-medium">
                    Treatment Administered
                  </Label>
                  <Textarea
                    id="treatment_given"
                    value={formData.treatment_given}
                    onChange={(e) => setFormData({ ...formData, treatment_given: e.target.value })}
                    rows={3}
                    placeholder="Treatment provided, medications dispensed, procedures performed..."
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vital Signs */}
            <VitalSignsForm formData={formData} setFormData={setFormData} />

            {/* Follow-up Care */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-amber-600" />
                  Follow-up Care Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="follow_up_required"
                    checked={formData.follow_up_required}
                    onChange={(e) => setFormData({ ...formData, follow_up_required: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="follow_up_required" className="text-sm font-medium">
                    Follow-up visit required
                  </Label>
                </div>

                {formData.follow_up_required && (
                  <div className="ml-7 space-y-2">
                    <Label htmlFor="follow_up_date" className="text-sm font-medium">
                      Scheduled Follow-up Date
                    </Label>
                    <Input
                      id="follow_up_date"
                      type="date"
                      value={formData.follow_up_date}
                      onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                      className="max-w-xs"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-900">
                  Additional Clinical Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional observations, patient instructions, referral notes..."
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="min-w-32">
                {saving ? 'Saving...' : visit ? 'Update Record' : 'Save Visit Record'}
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
