
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Users, 
  UserCheck,
  Stethoscope,
  Shield,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportsProps {
  userRole: string;
}

const Reports = ({ userRole }: ReportsProps) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalVisits: 0,
    totalImmunizations: 0,
    recentVisits: [],
    upcomingImmunizations: []
  });

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      
      // Fetch basic statistics
      const [studentsData, visitsData, immunizationsData] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('clinic_visits').select('id', { count: 'exact' }),
        supabase.from('immunizations').select('id', { count: 'exact' })
      ]);

      // Fetch recent visits
      const { data: recentVisits } = await supabase
        .from('clinic_visits')
        .select(`
          id,
          visit_date,
          visit_type,
          students(full_name, student_id)
        `)
        .order('visit_date', { ascending: false })
        .limit(5);

      setStats({
        totalStudents: studentsData.count || 0,
        totalStaff: 0, // Will be updated when staff table is properly set up
        totalVisits: visitsData.count || 0,
        totalImmunizations: immunizationsData.count || 0,
        recentVisits: recentVisits || [],
        upcomingImmunizations: []
      });
    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast.error('Error loading reports data');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportType: string) => {
    try {
      setLoading(true);
      let data: any[] = [];
      let filename = '';
      let headers: string[] = [];

      switch (reportType) {
        case 'students':
          const { data: studentsData } = await supabase
            .from('students')
            .select('*')
            .eq('is_active', true);
          data = studentsData || [];
          filename = `students-report-${new Date().toISOString().split('T')[0]}.csv`;
          headers = ['Full Name', 'Student ID', 'Form Level', 'Gender', 'Date of Birth', 'County'];
          break;

        case 'visits':
          const { data: visitsData } = await supabase
            .from('clinic_visits')
            .select(`
              *,
              students(full_name, student_id)
            `)
            .order('visit_date', { ascending: false });
          data = visitsData || [];
          filename = `clinic-visits-report-${new Date().toISOString().split('T')[0]}.csv`;
          headers = ['Date', 'Student Name', 'Student ID', 'Visit Type', 'Symptoms', 'Diagnosis'];
          break;

        case 'immunizations':
          const { data: immunizationsData } = await supabase
            .from('immunizations')
            .select(`
              *,
              students(full_name, student_id)
            `)
            .order('date_administered', { ascending: false });
          data = immunizationsData || [];
          filename = `immunizations-report-${new Date().toISOString().split('T')[0]}.csv`;
          headers = ['Date', 'Student Name', 'Student ID', 'Vaccine', 'Administered By'];
          break;

        default:
          throw new Error('Invalid report type');
      }

      // Convert data to CSV
      const csvContent = convertToCSV(data, reportType, headers);
      downloadCSV(csvContent, filename);
      
      toast.success(`${reportType} report downloaded successfully`);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Error downloading report');
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data: any[], reportType: string, headers: string[]) => {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(item => {
      switch (reportType) {
        case 'students':
          return [
            `"${item.full_name || ''}"`,
            `"${item.student_id || ''}"`,
            `"${item.form_level || ''}"`,
            `"${item.gender || ''}"`,
            `"${item.date_of_birth || ''}"`,
            `"${item.county || ''}"`
          ].join(',');
        
        case 'visits':
          return [
            `"${item.visit_date || ''}"`,
            `"${item.students?.full_name || ''}"`,
            `"${item.students?.student_id || ''}"`,
            `"${item.visit_type || ''}"`,
            `"${item.symptoms || ''}"`,
            `"${item.diagnosis || ''}"`
          ].join(',');
        
        case 'immunizations':
          return [
            `"${item.date_administered || ''}"`,
            `"${item.students?.full_name || ''}"`,
            `"${item.students?.student_id || ''}"`,
            `"${item.vaccine_name || ''}"`,
            `"${item.administered_by || ''}"`
          ].join(',');
        
        default:
          return '';
      }
    });

    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="w-8 h-8 mr-3 text-blue-600" />
          Reports & Analytics
        </h2>
        <p className="text-gray-600 mt-1">Generate and download comprehensive health reports</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="medical-card">
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

        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold">{stats.totalStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Stethoscope className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clinic Visits</p>
                <p className="text-2xl font-bold">{stats.totalVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Immunizations</p>
                <p className="text-2xl font-bold">{stats.totalImmunizations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="download" className="space-y-4">
        <TabsList>
          <TabsTrigger value="download">Download Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="download" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="medical-card hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Students Report
                </CardTitle>
                <CardDescription>
                  Download complete student profiles and health records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => downloadReport('students')}
                  disabled={loading}
                  className="w-full btn-medical"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="medical-card hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2 text-purple-600" />
                  Clinic Visits Report
                </CardTitle>
                <CardDescription>
                  Download clinic visit records and medical consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => downloadReport('visits')}
                  disabled={loading}
                  className="w-full btn-medical"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="medical-card hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-orange-600" />
                  Immunizations Report
                </CardTitle>
                <CardDescription>
                  Download vaccination records and compliance data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => downloadReport('immunizations')}
                  disabled={loading}
                  className="w-full btn-medical"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Clinic Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentVisits.map((visit: any, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{visit.students?.full_name}</p>
                        <p className="text-sm text-gray-600">{visit.students?.student_id}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{visit.visit_type}</Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(visit.visit_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {stats.recentVisits.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No recent visits found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Health Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Monthly Visits</span>
                    <span className="text-lg font-bold text-blue-600">
                      {Math.floor(stats.totalVisits / 12)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Vaccination Rate</span>
                    <span className="text-lg font-bold text-green-600">
                      {stats.totalStudents > 0 ? Math.round((stats.totalImmunizations / stats.totalStudents) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Students</span>
                    <span className="text-lg font-bold text-purple-600">{stats.totalStudents}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
