
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Activity, 
  Heart, 
  Calendar,
  TrendingUp,
  Bell,
  Plus,
  ArrowRight,
  Stethoscope,
  Pill,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import HealthOverview from './HealthOverview';

interface DashboardHomeProps {
  userRole: string;
}

const DashboardHome = ({ userRole }: DashboardHomeProps) => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayVisits: 0,
    lowStockMeds: 0,
    pendingFollowUps: 0
  });

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivity();
    fetchUpcomingTasks();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total students
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch today's visits
      const today = new Date().toISOString().split('T')[0];
      const { count: todayVisitsCount } = await supabase
        .from('clinic_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_date', today);

      // Fetch low stock medications
      const { count: lowStockCount } = await supabase
        .from('medications')
        .select('*', { count: 'exact', head: true })
        .lt('quantity_in_stock', 10);

      // Fetch pending follow-ups
      const { count: followUpCount } = await supabase
        .from('clinic_visits')
        .select('*', { count: 'exact', head: true })
        .eq('follow_up_required', true)
        .gte('follow_up_date', today);

      setStats({
        totalStudents: studentCount || 0,
        todayVisits: todayVisitsCount || 0,
        lowStockMeds: lowStockCount || 0,
        pendingFollowUps: followUpCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: visits } = await supabase
        .from('clinic_visits')
        .select(`
          *,
          students(full_name, student_id)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(visits || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const fetchUpcomingTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: followUps } = await supabase
        .from('clinic_visits')
        .select(`
          *,
          students(full_name, student_id)
        `)
        .eq('follow_up_required', true)
        .gte('follow_up_date', today)
        .order('follow_up_date', { ascending: true })
        .limit(5);

      setUpcomingTasks(followUps || []);
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white shadow-lg">
          <h1 className="text-4xl font-bold mb-3">School Health Records System</h1>
          <p className="text-blue-100 text-xl mb-6">
            Comprehensive health management for student wellness and safety
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="secondary" 
              className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Record Visit
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600 font-medium px-6 py-3"
            >
              <Users className="w-5 h-5 mr-2" />
              Manage Students
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                  <p className="text-sm text-green-600 mt-1">Active enrollment</p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Today's Visits</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.todayVisits}</p>
                  <p className="text-sm text-gray-500 mt-1">Clinic consultations</p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Low Stock Items</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.lowStockMeds}</p>
                  <p className="text-sm text-orange-600 mt-1">Need restocking</p>
                </div>
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Follow-ups Due</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingFollowUps}</p>
                  <p className="text-sm text-purple-600 mt-1">Pending reviews</p>
                </div>
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Overview */}
        <HealthOverview />

        {/* Activity and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl">
                <Activity className="w-6 h-6 mr-3 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((visit: any) => (
                    <div key={visit.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{visit.students?.full_name}</p>
                        <p className="text-sm text-gray-600">{visit.visit_type} - {visit.diagnosis || 'General consultation'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(visit.visit_date).toLocaleDateString()} • {visit.students?.student_id}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-6">
                View All Activity
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl">
                <Bell className="w-6 h-6 mr-3 text-orange-600" />
                Upcoming Follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task: any) => (
                    <div key={task.id} className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.students?.full_name}</p>
                        <p className="text-sm text-gray-600">Follow-up visit required</p>
                        <p className="text-xs text-gray-500">
                          Due: {new Date(task.follow_up_date).toLocaleDateString()} • {task.students?.student_id}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No upcoming follow-ups</p>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-6">
                View All Tasks
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
