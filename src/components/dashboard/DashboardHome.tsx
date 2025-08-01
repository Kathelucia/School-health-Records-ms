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
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import HealthOverview from './HealthOverview';

interface DashboardHomeProps {
  userRole: string;
}

const DashboardHome = ({ userRole }: DashboardHomeProps) => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  useEffect(() => {
    fetchRecentActivity();
    fetchUpcomingTasks();
  }, []);

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
      // Fetch follow-up visits
      const { data: followUps } = await supabase
        .from('clinic_visits')
        .select(`
          *,
          students(full_name, student_id)
        `)
        .eq('follow_up_required', true)
        .gte('follow_up_date', new Date().toISOString().split('T')[0])
        .order('follow_up_date', { ascending: true })
        .limit(3);

      setUpcomingTasks(followUps || []);
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to School Health Records System</h1>
        <p className="text-blue-100 text-lg">
          Your comprehensive platform for managing student health and medical records
        </p>
        <div className="flex items-center mt-4 space-x-4">
          <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
            <Plus className="w-4 h-4 mr-2" />
            New Clinic Visit
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
            <Users className="w-4 h-4 mr-2" />
            View Students
          </Button>
        </div>
      </div>

      {/* Health Overview */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Health Overview</h2>
        <HealthOverview />
      </div>

      {/* Recent Activity and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((visit: any) => (
                  <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{visit.students?.full_name}</p>
                      <p className="text-sm text-gray-600">{visit.visit_type} - {visit.diagnosis || 'General consultation'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(visit.visit_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-blue-600">
                        {visit.students?.student_id}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Activity
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-orange-600" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                    <div>
                      <p className="font-medium">{task.students?.full_name}</p>
                      <p className="text-sm text-gray-600">Follow-up visit required</p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(task.follow_up_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-orange-600">
                        {task.students?.student_id}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No upcoming tasks</p>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Tasks
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span>Add Student</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
            <Activity className="w-8 h-8 text-green-600" />
            <span>New Visit</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
            <Heart className="w-8 h-8 text-red-600" />
            <span>Check Medications</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span>View Reports</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
