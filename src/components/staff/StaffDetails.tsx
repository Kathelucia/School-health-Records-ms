
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  UserCheck, 
  Mail, 
  Phone, 
  Building, 
  Hash,
  Heart,
  Calendar,
  AlertTriangle,
  Shield,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StaffDetailsProps {
  staff: any;
  onBack: () => void;
  onEdit: () => void;
}

const StaffDetails = ({ staff, onBack, onEdit }: StaffDetailsProps) => {
  const [clinicVisits, setClinicVisits] = useState([]);
  const [immunizations, setImmunizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffHealthData();
  }, [staff.id]);

  const fetchStaffHealthData = async () => {
    try {
      // Note: In a real implementation, you'd have separate tables for staff clinic visits
      // For now, we'll use the existing student tables structure
      setLoading(false);
    } catch (error) {
      console.error('Error fetching staff health data:', error);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mr-4 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Staff List
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserCheck className="w-8 h-8 mr-3 text-blue-600" />
              {staff.full_name}
            </h2>
            <p className="text-gray-600">Staff Health Profile</p>
          </div>
        </div>
        <Button onClick={onEdit} className="btn-medical">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{staff.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{staff.phone_number || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Hash className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Employee ID</p>
                    <p className="font-medium">{staff.employee_id || 'Not assigned'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium">{staff.department || 'General'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <Badge className={staff.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}>
                    {staff.role === 'admin' ? 'Administrator' : 'Nurse'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={staff.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {staff.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {staff.blood_group && (
                <div>
                  <p className="text-sm text-gray-600">Blood Group</p>
                  <p className="font-medium text-red-600">{staff.blood_group}</p>
                </div>
              )}

              {staff.medical_conditions && (
                <div>
                  <p className="text-sm text-gray-600">Medical Conditions</p>
                  <p className="font-medium">{staff.medical_conditions}</p>
                </div>
              )}

              {staff.allergies && (
                <div>
                  <p className="text-sm text-gray-600">Allergies</p>
                  <p className="font-medium text-orange-600">{staff.allergies}</p>
                </div>
              )}

              {staff.nhif_number && (
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">NHIF/SHA Number</p>
                    <p className="font-medium">{staff.nhif_number}</p>
                  </div>
                </div>
              )}

              {!staff.medical_conditions && !staff.allergies && !staff.blood_group && (
                <div className="text-center py-6 text-gray-500">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No medical information recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Emergency Contact */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              {staff.emergency_contact_name ? (
                <div className="space-y-2">
                  <p className="font-medium">{staff.emergency_contact_name}</p>
                  {staff.emergency_contact_phone && (
                    <p className="text-sm text-gray-600">{staff.emergency_contact_phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No emergency contact recorded</p>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Account Created</p>
                <p className="font-medium">{new Date(staff.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">{new Date(staff.updated_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {/* Add clinic visit functionality */}}
              >
                <Heart className="w-4 h-4 mr-2" />
                Record Health Visit
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {/* Add immunization functionality */}}
              >
                <Shield className="w-4 h-4 mr-2" />
                Update Immunizations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffDetails;
