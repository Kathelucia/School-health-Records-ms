
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Users, 
  Heart, 
  Search, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Calendar,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InsuranceManagementProps {
  userRole: string;
}

const InsuranceManagement = ({ userRole }: InsuranceManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCovered: 0,
    nhifMembers: 0,
    shaMembers: 0,
    uncovered: 0
  });

  useEffect(() => {
    fetchInsuranceData();
  }, []);

  const fetchInsuranceData = async () => {
    try {
      // Fetch students with insurance info
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      // Fetch staff with insurance info
      const { data: staffData, error: staffError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true);

      if (staffError) throw staffError;

      setStudents(studentsData || []);
      setStaff(staffData || []);

      // Calculate stats
      const allMembers = [...(studentsData || []), ...(staffData || [])];
      const nhifCount = allMembers.filter(member => member.nhif_number).length;
      const shaCount = allMembers.filter(member => member.sha_number).length;
      const coveredCount = allMembers.filter(member => member.nhif_number || member.sha_number).length;

      setStats({
        totalCovered: coveredCount,
        nhifMembers: nhifCount,
        shaMembers: shaCount,
        uncovered: allMembers.length - coveredCount
      });

    } catch (error: any) {
      console.error('Error fetching insurance data:', error);
      toast.error('Error loading insurance data');
    } finally {
      setLoading(false);
    }
  };

  const getInsuranceStatus = (member: any) => {
    if (member.nhif_number && member.sha_number) return 'Both';
    if (member.nhif_number) return 'NHIF';
    if (member.sha_number) return 'SHA';
    return 'None';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Both': return 'bg-green-100 text-green-800';
      case 'NHIF': return 'bg-blue-100 text-blue-800';
      case 'SHA': return 'bg-purple-100 text-purple-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const filteredStudents = students.filter((student: any) =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nhif_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.sha_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStaff = staff.filter((member: any) =>
    member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.nhif_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.sha_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <CreditCard className="w-8 h-8 mr-3 text-blue-600" />
          Insurance Management (NHIF/SHA)
        </h2>
        <p className="text-gray-600 mt-1">Manage insurance coverage for students and staff</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Covered</p>
                <p className="text-2xl font-bold">{stats.totalCovered}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">NHIF Members</p>
                <p className="text-2xl font-bold">{stats.nhifMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">SHA Members</p>
                <p className="text-2xl font-bold">{stats.shaMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card warning">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">No Coverage</p>
                <p className="text-2xl font-bold">{stats.uncovered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name, ID, or insurance number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tabs for Students and Staff */}
      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="students" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Staff
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Student Insurance Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStudents.map((student: any, index) => (
                    <div 
                      key={student.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors animate-slide-in-right"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">{student.full_name}</h3>
                          <p className="text-sm text-gray-600">ID: {student.student_id || 'N/A'}</p>
                          {student.nhif_number && (
                            <p className="text-xs text-blue-600">NHIF: {student.nhif_number}</p>
                          )}
                          {student.sha_number && (
                            <p className="text-xs text-purple-600">SHA: {student.sha_number}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getStatusColor(getInsuranceStatus(student))}>
                          {getInsuranceStatus(student)}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Form {student.form_level?.replace('form_', '') || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p>No students found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Staff Insurance Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStaff.map((member: any, index) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors animate-slide-in-right"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">{member.full_name}</h3>
                          <p className="text-sm text-gray-600">ID: {member.employee_id || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{member.department || 'General'}</p>
                          {member.nhif_number && (
                            <p className="text-xs text-blue-600">NHIF: {member.nhif_number}</p>
                          )}
                          {member.sha_number && (
                            <p className="text-xs text-purple-600">SHA: {member.sha_number}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getStatusColor(getInsuranceStatus(member))}>
                          {getInsuranceStatus(member)}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {member.role === 'admin' ? 'Administrator' : 'Nurse'}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {filteredStaff.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p>No staff found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsuranceManagement;
