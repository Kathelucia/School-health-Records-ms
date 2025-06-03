
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Users, 
  Stethoscope,
  AlertTriangle,
  Calendar,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportsProps {
  userRole: string;
}

const Reports = ({ userRole }: ReportsProps) => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    studentStats: {
      total: 0,
      byGender: [],
      byFormLevel: [],
      withMedicalConditions: 0
    },
    clinicStats: {
      totalVisits: 0,
      monthlyVisits: [],
      visitTypes: [],
      frequentVisitors: []
    },
    healthTrends: {
      commonConditions: [],
      vaccinationCompliance: [],
      medicationUsage: []
    },
    riskAssessment: {
      highRiskStudents: [],
      emergencyContacts: 0,
      chronicConditions: []
    }
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch student statistics
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      // Fetch clinic visits
      const { data: visits, error: visitsError } = await supabase
        .from('clinic_visits')
        .select('*')
        .order('visit_date', { ascending: false });

      if (visitsError) throw visitsError;

      // Fetch immunizations
      const { data: immunizations, error: immunizationsError } = await supabase
        .from('immunizations')
        .select('*');

      if (immunizationsError) throw immunizationsError;

      // Process data for reports
      processReportData(students || [], visits || [], immunizations || []);
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Error loading report data');
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (students: any[], visits: any[], immunizations: any[]) => {
    // Student statistics
    const genderStats = students.reduce((acc, student) => {
      const gender = student.gender || 'Unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    const formLevelStats = students.reduce((acc, student) => {
      const form = student.form_level || 'Unknown';
      acc[form] = (acc[form] || 0) + 1;
      return acc;
    }, {});

    const studentsWithConditions = students.filter(s => 
      s.chronic_conditions || s.allergies
    ).length;

    // Clinic visit statistics
    const monthlyVisits = visits.reduce((acc, visit) => {
      const month = new Date(visit.visit_date).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const visitTypes = visits.reduce((acc, visit) => {
      const type = visit.visit_type || 'routine';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Common conditions
    const conditions = visits.reduce((acc, visit) => {
      if (visit.diagnosis) {
        acc[visit.diagnosis] = (acc[visit.diagnosis] || 0) + 1;
      }
      return acc;
    }, {});

    // Vaccination compliance
    const vaccineStats = immunizations.reduce((acc, imm) => {
      acc[imm.vaccine_name] = (acc[imm.vaccine_name] || 0) + 1;
      return acc;
    }, {});

    setReportData({
      studentStats: {
        total: students.length,
        byGender: Object.entries(genderStats).map(([name, value]) => ({ name, value })),
        byFormLevel: Object.entries(formLevelStats).map(([name, value]) => ({ name, value })),
        withMedicalConditions: studentsWithConditions
      },
      clinicStats: {
        totalVisits: visits.length,
        monthlyVisits: Object.entries(monthlyVisits).map(([name, value]) => ({ name, value })),
        visitTypes: Object.entries(visitTypes).map(([name, value]) => ({ name, value })),
        frequentVisitors: []
      },
      healthTrends: {
        commonConditions: Object.entries(conditions)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([name, value]) => ({ name, value })),
        vaccinationCompliance: Object.entries(vaccineStats).map(([name, value]) => ({ name, value })),
        medicationUsage: []
      },
      riskAssessment: {
        highRiskStudents: students.filter(s => s.chronic_conditions || s.allergies),
        emergencyContacts: students.filter(s => s.emergency_contact).length,
        chronicConditions: []
      }
    });
  };

  const generatePDFReport = () => {
    toast.success('PDF report generation will be implemented soon');
  };

  const exportToCSV = () => {
    toast.success('CSV export will be implemented soon');
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Health Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive health data analysis and reporting</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={generatePDFReport} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Student Health</TabsTrigger>
          <TabsTrigger value="clinic">Clinic Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.studentStats.total}</div>
                <p className="text-xs text-muted-foreground">Active registrations</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clinic Visits</CardTitle>
                <Stethoscope className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.clinicStats.totalVisits}</div>
                <p className="text-xs text-muted-foreground">Total recorded visits</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.riskAssessment.highRiskStudents.length}</div>
                <p className="text-xs text-muted-foreground">Students with conditions</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emergency Contacts</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.riskAssessment.emergencyContacts}</div>
                <p className="text-xs text-muted-foreground">Students with contacts</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Distribution by Gender</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={reportData.studentStats.byGender}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {reportData.studentStats.byGender.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Clinic Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={reportData.clinicStats.monthlyVisits}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Students by Form Level</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.studentStats.byFormLevel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>High-Risk Students</CardTitle>
                <CardDescription>Students with chronic conditions or allergies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.riskAssessment.highRiskStudents.slice(0, 5).map((student: any) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-sm text-gray-600">ID: {student.student_id}</p>
                      </div>
                      <Badge variant="destructive">High Risk</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clinic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visit Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.clinicStats.visitTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {reportData.clinicStats.visitTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Health Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.healthTrends.commonConditions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vaccination Compliance</CardTitle>
              <CardDescription>Immunization records by vaccine type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={reportData.healthTrends.vaccinationCompliance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
