import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, User, Stethoscope, FileText, Clock, Activity, Save, X } from 'lucide-react';
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
      toast.error('Please select a student for this visit');
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
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center text-2xl font-bold text-gray-900">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <div>{visit ? 'Update Clinic Visit' : 'New Clinic Visit'}</div>
                <p className="text-base text-gray-600 mt-1 font-normal">
                  {visit ? 'Update medical examination record' : 'Record new medical examination and treatment'}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection Card */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{selectedStudent.full_name}</h4>
                        <div className="text-sm text-gray-600 space-x-4 mt-1">
                          <span className="font-medium">ID: {selectedStudent.student_id}</span>
                          {selectedStudent.admission_number && (
                            <span className="font-medium">Admission: {selectedStudent.admission_number}</span>
                          )}
                          <span className="capitalize font-medium">
                            {selectedStudent.form_level?.replace('_', ' ')} {selectedStudent.stream}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowStudentSelector(true)}
                      size="lg"
                      className="px-6"
                    >
                      Change Patient
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowStudentSelector(true)}
                    className="w-full h-24 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  >
                    <div className="text-center">
                      <User className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                      <span className="text-lg font-medium text-gray-600">Select Patient for Visit</span>
                      <p className="text-sm text-gray-500 mt-1">Choose a student to record clinic visit</p>
                    </div>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Visit Details Card */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Visit Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="visit_date" className="text-sm font-semibold text-gray-700">
                      Visit Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="visit_date"
                      type="date"
                      value={formData.visit_date}
                      onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Visit Type <span className="text-red-500">*</span>
                    </Label>
                    <VisitTypeSelector
                      value={formData.visit_type}
                      onChange={(value) => setFormData({ ...formData, visit_type: value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Assessment Card */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Clinical Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="symptoms" className="text-sm font-semibold text-gray-700">
                    Chief Complaint & Symptoms <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    rows={4}
                    placeholder="Describe the primary reason for the visit, presenting symptoms, and patient's complaints..."
                    className="resize-none text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis" className="text-sm font-semibold text-gray-700">
                    Diagnosis & Clinical Assessment <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    rows={3}
                    placeholder="Medical diagnosis, clinical assessment, or working diagnosis..."
                    className="resize-none text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment_given" className="text-sm font-semibold text-gray-700">
                    Treatment & Intervention
                  </Label>
                  <Textarea
                    id="treatment_given"
                    value={formData.treatment_given}
                    onChange={(e) => setFormData({ ...formData, treatment_given: e.target.value })}
                    rows={4}
                    placeholder="Treatment provided, medications administered, procedures performed, recommendations given..."
                    className="resize-none text-base"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vital Signs Card */}
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-red-600" />
                  Vital Signs & Measurements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VitalSignsForm formData={formData} setFormData={setFormData} />
              </CardContent>
            </Card>

            {/* Follow-up Care Card */}
            <Card className="border-l-4 border-l-amber-500">
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
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <Label htmlFor="follow_up_required" className="text-sm font-semibold text-gray-700">
                    Follow-up visit required
                  </Label>
                </div>

                {formData.follow_up_required && (
                  <div className="ml-8 space-y-2">
                    <Label htmlFor="follow_up_date" className="text-sm font-semibold text-gray-700">
                      Scheduled Follow-up Date
                    </Label>
                    <Input
                      id="follow_up_date"
                      type="date"
                      value={formData.follow_up_date}
                      onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                      className="max-w-xs h-12"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                    Additional Clinical Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Additional observations, patient instructions, referral notes, special considerations..."
                    className="resize-none text-base"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t bg-gray-50/50 -mx-6 px-6 py-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                size="lg"
                className="px-8"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving} 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
              >
                {saving ? (
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {visit ? 'Update Visit Record' : 'Save Clinic Visit'}
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
