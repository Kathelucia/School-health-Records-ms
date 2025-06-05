
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Settings as SettingsIcon, Shield, Bell } from 'lucide-react';

interface SettingsProps {
  userProfile: any;
  onProfileUpdate: (profile: any) => void;
}

const Settings = ({ userProfile, onProfileUpdate }: SettingsProps) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    employee_id: '',
    department: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (userProfile && initialLoad) {
      console.log('Loading profile data:', userProfile);
      setFormData({
        full_name: userProfile.full_name || '',
        email: userProfile.email || '',
        phone_number: userProfile.phone_number || '',
        employee_id: userProfile.employee_id || '',
        department: userProfile.department || '',
        role: userProfile.role || 'other_staff'
      });
      setInitialLoad(false);
    }
  }, [userProfile, initialLoad]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile?.id) {
      toast.error('No user profile found. Please refresh the page.');
      return;
    }

    setLoading(true);

    try {
      console.log('Updating profile for user:', userProfile.id);
      console.log('Update data:', {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        employee_id: formData.employee_id,
        department: formData.department
      });

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          phone_number: formData.phone_number.trim() || null,
          employee_id: formData.employee_id.trim() || null,
          department: formData.department.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      console.log('Profile updated successfully:', data);
      onProfileUpdate(data);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'nurse': return 'School Nurse';
      case 'clinical_officer': return 'Clinical Officer';
      case 'it_support': return 'IT Support';
      case 'admin': return 'System Administrator';
      case 'other_staff': return 'Staff Member';
      default: return 'User';
    }
  };

  if (!userProfile) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" />
          Account Settings
        </h2>
        <p className="text-gray-600">Manage your profile information and account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      placeholder="e.g., +254 700 123 456"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employee_id">Employee ID</Label>
                    <Input
                      id="employee_id"
                      value={formData.employee_id}
                      onChange={(e) => handleInputChange('employee_id', e.target.value)}
                      placeholder="Enter your employee ID"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="e.g., Health Services"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={getRoleDisplayName(formData.role)}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Contact admin to change role</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Current Role</Label>
                <p className="text-sm font-semibold">{getRoleDisplayName(userProfile?.role)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Account Status</Label>
                <p className="text-sm font-semibold text-green-600">Active</p>
              </div>
              {userProfile?.updated_at && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                  <p className="text-sm">{new Date(userProfile.updated_at).toLocaleDateString()}</p>
                </div>
              )}
              {userProfile?.created_at && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Member Since</Label>
                  <p className="text-sm">{new Date(userProfile.created_at).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email notifications</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">System alerts</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Medication alerts</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Enabled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
