
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StudentFormProps {
  student?: any;
  onClose: () => void;
  onSave: () => void;
}

const StudentForm = ({ student, onClose, onSave }: StudentFormProps) => {
  const [formData, setFormData] = useState({
    full_name: student?.full_name || '',
    student_id: student?.student_id || '',
    admission_number: student?.admission_number || '',
    gender: student?.gender || '',
    date_of_birth: student?.date_of_birth ? new Date(student.date_of_birth) : null,
    admission_date: student?.admission_date ? new Date(student.admission_date) : null,
    form_level: student?.form_level || '',
    stream: student?.stream || '',
    blood_group: student?.blood_group || '',
    allergies: student?.allergies || '',
    chronic_conditions: student?.chronic_conditions || '',
    parent_guardian_name: student?.parent_guardian_name || '',
    parent_guardian_phone: student?.parent_guardian_phone || '',
    county: student?.county || '',
    sub_county: student?.sub_county || '',
    ward: student?.ward || '',
    village: student?.village || '',
    emergency_contact: student?.emergency_contact || {}
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const studentData = {
        ...formData,
        date_of_birth: formData.date_of_birth?.toISOString().split('T')[0],
        admission_date: formData.admission_date?.toISOString().split('T')[0],
        emergency_contact: typeof formData.emergency_contact === 'string' 
          ? JSON.parse(formData.emergency_contact || '{}') 
          : formData.emergency_contact
      };

      if (student?.id) {
        const { error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', student.id);

        if (error) throw error;
        toast.success('Student updated successfully');
      } else {
        const { error } = await supabase
          .from('students')
          .insert(studentData);

        if (error) throw error;
        toast.success('Student added successfully');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving student:', error);
      toast.error(`Error saving student: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{student ? 'Edit Student' : 'Add New Student'}</CardTitle>
              <CardDescription>
                {student ? 'Update student information' : 'Enter student details and medical information'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="student_id">Student ID</Label>
                <Input
                  id="student_id"
                  value={formData.student_id}
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="admission_number">Admission Number</Label>
                <Input
                  id="admission_number"
                  value={formData.admission_number}
                  onChange={(e) => setFormData({...formData, admission_number: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date_of_birth ? format(formData.date_of_birth, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date_of_birth || undefined}
                      onSelect={(date) => setFormData({...formData, date_of_birth: date || null})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Admission Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.admission_date ? format(formData.admission_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.admission_date || undefined}
                      onSelect={(date) => setFormData({...formData, admission_date: date || null})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="form_level">Form Level</Label>
                <Select value={formData.form_level} onValueChange={(value) => setFormData({...formData, form_level: value})}>
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
              <div>
                <Label htmlFor="stream">Stream</Label>
                <Input
                  id="stream"
                  value={formData.stream}
                  onChange={(e) => setFormData({...formData, stream: e.target.value})}
                  placeholder="e.g., A, B, C"
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Medical Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Select value={formData.blood_group} onValueChange={(value) => setFormData({...formData, blood_group: value})}>
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
              </div>
              <div>
                <Label htmlFor="allergies">Known Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  placeholder="List any known allergies (food, medication, environmental, etc.)"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="chronic_conditions">Chronic Conditions</Label>
                <Textarea
                  id="chronic_conditions"
                  value={formData.chronic_conditions}
                  onChange={(e) => setFormData({...formData, chronic_conditions: e.target.value})}
                  placeholder="List any chronic medical conditions (asthma, diabetes, etc.)"
                  rows={3}
                />
              </div>
            </div>

            {/* Guardian Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parent_guardian_name">Parent/Guardian Name</Label>
                  <Input
                    id="parent_guardian_name"
                    value={formData.parent_guardian_name}
                    onChange={(e) => setFormData({...formData, parent_guardian_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="parent_guardian_phone">Parent/Guardian Phone</Label>
                  <Input
                    id="parent_guardian_phone"
                    value={formData.parent_guardian_phone}
                    onChange={(e) => setFormData({...formData, parent_guardian_phone: e.target.value})}
                    placeholder="+254..."
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    value={formData.county}
                    onChange={(e) => setFormData({...formData, county: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="sub_county">Sub County</Label>
                  <Input
                    id="sub_county"
                    value={formData.sub_county}
                    onChange={(e) => setFormData({...formData, sub_county: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="ward">Ward</Label>
                  <Input
                    id="ward"
                    value={formData.ward}
                    onChange={(e) => setFormData({...formData, ward: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="village">Village</Label>
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => setFormData({...formData, village: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Student'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentForm;
