import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Clock,
  RefreshCw
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting dashboard data fetch...');
      const today = new Date().toISOString().split('T')[0];
      
      const data = {
        totalStudents: 0,
        todayVisits: 0,
        chronicConditions: 0,
        lowStockMedications: 0,
        pendingFollowUps: 0,
        recentVisits: [],
        urgentAlerts: [],
        upcomingTasks: []
      };

      // Fetch students with better error handling
      try {
        console.log('Fetching students...');
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('is_active', true);

        if (studentsError) {
          console.error('Error fetching students:', studentsError);
          // Don't throw, just log and continue
        } else if (students) {
          data.totalStudents = students.length;
          data.chronicConditions = students.filter(s => 
            s.chronic_conditions && s.chronic_conditions.trim()
          ).length;
          console.log(`Found ${data.totalStudents} students`);
        }
      } catch (err) {
        console.error('Students fetch failed:', err);
      }

      // Fetch today's visits
      try {
        console.log('Fetching today\'s visits...');
        const { data: todayVisits, error: visitsError } = await supabase
          .from('clinic_visits')
          .select(`
            *,
            students(full_name, student_id, form_level)
          `)
          .gte('visit_date', today)
          .order('visit_date', { ascending: false })
          .limit(5);

        if (visitsError) {
          console.error('Error fetching today\'s visits:', visitsError);
        } else if (todayVisits) {
          data.todayVisits = todayVisits.length;
          console.log(`Found ${data.todayVisits} visits today`);
        }
      } catch (err) {
        console.error('Today visits fetch failed:', err);
      }

      // Fetch recent visits
      try {
        console.log('Fetching recent visits...');
        const { data: recentVisits, error: recentError } = await supabase
          .from('clinic_visits')
          .select(`
            *,
            students(full_name, student_id, form_level)
          `)
          .order('visit_date', { ascending: false })
          .limit(5);

        if (recentError) {
          console.error('Error fetching recent visits:', recentError);
        } else if (recentVisits) {
          data.recentVisits = recentVisits;
          console.log(`Found ${data.recentVisits.length} recent visits`);
        }
      } catch (err) {
        console.error('Recent visits fetch failed:', err);
      }

      // Fetch medications
      try {
        console.log('Fetching medications...');
        const thirtyDaysFromNow = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];
        
        const { data: medications, error: medicationsError } = await supabase
          .from('medications')
          .select('*')
          .or(`quantity_in_stock.lte.minimum_stock_level,expiry_date.lte.${thirtyDaysFromNow}`);

        if (medicationsError) {
          console.error('Error fetching medications:', medicationsError);
        } else if (medications) {
          data.lowStockMedications = medications.length;
          console.log(`Found ${data.lowStockMedications} medications needing attention`);
        }
      } catch (err) {
        console.error('Medications fetch failed:', err);
      }

      // Fetch follow-ups
      try {
        console.log('Fetching follow-ups...');
        const { data: followUps, error: followUpsError } = await supabase
          .from('clinic_visits')
          .select(`
            *,
            students(full_name, student_id)
          `)
          .eq('follow_up_required', true)
          .gte('follow_up_date', today);

        if (followUpsError) {
          console.error('Error fetching follow-ups:', followUpsError);
        } else if (followUps) {
          data.pendingFollowUps = followUps.length;
          data.upcomingTasks = followUps.slice(0, 3);
          console.log(`Found ${data.pendingFollowUps} pending follow-ups`);
        }
      } catch (err) {
        console.error('Follow-ups fetch failed:', err);
      }

      // Create alerts based on data
      const urgentAlerts = [];
      
      if (data.lowStockMedications > 0) {
        urgentAlerts.push({
          type: 'medication',
          message: `${data.lowStockMedications} medications need attention`,
          priority: 'high',
          action: () => onNavigate('medications')
        });
      }

      if (data.pendingFollowUps > 0) {
        urgentAlerts.push({
          type: 'followup',
          message: `${data.pendingFollowUps} students require follow-up`,
          priority: 'medium',
          action: () => onNavigate('clinic')
        });
      }

      data.urgentAlerts = urgentAlerts;

      console.log('Dashboard data loaded successfully:', data);
      setDashboardData(data);
      
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDashboardData}
              className="ml-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={() => onNavigate('students')}
              >
                <Users className="w-8 h-8" />
                <span className="text-sm">Students</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={() => onNavigate('clinic')}
              >
                <Stethoscope className="w-8 h-8" />
                <span className="text-sm">Clinic</span>
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
                onClick={() => onNavigate('reports')}
              >
                <FileText className="w-8 h-8" />
                <span className="text-sm">Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card-professional p-6 bg-gradient-to-r from-primary to-accent text-primary-foreground animate-fade-in">
        <h1 className="text-2xl font-bold mb-2">School Health Records Management System</h1>
        <p className="text-primary-foreground/90">
          Welcome to your health management dashboard. Track student health, manage clinic visits, and monitor medication inventory.
        </p>
      </div>

      {/* Urgent Alerts */}
      {dashboardData.urgentAlerts.length > 0 && (
        <div className="card-professional border-accent/20 bg-accent/5 animate-scale-in">
          <div className="p-4">
            <h3 className="flex items-center gap-2 text-accent font-semibold mb-4">
              <Bell className="w-5 h-5" />
              Urgent Alerts
            </h3>
            <div className="space-y-3">
              {dashboardData.urgentAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-accent" />
                    <span className="text-foreground">{alert.message}</span>
                    <Badge variant={alert.priority === 'high' ? 'destructive' : 'outline'}>
                      {alert.priority}
                    </Badge>
                  </div>
                  <Button size="sm" onClick={alert.action} className="btn-primary">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="medical-grid animate-slide-up">
        <div className="stats-card group" onClick={() => onNavigate('students')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold text-primary">{dashboardData.totalStudents}</p>
            </div>
            <div className="icon-container bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="stats-card group" onClick={() => onNavigate('clinic')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Visits</p>
              <p className="text-3xl font-bold text-secondary">{dashboardData.todayVisits}</p>
            </div>
            <div className="icon-container bg-secondary/10">
              <Stethoscope className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </div>

        <div className="stats-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Chronic Conditions</p>
              <p className="text-3xl font-bold text-accent">{dashboardData.chronicConditions}</p>
            </div>
            <div className="icon-container bg-accent/10">
              <Shield className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>

        <div className="stats-card group" onClick={() => onNavigate('medications')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Medications Alert</p>
              <p className="text-3xl font-bold text-destructive">{dashboardData.lowStockMedications}</p>
            </div>
            <div className="icon-container bg-destructive/10">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
          </div>
        </div>

        <div className="stats-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Follow-ups Due</p>
              <p className="text-3xl font-bold text-accent">{dashboardData.pendingFollowUps}</p>
            </div>
            <div className="icon-container bg-accent/10">
              <Clock className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
        {/* Recent Clinic Visits */}
        <div className="card-professional">
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-foreground font-semibold">
                <Activity className="w-5 h-5" />
                Recent Clinic Visits
              </h3>
              <Button variant="outline" size="sm" onClick={() => onNavigate('clinic')}>
                View All
              </Button>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.recentVisits.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentVisits.map((visit: any, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {visit.students?.full_name || 'Unknown Student'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {visit.students?.student_id || 'N/A'} | {visit.students?.form_level?.replace('_', ' ').toUpperCase() || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {visit.visit_type?.replace('_', ' ') || 'General'} - {new Date(visit.visit_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {visit.visit_type?.replace('_', ' ') || 'Visit'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Stethoscope className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No recent clinic visits</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => onNavigate('clinic')}
                >
                  Record a Visit
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card-professional">
          <div className="p-6 border-b border-border/50">
            <h3 className="flex items-center gap-2 text-foreground font-semibold">
              <Calendar className="w-5 h-5" />
              Upcoming Tasks
            </h3>
          </div>
          <div className="p-6">
            {dashboardData.upcomingTasks.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcomingTasks.map((task: any, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div>
                      <p className="font-semibold text-foreground">
                        Follow-up: {task.students?.full_name || 'Unknown Student'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Due: {task.follow_up_date ? new Date(task.follow_up_date).toLocaleDateString() : 'No date set'}
                      </p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      Follow-up
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No upcoming tasks</p>
              </div>
            )}
          </div>
        </div>
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
