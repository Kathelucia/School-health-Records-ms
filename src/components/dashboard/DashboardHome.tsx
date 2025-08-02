
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Stethoscope, 
  Pill, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  Clock,
  FileText,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardHomeProps {
  userRole: string;
  onNavigate: (view: string) => void;
}

const DashboardHome = ({ userRole, onNavigate }: DashboardHomeProps) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    studentsWithAllergies: 0,
    studentsWithConditions: 0,
    totalVisits: 0,
    todayVisits: 0,
    followUpsRequired: 0,
    medicationsLowStock: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch student statistics
      const { data: students } = await supabase
        .from('students')
        .select('id, allergies, chronic_conditions, is_active');

      // Fetch visit statistics
      const [totalVisitsData, todayVisitsData, followUpData] = await Promise.all([
        supabase.from('clinic_visits').select('id', { count: 'exact', head: true }),
        supabase.from('clinic_visits').select('id', { count: 'exact', head: true }).gte('visit_date', today),
        supabase.from('clinic_visits').select('id', { count: 'exact', head: true }).eq('follow_up_required', true)
      ]);

      // Fetch recent visits for activity feed
      const { data: recentVisits } = await supabase
        .from('clinic_visits')
        .select(`
          id, visit_date, visit_type, symptoms,
          students (full_name, student_id)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (students) {
        setStats({
          totalStudents: students.length,
          activeStudents: students.filter(s => s.is_active).length,
          studentsWithAllergies: students.filter(s => s.allergies && s.allergies.trim()).length,
          studentsWithConditions: students.filter(s => s.chronic_conditions && s.chronic_conditions.trim()).length,
          totalVisits: totalVisitsData.count || 0,
          todayVisits: todayVisitsData.count || 0,
          followUpsRequired: followUpData.count || 0,
          medicationsLowStock: 3 // Mock data for now
        });

        // Set health alerts for students with conditions
        const alerts = students
          .filter(s => (s.allergies && s.allergies.trim()) || (s.chronic_conditions && s.chronic_conditions.trim()))
          .slice(0, 3)
          .map((student, index) => ({
            id: index,
            type: student.allergies ? 'allergy' : 'condition',
            message: student.allergies ? `Student has allergies: ${student.allergies}` : `Student has medical condition: ${student.chronic_conditions}`,
            severity: 'medium'
          }));
        setHealthAlerts(alerts);
      }

      if (recentVisits) {
        setRecentActivity(recentVisits.map((visit: any) => ({
          id: visit.id,
          type: 'visit',
          title: `Clinic Visit - ${visit.students?.full_name}`,
          description: visit.symptoms || 'Regular check-up',
          time: new Date(visit.visit_date).toLocaleString(),
          urgency: visit.visit_type === 'emergency' ? 'high' : 'normal'
        })));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Add New Student',
      description: 'Register a new student profile',
      icon: Users,
      action: () => onNavigate('students'),
      color: 'from-blue-500 to-blue-600',
      available: ['admin', 'nurse'].includes(userRole)
    },
    {
      title: 'Record Clinic Visit',
      description: 'Log a new clinic visit',
      icon: Stethoscope,
      action: () => onNavigate('clinic'),
      color: 'from-green-500 to-green-600',
      available: ['admin', 'nurse', 'medical_officer'].includes(userRole)
    },
    {
      title: 'Manage Medications',
      description: 'Update medication inventory',
      icon: Pill,
      action: () => onNavigate('medications'),
      color: 'from-purple-500 to-purple-600',
      available: ['admin', 'nurse'].includes(userRole)
    },
    {
      title: 'Generate Reports',
      description: 'View health analytics',
      icon: FileText,
      action: () => onNavigate('reports'),
      color: 'from-orange-500 to-orange-600',
      available: true
    }
  ].filter(action => action.available);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-green-50/30">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <Card key={i} className="h-32 bg-gray-100 border-0 animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-green-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Health Management Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Welcome back! Here's your school health overview for today.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 px-3 py-1 text-sm font-medium">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Access
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                  <p className="text-xs text-green-600">↗ {stats.activeStudents} active</p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Today's Visits</p>
                  <p className="text-3xl font-bold text-green-600">{stats.todayVisits}</p>
                  <p className="text-xs text-gray-500">{stats.totalVisits} total visits</p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Stethoscope className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Health Alerts</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.studentsWithAllergies + stats.studentsWithConditions}</p>
                  <p className="text-xs text-gray-500">Students requiring monitoring</p>
                </div>
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Follow-ups</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.followUpsRequired}</p>
                  <p className="text-xs text-gray-500">Scheduled appointments</p>
                </div>
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={action.action}
                    className="h-auto p-6 flex flex-col items-center space-y-3 border-2 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 group"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Health Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                Health Monitoring Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthAlerts.length > 0 ? (
                healthAlerts.map((alert: any) => (
                  <div key={alert.id} className="flex items-start space-x-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-orange-800">{alert.message}</p>
                      <Badge variant="secondary" className="mt-1 bg-orange-200 text-orange-700 text-xs">
                        {alert.type === 'allergy' ? 'Allergy Alert' : 'Medical Condition'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No active health alerts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
