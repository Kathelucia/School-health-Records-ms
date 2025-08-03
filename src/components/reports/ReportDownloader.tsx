
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { toast } from 'sonner';
import { Download, FileText, Users, Calendar, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface ReportDownloaderProps {
  userRole?: string;
  students?: any[];
  clinicVisits?: any[];
  immunizations?: any[];
  medications?: any[];
}

const ReportDownloader = ({ userRole, students = [], clinicVisits = [], immunizations = [], medications = [] }: ReportDownloaderProps) => {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allClinicVisits, setAllClinicVisits] = useState<any[]>([]);
  const [allImmunizations, setAllImmunizations] = useState<any[]>([]);
  const [allMedications, setAllMedications] = useState<any[]>([]);

  useEffect(() => {
    // Fetch data if not provided as props
    if (students.length === 0) fetchStudents();
    if (clinicVisits.length === 0) fetchClinicVisits();
    if (immunizations.length === 0) fetchImmunizations();
    if (medications.length === 0) fetchMedications();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setAllStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchClinicVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_visits')
        .select(`
          *,
          students (full_name, student_id)
        `)
        .order('visit_date', { ascending: false });
      
      if (error) throw error;
      setAllClinicVisits(data || []);
    } catch (error) {
      console.error('Error fetching clinic visits:', error);
    }
  };

  const fetchImmunizations = async () => {
    try {
      const { data, error } = await supabase
        .from('immunizations')
        .select(`
          *,
          students (full_name, student_id)
        `);
      
      if (error) throw error;
      setAllImmunizations(data || []);
    } catch (error) {
      console.error('Error fetching immunizations:', error);
    }
  };

  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*');
      
      if (error) throw error;
      setAllMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  };

  const reportTypes = [
    { value: 'students', label: 'Student Health Records', icon: Users },
    { value: 'clinic', label: 'Clinic Visit Summary', icon: Activity },
    { value: 'immunizations', label: 'Immunization Report', icon: FileText },
    { value: 'medications', label: 'Medication Inventory', icon: FileText }
  ];

  const generateCSV = (data: any[], headers: string[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error('No data available for the selected report');
      return;
    }

    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const key = header.toLowerCase().replace(/\s+/g, '_');
        let value = '';
        
        // Handle nested objects (like student data)
        if (key.includes('student_name') && row.students) {
          value = row.students.full_name || '';
        } else if (key.includes('student_id') && row.students) {
          value = row.students.student_id || '';
        } else {
          value = row[key] || '';
        }
        
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    if (!reportType) {
      toast.error('Please select a report type');
      return;
    }

    setIsGenerating(true);

    try {
      const dataToUse = {
        students: students.length > 0 ? students : allStudents,
        clinicVisits: clinicVisits.length > 0 ? clinicVisits : allClinicVisits,
        immunizations: immunizations.length > 0 ? immunizations : allImmunizations,
        medications: medications.length > 0 ? medications : allMedications
      };

      switch (reportType) {
        case 'students':
          generateCSV(
            dataToUse.students,
            ['Full Name', 'Student ID', 'Form Level', 'Gender', 'Blood Group', 'Allergies', 'Chronic Conditions'],
            'student_health_records'
          );
          break;

        case 'clinic':
          generateCSV(
            dataToUse.clinicVisits,
            ['Student Name', 'Visit Date', 'Visit Type', 'Symptoms', 'Diagnosis', 'Treatment', 'Attended By'],
            'clinic_visit_summary'
          );
          break;

        case 'immunizations':
          generateCSV(
            dataToUse.immunizations,
            ['Student Name', 'Vaccine Name', 'Date Administered', 'Administered By', 'Next Dose Date'],
            'immunization_report'
          );
          break;

        case 'medications':
          generateCSV(
            dataToUse.medications,
            ['Name', 'Generic Name', 'Dosage', 'Quantity in Stock', 'Expiry Date', 'Supplier'],
            'medication_inventory'
          );
          break;

        default:
          toast.error('Invalid report type selected');
          return;
      }

      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200 shadow-lg">
        <CardHeader className="bg-white border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <Download className="w-6 h-6 mr-3 text-blue-600" />
            Download Reports
          </CardTitle>
          <CardDescription className="text-gray-600">
            Generate and download various health reports in CSV format
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value} className="hover:bg-gray-50 focus:bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Date Range (Optional)</label>
            <DatePickerWithRange 
              date={dateRange} 
              onDateChange={setDateRange}
              className="w-full"
            />
          </div>

          <Button 
            onClick={handleDownload}
            disabled={!reportType || isGenerating}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-b-2 border-white"></div>
                Generating Report...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDownloader;
