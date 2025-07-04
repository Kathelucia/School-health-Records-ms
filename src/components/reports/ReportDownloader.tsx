
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Download, FileText, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';

interface ReportDownloaderProps {
  userRole: string;
}

const ReportDownloader = ({ userRole }: ReportDownloaderProps) => {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);

  const generateStudentReport = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    const headers = [
      'Full Name', 'Student ID', 'Admission Number', 'Date of Birth', 'Gender',
      'Form Level', 'Stream', 'Blood Group', 'Allergies', 'Chronic Conditions',
      'Parent/Guardian', 'Guardian Phone', 'County', 'Sub-County', 'Ward', 'Village'
    ];

    const csvRows = [headers.join(',')];
    
    data?.forEach((student: any) => {
      const row = [
        student.full_name || '',
        student.student_id || '',
        student.admission_number || '',
        student.date_of_birth || '',
        student.gender || '',
        student.form_level?.replace('_', ' ') || '',
        student.stream || '',
        student.blood_group || '',
        student.allergies || '',
        student.chronic_conditions || '',
        student.parent_guardian_name || '',
        student.parent_guardian_phone || '',
        student.county || '',
        student.sub_county || '',
        student.ward || '',
        student.village || ''
      ];
      csvRows.push(row.map(field => `"${field}"`).join(','));
    });

    return csvRows.join('\n');
  };

  const generateClinicReport = async () => {
    let query = supabase
      .from('clinic_visits')
      .select(`
        *,
        students(full_name, student_id),
        profiles(full_name)
      `);

    if (dateRange?.from) {
      query = query.gte('visit_date', dateRange.from.toISOString());
    }
    if (dateRange?.to) {
      query = query.lte('visit_date', dateRange.to.toISOString());
    }

    const { data, error } = await query.order('visit_date', { ascending: false });

    if (error) throw error;

    const headers = [
      'Date', 'Student Name', 'Student ID', 'Visit Type', 'Symptoms', 
      'Diagnosis', 'Treatment', 'Attended By', 'Temperature', 'Blood Pressure',
      'Pulse Rate', 'Weight', 'Height', 'Follow Up Required'
    ];

    const csvRows = [headers.join(',')];
    
    data?.forEach((visit: any) => {
      const row = [
        new Date(visit.visit_date).toLocaleDateString(),
        visit.students?.full_name || '',
        visit.students?.student_id || '',
        visit.visit_type || '',
        visit.symptoms || '',
        visit.diagnosis || '',
        visit.treatment_given || '',
        visit.profiles?.full_name || '',
        visit.temperature || '',
        visit.blood_pressure || '',
        visit.pulse_rate || '',
        visit.weight || '',
        visit.height || '',
        visit.follow_up_required ? 'Yes' : 'No'
      ];
      csvRows.push(row.map(field => `"${field}"`).join(','));
    });

    return csvRows.join('\n');
  };

  const generateImmunizationReport = async () => {
    const { data, error } = await supabase
      .from('immunizations')
      .select(`
        *,
        students(full_name, student_id, form_level)
      `)
      .order('date_administered', { ascending: false });

    if (error) throw error;

    const headers = [
      'Student Name', 'Student ID', 'Form Level', 'Vaccine Name', 
      'Date Administered', 'Administered By', 'Batch Number', 'Next Dose Date', 'Notes'
    ];

    const csvRows = [headers.join(',')];
    
    data?.forEach((immunization: any) => {
      const row = [
        immunization.students?.full_name || '',
        immunization.students?.student_id || '',
        immunization.students?.form_level?.replace('_', ' ') || '',
        immunization.vaccine_name || '',
        new Date(immunization.date_administered).toLocaleDateString(),
        immunization.administered_by || '',
        immunization.batch_number || '',
        immunization.next_dose_date ? new Date(immunization.next_dose_date).toLocaleDateString() : '',
        immunization.notes || ''
      ];
      csvRows.push(row.map(field => `"${field}"`).join(','));
    });

    return csvRows.join('\n');
  };

  const generateMedicationReport = async () => {
    const { data, error } = await supabase
      .from('medication_dispensing')
      .select(`
        *,
        medications(name, generic_name),
        clinic_visits(
          visit_date,
          students(full_name, student_id)
        ),
        profiles(full_name)
      `)
      .order('dispensed_at', { ascending: false });

    if (error) throw error;

    const headers = [
      'Date Dispensed', 'Student Name', 'Student ID', 'Medication Name', 
      'Generic Name', 'Quantity', 'Dosage Instructions', 'Dispensed By'
    ];

    const csvRows = [headers.join(',')];
    
    data?.forEach((dispensing: any) => {
      const row = [
        new Date(dispensing.dispensed_at).toLocaleDateString(),
        dispensing.clinic_visits?.students?.full_name || '',
        dispensing.clinic_visits?.students?.student_id || '',
        dispensing.medications?.name || '',
        dispensing.medications?.generic_name || '',
        dispensing.quantity_dispensed || '',
        dispensing.dosage_instructions || '',
        dispensing.profiles?.full_name || ''
      ];
      csvRows.push(row.map(field => `"${field}"`).join(','));
    });

    return csvRows.join('\n');
  };

  const handleDownload = async () => {
    if (!reportType) {
      toast.error('Please select a report type');
      return;
    }

    setLoading(true);

    try {
      let csvContent = '';
      let filename = '';

      switch (reportType) {
        case 'students':
          csvContent = await generateStudentReport();
          filename = 'students_report';
          break;
        case 'clinic':
          csvContent = await generateClinicReport();
          filename = 'clinic_visits_report';
          break;
        case 'immunizations':
          csvContent = await generateImmunizationReport();
          filename = 'immunizations_report';
          break;
        case 'medications':
          csvContent = await generateMedicationReport();
          filename = 'medications_report';
          break;
        default:
          throw new Error('Invalid report type');
      }

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully');
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error('Error generating report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Download Reports</h2>
        <p className="text-gray-600">Generate and download various system reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Report Generator
          </CardTitle>
          <CardDescription>
            Select report type and date range to generate downloadable reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">Student Profiles</SelectItem>
                  <SelectItem value="clinic">Clinic Visits</SelectItem>
                  <SelectItem value="immunizations">Immunization Records</SelectItem>
                  <SelectItem value="medications">Medication Dispensing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(reportType === 'clinic' || reportType === 'medications') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range (Optional)</label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>
            )}
          </div>

          <Button 
            onClick={handleDownload} 
            disabled={!reportType || loading}
            className="w-full md:w-auto"
          >
            {loading ? (
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

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Report Descriptions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Student Profiles:</strong> Complete student information including medical data</li>
              <li><strong>Clinic Visits:</strong> All clinic visits with symptoms, diagnosis, and treatment</li>
              <li><strong>Immunization Records:</strong> Vaccination history for all students</li>
              <li><strong>Medication Dispensing:</strong> Record of all medications dispensed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDownloader;
