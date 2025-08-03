
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, User, Loader2 } from 'lucide-react';
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

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }
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
      <DialogContent className="max-w-2xl max-h-[70vh] bg-white">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, student ID, or admission number..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-12 bg-white border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Searching students...</span>
              </div>
            ) : students.length > 0 ? (
              students.map((student: any) => (
                <Card 
                  key={student.id} 
                  className="cursor-pointer hover:bg-blue-50 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500"
                  onClick={() => handleSelect(student)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{student.full_name}</h3>
                        <div className="text-sm text-gray-600 space-x-4">
                          <span className="font-medium">ID: {student.student_id}</span>
                          {student.admission_number && (
                            <span>Adm: {student.admission_number}</span>
                          )}
                          <span className="capitalize">
                            {student.form_level?.replace('_', ' ')} {student.stream}
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-700 font-medium mb-2">
                  {searchTerm ? 'No students found' : 'Start searching'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {searchTerm 
                    ? 'No students match your search criteria' 
                    : 'Type at least 2 characters to search for students'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentSelector;
