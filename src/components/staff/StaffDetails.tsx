
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Building, 
  User, 
  Heart,
  AlertTriangle,
  Droplet
} from 'lucide-react';

interface StaffDetailsProps {
  staff: any;
  onBack: () => void;
  onEdit: () => void;
}

const StaffDetails = ({ staff, onBack, onEdit }: StaffDetailsProps) => {
  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Staff
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{staff.full_name}</h2>
            <p className="text-gray-600">Staff ID: {staff.employee_id || 'Not assigned'}</p>
          </div>
        </div>
        <Button onClick={onEdit} className="btn-medical">
          <Edit className="w-4 h-4 mr-2" />
          Edit Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Email</span>
                  </div>
                  <p className="font-medium">{staff.email}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Phone</span>
                  </div>
                  <p className="font-medium">{staff.phone_number || 'Not provided'}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Department</span>
                  </div>
                  <p className="font-medium">{staff.department || 'General'}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Role</span>
                  </div>
                  <Badge className={staff.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}>
                    {staff.role === 'admin' ? 'Administrator' : 'School Nurse'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Contact Name</span>
                    <p className="font-medium">{staff.emergency_contact_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Contact Phone</span>
                    <p className="font-medium">{staff.emergency_contact_phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Information */}
        <div>
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-600" />
                Health Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Droplet className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-gray-600">Blood Group</span>
                </div>
                <p className="font-medium">{staff.blood_group || 'Not specified'}</p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-600">Allergies</span>
                </div>
                <p className="text-sm text-gray-700">
                  {staff.allergies || 'No known allergies'}
                </p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-gray-600">Medical Conditions</span>
                </div>
                <p className="text-sm text-gray-700">
                  {staff.medical_conditions || 'No medical conditions reported'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="medical-card mt-6">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${staff.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">
                  {staff.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Added on {new Date(staff.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffDetails;
