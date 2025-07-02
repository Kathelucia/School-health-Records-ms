
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StudentSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (student: any) => void;
  title?: string;
}

const StudentSelector = ({ isOpen, onClose, onSelect, title = "Select Student" }: StudentSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  const fetchStudents = async (search = '') => {
    setLoading(true);
    try {
      let query = supabase
        .from('students')
        .select('id, full_name, student_id, admission_number, form_level, stream')
        .eq('is_active', true)
        .order('full_name');

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,student_id.ilike.%${search}%,admission_number.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.length >= 2 || value.length === 0) {
      fetchStudents(value);
    }
  };

  const handleSelect = (student: any) => {
    onSelect(student);
    onClose();
    setSearchTerm('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[70vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, student ID, or admission number..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8">Loading students...</div>
            ) : students.length > 0 ? (
              students.map((student: any) => (
                <Card 
                  key={student.id} 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSelect(student)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{student.full_name}</h3>
                        <div className="text-sm text-gray-600 space-x-4">
                          <span>ID: {student.student_id}</span>
                          {student.admission_number && (
                            <span>Adm: {student.admission_number}</span>
                          )}
                          <span>{student.form_level?.replace('_', ' ')} {student.stream}</span>
                        </div>
                      </div>
                      <Button size="sm">Select</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No students found matching your search' : 'Start typing to search for students'}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentSelector;
