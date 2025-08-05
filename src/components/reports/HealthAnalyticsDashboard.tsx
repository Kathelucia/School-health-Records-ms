
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, AlertTriangle, Activity, TrendingUp, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface HealthAnalyticsDashboardProps {
  userRole: string;
}

const HealthAnalyticsDashboard = ({ userRole }: HealthAnalyticsDashboardProps) => {
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    chronicConditions: 0,
    allergies: 0,
    recentVisits: 0,
    visitTrends: [],
    conditionBreakdown: [],
    vaccinationCompliance: [],
    frequentVisitors: []
  });
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Get total students
      const { data: students } = await supabase
        .from('students')
        .select('*')
        .eq('is_active', true);

      const totalStudents = students?.length || 0;
      const chronicConditions = students?.filter(s => s.chronic_conditions && s.chronic_conditions.trim()).length || 0;
      const allergies = students?.filter(s => s.allergies && s.allergies.trim()).length || 0;

      // Get recent clinic visits
      const { data: visits } = await supabase
        .from('clinic_visits')
        .select(`
          *,
          students(full_name, student_id, form_level)
        `)
        .gte('visit_date', new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString())
        .order('visit_date', { ascending: false });

      const recentVisits = visits?.length || 0;

      // Process visit trends by day
      const visitTrends = processVisitTrends(visits || []);
      
      // Process condition breakdown
      const conditionBreakdown = processConditionBreakdown(students || []);
      
      // Get vaccination compliance
      const { data: immunizations } = await supabase
        .from('immunizations')
        .select('*');
      
      const vaccinationCompliance = processVaccinationCompliance(students || [], immunizations || []);
      
      // Get frequent visitors
      const frequentVisitors = processFrequentVisitors(visits || []);

      setAnalytics({
        totalStudents,
        chronicConditions,
        allergies,
        recentVisits,
        visitTrends,
        conditionBreakdown,
        vaccinationCompliance,
        frequentVisitors
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Error loading analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processVisitTrends = (visits: any[]) => {
    const trends: { [key: string]: number } = {};
    const days = parseInt(timeRange);
    
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trends[key] = 0;
    }
    
    visits.forEach(visit => {
      const date = new Date(visit.visit_date);
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (trends.hasOwnProperty(key)) {
        trends[key]++;
      }
    });
    
    return Object.entries(trends).map(([date, visits]) => ({ date, visits }));
  };

  const processConditionBreakdown = (students: any[]) => {
    const conditions: { [key: string]: number } = {};
    
    students.forEach(student => {
      if (student.chronic_conditions && student.chronic_conditions.trim()) {
        const conditionList = student.chronic_conditions.toLowerCase().split(',').map((c: string) => c.trim());
        conditionList.forEach((condition: string) => {
          if (condition) {
            conditions[condition] = (conditions[condition] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(conditions)
      .map(([condition, count]) => ({ condition, count, percentage: Math.round((count / students.length) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const processVaccinationCompliance = (students: any[], immunizations: any[]) => {
    const formLevels = ['form_1', 'form_2', 'form_3', 'form_4'];
    
    return formLevels.map(level => {
      const studentsInForm = students.filter(s => s.form_level === level).length;
      const immunizedStudents = immunizations.filter(imm => {
        const student = students.find(s => s.id === imm.student_id);
        return student && student.form_level === level;
      }).length;
      
      return {
        form: level.replace('_', ' ').toUpperCase(),
        total: studentsInForm,
        immunized: immunizedStudents,
        compliance: studentsInForm > 0 ? Math.round((immunizedStudents / studentsInForm) * 100) : 0
      };
    });
  };

  const processFrequentVisitors = (visits: any[]) => {
    const visitCounts: { [key: string]: { student: any, count: number } } = {};
    
    visits.forEach(visit => {
      if (visit.students) {
        const studentId = visit.student_id;
        if (visitCounts[studentId]) {
          visitCounts[studentId].count++;
        } else {
          visitCounts[studentId] = {
            student: visit.students,
            count: 1
          };
        }
      }
    });
    
    return Object.values(visitCounts)
      .filter(entry => entry.count >= 3)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const exportReport = async (type: 'pdf' | 'csv') => {
    try {
      // This is a placeholder for report export functionality
      toast.success(`${type.toUpperCase()} report generation started`);
    } catch (error) {
      toast.error('Error generating report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Health Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive health trends and compliance reporting</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => exportReport('pdf')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          
          <Button onClick={() => exportReport('csv')} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalStudents}</p>
              </div>
              <Users className="w-12 h-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chronic Conditions</p>
                <p className="text-3xl font-bold text-orange-600">{analytics.chronicConditions}</p>
                <p className="text-xs text-gray-500">
                  {Math.round((analytics.chronicConditions / analytics.totalStudents) * 100)}% of students
                </p>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Students with Allergies</p>
                <p className="text-3xl font-bold text-red-600">{analytics.allergies}</p>
                <p className="text-xs text-gray-500">
                  {Math.round((analytics.allergies / analytics.totalStudents) * 100)}% of students
                </p>
              </div>
              <Activity className="w-12 h-12 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent Clinic Visits</p>
                <p className="text-3xl font-bold text-green-600">{analytics.recentVisits}</p>
                <p className="text-xs text-gray-500">Last {timeRange} days</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Clinic Visits Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.visitTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="visits" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Chronic Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.conditionBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.conditionBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ condition, percentage }) => `${condition}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.conditionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No chronic conditions data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vaccination Compliance by Form</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.vaccinationCompliance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="form" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="compliance" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frequent Clinic Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.frequentVisitors.length > 0 ? (
                analytics.frequentVisitors.map((visitor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{visitor.student.full_name}</p>
                      <p className="text-sm text-gray-600">
                        ID: {visitor.student.student_id} | {visitor.student.form_level?.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      {visitor.count} visits
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No frequent visitors in the selected period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthAnalyticsDashboard;
