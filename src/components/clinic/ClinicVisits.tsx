
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Stethoscope, Calendar, User, AlertCircle, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ClinicVisitForm from './ClinicVisitForm';
import StudentSelector from '@/components/students/StudentSelector';

interface ClinicVisitsProps {
  userRole: string;
}

const ClinicVisits = ({ userRole }: ClinicVisitsProps) => {
  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchVisits();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = visits.filter((visit: any) =>
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
        .limit(50);

      if (error) throw error;
      setVisits(data || []);
      setFilteredVisits(data || []);
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

  const handleEditVisit = (visit: any) => {
    setEditingVisit(visit);
    setSelectedStudent(null);
    setShowForm(true);
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

  const getVisitTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'sick_visit': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'follow_up': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'screening': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getVisitTypeLabel = (type: string) => {
    switch (type) {
      case 'sick_visit': return 'Sick Visit';
      case 'follow_up': return 'Follow-up';
      case 'screening': return 'Screening';
      case 'emergency': return 'Emergency';
      default: return 'Routine';
    }
  };

  const canManageVisits = ['admin', 'nurse'].includes(userRole);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clinic Visits</h2>
          <p className="text-gray-600">Manage student clinic visits and health records</p>
        </div>
        {canManageVisits && (
          <div className="flex space-x-2">
            <Button onClick={handleAddVisitForStudent} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Visit for Student
            </Button>
            <Button onClick={handleAddVisit}>
              <Plus className="w-4 h-4 mr-2" />
              Quick Add Visit
            </Button>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by student name, ID, diagnosis, or symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVisits.map((visit: any) => (
            <Card key={visit.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleEditVisit(visit)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{visit.students?.full_name || 'Unknown Student'}</CardTitle>
                      <CardDescription>
                        ID: {visit.students?.student_id || 'N/A'} • {visit.students?.form_level?.replace('_', ' ')} {visit.students?.stream}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getVisitTypeColor(visit.visit_type)} border`}>
                    {getVisitTypeLabel(visit.visit_type)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(visit.visit_date).toLocaleDateString()}</span>
                </div>

                {visit.symptoms && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700">Symptoms</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{visit.symptoms}</p>
                  </div>
                )}

                {visit.diagnosis && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Diagnosis</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{visit.diagnosis}</p>
                  </div>
                )}

                {visit.temperature && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Temperature:</span>
                    <span className="font-medium">{visit.temperature}°C</span>
                  </div>
                )}

                {visit.follow_up_required && (
                  <div className="flex items-center space-x-1 text-sm text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>Follow-up required</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredVisits.length === 0 && !loading && (
        <div className="text-center py-12">
          <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No visits found' : 'No clinic visits recorded'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Start by recording your first clinic visit'
            }
          </p>
          {canManageVisits && !searchTerm && (
            <Button onClick={handleAddVisit}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Visit
            </Button>
          )}
        </div>
      )}

      {showForm && (
        <ClinicVisitForm
          visit={editingVisit}
          student={selectedStudent}
          onClose={handleFormClose}
          onSave={handleFormSave}
          userProfile={userProfile}
        />
      )}

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
