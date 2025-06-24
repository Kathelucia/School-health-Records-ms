import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const roleOptions = [
  { value: 'admin', label: 'System Administrator' },
  { value: 'nurse', label: 'School Nurse' },
  { value: 'clinical_officer', label: 'Clinical Officer' },
  { value: 'it_support', label: 'IT Support' },
  { value: 'other_staff', label: 'Staff Member' },
];

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('full_name');
    if (!error && data) setStaff(data);
    setLoading(false);
  };

  const handleRoleChange = async (id, newRole) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    if (!error) {
      setStaff(staff => staff.map(s => s.id === id ? { ...s, role: newRole } : s));
      toast.success('Role updated');
    } else {
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
            <div>Loading staff...</div>
          ) : filteredStaff.length === 0 ? (
            <div>No staff found.</div>
          ) : (
            <div className="space-y-4">
              {filteredStaff.map(staff => (
                <div key={staff.id} className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2 gap-2">
                  <div>
                    <div className="font-semibold">{staff.full_name}</div>
                    <div className="text-xs text-gray-500">{staff.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={staff.role} onValueChange={value => handleRoleChange(staff.id, value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
