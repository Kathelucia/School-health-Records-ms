
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Users, UserCheck, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StaffForm from './StaffForm';
import StaffDetails from './StaffDetails';

interface StaffProfilesProps {
  userRole: string;
}

const StaffProfiles = ({ userRole }: StaffProfilesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      toast.error('Error loading staff profiles');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = useMemo(() => {
    if (!searchTerm) return staff;
    
    const term = searchTerm.toLowerCase();
    return staff.filter((member: any) =>
      member.full_name?.toLowerCase().includes(term) ||
      member.email?.toLowerCase().includes(term) ||
      member.employee_id?.toLowerCase().includes(term) ||
      member.department?.toLowerCase().includes(term)
    );
  }, [staff, searchTerm]);

  const handleAddStaff = () => {
    setEditingStaff(null);
    setShowForm(true);
  };

  const handleEditStaff = (staffMember: any) => {
    setEditingStaff(staffMember);
    setShowForm(true);
    setSelectedStaff(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingStaff(null);
  };

  const handleFormSave = () => {
    fetchStaff();
    setShowForm(false);
    setEditingStaff(null);
  };

  if (selectedStaff) {
    return (
      <StaffDetails
        staff={selectedStaff}
        onBack={() => setSelectedStaff(null)}
        onEdit={() => handleEditStaff(selectedStaff)}
      />
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserCheck className="w-8 h-8 mr-3 text-blue-600" />
            Staff Health Profiles
          </h2>
          <p className="text-gray-600 mt-1">Manage staff health records and medical information</p>
        </div>
        <Button onClick={handleAddStaff} className="btn-medical">
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search staff by name, email, ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        
        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold">{staff.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">{staff.filter((s: any) => s.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((staffMember: any, index) => (
            <Card
              key={staffMember.id}
              className="medical-card hover-scale cursor-pointer transition-all duration-200"
              onClick={() => setSelectedStaff(staffMember)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{staffMember.full_name}</CardTitle>
                      <p className="text-sm text-gray-600">{staffMember.employee_id || 'No ID'}</p>
                    </div>
                  </div>
                  <Badge className={staffMember.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}>
                    {staffMember.role === 'admin' ? 'Administrator' : 'Nurse'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium truncate">{staffMember.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Department</p>
                    <p className="font-medium">{staffMember.department || 'General'}</p>
                  </div>
                </div>
                
                {staffMember.phone_number && (
                  <div>
                    <p className="text-gray-500 text-sm">Phone</p>
                    <p className="font-medium">{staffMember.phone_number}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500">
                    Added {new Date(staffMember.created_at).toLocaleDateString()}
                  </span>
                  <div className={`w-3 h-3 rounded-full ${staffMember.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredStaff.length === 0 && !loading && (
        <div className="text-center py-12">
          <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No staff found' : 'No staff members yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Add staff members to start managing their health records'
            }
          </p>
          {!searchTerm && (
            <Button onClick={handleAddStaff} className="btn-medical">
              <Plus className="w-4 h-4 mr-2" />
              Add First Staff Member
            </Button>
          )}
        </div>
      )}

      {showForm && (
        <StaffForm
          staff={editingStaff}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
};

export default StaffProfiles;
