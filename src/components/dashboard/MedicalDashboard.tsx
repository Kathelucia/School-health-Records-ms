
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Stethoscope, 
  Pill, 
  Syringe, 
  AlertTriangle, 
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';

interface MedicalDashboardProps {
  userRole: string;
}

const MedicalDashboard = ({ userRole }: MedicalDashboardProps) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayVisits: 0,
    lowStockMeds: 0,
    pendingImmunizations: 0,
    weeklyVisits: 0,
    criticalAlerts: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch total students
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      // Fetch today's clinic visits
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

      // Fetch this week's visits for trend
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weeklyVisitsCount } = await supabase
        .from('clinic_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_date', weekAgo.toISOString().split('T')[0]);

      setStats({
        totalStudents: studentCount || 0,
        todayVisits: todayVisitsCount || 0,
        lowStockMeds: lowStockCount || 0,
        pendingImmunizations: 15, // Mock data
        weeklyVisits: weeklyVisitsCount || 0,
        criticalAlerts: (lowStockCount || 0) > 5 ? 1 : 0
      });

      // Mock recent activity data
      setRecentActivity([
        { id: 1, type: 'visit', description: 'New clinic visit recorded', time: '2 minutes ago' },
        { id: 2, type: 'medication', description: 'Medication dispensed', time: '15 minutes ago' },
        { id: 3, type: 'immunization', description: 'Vaccination record updated', time: '1 hour ago' }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'visit':
        return <Stethoscope className="w-4 h-4 text-blue-600" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-green-600" />;
      case 'immunization':
        return <Syringe className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Health Dashboard</h2>
        <p className="text-gray-600">Overview of school health metrics and recent activity</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
            <p className="text-xs text-green-600 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Active enrollment
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Visits</CardTitle>
              <Stethoscope className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.todayVisits}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.weeklyVisits} this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Low Stock Alerts</CardTitle>
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.lowStockMeds}</div>
            {stats.lowStockMeds > 0 && (
              <Badge variant="secondary" className="mt-1 text-xs bg-orange-100 text-orange-800">
                Needs attention
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Vaccination Rate</CardTitle>
              <Syringe className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">94%</div>
            <Progress value={94} className="mt-2 h-2" />
            <p className="text-xs text-gray-500 mt-1">School compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity: any) => (
              <div key={activity.id} className="flex items-start space-x-3 py-2">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Record New Visit</div>
                    <div className="text-sm text-gray-500">Log a clinic visit</div>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Add New Student</div>
                    <div className="text-sm text-gray-500">Create student profile</div>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Pill className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">Update Inventory</div>
                    <div className="text-sm text-gray-500">Manage medications</div>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicalDashboard;
