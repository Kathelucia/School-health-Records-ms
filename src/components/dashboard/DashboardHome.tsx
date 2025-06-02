
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Stethoscope, 
  Pill, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardHomeProps {
  userRole: string;
}

const DashboardHome = ({ userRole }: DashboardHomeProps) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayVisits: 0,
    totalMedications: 0,
    highRiskStudents: 0,
    recentVisits: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch total students
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch today's visits
      const today = new Date().toISOString().split('T')[0];
      const { count: todayVisitsCount } = await supabase
        .from('clinic_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_date', today)
        .lt('visit_date', today + 'T23:59:59');

      // Fetch medications count
      const { count: medicationsCount } = await supabase
        .from('medications')
        .select('*', { count: 'exact', head: true });

      // Fetch high-risk students (those with allergies or chronic conditions)
      const { count: highRiskCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .or('allergies.not.is.null,chronic_conditions.not.is.null');

      // Fetch recent visits
      const { data: recentVisits } = await supabase
        .from('clinic_visits')
        .select(`
          *,
          students(full_name, student_id)
        `)
        .order('visit_date', { ascending: false })
        .limit(5);

      setStats({
        totalStudents: studentsCount || 0,
        todayVisits: todayVisitsCount || 0,
        totalMedications: medicationsCount || 0,
        highRiskStudents: highRiskCount || 0,
        recentVisits: recentVisits || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      description: 'Active student profiles',
      color: 'text-blue-600'
    },
    {
      title: "Today's Visits",
      value: stats.todayVisits,
      icon: Stethoscope,
      description: 'Clinic visits today',
      color: 'text-green-600'
    },
    {
      title: 'Medications',
      value: stats.totalMedications,
      icon: Pill,
      description: 'Available medications',
      color: 'text-purple-600'
    },
    {
      title: 'High-Risk Students',
      value: stats.highRiskStudents,
      icon: AlertTriangle,
      description: 'Students with medical alerts',
      color: 'text-red-600'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏥 School Health Records Management System
        </h1>
        <p className="text-gray-600">
          Welcome to the secure health records platform for school medical personnel
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Clinic Visits
            </CardTitle>
            <CardDescription>
              Latest student visits to the clinic
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentVisits.length > 0 ? (
              <div className="space-y-3">
                {stats.recentVisits.map((visit: any) => (
                  <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{visit.students?.full_name}</p>
                      <p className="text-sm text-gray-600">{visit.diagnosis || 'General visit'}</p>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              System Features
            </CardTitle>
            <CardDescription>
              Available functionality in the health records system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-blue-50 rounded">
                <Users className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium">Student Profiles</p>
                  <p className="text-sm text-gray-600">Manage comprehensive health records</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-green-50 rounded">
                <Stethoscope className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium">Clinic Visits</p>
                  <p className="text-sm text-gray-600">Log and track medical consultations</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-purple-50 rounded">
                <Pill className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium">Medication Inventory</p>
                  <p className="text-sm text-gray-600">Track medication stock and dispensing</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-orange-50 rounded">
                <TrendingUp className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <p className="font-medium">Health Reports</p>
                  <p className="text-sm text-gray-600">Generate analytics and compliance reports</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for medical personnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-medium">Add New Student</h3>
              <p className="text-sm text-gray-600">Register a new student profile</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Stethoscope className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-medium">Log Clinic Visit</h3>
              <p className="text-sm text-gray-600">Record a new medical consultation</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Calendar className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-medium">View Today's Schedule</h3>
              <p className="text-sm text-gray-600">Check today's appointments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
