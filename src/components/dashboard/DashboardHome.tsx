
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Stethoscope, 
  Pill, 
  Calendar,
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProfileDebugger from '@/components/debug/ProfileDebugger';

interface DashboardHomeProps {
  userRole: string;
}

const DashboardHome = ({ userRole }: DashboardHomeProps) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayVisits: 0,
    lowStockMedications: 0,
    expiringMedications: 0,
    recentVisits: [],
    urgentAlerts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total students
      const { data: studentsCount } = await supabase
        .from('students')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      // Fetch today's visits
      const today = new Date().toISOString().split('T')[0];
      const { data: todayVisitsData } = await supabase
        .from('clinic_visits')
        .select('id', { count: 'exact' })
        .gte('visit_date', today);

      // Fetch recent visits
      const { data: recentVisitsData } = await supabase
        .from('clinic_visits')
        .select(`
          id,
          visit_date,
          visit_type,
          diagnosis,
          students(full_name, student_id)
        `)
        .order('visit_date', { ascending: false })
        .limit(5);

      // Fetch medication alerts
      const { data: medications } = await supabase
        .from('medications')
        .select('*');

      let lowStockCount = 0;
      let expiringCount = 0;
      const urgentAlerts: any[] = [];

      medications?.forEach((med: any) => {
        // Check low stock
        if (med.quantity_in_stock <= med.minimum_stock_level) {
          lowStockCount++;
          if (med.quantity_in_stock === 0) {
            urgentAlerts.push({
              type: 'out_of_stock',
              message: `${med.name} is out of stock`,
              severity: 'high'
            });
          }
        }

        // Check expiring medications
        if (med.expiry_date) {
          const today = new Date();
          const expiry = new Date(med.expiry_date);
          const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
            expiringCount++;
            if (daysUntilExpiry <= 7) {
              urgentAlerts.push({
                type: 'expiring_soon',
                message: `${med.name} expires in ${daysUntilExpiry} days`,
                severity: daysUntilExpiry <= 3 ? 'high' : 'medium'
              });
            }
          } else if (daysUntilExpiry < 0) {
            urgentAlerts.push({
              type: 'expired',
              message: `${med.name} has expired`,
              severity: 'high'
            });
          }
        }
      });

      setStats({
        totalStudents: studentsCount?.length || 0,
        todayVisits: todayVisitsData?.length || 0,
        lowStockMedications: lowStockCount,
        expiringMedications: expiringCount,
        recentVisits: recentVisitsData || [],
        urgentAlerts: urgentAlerts.slice(0, 5) // Show only top 5 alerts
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVisitTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'injury': return 'bg-orange-100 text-orange-800';
      case 'sick': return 'bg-yellow-100 text-yellow-800';
      case 'medication': return 'bg-blue-100 text-blue-800';
      case 'follow_up': return 'bg-purple-100 text-purple-800';
      case 'routine': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">School Health Management System Overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Stethoscope className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Visits</p>
                <p className="text-2xl font-bold">{stats.todayVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Pill className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Meds</p>
                <p className="text-2xl font-bold">{stats.lowStockMedications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiring Meds</p>
                <p className="text-2xl font-bold">{stats.expiringMedications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Clinic Visits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Clinic Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentVisits.length > 0 ? (
              <div className="space-y-3">
                {stats.recentVisits.map((visit: any) => (
                  <div key={visit.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <div>
                      <p className="font-medium">{visit.students?.full_name}</p>
                      <p className="text-sm text-gray-600">{visit.students?.student_id}</p>
                      {visit.diagnosis && (
                        <p className="text-sm text-gray-500">{visit.diagnosis}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className={getVisitTypeColor(visit.visit_type)}>
                        {visit.visit_type?.replace('_', ' ')}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(visit.visit_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent visits</p>
            )}
          </CardContent>
        </Card>

        {/* Urgent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Urgent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.urgentAlerts.length > 0 ? (
              <div className="space-y-3">
                {stats.urgentAlerts.map((alert: any, index: number) => (
                  <div key={index} className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}>
                    <p className="text-sm font-medium">{alert.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No urgent alerts</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debug Section - Only show for development */}
      <ProfileDebugger />
    </div>
  );
};

export default DashboardHome;
