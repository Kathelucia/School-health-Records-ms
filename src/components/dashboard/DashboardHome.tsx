import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Stethoscope, Syringe, Pill, TrendingUp, Calendar, AlertTriangle, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardHomeProps {
  userRole: string;
  onTabChange: (tab: string) => void;
}

const DashboardHome = ({ userRole, onTabChange }: DashboardHomeProps) => {
  console.log('DashboardHome rendered. userRole:', userRole);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    todayVisits: 0,
    totalVisits: 0,
    pendingImmunizations: 0,
    lowStockMedications: 0,
    recentVisits: [] as any[],
    recentImmunizations: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('userRole changed or DashboardHome mounted:', userRole);
    fetchDashboardData();
  }, [userRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch basic statistics with error handling
      const [
        studentsResult,
        visitsResult,
        todayVisitsResult,
        immunizationsResult,
        medicationsResult,
        recentVisitsResult,
        recentImmunizationsResult
      ] = await Promise.allSettled([
        supabase.from('students').select('id, is_active', { count: 'exact' }),
        supabase.from('clinic_visits').select('id', { count: 'exact' }),
        supabase.from('clinic_visits').select('id', { count: 'exact' }).gte('visit_date', new Date().toISOString().split('T')[0]),
        supabase.from('immunizations').select('id, next_dose_date', { count: 'exact' }),
        supabase.from('medications').select('id, quantity_in_stock, minimum_stock_level', { count: 'exact' }),
        supabase.from('clinic_visits').select(`
          id, visit_date, visit_type, diagnosis,
          students(full_name, student_id)
        `).order('visit_date', { ascending: false }).limit(5),
        supabase.from('immunizations').select(`
          id, vaccine_name, date_administered,
          students(full_name, student_id)
        `).order('date_administered', { ascending: false }).limit(5)
      ]);

      // Process students data
      let totalStudents = 0;
      let activeStudents = 0;
      if (studentsResult.status === 'fulfilled' && studentsResult.value.data) {
        totalStudents = studentsResult.value.count || 0;
        activeStudents = studentsResult.value.data.filter(s => s.is_active).length;
      }

      // Process visits data
      let totalVisits = 0;
      let todayVisits = 0;
      if (visitsResult.status === 'fulfilled') {
        totalVisits = visitsResult.value.count || 0;
      }
      if (todayVisitsResult.status === 'fulfilled') {
        todayVisits = todayVisitsResult.value.count || 0;
      }

      // Process immunizations data
      let pendingImmunizations = 0;
      if (immunizationsResult.status === 'fulfilled' && immunizationsResult.value.data) {
        const today = new Date().toISOString().split('T')[0];
        pendingImmunizations = immunizationsResult.value.data.filter(
          i => i.next_dose_date && i.next_dose_date <= today
        ).length;
      }

      // Process medications data
      let lowStockMedications = 0;
      if (medicationsResult.status === 'fulfilled' && medicationsResult.value.data) {
        lowStockMedications = medicationsResult.value.data.filter(
          m => m.quantity_in_stock <= m.minimum_stock_level
        ).length;
      }

      // Process recent visits
      let recentVisits: any[] = [];
      if (recentVisitsResult.status === 'fulfilled' && recentVisitsResult.value.data) {
        recentVisits = recentVisitsResult.value.data;
      }

      // Process recent immunizations
      let recentImmunizations: any[] = [];
      if (recentImmunizationsResult.status === 'fulfilled' && recentImmunizationsResult.value.data) {
        recentImmunizations = recentImmunizationsResult.value.data;
      }

      setStats({
        totalStudents,
        activeStudents,
        todayVisits,
        totalVisits,
        pendingImmunizations,
        lowStockMedications,
        recentVisits,
        recentImmunizations
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Debug: Refresh Profile button handler
  const handleDebugRefreshProfile = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found in session.');
        return;
      }
      // Fetch profile from Supabase
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        console.log('Debug: Current profile from Supabase:', profile);
      }
    } catch (err) {
      console.error('Debug: Error in handleDebugRefreshProfile:', err);
    }
  };

  const getDashboardCards = () => {
    const baseCards = [
      {
        title: 'Total Students',
        value: stats.totalStudents,
        description: `${stats.activeStudents} active students`,
        icon: Users,
        color: 'text-blue-600'
      },
      {
        title: 'Today\'s Visits',
        value: stats.todayVisits,
        description: `${stats.totalVisits} total visits`,
        icon: Calendar,
        color: 'text-green-600'
      }
    ];

    // Add role-specific cards
    if (['nurse', 'clinical_officer', 'admin'].includes(userRole)) {
      baseCards.push(
        {
          title: 'Clinic Visits',
          value: stats.totalVisits,
          description: 'Total clinic visits',
          icon: Stethoscope,
          color: 'text-purple-600'
        },
        {
          title: 'Pending Immunizations',
          value: stats.pendingImmunizations,
          description: 'Due or overdue',
          icon: Syringe,
          color: 'text-orange-600'
        }
      );
    }

    if (['nurse', 'clinical_officer', 'admin'].includes(userRole)) {
      baseCards.push({
        title: 'Low Stock Medications',
        value: stats.lowStockMedications,
        description: 'Need restocking',
        icon: AlertTriangle,
        color: 'text-red-600'
      });
    }

    return baseCards;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Debug: Refresh Profile Button */}
      <div className="mb-4">
        <Button onClick={handleDebugRefreshProfile} variant="destructive">
          Debug: Refresh Profile
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">School Health Records Overview</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getDashboardCards().map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clinic Visits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-purple-600" />
              Recent Clinic Visits
            </CardTitle>
            <CardDescription>
              Latest student health visits
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentVisits.length > 0 ? (
              <div className="space-y-3">
                {stats.recentVisits.map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{visit.students?.full_name || 'Unknown Student'}</p>
                      <p className="text-sm text-gray-600">{visit.visit_type} - {visit.diagnosis || 'No diagnosis'}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(visit.visit_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent visits</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Immunizations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Syringe className="w-5 h-5 mr-2 text-orange-600" />
              Recent Immunizations
            </CardTitle>
            <CardDescription>
              Latest vaccination records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentImmunizations.length > 0 ? (
              <div className="space-y-3">
                {stats.recentImmunizations.map((immunization) => (
                  <div key={immunization.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{immunization.students?.full_name || 'Unknown Student'}</p>
                      <p className="text-sm text-gray-600">{immunization.vaccine_name}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(immunization.date_administered).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent immunizations</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks for health management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center" onClick={() => onTabChange('students')}>
              <Users className="w-5 h-5 mb-1" />
              <span className="text-xs">View Students</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center" onClick={() => onTabChange('clinic')}>
              <Stethoscope className="w-5 h-5 mb-1" />
              <span className="text-xs">New Visit</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center" onClick={() => onTabChange('immunizations')}>
              <Syringe className="w-5 h-5 mb-1" />
              <span className="text-xs">Immunizations</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center" onClick={() => onTabChange('medication')}>
              <Pill className="w-5 h-5 mb-1" />
              <span className="text-xs">Medications</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
