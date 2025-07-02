
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
import { Search, User } from 'lucide-react';
import StudentSelector from '@/components/students/StudentSelector';

interface ImmunizationFormProps {
  immunization?: any;
  student?: any;
  onClose: () => void;
  onSave: () => void;
  requirements?: any[];
}

const ImmunizationForm = ({ immunization, student, onClose, onSave, requirements = [] }: ImmunizationFormProps) => {
  const [selectedStudent, setSelectedStudent] = useState<any>(student || null);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [formData, setFormData] = useState({
    student_id: student?.id || '',
    vaccine_name: '',
    date_administered: new Date().toISOString().split('T')[0],
    batch_number: '',
    administered_by: '',
    next_dose_date: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (student) {
      setSelectedStudent(student);
      setFormData(prev => ({ ...prev, student_id: student.id }));
    }
  }, [student]);

  useEffect(() => {
    if (immunization) {
      setFormData({
        student_id: immunization.student_id || '',
        vaccine_name: immunization.vaccine_name || '',
        date_administered: immunization.date_administered || '',
        batch_number: immunization.batch_number || '',
        administered_by: immunization.administered_by || '',
        next_dose_date: immunization.next_dose_date || '',
        notes: immunization.notes || ''
      });

      // Fetch student info if editing
      if (immunization.student_id) {
        fetchStudentInfo(immunization.student_id);
      }
    }
  }, [immunization]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
        if (!immunization) {
          setFormData(prev => ({ ...prev, administered_by: profile?.full_name || '' }));
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
      if (immunization) {
        const { error } = await supabase
          .from('immunizations')
          .update(formData)
          .eq('id', immunization.id);
        
        if (error) throw error;
        toast.success('Immunization updated successfully');
      } else {
        const { error } = await supabase
          .from('immunizations')
          .insert([formData]);
        
        if (error) throw error;
        toast.success('Immunization recorded successfully');
      }
      
      onSave();
    } catch (error: any) {
      console.error('Error saving immunization:', error);
      toast.error('Error saving immunization: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const commonVaccines = [
    'COVID-19',
    'Hepatitis B',
    'MMR (Measles, Mumps, Rubella)',
    'Tetanus',
    'Polio',
    'Meningitis',
    'HPV',
    'Influenza',
    'Yellow Fever',
    'Typhoid',
    'Other'
  ];

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {immunization ? 'Edit Immunization Record' : 'New Immunization Record'}
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

            {/* Immunization Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Immunization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vaccine_name">Vaccine Name *</Label>
                  <Select value={formData.vaccine_name} onValueChange={(value) => setFormData({ ...formData, vaccine_name: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vaccine" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonVaccines.map(vaccine => (
                        <SelectItem key={vaccine} value={vaccine}>{vaccine}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.vaccine_name === 'Other' && (
                    <Input
                      placeholder="Enter vaccine name"
                      value={formData.vaccine_name === 'Other' ? '' : formData.vaccine_name}
                      onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_administered">Date Administered *</Label>
                    <Input
                      id="date_administered"
                      type="date"
                      value={formData.date_administered}
                      onChange={(e) => setFormData({ ...formData, date_administered: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="next_dose_date">Next Dose Date</Label>
                    <Input
                      id="next_dose_date"
                      type="date"
                      value={formData.next_dose_date}
                      onChange={(e) => setFormData({ ...formData, next_dose_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batch_number">Batch Number</Label>
                    <Input
                      id="batch_number"
                      value={formData.batch_number}
                      onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="administered_by">Administered By</Label>
                    <Input
                      id="administered_by"
                      value={formData.administered_by}
                      onChange={(e) => setFormData({ ...formData, administered_by: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Any additional notes or observations..."
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : immunization ? 'Update Record' : 'Record Immunization'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <StudentSelector
        isOpen={showStudentSelector}
        onClose={() => setShowStudentSelector(false)}
        onSelect={handleStudentSelect}
        title="Select Student for Immunization"
      />
    </>
  );
};

export default ImmunizationForm;
