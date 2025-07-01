
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
  Thermometer,
  Heart,
  Scale,
  AlertTriangle,
  Edit
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
  const [todayVisits, setTodayVisits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchUserProfile();
    fetchVisits();
  }, []);

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
          students(full_name, student_id, form_level, stream),
          profiles:attended_by(full_name)
        `)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      
      const allVisits = data || [];
      setVisits(allVisits);

      const today = new Date().toISOString().split('T')[0];
      const todayVisitsData = allVisits.filter((visit: any) => 
        visit.visit_date?.startsWith(today)
      );
      setTodayVisits(todayVisitsData);
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
    visit.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.symptoms?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVisitTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'injury': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'sick': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'medication': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'follow_up': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'routine': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddVisit = () => {
    setEditingVisit(null);
    setShowForm(true);
  };

  const handleEditVisit = (visit: any) => {
    setEditingVisit(visit);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingVisit(null);
  };

  const handleFormSave = () => {
    fetchVisits();
    setShowForm(false);
    setEditingVisit(null);
  };

  // Both admin and nurse can manage visits
  const canManageVisits = ['admin', 'nurse'].includes(userRole);

  const VisitCard = ({ visit, showEdit = true }: { visit: any, showEdit?: boolean }) => (
    <Card key={visit.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{visit.students?.full_name || 'Unknown Student'}</CardTitle>
              <CardDescription>
                {visit.students?.student_id} • {visit.students?.form_level?.replace('_', ' ')} {visit.students?.stream}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getVisitTypeColor(visit.visit_type)}>
              {visit.visit_type?.replace('_', ' ')}
            </Badge>
            {showEdit && canManageVisits && (
              <Button variant="outline" size="sm" onClick={() => handleEditVisit(visit)}>
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>{new Date(visit.visit_date).toLocaleString()}</span>
          </div>
          
          {visit.symptoms && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Symptoms:</span>
              <p className="text-gray-600 mt-1">{visit.symptoms}</p>
            </div>
          )}
          
          {visit.diagnosis && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Diagnosis:</span>
              <p className="text-gray-600 mt-1">{visit.diagnosis}</p>
            </div>
          )}
          
          {visit.treatment_given && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Treatment:</span>
              <p className="text-gray-600 mt-1">{visit.treatment_given}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm">
            {visit.temperature && (
              <div className="flex items-center">
                <Thermometer className="w-4 h-4 mr-1 text-red-500" />
                <span>{visit.temperature}°C</span>
              </div>
            )}
            {visit.pulse_rate && (
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1 text-pink-500" />
                <span>{visit.pulse_rate} bpm</span>
              </div>
            )}
            {visit.blood_pressure && (
              <div className="flex items-center">
                <span className="text-gray-600">BP: {visit.blood_pressure}</span>
              </div>
            )}
            {visit.weight && (
              <div className="flex items-center">
                <Scale className="w-4 h-4 mr-1 text-blue-500" />
                <span>{visit.weight} kg</span>
              </div>
            )}
          </div>

          {visit.follow_up_required && (
            <div className="flex items-center text-sm text-amber-600">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span>Follow-up required: {visit.follow_up_date ? new Date(visit.follow_up_date).toLocaleDateString() : 'Date TBD'}</span>
            </div>
          )}

          {visit.profiles && (
            <div className="text-xs text-gray-500 border-t pt-2">
              Attended by: {visit.profiles.full_name}
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
          <p className="text-gray-600">Manage student clinic visits and medical records</p>
        </div>
        {canManageVisits && (
          <Button onClick={handleAddVisit}>
            <Plus className="w-4 h-4 mr-2" />
            New Visit
          </Button>
        )}
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today's Visits ({todayVisits.length})</TabsTrigger>
          <TabsTrigger value="all">All Visits</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500">Loading visits...</div>
            </div>
          ) : todayVisits.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {todayVisits.map((visit: any) => (
                <VisitCard key={visit.id} visit={visit} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No visits today</h3>
              <p className="text-gray-600">No clinic visits have been recorded for today yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search visits by student name, ID, diagnosis, or symptoms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500">Loading visits...</div>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No visits found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'No clinic visits have been recorded yet'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showForm && (
        <ClinicVisitForm
          visit={editingVisit}
          onClose={handleFormClose}
          onSave={handleFormSave}
          userProfile={userProfile}
        />
      )}
    </div>
  );
};

export default ClinicVisits;
