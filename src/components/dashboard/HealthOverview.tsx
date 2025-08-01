
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Activity, 
  Heart, 
  AlertTriangle, 
  Calendar,
  Pill,
  Shield,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const HealthOverview = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    todayVisits: 0,
    emergencyVisits: 0,
    immunizationCompliance: 0,
    medicationAlerts: 0,
    insuranceCoverage: 0,
    chronicConditions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthStats();
  }, []);

  const fetchHealthStats = async () => {
    try {
      // Fetch student stats
      const { data: students } = await supabase
        .from('students')
        .select('*');

      const activeStudents = students?.filter(s => s.is_active) || [];
      
      // Fetch today's clinic visits
      const today = new Date().toDateString();
      const { data: todayVisits } = await supabase
        .from('clinic_visits')
        .select('*')
        .gte('visit_date', new Date().toISOString().split('T')[0]);

      // Fetch emergency visits this month
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const { data: emergencyVisits } = await supabase
        .from('clinic_visits')
        .select('*')
        .eq('visit_type', 'emergency')
        .gte('visit_date', firstDayOfMonth.toISOString());

      // Fetch immunization data
      const { data: immunizations } = await supabase
        .from('immunizations')
        .select('student_id')
        .in('student_id', activeStudents.map(s => s.id));

      // Fetch medication alerts
      const { data: medications } = await supabase
        .from('medications')
        .select('*')
        .or('quantity_in_stock.lte.minimum_stock_level,expiry_date.lte.' + new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]);

      // Calculate insurance coverage
      const insuredStudents = activeStudents.filter(s => s.nhif_number || s.sha_number);
      
      // Students with chronic conditions
      const chronicStudents = activeStudents.filter(s => s.chronic_conditions);

      // Calculate immunization compliance
      const uniqueImmunizedStudents = new Set(immunizations?.map(i => i.student_id) || []);
      const complianceRate = activeStudents.length > 0 
        ? (uniqueImmunizedStudents.size / activeStudents.length) * 100 
        : 0;

      setStats({
        totalStudents: students?.length || 0,
        activeStudents: activeStudents.length,
        todayVisits: todayVisits?.length || 0,
        emergencyVisits: emergencyVisits?.length || 0,
        immunizationCompliance: Math.round(complianceRate),
        medicationAlerts: medications?.length || 0,
        insuranceCoverage: activeStudents.length > 0 
          ? Math.round((insuredStudents.length / activeStudents.length) * 100)
          : 0,
        chronicConditions: chronicStudents.length
      });
    } catch (error) {
      console.error('Error fetching health stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold">{stats.activeStudents}</p>
                <p className="text-xs text-gray-500">Total: {stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Visits</p>
                <p className="text-2xl font-bold">{stats.todayVisits}</p>
                <p className="text-xs text-gray-500">Clinic consultations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card warning">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Emergency Cases</p>
                <p className="text-2xl font-bold">{stats.emergencyVisits}</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chronic Conditions</p>
                <p className="text-2xl font-bold">{stats.chronicConditions}</p>
                <p className="text-xs text-gray-500">Students requiring care</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-purple-600" />
              Immunization Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{stats.immunizationCompliance}%</span>
                <Badge variant={stats.immunizationCompliance >= 80 ? "default" : "secondary"}>
                  {stats.immunizationCompliance >= 80 ? "Good" : "Needs Attention"}
                </Badge>
              </div>
              <Progress value={stats.immunizationCompliance} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="w-4 h-4 mr-2 text-blue-600" />
              Insurance Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{stats.insuranceCoverage}%</span>
                <Badge variant={stats.insuranceCoverage >= 70 ? "default" : "secondary"}>
                  {stats.insuranceCoverage >= 70 ? "Good" : "Low"}
                </Badge>
              </div>
              <Progress value={stats.insuranceCoverage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.medicationAlerts > 0 ? "border-orange-200 bg-orange-50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Pill className="w-4 h-4 mr-2 text-orange-600" />
              Medication Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{stats.medicationAlerts}</span>
                <Badge variant={stats.medicationAlerts > 0 ? "destructive" : "default"}>
                  {stats.medicationAlerts > 0 ? "Action Needed" : "All Good"}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">Low stock or expiring</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
              Health Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">Stable</span>
                <Badge variant="default">Normal</Badge>
              </div>
              <p className="text-xs text-gray-500">Overall health status</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthOverview;
