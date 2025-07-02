
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Mail, Phone, Building, Hash, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StaffFormProps {
  staff: any;
  onClose: () => void;
  onSave: () => void;
}

const departments = [
  'Administration',
  'Health Services',
  'Teaching Staff',
  'Support Staff',
  'IT Department',
  'Finance',
  'Maintenance',
  'Security',
  'Kitchen Staff',
  'Other'
];

const StaffForm = ({ staff, onClose, onSave }: StaffFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    employee_id: '',
    department: '',
    role: 'nurse',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_conditions: '',
    allergies: '',
    blood_group: '',
    nhif_number: '',
    is_active: true
  });

  useEffect(() => {
    if (staff) {
      setFormData({
        full_name: staff.full_name || '',
        email: staff.email || '',
        phone_number: staff.phone_number || '',
        employee_id: staff.employee_id || '',
        department: staff.department || '',
        role: staff.role || 'nurse',
        emergency_contact_name: staff.emergency_contact_name || '',
        emergency_contact_phone: staff.emergency_contact_phone || '',
        medical_conditions: staff.medical_conditions || '',
        allergies: staff.allergies || '',
        blood_group: staff.blood_group || '',
        nhif_number: staff.nhif_number || '',
        is_active: staff.is_active !== false
      });
    }
  }, [staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (staff) {
        // Update existing staff
        const { error } = await supabase
          .from('profiles')
          .update(formData)
          .eq('id', staff.id);

        if (error) throw error;
        toast.success('Staff member updated successfully');
      } else {
        // This would typically be handled during user registration
        toast.info('New staff members need to be registered through the authentication system');
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving staff:', error);
      toast.error('Error saving staff member: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <UserCheck className="w-6 h-6 mr-2 text-blue-600" />
            {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="staff@school.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      placeholder="+254 700 000 000"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="employee_id"
                      value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      placeholder="EMP001"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Medical & Emergency Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Medical & Emergency Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    placeholder="Contact person name"
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    placeholder="+254 700 000 000"
                  />
                </div>

                <div>
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Select value={formData.blood_group} onValueChange={(value) => setFormData({ ...formData, blood_group: value })}>
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

                <div>
                  <Label htmlFor="nhif_number">NHIF/SHA Number</Label>
                  <Input
                    id="nhif_number"
                    value={formData.nhif_number}
                    onChange={(e) => setFormData({ ...formData, nhif_number: e.target.value })}
                    placeholder="Enter NHIF or SHA number"
                  />
                </div>

                <div>
                  <Label htmlFor="medical_conditions">Medical Conditions</Label>
                  <Textarea
                    id="medical_conditions"
                    value={formData.medical_conditions}
                    onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                    placeholder="Any chronic conditions or ongoing medical issues..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="Food allergies, drug allergies, environmental allergies..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="btn-medical">
              {loading ? 'Saving...' : (staff ? 'Update Staff Member' : 'Add Staff Member')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StaffForm;
