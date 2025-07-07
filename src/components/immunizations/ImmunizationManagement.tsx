
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Syringe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ImmunizationForm from './ImmunizationForm';
import ImmunizationCard from './ImmunizationCard';
import StudentComplianceCard from './StudentComplianceCard';
import VaccinationComplianceReport from './VaccinationComplianceReport';

interface ImmunizationManagementProps {
  userRole: string;
}

const ImmunizationManagement = ({ userRole }: ImmunizationManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [immunizations, setImmunizations] = useState([]);
  const [students, setStudents] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch immunizations with student data
      const { data: immunizationData, error: immError } = await supabase
        .from('immunizations')
        .select(`
          *,
          students(full_name, student_id, form_level)
        `)
        .order('date_administered', { ascending: false });

      if (immError) throw immError;

      // Fetch students
      const { data: studentData, error: studError } = await supabase
        .from('students')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (studError) throw studError;

      // Fetch vaccination requirements
      const { data: reqData, error: reqError } = await supabase
        .from('vaccination_requirements')
        .select('*')
        .order('vaccine_name');

      if (reqError) throw reqError;

      setImmunizations(immunizationData || []);
      setStudents(studentData || []);
      setRequirements(reqData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Error loading immunization data');
    } finally {
      setLoading(false);
    }
  };

  const filteredImmunizations = immunizations.filter((imm: any) =>
    imm.students?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    imm.students?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    imm.vaccine_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddImmunization = (student?: any) => {
    setSelectedStudent(student || null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedStudent(null);
  };

  const handleFormSave = () => {
    fetchData();
    setShowForm(false);
    setSelectedStudent(null);
  };

  const canManageImmunizations = ['nurse', 'clinical_officer', 'admin'].includes(userRole);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Immunization Management</h2>
          <p className="text-gray-600">Track student vaccinations and compliance</p>
        </div>
        {canManageImmunizations && (
          <Button onClick={() => handleAddImmunization()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Immunization
          </Button>
        )}
      </div>

      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">Immunization Records</TabsTrigger>
          <TabsTrigger value="compliance">Student Compliance</TabsTrigger>
          <TabsTrigger value="reports">Compliance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by student name, ID, or vaccine name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500">Loading immunization records...</div>
            </div>
          ) : filteredImmunizations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredImmunizations.map((immunization: any) => (
                <ImmunizationCard key={immunization.id} immunization={immunization} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Syringe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No immunization records found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'No immunization records have been added yet'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500">Loading compliance data...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {students.map((student: any) => (
                <StudentComplianceCard 
                  key={student.id} 
                  student={student}
                  immunizations={immunizations}
                  requirements={requirements}
                  canManageImmunizations={canManageImmunizations}
                  onAddImmunization={handleAddImmunization}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <VaccinationComplianceReport 
            students={students}
            immunizations={immunizations}
            requirements={requirements}
          />
        </TabsContent>
      </Tabs>

      {showForm && (
        <ImmunizationForm
          student={selectedStudent}
          onClose={handleFormClose}
          onSave={handleFormSave}
          requirements={requirements}
        />
      )}
    </div>
  );
};

export default ImmunizationManagement;
