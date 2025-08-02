import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Save, User, GraduationCap, Heart, MapPin, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StudentFormProps {
  student?: any;
  onClose: () => void;
  onSave: () => void;
}

const StudentForm = ({ student, onClose, onSave }: StudentFormProps) => {
  const [loading, setLoading] = useState(false);
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
    admission_date: '',
    is_active: true
  });

  const [validationErrors, setValidationErrors] = useState({
    student_id: '',
    admission_number: ''
  });

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
        admission_date: student.admission_date || '',
        is_active: student.is_active !== false
      });
    }
  }, [student]);

  const validateStudentId = (value: string) => {
    if (!value) return '';
    const studentIdPattern = /^[A-Za-z0-9]+$/;
    if (!studentIdPattern.test(value)) {
      return 'Student ID must contain only letters and numbers';
    }
    if (value.length < 3) {
      return 'Student ID must be at least 3 characters long';
    }
    return '';
  };

  const validateAdmissionNumber = (value: string) => {
    if (!value) return '';
    const admissionPattern = /^[0-9]+$/;
    if (!admissionPattern.test(value)) {
      return 'Admission number must contain only numbers';
    }
    if (value.length < 4) {
      return 'Admission number must be at least 4 digits long';
    }
    return '';
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'student_id') {
      setValidationErrors(prev => ({
        ...prev,
        student_id: validateStudentId(value)
      }));
    }
    if (field === 'admission_number') {
      setValidationErrors(prev => ({
        ...prev,
        admission_number: validateAdmissionNumber(value)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast.error('Student name is required');
      return;
    }
    
    const studentIdError = formData.student_id ? validateStudentId(formData.student_id) : '';
    const admissionNumberError = formData.admission_number ? validateAdmissionNumber(formData.admission_number) : '';
    
    if (studentIdError || admissionNumberError) {
      setValidationErrors({
        student_id: studentIdError,
        admission_number: admissionNumberError
      });
      toast.error('Please fix validation errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        full_name: formData.full_name.trim(),
        student_id: formData.student_id.trim() || null,
        admission_number: formData.admission_number.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        form_level: formData.form_level || null,
        stream: formData.stream.trim() || null,
        blood_group: formData.blood_group || null,
        allergies: formData.allergies.trim() || null,
        chronic_conditions: formData.chronic_conditions.trim() || null,
        parent_guardian_name: formData.parent_guardian_name.trim() || null,
        parent_guardian_phone: formData.parent_guardian_phone.trim() || null,
        county: formData.county || null,
        sub_county: formData.sub_county.trim() || null,
        ward: formData.ward.trim() || null,
        village: formData.village.trim() || null,
        admission_date: formData.admission_date || null,
        is_active: formData.is_active
      };

      if (student) {
        const { error } = await supabase
          .from('students')
          .update(submitData)
          .eq('id', student.id);

        if (error) throw error;
        toast.success('Student updated successfully');
      } else {
        const { error } = await supabase
          .from('students')
          .insert([submitData]);

        if (error) throw error;
        toast.success('Student added successfully');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving student:', error);
      if (error.code === '23505') {
        toast.error('A student with this ID or admission number already exists');
      } else {
        toast.error(error.message || 'Error saving student');
      }
    } finally {
      setLoading(false);
    }
  };

  const kenyanCounties = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay',
    'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
    'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
    'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi',
    'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
    'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center text-2xl font-bold text-gray-900">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <div>{student ? 'Edit Student Profile' : 'Add New Student'}</div>
              <DialogDescription className="text-base text-gray-600 mt-1">
                {student ? 'Update student information and health records' : 'Enter complete student information for health record management'}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-semibold text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter student's complete full name"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-sm font-semibold text-gray-700">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blood_group" className="text-sm font-semibold text-gray-700">Blood Group</Label>
                  <Select value={formData.blood_group} onValueChange={(value) => handleInputChange('blood_group', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map(group => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information Card */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <GraduationCap className="w-5 h-5 mr-2 text-green-600" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="student_id" className="text-sm font-semibold text-gray-700">Student ID (Optional)</Label>
                  <Input
                    id="student_id"
                    value={formData.student_id}
                    onChange={(e) => handleInputChange('student_id', e.target.value.toUpperCase())}
                    placeholder="e.g., STU001, ABC123"
                    className={`h-12 ${validationErrors.student_id ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.student_id && (
                    <p className="text-sm text-red-600 font-medium">{validationErrors.student_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admission_number" className="text-sm font-semibold text-gray-700">Admission Number (Optional)</Label>
                  <Input
                    id="admission_number"
                    value={formData.admission_number}
                    onChange={(e) => handleInputChange('admission_number', e.target.value)}
                    placeholder="e.g., 2024001"
                    className={`h-12 ${validationErrors.admission_number ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.admission_number && (
                    <p className="text-sm text-red-600 font-medium">{validationErrors.admission_number}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form_level" className="text-sm font-semibold text-gray-700">Form Level</Label>
                  <Select value={formData.form_level} onValueChange={(value) => handleInputChange('form_level', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select form level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="form_1">Form 1</SelectItem>
                      <SelectItem value="form_2">Form 2</SelectItem>
                      <SelectItem value="form_3">Form 3</SelectItem>
                      <SelectItem value="form_4">Form 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stream" className="text-sm font-semibold text-gray-700">Stream/Class</Label>
                  <Input
                    id="stream"
                    value={formData.stream}
                    onChange={(e) => handleInputChange('stream', e.target.value)}
                    placeholder="e.g., East, West, A, B"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admission_date" className="text-sm font-semibold text-gray-700">Admission Date</Label>
                  <Input
                    id="admission_date"
                    type="date"
                    value={formData.admission_date}
                    onChange={(e) => handleInputChange('admission_date', e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="is_active" className="text-sm font-semibold text-gray-700">Active Student</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information Card */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <Heart className="w-5 h-5 mr-2 text-red-600" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies" className="text-sm font-semibold text-gray-700">Known Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    placeholder="List any known allergies (food, medication, environmental, etc.)"
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chronic_conditions" className="text-sm font-semibold text-gray-700">Chronic Conditions</Label>
                  <Textarea
                    id="chronic_conditions"
                    value={formData.chronic_conditions}
                    onChange={(e) => handleInputChange('chronic_conditions', e.target.value)}
                    placeholder="List any chronic medical conditions, ongoing treatments, or medications"
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <Phone className="w-5 h-5 mr-2 text-purple-600" />
                Guardian & Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="parent_guardian_name" className="text-sm font-semibold text-gray-700">Parent/Guardian Name</Label>
                  <Input
                    id="parent_guardian_name"
                    value={formData.parent_guardian_name}
                    onChange={(e) => handleInputChange('parent_guardian_name', e.target.value)}
                    placeholder="Enter parent or guardian full name"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent_guardian_phone" className="text-sm font-semibold text-gray-700">Guardian Phone Number</Label>
                  <Input
                    id="parent_guardian_phone"
                    value={formData.parent_guardian_phone}
                    onChange={(e) => handleInputChange('parent_guardian_phone', e.target.value)}
                    placeholder="e.g., +254712345678"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="county" className="text-sm font-semibold text-gray-700">County</Label>
                  <Select value={formData.county} onValueChange={(value) => handleInputChange('county', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {kenyanCounties.map(county => (
                        <SelectItem key={county} value={county}>{county}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sub_county" className="text-sm font-semibold text-gray-700">Sub-County</Label>
                  <Input
                    id="sub_county"
                    value={formData.sub_county}
                    onChange={(e) => handleInputChange('sub_county', e.target.value)}
                    placeholder="Enter sub-county"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ward" className="text-sm font-semibold text-gray-700">Ward</Label>
                  <Input
                    id="ward"
                    value={formData.ward}
                    onChange={(e) => handleInputChange('ward', e.target.value)}
                    placeholder="Enter ward"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village" className="text-sm font-semibold text-gray-700">Village/Estate</Label>
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => handleInputChange('village', e.target.value)}
                    placeholder="Enter village or estate"
                    className="h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t bg-gray-50/50 -mx-6 px-6 py-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              size="lg"
              className="px-8"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8"
            >
              {loading ? (
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {student ? 'Update Student Profile' : 'Add Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;
