
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Users, 
  Stethoscope, 
  Syringe,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportsProps {
  userRole: string;
}

const Reports = ({ userRole }: ReportsProps) => {
  const [reportType, setReportType] = useState('health-trends');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async () => {
    if (!dateFrom || !dateTo) {
      toast.error('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      let data;
      
      switch (reportType) {
        case 'health-trends':
          data = await generateHealthTrendsReport();
          break;
        case 'vaccination-compliance':
          data = await generateVaccinationComplianceReport();
          break;
        case 'frequent-visitors':
          data = await generateFrequentVisitorsReport();
          break;
        case 'medication-usage':
          data = await generateMedicationUsageReport();
          break;
        default:
          throw new Error('Invalid report type');
      }
      
      setReportData(data);
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generateHealthTrendsReport = async () => {
    const { data: visits, error } = await supabase
      .from('clinic_visits')
      .select(`
        *,
        students:student_id (
          full_name,
          form_level,
          stream
        )
      `)
      .gte('visit_date', dateFrom?.toISOString())
      .lte('visit_date', dateTo?.toISOString());

    if (error) throw error;

    // Process data for trends
    const trendsData = {
      totalVisits: visits?.length || 0,
      visitsByType: {},
      visitsByDay: {},
      commonSymptoms: {},
      formLevelBreakdown: {}
    };

    visits?.forEach((visit: any) => {
      // Visit types
      const type = visit.visit_type || 'routine';
      trendsData.visitsByType[type] = (trendsData.visitsByType[type] || 0) + 1;

      // Daily visits
      const day = new Date(visit.visit_date).toLocaleDateString();
      trendsData.visitsByDay[day] = (trendsData.visitsByDay[day] || 0) + 1;

      // Common symptoms
      if (visit.symptoms) {
        const symptoms = visit.symptoms.toLowerCase();
        if (symptoms.includes('headache')) trendsData.commonSymptoms['headache'] = (trendsData.commonSymptoms['headache'] || 0) + 1;
        if (symptoms.includes('fever')) trendsData.commonSymptoms['fever'] = (trendsData.commonSymptoms['fever'] || 0) + 1;
        if (symptoms.includes('stomach')) trendsData.commonSymptoms['stomach_ache'] = (trendsData.commonSymptoms['stomach_ache'] || 0) + 1;
        if (symptoms.includes('cough')) trendsData.commonSymptoms['cough'] = (trendsData.commonSymptoms['cough'] || 0) + 1;
      }

      // Form level breakdown
      if (visit.students?.form_level) {
        const level = visit.students.form_level;
        trendsData.formLevelBreakdown[level] = (trendsData.formLevelBreakdown[level] || 0) + 1;
      }
    });

    return { type: 'health-trends', data: trendsData, rawData: visits };
  };

  const generateVaccinationComplianceReport = async () => {
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('is_active', true);

    if (studentsError) throw studentsError;

    const { data: immunizations, error: immunizationsError } = await supabase
      .from('immunizations')
      .select('*');

    if (immunizationsError) throw immunizationsError;

    // Process vaccination compliance
    const complianceData = {
      totalStudents: students?.length || 0,
      fullyVaccinated: 0,
      partiallyVaccinated: 0,
      notVaccinated: 0,
      vaccineBreakdown: {}
    };

    const studentVaccinations = {};
    immunizations?.forEach((imm: any) => {
      if (!studentVaccinations[imm.student_id]) {
        studentVaccinations[imm.student_id] = [];
      }
      studentVaccinations[imm.student_id].push(imm);
      
      // Track vaccine types
      const vaccine = imm.vaccine_name;
      complianceData.vaccineBreakdown[vaccine] = (complianceData.vaccineBreakdown[vaccine] || 0) + 1;
    });

    students?.forEach((student: any) => {
      const studentImms = studentVaccinations[student.id] || [];
      if (studentImms.length === 0) {
        complianceData.notVaccinated++;
      } else if (studentImms.length >= 3) { // Assuming 3+ vaccines = fully vaccinated
        complianceData.fullyVaccinated++;
      } else {
        complianceData.partiallyVaccinated++;
      }
    });

    return { type: 'vaccination-compliance', data: complianceData };
  };

  const generateFrequentVisitorsReport = async () => {
    const { data: visits, error } = await supabase
      .from('clinic_visits')
      .select(`
        student_id,
        visit_date,
        students:student_id (
          full_name,
          form_level,
          stream
        )
      `)
      .gte('visit_date', dateFrom?.toISOString())
      .lte('visit_date', dateTo?.toISOString());

    if (error) throw error;

    // Count visits per student
    const studentVisitCounts = {};
    visits?.forEach((visit: any) => {
      const studentId = visit.student_id;
      if (!studentVisitCounts[studentId]) {
        studentVisitCounts[studentId] = {
          student: visit.students,
          count: 0
        };
      }
      studentVisitCounts[studentId].count++;
    });

    // Sort by visit count and get top 20
    const frequentVisitors = Object.values(studentVisitCounts)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 20);

    return { type: 'frequent-visitors', data: frequentVisitors };
  };

  const generateMedicationUsageReport = async () => {
    // This would need the medication_dispensing table
    // For now, return mock data
    return { 
      type: 'medication-usage', 
      data: {
        totalDispensed: 0,
        topMedications: [],
        costAnalysis: {}
      }
    };
  };

  const exportToPDF = () => {
    // Implementation for PDF export
    toast.info('PDF export feature coming soon');
  };

  const exportToCSV = () => {
    if (!reportData) return;
    
    // Convert report data to CSV format
    let csvContent = '';
    
    if (reportData.type === 'health-trends') {
      csvContent = 'Date,Visit Type,Student,Symptoms,Diagnosis\n';
      reportData.rawData?.forEach((visit: any) => {
        csvContent += `${new Date(visit.visit_date).toLocaleDateString()},"${visit.visit_type}","${visit.students?.full_name || 'Unknown'}","${visit.symptoms || ''}","${visit.diagnosis || ''}"\n`;
      });
    }
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Report exported to CSV');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
          Reports & Analytics
        </h2>
        <p className="text-gray-600 mt-1">Generate comprehensive health reports and track trends</p>
      </div>

      {/* Report Generation Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="health-trends">Health Trends</SelectItem>
                <SelectItem value="vaccination-compliance">Vaccination Compliance</SelectItem>
                <SelectItem value="frequent-visitors">Frequent Visitors</SelectItem>
                <SelectItem value="medication-usage">Medication Usage</SelectItem>
              </SelectContent>
            </Select>
            
            <DatePicker
              date={dateFrom}
              onDateChange={setDateFrom}
              placeholder="From date"
            />
            
            <DatePicker
              date={dateTo}
              onDateChange={setDateTo}
              placeholder="To date"
            />
            
            <Button 
              onClick={generateReport} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Report Results</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={exportToPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reportData.type === 'health-trends' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center">
                        <Stethoscope className="w-8 h-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Visits</p>
                          <p className="text-2xl font-bold">{reportData.data.totalVisits}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Emergency Visits</p>
                          <p className="text-2xl font-bold">{reportData.data.visitsByType.emergency || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center">
                        <Users className="w-8 h-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Routine Checkups</p>
                          <p className="text-2xl font-bold">{reportData.data.visitsByType.routine || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center">
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Sick Visits</p>
                          <p className="text-2xl font-bold">{reportData.data.visitsByType.sick_visit || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Common Symptoms</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(reportData.data.commonSymptoms).map(([symptom, count]: [string, any]) => (
                      <div key={symptom} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium capitalize">{symptom.replace('_', ' ')}</p>
                        <p className="text-2xl font-bold text-blue-600">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {reportData.type === 'vaccination-compliance' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Syringe className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Fully Vaccinated</p>
                      <p className="text-2xl font-bold text-green-600">{reportData.data.fullyVaccinated}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Syringe className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Partially Vaccinated</p>
                      <p className="text-2xl font-bold text-yellow-600">{reportData.data.partiallyVaccinated}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Syringe className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Not Vaccinated</p>
                      <p className="text-2xl font-bold text-red-600">{reportData.data.notVaccinated}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {reportData.type === 'frequent-visitors' && (
              <div>
                <h4 className="text-lg font-semibold mb-4">Top 20 Frequent Clinic Visitors</h4>
                <div className="space-y-2">
                  {reportData.data.map((visitor: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{visitor.student?.full_name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">
                          {visitor.student?.form_level} {visitor.student?.stream}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{visitor.count}</p>
                        <p className="text-xs text-gray-500">visits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
