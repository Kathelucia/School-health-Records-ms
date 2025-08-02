
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Save, X, Stethoscope } from 'lucide-react';
import StudentSelector from '@/components/students/StudentSelector';

interface ClinicVisitFormProps {
  visit?: any;
  student?: any;
  onClose: () => void;
  onSave: () => void;
}

const ClinicVisitForm = ({ visit, student, onClose, onSave }: ClinicVisitFormProps) => {
  const [selectedStudent, setSelectedStudent] = useState<any>(student || null);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [formData, setFormData] = useState({
    student_id: student?.id || '',
    visit_type: 'routine',
    symptoms: '',
    diagnosis: '',
    treatment_given: '',
    temperature: '',
    blood_pressure: '',
    pulse_rate: '',
    weight: '',
    height: '',
    notes: '',
    follow_up_required: false,
    follow_up_date: ''
  });
  const [saving, setSaving] = useState(false);

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
        visit_type: visit.visit_type || 'routine',
        symptoms: visit.symptoms || '',
        diagnosis: visit.diagnosis || '',
        treatment_given: visit.treatment_given || '',
        temperature: visit.temperature || '',
        blood_pressure: visit.blood_pressure || '',
        pulse_rate: visit.pulse_rate || '',
        weight: visit.weight || '',
        height: visit.height || '',
        notes: visit.notes || '',
        follow_up_required: visit.follow_up_required || false,
        follow_up_date: visit.follow_up_date || ''
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
      toast.error('Please select a student for this visit');
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const submitData = {
        ...formData,
        attended_by: user?.id,
        pulse_rate: formData.pulse_rate ? parseInt(formData.pulse_rate) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="pb-6 bg-white">
            <DialogTitle className="flex items-center text-2xl font-bold text-gray-900">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-4">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              {visit ? 'Update Clinic Visit' : 'New Clinic Visit'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white">
            {/* Student Selection */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900">Student Information</CardTitle>
              </CardHeader>
              <CardContent className="bg-white">
                {selectedStudent ? (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{selectedStudent.full_name}</h4>
                        <p className="text-sm text-gray-600">
                          ID: {selectedStudent.student_id} | {selectedStudent.form_level?.replace('_', ' ')} {selectedStudent.stream}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowStudentSelector(true)}
                      className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Change Student
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowStudentSelector(true)}
                    className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-gray-50 bg-white"
                  >
                    <div className="text-center">
                      <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <span className="font-medium text-gray-600">Select Student for Visit</span>
                    </div>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Visit Details */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900">Visit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 bg-white">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Visit Type</Label>
                  <Select value={formData.visit_type} onValueChange={(value) => setFormData({ ...formData, visit_type: value })}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="routine" className="hover:bg-gray-50">Routine Check-up</SelectItem>
                      <SelectItem value="sick" className="hover:bg-gray-50">Sick Visit</SelectItem>
                      <SelectItem value="emergency" className="hover:bg-gray-50">Emergency</SelectItem>
                      <SelectItem value="follow_up" className="hover:bg-gray-50">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Symptoms</Label>
                  <Textarea
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    placeholder="Describe the symptoms..."
                    className="bg-white border-gray-300"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Diagnosis</Label>
                  <Textarea
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="Enter diagnosis..."
                    className="bg-white border-gray-300"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Treatment Given</Label>
                  <Textarea
                    value={formData.treatment_given}
                    onChange={(e) => setFormData({ ...formData, treatment_given: e.target.value })}
                    placeholder="Describe treatment provided..."
                    className="bg-white border-gray-300"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vital Signs */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900">Vital Signs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 bg-white">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Temperature (°C)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Blood Pressure</Label>
                    <Input
                      value={formData.blood_pressure}
                      onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
                      placeholder="120/80"
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Pulse Rate (bpm)</Label>
                    <Input
                      type="number"
                      value={formData.pulse_rate}
                      onChange={(e) => setFormData({ ...formData, pulse_rate: e.target.value })}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Height (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="bg-white border-gray-300 max-w-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 bg-white">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Clinical Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes and observations..."
                    className="bg-white border-gray-300"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="follow_up"
                    checked={formData.follow_up_required}
                    onChange={(e) => setFormData({ ...formData, follow_up_required: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="follow_up" className="text-sm font-medium text-gray-700">Follow-up Required</Label>
                </div>

                {formData.follow_up_required && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Follow-up Date</Label>
                    <Input
                      type="date"
                      value={formData.follow_up_date}
                      onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                      className="bg-white border-gray-300 max-w-xs"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t bg-white px-6 py-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {saving ? (
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {visit ? 'Update Visit' : 'Record Visit'}
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
