
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
    <div className="min-h-screen bg-gradient-to-br from-muted/20 via-background to-secondary/5">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Professional Header Section */}
        <div className="card-professional p-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="icon-container bg-gradient-to-br from-primary to-accent">
                  <Users className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    Student Health Profiles
                  </h1>
                  <p className="text-muted-foreground text-lg">
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
                  className="btn-primary px-8 py-3 text-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Student
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Professional Stats Dashboard */}
        <div className="medical-grid animate-slide-up">
          <div className="stats-card group">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Students</p>
                <p className="text-4xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Registered in system</p>
              </div>
              <div className="icon-container bg-primary/10">
                <Users className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="stats-card group">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Records</p>
                <p className="text-4xl font-bold text-secondary">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Currently enrolled</p>
              </div>
              <div className="icon-container bg-secondary/10">
                <FileText className="w-8 h-8 text-secondary" />
              </div>
            </div>
          </div>

          <div className="stats-card group">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">With Allergies</p>
                <p className="text-4xl font-bold text-orange-500">{stats.withAllergies}</p>
                <p className="text-xs text-muted-foreground">Require monitoring</p>
              </div>
              <div className="icon-container bg-orange-50">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="stats-card group">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Medical Conditions</p>
                <p className="text-4xl font-bold text-red-500">{stats.withConditions}</p>
                <p className="text-xs text-muted-foreground">Special attention needed</p>
              </div>
              <div className="icon-container bg-red-50">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Search Section */}
        <div className="card-professional p-6 animate-scale-in">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search students by name, ID, admission number, or form level..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-professional pl-12 h-14 text-base"
              />
            </div>
            <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl border-2 hover:scale-105 transition-transform">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Professional Student Grid */}
        <div className="space-y-6">
          {loading ? (
            <div className="medical-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="card-professional h-64 p-6 animate-pulse">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="medical-grid">
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
            <div className="card-professional p-12 text-center animate-fade-in">
              <div className="icon-container bg-muted/50 mx-auto mb-6">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">No students found</h3>
              <p className="text-muted-foreground text-lg mb-6">
                No students match your search criteria "{searchTerm}"
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                className="rounded-xl px-6"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <StudentEmptyState searchTerm={searchTerm} />
          )}
        </div>

        {/* Professional Add Student CTA */}
        {!loading && students.length === 0 && canManageStudents && (
          <div className="card-professional p-12 text-center glass-effect animate-scale-in">
            <div className="icon-container bg-gradient-to-br from-primary to-accent mx-auto mb-8 animate-float">
              <Plus className="w-12 h-12 text-primary-foreground" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-4">Get Started</h3>
            <p className="text-muted-foreground text-xl mb-8 max-w-md mx-auto">
              Begin building your student health database by adding your first student profile
            </p>
            <Button 
              onClick={handleAddStudent}
              size="lg"
              className="btn-primary px-10 py-4 text-lg"
            >
              <Plus className="w-6 h-6 mr-3" />
              Add Your First Student
            </Button>
          </div>
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
