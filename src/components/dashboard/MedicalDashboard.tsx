
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Stethoscope, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Shield,
  Pill,
  Activity,
  Clock,
  UserCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MedicalDashboardProps {
  userRole: string;
}

const MedicalDashboard = ({ userRole }: MedicalDashboardProps) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayVisits: 0,
    activeAlerts: 0,
    pendingFollowUps: 0,
    immunizationCompliance: 0,
    criticalMedications: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch various statistics
      const today = new Date().toDateString();
      
      const [
        studentsResult,
        visitsResult,
        medicationsResult
      ] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('clinic_visits').select('id', { count: 'exact' }).gte('visit_date', today),
        supabase.from('medications').select('id', { count: 'exact' }).lte('quantity_in_stock', 10)
      ]);

      setStats({
        totalStudents: studentsResult.count || 0,
        todayVisits: visitsResult.count || 0,
        activeAlerts: 3, // Mock data
        pendingFollowUps: 5, // Mock data
        immunizationCompliance: 85, // Mock data
        criticalMedications: medicationsResult.count || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'New Clinic Visit',
      description: 'Record student visit',
      icon: Stethoscope,
      href: '/clinic',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Student Lookup',
      description: 'Search health records',
      icon: Users,
      href: '/students',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Medication Stock',
      description: 'Check inventory',
      icon: Pill,
      href: '/medications',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Generate Report',
      description: 'Health analytics',
      icon: TrendingUp,
      href: '/reports',
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  const alerts = [
    {
      type: 'critical',
      title: 'Low Medication Stock',
      message: 'Paracetamol tablets below minimum threshold',
      time: '10 minutes ago'
    },
    {
      type: 'warning',
      title: 'Follow-up Required',
      message: '5 students need scheduled follow-up visits',
      time: '1 hour ago'
    },
    {
      type: 'info',
      title: 'Vaccination Schedule',
      message: 'Grade 7 vaccination campaign next week',
      time: '2 hours ago'
    }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!
        </h1>
        <p className="text-blue-100">
          Welcome to the School Health Records Management System. Here's your daily overview.
        </p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active health profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Visits</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.todayVisits}</div>
            <p className="text-xs text-muted-foreground">Clinic consultations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vaccination Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.immunizationCompliance}%</div>
            <p className="text-xs text-muted-foreground">Compliance rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Frequently used medical operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                className={`${action.color} text-white h-auto p-4 flex flex-col items-center space-y-2`}
                onClick={() => window.location.href = action.href}
              >
                <action.icon className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.type === 'critical' ? 'bg-red-500' :
                  alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
              <div className="flex items-center space-x-3">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Clinic Visits</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">{stats.todayVisits}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Immunizations Given</span>
              </div>
              <Badge className="bg-green-100 text-green-800">12</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
              <div className="flex items-center space-x-3">
                <Pill className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Medications Dispensed</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800">28</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicalDashboard;
