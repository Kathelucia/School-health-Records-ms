
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StudentForm from './StudentForm';
import StudentDetails from './StudentDetails';
import StudentCard from './StudentCard';
import StudentSearch from './StudentSearch';
import StudentEmptyState from './StudentEmptyState';

interface StudentProfilesProps {
  userRole: string;
}

const StudentProfiles = ({ userRole }: StudentProfilesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast.error('Error loading students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student: any) =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admission_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.form_level?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setShowForm(true);
    setSelectedStudent(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  const handleFormSave = () => {
    fetchStudents();
    setShowForm(false);
    setEditingStudent(null);
  };

  // Check if user has permission to add/edit students
  const canManageStudents = ['nurse', 'clinical_officer', 'admin'].includes(userRole);

  if (selectedStudent) {
    return (
      <StudentDetails
        student={selectedStudent}
        onBack={() => setSelectedStudent(null)}
        onEdit={() => handleEditStudent(selectedStudent)}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Health Profiles</h2>
          <p className="text-gray-600">Manage student health records and medical information</p>
        </div>
        {canManageStudents && (
          <Button onClick={handleAddStudent}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        )}
      </div>

      <StudentSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Students Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading students...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student: any) => (
            <StudentCard
              key={student.id}
              student={student}
              onClick={() => setSelectedStudent(student)}
            />
          ))}
        </div>
      )}

      {filteredStudents.length === 0 && !loading && (
        <StudentEmptyState searchTerm={searchTerm} />
      )}

      {/* Student Form Modal */}
      {showForm && (
        <StudentForm
          student={editingStudent}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
};

export default StudentProfiles;
