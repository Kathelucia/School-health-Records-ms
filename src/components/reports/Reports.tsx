
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp,
  Users,
  Activity,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface ReportsProps {
  userRole: 'nurse' | 'admin';
}

const Reports = ({ userRole }: ReportsProps) => {
  const reportCategories = [
    {
      title: "Health Trends",
      description: "Analyze health patterns and trends across student population",
      icon: TrendingUp,
      reports: [
        { name: "Monthly Health Summary", lastGenerated: "2024-01-15", format: "PDF" },
        { name: "Seasonal Illness Trends", lastGenerated: "2024-01-10", format: "CSV" },
        { name: "Emergency Response Statistics", lastGenerated: "2024-01-08", format: "PDF" }
      ]
    },
    {
      title: "Student Health Records",
      description: "Individual and group health record reports",
      icon: Users,
      reports: [
        { name: "Vaccination Compliance Report", lastGenerated: "2024-01-12", format: "PDF" },
        { name: "Students with Chronic Conditions", lastGenerated: "2024-01-14", format: "CSV" },
        { name: "Allergy Alert Summary", lastGenerated: "2024-01-16", format: "PDF" }
      ]
    },
    {
      title: "Clinic Operations",
      description: "Clinic visit statistics and operational metrics",
      icon: Activity,
      reports: [
        { name: "Daily Clinic Visit Log", lastGenerated: "2024-01-18", format: "PDF" },
        { name: "Medication Usage Report", lastGenerated: "2024-01-15", format: "CSV" },
        { name: "Peak Hours Analysis", lastGenerated: "2024-01-10", format: "PDF" }
      ]
    },
    {
      title: "Compliance & Safety",
      description: "Regulatory compliance and safety monitoring reports",
      icon: AlertTriangle,
      adminOnly: true,
      reports: [
        { name: "Health & Safety Compliance", lastGenerated: "2024-01-01", format: "PDF" },
        { name: "Incident Reports Summary", lastGenerated: "2024-01-05", format: "CSV" },
        { name: "Staff Training Records", lastGenerated: "2024-01-03", format: "PDF" }
      ]
    }
  ];

  const quickStats = [
    { label: "Reports Generated This Month", value: "24", trend: "+15%" },
    { label: "Most Common Visit Reason", value: "Headache", percentage: "32%" },
    { label: "Vaccination Compliance", value: "94%", trend: "+2%" },
    { label: "Emergency Incidents", value: "2", trend: "-50%" }
  ];

  const visibleCategories = reportCategories.filter(category => 
    !category.adminOnly || userRole === 'admin'
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Health Reports & Analytics</h2>
        <p className="text-gray-600">Generate and analyze health data reports</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.trend && (
                  <Badge variant={stat.trend.startsWith('+') ? 'default' : 'secondary'}>
                    {stat.trend}
                  </Badge>
                )}
                {stat.percentage && (
                  <Badge variant="outline">{stat.percentage}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Categories */}
      <div className="space-y-8">
        {visibleCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <category.icon className="w-5 h-5 mr-2 text-blue-600" />
                {category.title}
                {category.adminOnly && (
                  <Badge variant="secondary" className="ml-2">Admin Only</Badge>
                )}
              </CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {category.reports.map((report, reportIndex) => (
                  <div key={reportIndex} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900">{report.name}</h4>
                          <p className="text-sm text-gray-500">
                            Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{report.format}</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Generate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Report Builder */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
            Custom Report Builder
          </CardTitle>
          <CardDescription>
            Create custom reports with specific date ranges and criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select className="w-full p-2 border rounded">
                <option>Clinic Visits</option>
                <option>Medication Usage</option>
                <option>Health Alerts</option>
                <option>Student Profiles</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select className="w-full p-2 border rounded">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Custom range</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <select className="w-full p-2 border rounded">
                <option>PDF Report</option>
                <option>Excel Spreadsheet</option>
                <option>CSV Data</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Report
            </Button>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
