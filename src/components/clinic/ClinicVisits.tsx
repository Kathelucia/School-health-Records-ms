
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Stethoscope, 
  Plus, 
  Calendar, 
  Users, 
  Activity,
  Search,
  Filter,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ClinicVisitForm from './ClinicVisitForm';
import ClinicVisitDetails from './ClinicVisitDetails';
import VisitCard from './VisitCard';

interface ClinicVisitsProps {
  userRole: string;
}

const ClinicVisits = ({ userRole }: ClinicVisitsProps) => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [editingVisit, setEditingVisit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    todayVisits: 0,
    weeklyVisits: 0,
    pendingFollowUps: 0,
    totalVisits: 0
  });

  useEffect(() => {
    fetchVisits();
    fetchStats();
  }, []);

  const fetchVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_visits')
        .select(`
          *,
          students (
            id,
            full_name,
            student_id,
            form_level,
            stream
          )
        `)
        .order('visit_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setVisits(data || []);
    } catch (error: any) {
      console.error('Error fetching visits:', error);
      toast.error('Error loading clinic visits');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Today's visits
      const { count: todayCount } = await supabase
        .from('clinic_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_date', today);

      // Weekly visits
      const { count: weeklyCount } = await supabase
        .from('clinic_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_date', weekAgo.toISOString().split('T')[0]);

      // Pending follow-ups
      const { count: followUpCount } = await supabase
        .from('clinic_visits')
        .select('*', { count: 'exact', head: true })
        .eq('follow_up_required', true)
        .gte('follow_up_date', today);

      // Total visits
      const { count: totalCount } = await supabase
        .from('clinic_visits')
        .select('*', { count: 'exact', head: true });

      setStats({
        todayVisits: todayCount || 0,
        weeklyVisits: weeklyCount || 0,
        pendingFollowUps: followUpCount || 0,
        totalVisits: totalCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredVisits = useMemo(() => {
    if (!searchTerm) return visits;
    
    const term = searchTerm.toLowerCase();
    return visits.filter((visit: any) =>
      visit.students?.full_name?.toLowerCase().includes(term) ||
      visit.students?.student_id?.toLowerCase().includes(term) ||
      visit.diagnosis?.toLowerCase().includes(term) ||
      visit.symptoms?.toLowerCase().includes(term) ||
      visit.visit_type?.toLowerCase().includes(term)
    );
  }, [visits, searchTerm]);

  const todaysVisits = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return filteredVisits.filter((visit: any) => 
      visit.visit_date?.startsWith(today)
    );
  }, [filteredVisits]);

  const followUpVisits = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return filteredVisits.filter((visit: any) => 
      visit.follow_up_required && visit.follow_up_date >= today
    );
  }, [filteredVisits]);

  const handleAddVisit = () => {
    setEditingVisit(null);
    setShowForm(true);
  };

  const handleEditVisit = (visit: any) => {
    setEditingVisit(visit);
    setShowForm(true);
    setSelectedVisit(null);
  };

  const handleViewVisit = (visit: any) => {
    setSelectedVisit(visit);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingVisit(null);
  };

  const handleFormSave = () => {
    fetchVisits();
    fetchStats();
    setShowForm(false);
    setEditingVisit(null);
  };

  const canManageVisits = ['admin', 'nurse'].includes(userRole);

  if (selectedVisit) {
    return (
      <ClinicVisitDetails
        visit={selectedVisit}
        onEdit={() => handleEditVisit(selectedVisit)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Stethoscope className="w-8 h-8 mr-3 text-blue-600" />
                Clinic Visits
              </h1>
              <p className="text-gray-600 mt-2">
                Complete medical consultation and visit management system
              </p>
            </div>
            {canManageVisits && (
              <Button 
                onClick={handleAddVisit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Visit
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Today's Visits</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.todayVisits}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">This Week</p>
                    <p className="text-2xl font-bold text-green-600">{stats.weeklyVisits}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Follow-ups Due</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pendingFollowUps}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Visits</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalVisits}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by student name, ID, diagnosis, or symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>

        {/* Visits Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="all">All Visits</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : filteredVisits.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredVisits.map((visit: any) => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    onView={handleViewVisit}
                    onEdit={handleEditVisit}
                    canEdit={canManageVisits}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No visits found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms' : 'No clinic visits recorded yet'}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="today">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {todaysVisits.map((visit: any) => (
                <VisitCard
                  key={visit.id}
                  visit={visit}
                  onView={handleViewVisit}
                  onEdit={handleEditVisit}
                  canEdit={canManageVisits}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="follow-ups">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {followUpVisits.map((visit: any) => (
                <VisitCard
                  key={visit.id}
                  visit={visit}
                  onView={handleViewVisit}
                  onEdit={handleEditVisit}
                  canEdit={canManageVisits}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Form Modal */}
        {showForm && (
          <ClinicVisitForm
            visit={editingVisit}
            onClose={handleFormClose}
            onSave={handleFormSave}
          />
        )}
      </div>
    </div>
  );
};

export default ClinicVisits;
