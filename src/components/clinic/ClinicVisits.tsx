
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Stethoscope, TrendingUp, Calendar, Users, Filter, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ClinicVisitForm from './ClinicVisitForm';
import ClinicVisitDetails from './ClinicVisitDetails';
import VisitCard from './VisitCard';

interface ClinicVisitsProps {
  userRole: string;
}

const ClinicVisits = ({ userRole }: ClinicVisitsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVisits: 0,
    todayVisits: 0,
    followUpsRequired: 0,
    avgVisitsPerDay: 0
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
          id, student_id, visit_date, visit_type, symptoms, diagnosis,
          treatment_given, temperature, blood_pressure, pulse_rate,
          follow_up_required, follow_up_date, notes, created_at,
          students (
            id, full_name, student_id, admission_number, form_level, stream
          )
        `)
        .order('visit_date', { ascending: false })
        .limit(50);

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
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [totalData, todayData, followUpData, weekData] = await Promise.all([
        supabase.from('clinic_visits').select('id', { count: 'exact', head: true }),
        supabase.from('clinic_visits').select('id', { count: 'exact', head: true }).gte('visit_date', today),
        supabase.from('clinic_visits').select('id', { count: 'exact', head: true }).eq('follow_up_required', true),
        supabase.from('clinic_visits').select('id', { count: 'exact', head: true }).gte('visit_date', weekAgo)
      ]);

      setStats({
        totalVisits: totalData.count || 0,
        todayVisits: todayData.count || 0,
        followUpsRequired: followUpData.count || 0,
        avgVisitsPerDay: Math.round((weekData.count || 0) / 7)
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
      visit.symptoms?.toLowerCase().includes(term) ||
      visit.diagnosis?.toLowerCase().includes(term) ||
      visit.visit_type?.toLowerCase().includes(term)
    );
  }, [visits, searchTerm]);

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

  const canManageVisits = ['admin', 'nurse', 'medical_officer'].includes(userRole);

  if (selectedVisit) {
    return (
      <ClinicVisitDetails
        visit={selectedVisit}
        isOpen={true}
        onClose={() => setSelectedVisit(null)}
      />
    );
  }

  const todayVisits = visits.filter((visit: any) => {
    const visitDate = new Date(visit.visit_date).toDateString();
    const today = new Date().toDateString();
    return visitDate === today;
  });

  const recentVisits = visits.slice(0, 5);
  const followUpVisits = visits.filter((visit: any) => visit.follow_up_required);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-green-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Medical Center Management
                  </h1>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Comprehensive student health monitoring and clinic visit tracking system
                  </p>
                </div>
              </div>
            </div>
            
            {canManageVisits && (
              <Button 
                onClick={handleAddVisit}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <Plus className="w-5 h-5 mr-3" />
                Record New Visit
              </Button>
            )}
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Visits</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalVisits}</p>
                  <p className="text-xs text-gray-500">All recorded visits</p>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Stethoscope className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Today's Visits</p>
                  <p className="text-3xl font-bold text-green-600">{stats.todayVisits}</p>
                  <p className="text-xs text-gray-500">Current day activity</p>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Follow-ups</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.followUpsRequired}</p>
                  <p className="text-xs text-gray-500">Require attention</p>
                </div>
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Daily Average</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.avgVisitsPerDay}</p>
                  <p className="text-xs text-gray-500">Past 7 days</p>
                </div>
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white border-0 shadow-lg rounded-xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search visits by student name, symptoms, diagnosis, or visit type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-0 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200"
                />
              </div>
              <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl border-2 font-semibold">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Visits */}
          <Card className="bg-white border-0 shadow-lg rounded-xl">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="flex items-center text-xl font-bold">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                Today's Visits ({todayVisits.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {todayVisits.length > 0 ? (
                todayVisits.slice(0, 5).map((visit: any) => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    onView={() => handleViewVisit(visit)}
                    onEdit={() => handleEditVisit(visit)}
                    canEdit={canManageVisits}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No visits today</p>
                  <p className="text-gray-400 text-sm mt-1">Clinic visits will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Visits */}
          <Card className="bg-white border-0 shadow-lg rounded-xl">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="flex items-center text-xl font-bold">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {recentVisits.map((visit: any) => (
                <VisitCard
                  key={visit.id}
                  visit={visit}
                  onView={() => handleViewVisit(visit)}
                  onEdit={() => handleEditVisit(visit)}
                  canEdit={canManageVisits}
                />
              ))}
            </CardContent>
          </Card>

          {/* Follow-up Required */}
          <Card className="bg-white border-0 shadow-lg rounded-xl">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="flex items-center text-xl font-bold">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                Follow-ups ({followUpVisits.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {followUpVisits.length > 0 ? (
                followUpVisits.slice(0, 5).map((visit: any) => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    onView={() => handleViewVisit(visit)}
                    onEdit={() => handleEditVisit(visit)}
                    canEdit={canManageVisits}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No follow-ups required</p>
                  <p className="text-gray-400 text-sm mt-1">Patient follow-ups will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        {searchTerm && (
          <Card className="bg-white border-0 shadow-lg rounded-xl">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center justify-between">
                <span className="text-xl font-bold">Search Results ({filteredVisits.length})</span>
                {searchTerm && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
                    "{searchTerm}"
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {filteredVisits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVisits.map((visit: any) => (
                    <VisitCard
                      key={visit.id}
                      visit={visit}
                      onView={() => handleViewVisit(visit)}
                      onEdit={() => handleEditVisit(visit)}
                      canEdit={canManageVisits}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No matching visits found</h3>
                  <p className="text-gray-600 text-base">Try adjusting your search terms or browse recent visits above</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && visits.length === 0 && (
          <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-0 shadow-lg rounded-2xl">
            <CardContent className="p-16 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Stethoscope className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the Medical Center</h3>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                Start building comprehensive student health records by recording clinic visits, tracking treatments, and monitoring follow-up care
              </p>
              {canManageVisits && (
                <Button 
                  onClick={handleAddVisit}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                >
                  <Plus className="w-6 h-6 mr-3" />
                  Record Your First Visit
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Forms */}
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
