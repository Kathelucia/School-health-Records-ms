
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, FileText, AlertCircle } from 'lucide-react';
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
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    withAllergies: 0,
    withConditions: 0
  });

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id, full_name, student_id, admission_number, form_level, stream, 
          gender, date_of_birth, county, sub_county, chronic_conditions, 
          allergies, blood_group, parent_guardian_name, parent_guardian_phone,
          is_active, created_at
        `)
        .eq('is_active', true)
        .order('full_name')
        .limit(100);

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast.error('Error loading students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: allStudents } = await supabase
        .from('students')
        .select('allergies, chronic_conditions, is_active')
        .eq('is_active', true);

      if (allStudents) {
        setStats({
          total: allStudents.length,
          active: allStudents.filter(s => s.is_active).length,
          withAllergies: allStudents.filter(s => s.allergies && s.allergies.trim()).length,
          withConditions: allStudents.filter(s => s.chronic_conditions && s.chronic_conditions.trim()).length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    
    const term = searchTerm.toLowerCase();
    return students.filter((student: any) =>
      student.full_name?.toLowerCase().includes(term) ||
      student.student_id?.toLowerCase().includes(term) ||
      student.admission_number?.toLowerCase().includes(term) ||
      student.form_level?.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

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
    fetchStats();
    setShowForm(false);
    setEditingStudent(null);
  };

  const canManageStudents = ['admin', 'nurse'].includes(userRole);

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
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                Student Health Profiles
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive health records management for all students
              </p>
            </div>
            {canManageStudents && (
              <Button 
                onClick={handleAddStudent}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Student
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Active Students</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">With Allergies</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.withAllergies}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Chronic Conditions</p>
                    <p className="text-2xl font-bold text-red-600">{stats.withConditions}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <StudentSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Students Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student: any) => (
              <StudentCard
                key={student.id}
                student={student}
                onClick={() => setSelectedStudent(student)}
              />
            ))}
          </div>
        ) : (
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
    </div>
  );
};

export default StudentProfiles;
