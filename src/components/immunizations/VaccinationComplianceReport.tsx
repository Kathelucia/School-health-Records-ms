
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, TrendingUp, Users } from 'lucide-react';

interface VaccinationComplianceReportProps {
  students: any[];
  immunizations: any[];
  requirements: any[];
}

const VaccinationComplianceReport = ({ students, immunizations, requirements }: VaccinationComplianceReportProps) => {
  const generateComplianceData = () => {
    const complianceByForm: any = {};
    const complianceByVaccine: any = {};
    let totalCompliant = 0;

    // Initialize form level data
    ['form_1', 'form_2', 'form_3', 'form_4'].forEach(form => {
      complianceByForm[form] = { total: 0, compliant: 0 };
    });

    // Initialize vaccine data
    requirements.forEach(req => {
      complianceByVaccine[req.vaccine_name] = { required: 0, administered: 0 };
    });

    students.forEach(student => {
      const studentImmunizations = immunizations.filter(imm => imm.student_id === student.id);
      const requiredVaccines = requirements.filter(req => 
        req.is_mandatory && req.required_for_form_level?.includes(student.form_level)
      );
      
      complianceByForm[student.form_level].total++;
      
      let studentCompliant = true;
      requiredVaccines.forEach(req => {
        complianceByVaccine[req.vaccine_name].required++;
        const hasVaccine = studentImmunizations.some(imm => imm.vaccine_name === req.vaccine_name);
        if (hasVaccine) {
          complianceByVaccine[req.vaccine_name].administered++;
        } else {
          studentCompliant = false;
        }
      });

      if (studentCompliant) {
        complianceByForm[student.form_level].compliant++;
        totalCompliant++;
      }
    });

    return {
      overall: students.length > 0 ? (totalCompliant / students.length) * 100 : 0,
      byForm: complianceByForm,
      byVaccine: complianceByVaccine,
      totalStudents: students.length,
      totalCompliant
    };
  };

  const exportReport = () => {
    const data = generateComplianceData();
    const reportContent = `
Vaccination Compliance Report
Generated on: ${new Date().toLocaleDateString()}

Overall Compliance: ${data.overall.toFixed(1)}%
Total Students: ${data.totalStudents}
Compliant Students: ${data.totalCompliant}

Form Level Breakdown:
${Object.entries(data.byForm).map(([form, stats]: [string, any]) => 
  `${form.replace('_', ' ').toUpperCase()}: ${stats.compliant}/${stats.total} (${stats.total > 0 ? ((stats.compliant/stats.total)*100).toFixed(1) : 0}%)`
).join('\n')}

Vaccine Coverage:
${Object.entries(data.byVaccine).map(([vaccine, stats]: [string, any]) => 
  `${vaccine}: ${stats.administered}/${stats.required} (${stats.required > 0 ? ((stats.administered/stats.required)*100).toFixed(1) : 0}%)`
).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaccination-compliance-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const data = generateComplianceData();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overall.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {data.totalCompliant} of {data.totalStudents} students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Active student profiles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Required Vaccines</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requirements.filter(r => r.is_mandatory).length}</div>
            <p className="text-xs text-muted-foreground">
              Mandatory vaccinations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Level Compliance */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance by Form Level</CardTitle>
          <CardDescription>Vaccination compliance rates across different form levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.byForm).map(([form, stats]: [string, any]) => {
              const percentage = stats.total > 0 ? (stats.compliant / stats.total) * 100 : 0;
              return (
                <div key={form} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{form.replace('_', ' ').toUpperCase()}</span>
                    <Badge variant={percentage === 100 ? 'default' : percentage >= 80 ? 'secondary' : 'destructive'}>
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{stats.compliant}/{stats.total}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Vaccine Coverage */}
      <Card>
        <CardHeader>
          <CardTitle>Vaccine Coverage</CardTitle>
          <CardDescription>Coverage rates for each required vaccine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.byVaccine).map(([vaccine, stats]: [string, any]) => {
              const percentage = stats.required > 0 ? (stats.administered / stats.required) * 100 : 0;
              return (
                <div key={vaccine} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{vaccine}</span>
                    <Badge variant={percentage === 100 ? 'default' : percentage >= 80 ? 'secondary' : 'destructive'}>
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{stats.administered}/{stats.required}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={exportReport}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  );
};

export default VaccinationComplianceReport;
