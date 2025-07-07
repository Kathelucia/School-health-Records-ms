
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Stethoscope, 
  Calendar,
  User,
  AlertTriangle,
  Activity,
  Thermometer
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ClinicVisitForm from './ClinicVisitForm';

interface ClinicVisitsProps {
  userRole: string;
}

const ClinicVisits = ({ userRole }: ClinicVisitsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visits, setVisits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchVisits();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(profile);
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchVisits = async () => {
    try {
      // Fixed query - removed the problematic join on attended_by
      const { data: visitData, error } = await supabase
        .from('clinic_visits')
        .select(`
          *,
          students(full_name, student_id, form_level)
        `)
        .order('visit_date', { ascending: false });

      if (error) throw error;

      setVisits(visitData || []);
    } catch (error: any) {
      console.error('Error fetching visits:', error);
      toast.error('Error loading clinic visits');
    } finally {
      setLoading(false);
    }
  };

  const filteredVisits = visits.filter((visit: any) =>
    visit.students?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.students?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddVisit = (visit?: any) => {
    setSelectedVisit(visit || null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedVisit(null);
  };

  const handleFormSave = () => {
    fetchVisits();
    setShowForm(false);
    setSelectedVisit(null);
  };

  const canManageVisits = ['nurse', 'clinical_officer', 'admin'].includes(userRole);

  const VisitCard = ({ visit }: { visit: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{visit.students?.full_name}</CardTitle>
              <CardDescription>
                {visit.students?.student_id} • {visit.students?.form_level?.replace('_', ' ')}
              </CardDescription>
            </div>
          </div>
          <Badge variant={visit.visit_type === 'emergency' ? 'destructive' : 'default'}>
            {visit.visit_type || 'routine'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>{new Date(visit.visit_date).toLocaleDateString()}</span>
          </div>
          
          {visit.symptoms && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Symptoms:</span>
              <span className="ml-1 text-gray-600">{visit.symptoms}</span>
            </div>
          )}
          
          {visit.diagnosis && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Diagnosis:</span>
              <span className="ml-1 text-gray-600">{visit.diagnosis}</span>
            </div>
          )}
          
          {visit.temperature && (
            <div className="flex items-center text-sm">
              <Thermometer className="w-4 h-4 mr-2 text-gray-400" />
              <span>{visit.temperature}°C</span>
            </div>
          )}
          
          {visit.attended_by && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Attended by:</span>
              <span className="ml-1 text-gray-600">{visit.attended_by}</span>
            </div>
          )}
          
          {visit.follow_up_required && (
            <div className="flex items-center text-sm text-orange-600">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span>Follow-up required</span>
              {visit.follow_up_date && (
                <span className="ml-1">on {new Date(visit.follow_up_date).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clinic Visits</h2>
          <p className="text-gray-600">Manage student health visits and records</p>
        </div>
        {canManageVisits && (
          <Button onClick={() => handleAddVisit()}>
            <Plus className="w-4 h-4 mr-2" />
            New Visit
          </Button>
        )}
      </div>

      <Tabs defaultValue="visits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visits">All Visits</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="follow-up">Follow-up Required</TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by student name, ID, or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500">Loading clinic visits...</div>
            </div>
          ) : filteredVisits.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredVisits.map((visit: any) => (
                <VisitCard key={visit.id} visit={visit} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clinic visits found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'No clinic visits have been recorded yet'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visits.slice(0, 10).map((visit: any) => (
              <VisitCard key={visit.id} visit={visit} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="follow-up" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visits.filter((visit: any) => visit.follow_up_required).map((visit: any) => (
              <VisitCard key={visit.id} visit={visit} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {showForm && (
        <ClinicVisitForm
          visit={selectedVisit}
          onClose={handleFormClose}
          onSave={handleFormSave}
          userProfile={userProfile}
        />
      )}
    </div>
  );
};

export default ClinicVisits;
