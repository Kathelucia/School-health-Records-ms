
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Save, X, FileText, Shield, Phone, MapPin } from 'lucide-react';

interface StudentFormProps {
  student?: any;
  onClose: () => void;
  onSave: () => void;
}

const StudentForm = ({ student, onClose, onSave }: StudentFormProps) => {
  const [formData, setFormData] = useState({
    // Basic Information
    full_name: '',
    student_id: '',
    admission_number: '',
    date_of_birth: '',
    gender: '',
    form_level: '',
    stream: '',
    admission_date: '',
    
    // Contact Information
    county: '',
    sub_county: '',
    ward: '',
    village: '',
    parent_guardian_name: '',
    parent_guardian_phone: '',
    
    // Medical Information
    blood_group: '',
    allergies: '',
    chronic_conditions: '',
    nhif_number: '',
    sha_number: '',
    
    // Emergency Contact
    emergency_contact: {
      name: '',
      relationship: '',
      phone: '',
      address: ''
    }
  });
  
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

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
        admission_date: student.admission_date || '',
        county: student.county || '',
        sub_county: student.sub_county || '',
        ward: student.ward || '',
        village: student.village || '',
        parent_guardian_name: student.parent_guardian_name || '',
        parent_guardian_phone: student.parent_guardian_phone || '',
        blood_group: student.blood_group || '',
        allergies: student.allergies || '',
        chronic_conditions: student.chronic_conditions || '',
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
    
    // Validate required fields
    if (!formData.full_name) {
      toast.error('Full name is required');
      setActiveTab('basic');
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        ...formData,
        emergency_contact: JSON.stringify(formData.emergency_contact),
        is_active: true
      };

      if (student) {
        const { error } = await supabase
          .from('students')
          .update(submitData)
          .eq('id', student.id);
        
        if (error) throw error;
        toast.success('Student profile updated successfully');
      } else {
        const { error } = await supabase
          .from('students')
          .insert([submitData]);
        
        if (error) throw error;
        toast.success('Student profile created successfully');
      }
      
      onSave();
    } catch (error: any) {
      console.error('Error saving student:', error);
      toast.error('Error saving student: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergency_contact: {
        ...prev.emergency_contact,
        [field]: value
      }
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-6 border-b">
          <DialogTitle className="flex items-center text-2xl font-bold text-gray-900">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-white" />
            </div>
            {student ? 'Edit Student Profile' : 'Add New Student'}
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            {student ? 'Update student information and medical records' : 'Create a comprehensive student health profile'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </TabsTrigger>
              <TabsTrigger value="medical" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Medical
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-sm font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        placeholder="Enter student's full name"
                        required
                        className="border-2 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="student_id" className="text-sm font-medium">
                        Student ID
                      </Label>
                      <Input
                        id="student_id"
                        value={formData.student_id}
                        onChange={(e) => handleInputChange('student_id', e.target.value)}
                        placeholder="e.g., STU001"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admission_number" className="text-sm font-medium">
                        Admission Number
                      </Label>
                      <Input
                        id="admission_number"
                        value={formData.admission_number}
                        onChange={(e) => handleInputChange('admission_number', e.target.value)}
                        placeholder="e.g., 2024001"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth" className="text-sm font-medium">
                        Date of Birth
                      </Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium">
                        Gender
                      </Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="form_level" className="text-sm font-medium">
                        Form Level
                      </Label>
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
                      <Label htmlFor="stream" className="text-sm font-medium">
                        Stream
                      </Label>
                      <Input
                        id="stream"
                        value={formData.stream}
                        onChange={(e) => handleInputChange('stream', e.target.value)}
                        placeholder="e.g., East, West, North, South"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admission_date" className="text-sm font-medium">
                        Admission Date
                      </Label>
                      <Input
                        id="admission_date"
                        type="date"
                        value={formData.admission_date}
                        onChange={(e) => handleInputChange('admission_date', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Parent/Guardian Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parent_guardian_name" className="text-sm font-medium">
                          Parent/Guardian Name
                        </Label>
                        <Input
                          id="parent_guardian_name"
                          value={formData.parent_guardian_name}
                          onChange={(e) => handleInputChange('parent_guardian_name', e.target.value)}
                          placeholder="Enter parent/guardian name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="parent_guardian_phone" className="text-sm font-medium">
                          Phone Number
                        </Label>
                        <Input
                          id="parent_guardian_phone"
                          value={formData.parent_guardian_phone}
                          onChange={(e) => handleInputChange('parent_guardian_phone', e.target.value)}
                          placeholder="+254712345678"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergency_name" className="text-sm font-medium">
                          Emergency Contact Name
                        </Label>
                        <Input
                          id="emergency_name"
                          value={formData.emergency_contact.name}
                          onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                          placeholder="Emergency contact name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="emergency_relationship" className="text-sm font-medium">
                          Relationship
                        </Label>
                        <Input
                          id="emergency_relationship"
                          value={formData.emergency_contact.relationship}
                          onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                          placeholder="e.g., Mother, Father, Guardian"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="emergency_phone" className="text-sm font-medium">
                          Emergency Phone
                        </Label>
                        <Input
                          id="emergency_phone"
                          value={formData.emergency_contact.phone}
                          onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                          placeholder="+254712345678"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="emergency_address" className="text-sm font-medium">
                          Address
                        </Label>
                        <Textarea
                          id="emergency_address"
                          value={formData.emergency_contact.address}
                          onChange={(e) => handleEmergencyContactChange('address', e.target.value)}
                          placeholder="Emergency contact address"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="county" className="text-sm font-medium">
                        County
                      </Label>
                      <Input
                        id="county"
                        value={formData.county}
                        onChange={(e) => handleInputChange('county', e.target.value)}
                        placeholder="e.g., Nairobi"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sub_county" className="text-sm font-medium">
                        Sub County
                      </Label>
                      <Input
                        id="sub_county"
                        value={formData.sub_county}
                        onChange={(e) => handleInputChange('sub_county', e.target.value)}
                        placeholder="e.g., Westlands"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ward" className="text-sm font-medium">
                        Ward
                      </Label>
                      <Input
                        id="ward"
                        value={formData.ward}
                        onChange={(e) => handleInputChange('ward', e.target.value)}
                        placeholder="e.g., Parklands"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="village" className="text-sm font-medium">
                        Village/Estate
                      </Label>
                      <Input
                        id="village"
                        value={formData.village}
                        onChange={(e) => handleInputChange('village', e.target.value)}
                        placeholder="e.g., Parklands Estate"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="blood_group" className="text-sm font-medium">
                        Blood Group
                      </Label>
                      <Select value={formData.blood_group} onValueChange={(value) => handleInputChange('blood_group', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nhif_number" className="text-sm font-medium">
                        NHIF Number
                      </Label>
                      <Input
                        id="nhif_number"
                        value={formData.nhif_number}
                        onChange={(e) => handleInputChange('nhif_number', e.target.value)}
                        placeholder="NHIF number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sha_number" className="text-sm font-medium">
                        SHA Number
                      </Label>
                      <Input
                        id="sha_number"
                        value={formData.sha_number}
                        onChange={(e) => handleInputChange('sha_number', e.target.value)}
                        placeholder="SHA number"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="allergies" className="text-sm font-medium">
                        Known Allergies
                      </Label>
                      <Textarea
                        id="allergies"
                        value={formData.allergies}
                        onChange={(e) => handleInputChange('allergies', e.target.value)}
                        placeholder="List any known allergies (medications, food, environmental, etc.)"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="chronic_conditions" className="text-sm font-medium">
                        Chronic Conditions
                      </Label>
                      <Textarea
                        id="chronic_conditions"
                        value={formData.chronic_conditions}
                        onChange={(e) => handleInputChange('chronic_conditions', e.target.value)}
                        placeholder="List any chronic medical conditions (asthma, diabetes, etc.)"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
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
