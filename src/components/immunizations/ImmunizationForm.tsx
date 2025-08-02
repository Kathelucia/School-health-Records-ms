
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, User, Syringe, Calendar, Save, X, Shield } from 'lucide-react';
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
  const [customVaccine, setCustomVaccine] = useState('');

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

  const handleVaccineChange = (value: string) => {
    if (value === 'Other') {
      setCustomVaccine('');
      setFormData({ ...formData, vaccine_name: '' });
    } else {
      setCustomVaccine('');
      setFormData({ ...formData, vaccine_name: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id) {
      toast.error('Please select a student for this immunization');
      return;
    }

    if (!formData.vaccine_name && !customVaccine) {
      toast.error('Please specify the vaccine name');
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        ...formData,
        vaccine_name: customVaccine || formData.vaccine_name
      };

      if (immunization) {
        const { error } = await supabase
          .from('immunizations')
          .update(submitData)
          .eq('id', immunization.id);
        
        if (error) throw error;
        toast.success('Immunization record updated successfully');
      } else {
        const { error } = await supabase
          .from('immunizations')
          .insert([submitData]);
        
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="pb-6 bg-white">
            <DialogTitle className="flex items-center text-2xl font-bold text-gray-900">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                <Syringe className="w-6 h-6 text-white" />
              </div>
              <div>
                <div>{immunization ? 'Update Immunization Record' : 'New Immunization Record'}</div>
                <DialogDescription className="text-base text-gray-600 mt-1">
                  {immunization ? 'Update vaccination record details' : 'Record new vaccination for student health tracking'}
                </DialogDescription>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white">
            {/* Student Selection Card */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white">
                {selectedStudent ? (
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{selectedStudent.full_name}</h4>
                        <div className="text-sm text-gray-600 space-x-4 mt-1">
                          <span className="font-medium">Student ID: {selectedStudent.student_id}</span>
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
                      className="px-6 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Change Student
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowStudentSelector(true)}
                    className="w-full h-24 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gray-50 bg-white"
                  >
                    <div className="text-center">
                      <User className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                      <span className="text-lg font-medium text-gray-600">Select Student for Immunization</span>
                      <p className="text-sm text-gray-500 mt-1">Choose a student to record vaccination</p>
                    </div>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Immunization Details Card */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Immunization Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 bg-white">
                <div className="space-y-2">
                  <Label htmlFor="vaccine_name" className="text-sm font-semibold text-gray-700">
                    Vaccine Name <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.vaccine_name} onValueChange={handleVaccineChange}>
                    <SelectTrigger className="h-12 bg-white border-gray-300">
                      <SelectValue placeholder="Select vaccine type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {commonVaccines.map(vaccine => (
                        <SelectItem key={vaccine} value={vaccine} className="hover:bg-gray-50">{vaccine}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.vaccine_name === 'Other' && (
                    <Input
                      placeholder="Enter specific vaccine name"
                      value={customVaccine}
                      onChange={(e) => setCustomVaccine(e.target.value)}
                      className="mt-2 h-12 bg-white border-gray-300"
                      required
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date_administered" className="text-sm font-semibold text-gray-700">
                      Date Administered <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date_administered"
                      type="date"
                      value={formData.date_administered}
                      onChange={(e) => setFormData({ ...formData, date_administered: e.target.value })}
                      className="h-12 bg-white border-gray-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="next_dose_date" className="text-sm font-semibold text-gray-700">Next Dose Due Date</Label>
                    <Input
                      id="next_dose_date"
                      type="date"
                      value={formData.next_dose_date}
                      onChange={(e) => setFormData({ ...formData, next_dose_date: e.target.value })}
                      className="h-12 bg-white border-gray-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="batch_number" className="text-sm font-semibold text-gray-700">Batch/Lot Number</Label>
                    <Input
                      id="batch_number"
                      value={formData.batch_number}
                      onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                      placeholder="Enter vaccine batch number"
                      className="h-12 bg-white border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="administered_by" className="text-sm font-semibold text-gray-700">Administered By</Label>
                    <Input
                      id="administered_by"
                      value={formData.administered_by}
                      onChange={(e) => setFormData({ ...formData, administered_by: e.target.value })}
                      placeholder="Enter healthcare provider name"
                      className="h-12 bg-white border-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">Clinical Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    placeholder="Any adverse reactions, patient response, special instructions, or additional observations..."
                    className="resize-none text-base bg-white border-gray-300"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t bg-white px-6 py-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                size="lg"
                className="px-8 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {saving ? (
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {immunization ? 'Update Immunization' : 'Record Immunization'}
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
