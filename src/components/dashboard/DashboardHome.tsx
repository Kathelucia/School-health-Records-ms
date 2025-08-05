
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Stethoscope,
  Shield,
  FileText,
  Bell,
  Clock
} from 'lucide-react';

interface DashboardHomeProps {
  userRole: string;
  onNavigate: (view: string) => void;
}

const DashboardHome = ({ userRole, onNavigate }: DashboardHomeProps) => {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    todayVisits: 0,
    chronicConditions: 0,
    lowStockMedications: 0,
    pendingFollowUps: 0,
    recentVisits: [],
    urgentAlerts: [],
    upcomingTasks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch students
      const { data: students } = await supabase
        .from('students')
        .select('*')
        .eq('is_active', true);

      // Fetch today's visits
      const { data: todayVisits } = await supabase
        .from('clinic_visits')
        .select(`
          *,
          students(full_name, student_id, form_level)
        `)
        .gte('visit_date', today)
        .order('visit_date', { ascending: false })
        .limit(5);

      // Fetch recent visits (last 5)
      const { data: recentVisits } = await supabase
        .from('clinic_visits')
        .select(`
          *,
          students(full_name, student_id, form_level)
        `)
        .order('visit_date', { ascending: false })
        .limit(5);

      // Fetch low stock medications
      const { data: medications } = await supabase
        .from('medications')
        .select('*')
        .lte('quantity_in_stock', 'minimum_stock_level');

      // Fetch pending follow-ups
      const { data: followUps } = await supabase
        .from('clinic_visits')
        .select(`
          *,
          students(full_name, student_id)
        `)
        .eq('follow_up_required', true)
        .gte('follow_up_date', today);

      const totalStudents = students?.length || 0;
      const chronicConditions = students?.filter(s => s.chronic_conditions && s.chronic_conditions.trim()).length || 0;

      // Create urgent alerts
      const urgentAlerts = [];
      
      if (medications && medications.length > 0) {
        urgentAlerts.push({
          type: 'medication',
          message: `${medications.length} medications are running low`,
          priority: 'high',
          action: () => onNavigate('medications')
        });
      }

      if (followUps && followUps.length > 0) {
        urgentAlerts.push({
          type: 'followup',
          message: `${followUps.length} students require follow-up`,
          priority: 'medium',
          action: () => onNavigate('clinic')
        });
      }

      setDashboardData({
        totalStudents,
        todayVisits: todayVisits?.length || 0,
        chronicConditions,
        lowStockMedications: medications?.length || 0,
        pendingFollowUps: followUps?.length || 0,
        recentVisits: recentVisits || [],
        urgentAlerts,
        upcomingTasks: followUps?.slice(0, 3) || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Urgent Alerts */}
      {dashboardData.urgentAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Bell className="w-5 h-5" />
              Urgent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardData.urgentAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span className="text-gray-900">{alert.message}</span>
                    <Badge variant={alert.priority === 'high' ? 'destructive' : 'outline'}>
                      {alert.priority}
                    </Badge>
                  </div>
                  <Button size="sm" onClick={alert.action}>
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('students')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">{dashboardData.totalStudents}</p>
              </div>
              <Users className="w-12 h-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('clinic')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Visits</p>
                <p className="text-3xl font-bold text-green-600">{dashboardData.todayVisits}</p>
              </div>
              <Stethoscope className="w-12 h-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chronic Conditions</p>
                <p className="text-3xl font-bold text-orange-600">{dashboardData.chronicConditions}</p>
              </div>
              <Shield className="w-12 h-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('medications')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-red-600">{dashboardData.lowStockMedications}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Follow-ups Due</p>
                <p className="text-3xl font-bold text-purple-600">{dashboardData.pendingFollowUps}</p>
              </div>
              <Clock className="w-12 h-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clinic Visits */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Clinic Visits
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => onNavigate('clinic')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardData.recentVisits.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentVisits.map((visit: any, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {visit.students?.full_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {visit.students?.student_id} | {visit.students?.form_level?.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {visit.visit_type?.replace('_', ' ')} - {new Date(visit.visit_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {visit.visit_type?.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Stethoscope className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No clinic visits recorded today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.upcomingTasks.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcomingTasks.map((task: any, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-blue-900">
                        Follow-up: {task.students?.full_name}
                      </p>
                      <p className="text-sm text-blue-700">
                        Due: {new Date(task.follow_up_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-blue-600 text-white">
                      Follow-up
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No upcoming tasks</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => onNavigate('students')}
            >
              <Users className="w-8 h-8" />
              <span className="text-sm">Add Student</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => onNavigate('clinic')}
            >
              <Stethoscope className="w-8 h-8" />
              <span className="text-sm">Record Visit</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => onNavigate('medications')}
            >
              <Activity className="w-8 h-8" />
              <span className="text-sm">Medications</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => onNavigate('immunizations')}
            >
              <Shield className="w-8 h-8" />
              <span className="text-sm">Immunizations</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => onNavigate('reports')}
            >
              <FileText className="w-8 h-8" />
              <span className="text-sm">Reports</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => onNavigate('bulk-upload')}
            >
              <TrendingUp className="w-8 h-8" />
              <span className="text-sm">Bulk Upload</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
