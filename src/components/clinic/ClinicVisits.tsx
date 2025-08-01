
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Stethoscope, Users, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ClinicVisitForm from './ClinicVisitForm';
import ClinicVisitDetails from './ClinicVisitDetails';
import VisitCard from './VisitCard';
import StudentSelector from '@/components/students/StudentSelector';
import { ClinicVisit } from './types';

interface ClinicVisitsProps {
  userRole: string;
}

const ClinicVisits = ({ userRole }: ClinicVisitsProps) => {
  const [visits, setVisits] = useState<ClinicVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<ClinicVisit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingVisit, setEditingVisit] = useState<ClinicVisit | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<ClinicVisit | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalVisits: 0,
    todayVisits: 0,
    emergencyVisits: 0,
    followUpsNeeded: 0
  });

  useEffect(() => {
    fetchVisits();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = visits.filter((visit: ClinicVisit) =>
        visit.students?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.students?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.symptoms?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVisits(filtered);
    } else {
      setFilteredVisits(visits);
    }
  }, [searchTerm, visits]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_visits')
        .select(`
          *,
          students:student_id (
            id,
            full_name,
            student_id,
            admission_number,
            form_level,
            stream
          )
        `)
        .order('visit_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      const visitsData = data || [];
      setVisits(visitsData);
      setFilteredVisits(visitsData);
      
      // Calculate stats
      const today = new Date().toDateString();
      const todayVisits = visitsData.filter(visit => 
        new Date(visit.visit_date).toDateString() === today
      ).length;
      
      const emergencyVisits = visitsData.filter(visit => 
        visit.visit_type === 'emergency'
      ).length;
      
      const followUpsNeeded = visitsData.filter(visit => 
        visit.follow_up_required
      ).length;

      setStats({
        totalVisits: visitsData.length,
        todayVisits,
        emergencyVisits,
        followUpsNeeded
      });

    } catch (error: any) {
      console.error('Error fetching visits:', error);
      toast.error('Error loading clinic visits');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVisit = () => {
    setEditingVisit(null);
    setSelectedStudent(null);
    setShowForm(true);
  };

  const handleAddVisitForStudent = () => {
    setEditingVisit(null);
    setShowStudentSelector(true);
  };

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setShowStudentSelector(false);
    setShowForm(true);
  };

  const handleEditVisit = (visit: ClinicVisit) => {
    setEditingVisit(visit);
    setSelectedStudent(null);
    setShowForm(true);
  };

  const handleViewVisit = (visit: ClinicVisit) => {
    setSelectedVisit(visit);
    setShowDetails(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingVisit(null);
    setSelectedStudent(null);
  };

  const handleFormSave = () => {
    fetchVisits();
    setShowForm(false);
    setEditingVisit(null);
    setSelectedStudent(null);
  };

  const canManageVisits = ['admin', 'nurse'].includes(userRole);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">School Health Clinic</h1>
          <p className="text-gray-600 mt-1">
            Manage student clinic visits and health assessments
          </p>
        </div>
        {canManageVisits && (
          <div className="flex space-x-3">
            <Button onClick={handleAddVisitForStudent} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Visit for Student
            </Button>
            <Button onClick={handleAddVisit}>
              <Plus className="w-4 h-4 mr-2" />
              Quick Visit Entry
            </Button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVisits}</div>
            <p className="text-xs text-muted-foreground">All recorded visits</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Visits</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.todayVisits}</div>
            <p className="text-xs text-muted-foreground">Visits today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.emergencyVisits}</div>
            <p className="text-xs text-muted-foreground">Requiring urgent care</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups Needed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.followUpsNeeded}</div>
            <p className="text-xs text-muted-foreground">Scheduled follow-ups</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by student name, ID, diagnosis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Visit Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVisits.map((visit: ClinicVisit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              onEdit={handleEditVisit}
              onView={handleViewVisit}
              canEdit={canManageVisits}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredVisits.length === 0 && !loading && (
        <div className="text-center py-12">
          <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No matching visits found' : 'No clinic visits recorded'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchTerm 
              ? 'Try adjusting your search terms to find specific visits'
              : 'Start documenting student health visits to build comprehensive medical records'
            }
          </p>
          {canManageVisits && !searchTerm && (
            <div className="space-x-3">
              <Button onClick={handleAddVisitForStudent} variant="outline">
                Select Student First
              </Button>
              <Button onClick={handleAddVisit}>
                Quick Entry
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <ClinicVisitForm
          visit={editingVisit}
          student={selectedStudent}
          onClose={handleFormClose}
          onSave={handleFormSave}
          userProfile={userProfile}
        />
      )}

      <ClinicVisitDetails
        visit={selectedVisit}
        isOpen={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedVisit(null);
        }}
      />

      <StudentSelector
        isOpen={showStudentSelector}
        onClose={() => setShowStudentSelector(false)}
        onSelect={handleStudentSelect}
        title="Select Student for Clinic Visit"
      />
    </div>
  );
};

export default ClinicVisits;
