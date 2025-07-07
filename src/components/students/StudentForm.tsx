
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Save, User, MapPin, Heart, Phone, FileText } from 'lucide-react';
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

    // Validate student_id and admission_number in real-time
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
    
    // Basic validation
    if (!formData.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }
    
    // Validate before submission
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
      // Prepare data for submission, removing empty strings
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
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update(submitData)
          .eq('id', student.id);

        if (error) throw error;
        toast.success('Student profile updated successfully');
      } else {
        // Create new student
        const { error } = await supabase
          .from('students')
          .insert([submitData]);

        if (error) throw error;
        toast.success('Student profile created successfully');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving student:', error);
      if (error.code === '23505') {
        toast.error('A student with this ID or admission number already exists');
      } else {
        toast.error(error.message || 'Error saving student profile');
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            {student ? 'Edit Student Profile' : 'Add New Student'}
          </DialogTitle>
          <DialogDescription>
            {student ? 'Update student information and medical records' : 'Enter comprehensive student information including medical details'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Enter student's full name"
                      required
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blood_group">Blood Group</Label>
                    <Select value={formData.blood_group} onValueChange={(value) => handleInputChange('blood_group', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodGroups.map(group => (
                          <SelectItem key={group} value={group}>{group}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student_id">Student ID (Optional - Letters & Numbers)</Label>
                    <Input
                      id="student_id"
                      value={formData.student_id}
                      onChange={(e) => handleInputChange('student_id', e.target.value.toUpperCase())}
                      placeholder="e.g., STU001, ABC123"
                      className={`transition-all focus:ring-2 focus:ring-blue-500 ${validationErrors.student_id ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.student_id && (
                      <p className="text-sm text-red-600">{validationErrors.student_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admission_number">Admission Number (Optional - Numbers Only)</Label>
                    <Input
                      id="admission_number"
                      value={formData.admission_number}
                      onChange={(e) => handleInputChange('admission_number', e.target.value)}
                      placeholder="e.g., 2024001, 1234"
                      className={`transition-all focus:ring-2 focus:ring-blue-500 ${validationErrors.admission_number ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.admission_number && (
                      <p className="text-sm text-red-600">{validationErrors.admission_number}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="form_level">Form Level</Label>
                    <Select value={formData.form_level} onValueChange={(value) => handleInputChange('form_level', value)}>
                      <SelectTrigger>
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
                    <Label htmlFor="stream">Stream</Label>
                    <Input
                      id="stream"
                      value={formData.stream}
                      onChange={(e) => handleInputChange('stream', e.target.value)}
                      placeholder="e.g., East, West, North, South"
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admission_date">Admission Date</Label>
                    <Input
                      id="admission_date"
                      type="date"
                      value={formData.admission_date}
                      onChange={(e) => handleInputChange('admission_date', e.target.value)}
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                    <Label htmlFor="is_active">Active Student</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-red-600" />
                    Medical Information
                  </CardTitle>
                  <CardDescription>
                    Important medical conditions and allergies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Known Allergies</Label>
                    <Textarea
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      placeholder="List any known allergies (food, medication, environmental, etc.)"
                      className="min-h-[100px] transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chronic_conditions">Chronic Conditions</Label>
                    <Textarea
                      id="chronic_conditions"
                      value={formData.chronic_conditions}
                      onChange={(e) => handleInputChange('chronic_conditions', e.target.value)}
                      placeholder="List any chronic medical conditions (asthma, diabetes, epilepsy, etc.)"
                      className="min-h-[100px] transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {(formData.allergies || formData.chronic_conditions) && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-red-700 mb-2">
                        <Heart className="w-4 h-4" />
                        <span className="font-medium">Medical Alert</span>
                      </div>
                      <p className="text-sm text-red-600">
                        This student has medical conditions that require special attention. 
                        Ensure all medical staff are aware of these conditions.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Guardian Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent_guardian_name">Parent/Guardian Name</Label>
                    <Input
                      id="parent_guardian_name"
                      value={formData.parent_guardian_name}
                      onChange={(e) => handleInputChange('parent_guardian_name', e.target.value)}
                      placeholder="Enter parent/guardian name"
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent_guardian_phone">Guardian Phone Number</Label>
                    <Input
                      id="parent_guardian_phone"
                      value={formData.parent_guardian_phone}
                      onChange={(e) => handleInputChange('parent_guardian_phone', e.target.value)}
                      placeholder="e.g., +254712345678"
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="county">County</Label>
                    <Select value={formData.county} onValueChange={(value) => handleInputChange('county', value)}>
                      <SelectTrigger>
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
                    <Label htmlFor="sub_county">Sub-County</Label>
                    <Input
                      id="sub_county"
                      value={formData.sub_county}
                      onChange={(e) => handleInputChange('sub_county', e.target.value)}
                      placeholder="Enter sub-county"
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ward">Ward</Label>
                    <Input
                      id="ward"
                      value={formData.ward}
                      onChange={(e) => handleInputChange('ward', e.target.value)}
                      placeholder="Enter ward"
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="village">Village</Label>
                    <Input
                      id="village"
                      value={formData.village}
                      onChange={(e) => handleInputChange('village', e.target.value)}
                      placeholder="Enter village/location"
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="hover:scale-105 transition-transform">
              {loading ? (
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {student ? 'Update Student' : 'Save Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;
