
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, FileText, AlertCircle, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StudentForm from './StudentForm';
import StudentDetails from './StudentDetails';
import StudentCard from './StudentCard';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-green-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Student Health Profiles
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Comprehensive health records management system
                  </p>
                </div>
              </div>
            </div>
            
            {canManageStudents && (
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleAddStudent}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Student
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-500">Registered in system</p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Records</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                  <p className="text-xs text-gray-500">Currently enrolled</p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">With Allergies</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.withAllergies}</p>
                  <p className="text-xs text-gray-500">Require monitoring</p>
                </div>
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Medical Conditions</p>
                  <p className="text-3xl font-bold text-red-600">{stats.withConditions}</p>
                  <p className="text-xs text-gray-500">Special attention needed</p>
                </div>
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search students by name, ID, admission number, or form level..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-0 rounded-xl"
                />
              </div>
              <Button variant="outline" size="lg" className="h-12 px-6 rounded-xl border-2">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <Card key={i} className="h-64 bg-gray-100 border-0">
                  <CardContent className="p-6 animate-pulse">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-32"></div>
                          <div className="h-3 bg-gray-300 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-300 rounded"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student: any, index) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onClick={() => setSelectedStudent(student)}
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              ))}
            </div>
          ) : searchTerm ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-600 mb-4">
                  No students match your search criteria "{searchTerm}"
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                  className="rounded-xl"
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <StudentEmptyState searchTerm={searchTerm} />
          )}
        </div>

        {/* Add Student CTA - Show when no students exist */}
        {!loading && students.length === 0 && canManageStudents && (
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Plus className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Started</h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                Begin building your student health database by adding your first student profile
              </p>
              <Button 
                onClick={handleAddStudent}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Student
              </Button>
            </CardContent>
          </Card>
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
