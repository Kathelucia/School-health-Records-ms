
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
import { Save, X, User, Heart, MapPin, Phone, Calendar } from 'lucide-react';

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
    village: '',
    nhif_number: '',
    sha_number: '',
    emergency_contact: {
      name: '',
      relationship: '',
      phone: '',
      address: ''
    }
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
        village: student.village || '',
        nhif_number: student.nhif_number || '',
        sha_number: student.sha_number || '',
        emergency_contact: student.emergency_contact || {
          name: '',
          relationship: '',
          phone: '',
          address: ''
        }
      });
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast.error('Student full name is required');
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        ...formData,
        admission_date: student?.admission_date || new Date().toISOString().split('T')[0]
      };

      if (student) {
        const { error } = await supabase
          .from('students')
          .update(submitData)
          .eq('id', student.id);
        
        if (error) throw error;
        toast.success('Student record updated successfully');
      } else {
        const { error } = await supabase
          .from('students')
          .insert([submitData]);
        
        if (error) throw error;
        toast.success('Student record created successfully');
      }
      
      onSave();
    } catch (error: any) {
      console.error('Error saving student:', error);
      toast.error('Error saving student: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const formLevels = [
    { value: 'form_1', label: 'Form 1' },
    { value: 'form_2', label: 'Form 2' },
    { value: 'form_3', label: 'Form 3' },
    { value: 'form_4', label: 'Form 4' }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-6 bg-white border-b">
          <DialogTitle className="flex items-center text-2xl font-bold text-gray-900">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <div>{student ? 'Update Student Record' : 'New Student Record'}</div>
              <DialogDescription className="text-base text-gray-600 mt-1">
                {student ? 'Update student information and health records' : 'Add new student to the health management system'}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6">
          {/* Basic Information Card */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="bg-white">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-semibold text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter student's full name"
                    className="h-12 bg-white border-gray-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student_id" className="text-sm font-semibold text-gray-700">Student ID</Label>
                  <Input
                    id="student_id"
                    value={formData.student_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, student_id: e.target.value }))}
                    placeholder="Enter student ID"
                    className="h-12 bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admission_number" className="text-sm font-semibold text-gray-700">Admission Number</Label>
                  <Input
                    id="admission_number"
                    value={formData.admission_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, admission_number: e.target.value }))}
                    placeholder="Enter admission number"
                    className="h-12 bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-sm font-semibold text-gray-700">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    className="h-12 bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger className="h-12 bg-white border-gray-300">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="male" className="hover:bg-gray-50">Male</SelectItem>
                      <SelectItem value="female" className="hover:bg-gray-50">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form_level" className="text-sm font-semibold text-gray-700">Form Level</Label>
                  <Select value={formData.form_level} onValueChange={(value) => setFormData(prev => ({ ...prev, form_level: value }))}>
                    <SelectTrigger className="h-12 bg-white border-gray-300">
                      <SelectValue placeholder="Select form level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {formLevels.map(level => (
                        <SelectItem key={level.value} value={level.value} className="hover:bg-gray-50">{level.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stream" className="text-sm font-semibold text-gray-700">Stream</Label>
                  <Input
                    id="stream"
                    value={formData.stream}
                    onChange={(e) => setFormData(prev => ({ ...prev, stream: e.target.value }))}
                    placeholder="Enter class stream (e.g., A, B, C)"
                    className="h-12 bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blood_group" className="text-sm font-semibold text-gray-700">Blood Group</Label>
                  <Select value={formData.blood_group} onValueChange={(value) => setFormData(prev => ({ ...prev, blood_group: value }))}>
                    <SelectTrigger className="h-12 bg-white border-gray-300">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {bloodGroups.map(group => (
                        <SelectItem key={group} value={group} className="hover:bg-gray-50">{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Information Card */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="bg-white">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-600" />
                Health Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 bg-white">
              <div className="space-y-2">
                <Label htmlFor="allergies" className="text-sm font-semibold text-gray-700">Known Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                  placeholder="List any known allergies (food, medication, environmental)"
                  rows={3}
                  className="resize-none bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chronic_conditions" className="text-sm font-semibold text-gray-700">Chronic Conditions</Label>
                <Textarea
                  id="chronic_conditions"
                  value={formData.chronic_conditions}
                  onChange={(e) => setFormData(prev => ({ ...prev, chronic_conditions: e.target.value }))}
                  placeholder="List any chronic medical conditions (diabetes, asthma, etc.)"
                  rows={3}
                  className="resize-none bg-white border-gray-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nhif_number" className="text-sm font-semibold text-gray-700">NHIF Number</Label>
                  <Input
                    id="nhif_number"
                    value={formData.nhif_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, nhif_number: e.target.value }))}
                    placeholder="Enter NHIF number"
                    className="h-12 bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sha_number" className="text-sm font-semibold text-gray-700">SHA Number</Label>
                  <Input
                    id="sha_number"
                    value={formData.sha_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, sha_number: e.target.value }))}
                    placeholder="Enter SHA number"
                    className="h-12 bg-white border-gray-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="bg-white">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-green-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="parent_guardian_name" className="text-sm font-semibold text-gray-700">Parent/Guardian Name</Label>
                  <Input
                    id="parent_guardian_name"
                    value={formData.parent_guardian_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, parent_guardian_name: e.target.value }))}
                    placeholder="Enter parent/guardian name"
                    className="h-12 bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent_guardian_phone" className="text-sm font-semibold text-gray-700">Parent/Guardian Phone</Label>
                  <Input
                    id="parent_guardian_phone"
                    value={formData.parent_guardian_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, parent_guardian_phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className="h-12 bg-white border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Name</Label>
                    <Input
                      value={formData.emergency_contact.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergency_contact: { ...prev.emergency_contact, name: e.target.value }
                      }))}
                      placeholder="Emergency contact name"
                      className="h-12 bg-white border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Relationship</Label>
                    <Input
                      value={formData.emergency_contact.relationship}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergency_contact: { ...prev.emergency_contact, relationship: e.target.value }
                      }))}
                      placeholder="Relationship to student"
                      className="h-12 bg-white border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Phone</Label>
                    <Input
                      value={formData.emergency_contact.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergency_contact: { ...prev.emergency_contact, phone: e.target.value }
                      }))}
                      placeholder="Emergency contact phone"
                      className="h-12 bg-white border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Address</Label>
                    <Input
                      value={formData.emergency_contact.address}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergency_contact: { ...prev.emergency_contact, address: e.target.value }
                      }))}
                      placeholder="Emergency contact address"
                      className="h-12 bg-white border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information Card */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="bg-white">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="county" className="text-sm font-semibold text-gray-700">County</Label>
                  <Input
                    id="county"
                    value={formData.county}
                    onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))}
                    placeholder="Enter county"
                    className="h-12 bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sub_county" className="text-sm font-semibold text-gray-700">Sub County</Label>
                  <Input
                    id="sub_county"
                    value={formData.sub_county}
                    onChange={(e) => setFormData(prev => ({ ...prev, sub_county: e.target.value }))}
                    placeholder="Enter sub county"
                    className="h-12 bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ward" className="text-sm font-semibold text-gray-700">Ward</Label>
                  <Input
                    id="ward"
                    value={formData.ward}
                    onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                    placeholder="Enter ward"
                    className="h-12 bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village" className="text-sm font-semibold text-gray-700">Village</Label>
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                    placeholder="Enter village"
                    className="h-12 bg-white border-gray-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t bg-white">
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
              {student ? 'Update Student' : 'Create Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;
