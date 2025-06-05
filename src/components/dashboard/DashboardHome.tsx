
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
      // Optimize by running queries in parallel
      const today = new Date().toISOString().split('T')[0];
      
      const [
        studentsResult,
        visitsResult,
        medicationsResult,
        highRiskResult,
        recentVisitsResult
      ] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('clinic_visits').select('id', { count: 'exact', head: true }).gte('visit_date', today),
        supabase.from('medications').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('is_active', true).or('allergies.not.is.null,chronic_conditions.not.is.null'),
        supabase.from('clinic_visits').select('id,visit_date,diagnosis,students(full_name,student_id)').order('visit_date', { ascending: false }).limit(3)
      ]);

      setStats({
        totalStudents: studentsResult.count || 0,
        todayVisits: visitsResult.count || 0,
        totalMedications: medicationsResult.count || 0,
        highRiskStudents: highRiskResult.count || 0,
        recentVisits: recentVisitsResult.data || []
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
      color: 'text-blue-600'
    },
    {
      title: "Today's Visits",
      value: stats.todayVisits,
      icon: Stethoscope,
      color: 'text-green-600'
    },
    {
      title: 'Medications',
      value: stats.totalMedications,
      icon: Pill,
      color: 'text-purple-600'
    },
    {
      title: 'High-Risk Students',
      value: stats.highRiskStudents,
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏥 School Health Records Management System
        </h1>
        <p className="text-gray-600">
          Welcome to the secure health records platform for school medical personnel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
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
    </div>
  );
};

export default DashboardHome;
