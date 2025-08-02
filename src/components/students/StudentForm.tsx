
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
import { User, Save, X } from 'lucide-react';

interface StudentFormProps {
  student?: any;
  onClose: () => void;
  onSave: () => void;
}

const StudentForm = ({ student, onClose, onSave }: StudentFormProps) => {
  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    admission_number: '',
    date_of_birth: '',
    gender: '',
    form_level: '',
    stream: '',
    blood_group: '',
    allergies: '',
    chronic_conditions: '',
    parent_guardian_name: '',
    parent_guardian_phone: '',
    county: '',
    sub_county: '',
    ward: '',
    village: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.full_name || '',
        student_id: student.student_id || '',
        admission_number: student.admission_number || '',
        date_of_birth: student.date_of_birth || '',
        gender: student.gender || '',
        form_level: student.form_level || '',
        stream: student.stream || '',
        blood_group: student.blood_group || '',
        allergies: student.allergies || '',
        chronic_conditions: student.chronic_conditions || '',
        parent_guardian_name: student.parent_guardian_name || '',
        parent_guardian_phone: student.parent_guardian_phone || '',
        county: student.county || '',
        sub_county: student.sub_county || '',
        ward: student.ward || '',
        village: student.village || ''
      });
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (student) {
        const { error } = await supabase
          .from('students')
          .update(formData)
          .eq('id', student.id);
        
        if (error) throw error;
        toast.success('Student updated successfully');
      } else {
        const { error } = await supabase
          .from('students')
          .insert([formData]);
        
        if (error) throw error;
        toast.success('Student added successfully');
      }
      
      onSave();
    } catch (error: any) {
      console.error('Error saving student:', error);
      toast.error('Error saving student: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-6 bg-white">
          <DialogTitle className="flex items-center text-2xl font-bold text-gray-900">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-white" />
            </div>
            {student ? 'Update Student' : 'Add New Student'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white">
          {/* Personal Information */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="bg-white">
              <CardTitle className="text-lg font-semibold text-gray-900">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Full Name *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="bg-white border-gray-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Student ID</Label>
                  <Input
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Admission Number</Label>
                  <Input
                    value={formData.admission_number}
                    onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="male" className="hover:bg-gray-50">Male</SelectItem>
                      <SelectItem value="female" className="hover:bg-gray-50">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Blood Group</Label>
                  <Select value={formData.blood_group} onValueChange={(value) => setFormData({ ...formData, blood_group: value })}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="A+" className="hover:bg-gray-50">A+</SelectItem>
                      <SelectItem value="A-" className="hover:bg-gray-50">A-</SelectItem>
                      <SelectItem value="B+" className="hover:bg-gray-50">B+</SelectItem>
                      <SelectItem value="B-" className="hover:bg-gray-50">B-</SelectItem>
                      <SelectItem value="AB+" className="hover:bg-gray-50">AB+</SelectItem>
                      <SelectItem value="AB-" className="hover:bg-gray-50">AB-</SelectItem>
                      <SelectItem value="O+" className="hover:bg-gray-50">O+</SelectItem>
                      <SelectItem value="O-" className="hover:bg-gray-50">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="bg-white">
              <CardTitle className="text-lg font-semibold text-gray-900">Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Form Level</Label>
                  <Select value={formData.form_level} onValueChange={(value) => setFormData({ ...formData, form_level: value })}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Select form level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="form_1" className="hover:bg-gray-50">Form 1</SelectItem>
                      <SelectItem value="form_2" className="hover:bg-gray-50">Form 2</SelectItem>
                      <SelectItem value="form_3" className="hover:bg-gray-50">Form 3</SelectItem>
                      <SelectItem value="form_4" className="hover:bg-gray-50">Form 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Stream</Label>
                  <Input
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                    placeholder="e.g., East, West, North, South"
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="bg-white">
              <CardTitle className="text-lg font-semibold text-gray-900">Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Allergies</Label>
                <Textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="List any known allergies..."
                  className="bg-white border-gray-300"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Chronic Conditions</Label>
                <Textarea
                  value={formData.chronic_conditions}
                  onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                  placeholder="List any chronic medical conditions..."
                  className="bg-white border-gray-300"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="bg-white">
              <CardTitle className="text-lg font-semibold text-gray-900">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Parent/Guardian Name</Label>
                  <Input
                    value={formData.parent_guardian_name}
                    onChange={(e) => setFormData({ ...formData, parent_guardian_name: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Parent/Guardian Phone</Label>
                  <Input
                    value={formData.parent_guardian_phone}
                    onChange={(e) => setFormData({ ...formData, parent_guardian_phone: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">County</Label>
                  <Input
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Sub-County</Label>
                  <Input
                    value={formData.sub_county}
                    onChange={(e) => setFormData({ ...formData, sub_county: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Ward</Label>
                  <Input
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Village</Label>
                  <Input
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {student ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;
