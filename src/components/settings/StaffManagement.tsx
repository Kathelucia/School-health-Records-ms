
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'nurse', label: 'School Nurse' }
];

interface StaffProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  user_role: string;
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, user_role')
        .order('full_name');
      
      if (error) {
        console.error('Error fetching staff:', error);
        toast.error('Failed to load staff');
      } else if (data) {
        setStaff(data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          user_role: newRole 
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating role:', error);
        toast.error('Failed to update role');
      } else {
        setStaff(staff => 
          staff.map(s => 
            s.id === id 
              ? { ...s, role: newRole, user_role: newRole } 
              : s
          )
        );
        toast.success('Role updated successfully');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const filteredStaff = staff.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Staff Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search staff by name, email, or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-4"
          />
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading staff...</span>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {search ? `No staff found matching "${search}"` : 'No staff found.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStaff.map(staffMember => (
                <div key={staffMember.id} className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 gap-2">
                  <div>
                    <div className="font-semibold">{staffMember.full_name}</div>
                    <div className="text-sm text-gray-500">{staffMember.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={staffMember.user_role || staffMember.role} 
                      onValueChange={value => handleRoleChange(staffMember.id, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
