
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Heart,
  Stethoscope,
  Syringe,
  AlertTriangle,
  Shield,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StudentDetailsProps {
  student: any;
  onBack: () => void;
  onEdit: () => void;
}

const StudentDetails = ({ student, onBack, onEdit }: StudentDetailsProps) => {
  const [clinicVisits, setClinicVisits] = useState([]);
  const [immunizations, setImmunizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentRecords();
  }, [student.id]);

  const fetchStudentRecords = async () => {
    try {
      // Fetch clinic visits
      const { data: visits, error: visitsError } = await supabase
        .from('clinic_visits')
        .select(`
          *,
          profiles:attended_by(full_name)
        `)
        .eq('student_id', student.id)
        .order('visit_date', { ascending: false });

      if (visitsError) throw visitsError;

      // Fetch immunizations
      const { data: immunizationData, error: immunizationsError } = await supabase
        .from('immunizations')
        .select('*')
        .eq('student_id', student.id)
        .order('date_administered', { ascending: false });

      if (immunizationsError) throw immunizationsError;

      setClinicVisits(visits || []);
      setImmunizations(immunizationData || []);
    } catch (error) {
      console.error('Error fetching student records:', error);
      toast.error('Error loading student records');
    } finally {
      setLoading(false);
    }
  };

  const getFormLevelDisplay = (formLevel: string) => {
    return formLevel?.replace('_', ' ').toUpperCase() || 'N/A';
  };

  const age = student.date_of_birth 
    ? new Date().getFullYear() - new Date(student.date_of_birth).getFullYear()
    : null;

  const hasHealthAlerts = student.chronic_conditions || student.allergies;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{student.full_name}</h2>
            <p className="text-gray-600">Student ID: {student.student_id}</p>
          </div>
        </div>
        <Button onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {hasHealthAlerts && (
        <Card className="border-red-200 bg-red-50 animate-pulse">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-800">Medical Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {student.chronic_conditions && (
                <div>
                  <span className="font-medium text-red-700">Chronic Conditions: </span>
                  <span className="text-red-600">{student.chronic_conditions}</span>
                </div>
              )}
              {student.allergies && (
                <div>
                  <span className="font-medium text-red-700">Allergies: </span>
                  <span className="text-red-600">{student.allergies}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="visits">Clinic Visits</TabsTrigger>
          <TabsTrigger value="immunizations">Immunizations</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Info</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900">{student.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900">{student.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900">
                      {student.date_of_birth 
                        ? new Date(student.date_of_birth).toLocaleDateString()
                        : 'Not specified'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Age</label>
                    <p className="text-gray-900">{age ? `${age} years` : 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Blood Group</label>
                    <p className="text-gray-900">{student.blood_group || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Admission Date</label>
                    <p className="text-gray-900">
                      {student.admission_date 
                        ? new Date(student.admission_date).toLocaleDateString()
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{getFormLevelDisplay(student.form_level)}</Badge>
                  {student.stream && <Badge variant="secondary">{student.stream}</Badge>}
                  <Badge className={student.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {student.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Student ID</label>
                    <p className="text-gray-900">{student.student_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Admission Number</label>
                    <p className="text-gray-900">{student.admission_number || 'Not assigned'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">County</label>
                  <p className="text-gray-900">{student.county || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Sub-County</label>
                  <p className="text-gray-900">{student.sub_county || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ward</label>
                  <p className="text-gray-900">{student.ward || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Village</label>
                  <p className="text-gray-900">{student.village || 'Not specified'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-600" />
                  Health Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Chronic Conditions</label>
                  <p className="text-gray-900">{student.chronic_conditions || 'None reported'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Allergies</label>
                  <p className="text-gray-900">{student.allergies || 'None reported'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Parent/Guardian</label>
                  <p className="text-gray-900">{student.parent_guardian_name || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Guardian Phone</label>
                  <p className="text-gray-900">{student.parent_guardian_phone || 'Not specified'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : clinicVisits.length > 0 ? (
            <div className="space-y-4">
              {clinicVisits.map((visit: any) => (
                <Card key={visit.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
                        {new Date(visit.visit_date).toLocaleDateString()}
                      </CardTitle>
                      <Badge variant={visit.visit_type === 'emergency' ? 'destructive' : 'secondary'}>
                        {visit.visit_type?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {visit.symptoms && (
                        <div>
                          <span className="font-medium">Symptoms: </span>
                          <span>{visit.symptoms}</span>
                        </div>
                      )}
                      {visit.diagnosis && (
                        <div>
                          <span className="font-medium">Diagnosis: </span>
                          <span>{visit.diagnosis}</span>
                        </div>
                      )}
                      {visit.treatment_given && (
                        <div>
                          <span className="font-medium">Treatment: </span>
                          <span>{visit.treatment_given}</span>
                        </div>
                      )}
                      {visit.profiles && (
                        <div className="text-sm text-gray-500">
                          Attended by: {visit.profiles.full_name}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Stethoscope className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No clinic visits recorded</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="immunizations" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : immunizations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {immunizations.map((immunization: any) => (
                <Card key={immunization.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Syringe className="w-5 h-5 mr-2 text-blue-600" />
                      {immunization.vaccine_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Date: </span>
                        <span>{new Date(immunization.date_administered).toLocaleDateString()}</span>
                      </div>
                      {immunization.administered_by && (
                        <div>
                          <span className="font-medium">Administered by: </span>
                          <span>{immunization.administered_by}</span>
                        </div>
                      )}
                      {immunization.batch_number && (
                        <div>
                          <span className="font-medium">Batch: </span>
                          <span>{immunization.batch_number}</span>
                        </div>
                      )}
                      {immunization.next_dose_date && (
                        <div>
                          <span className="font-medium">Next dose: </span>
                          <span>{new Date(immunization.next_dose_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Syringe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No immunization records found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Emergency Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Parent/Guardian Name</label>
                  <p className="text-gray-900 text-lg">{student.parent_guardian_name || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                  <p className="text-gray-900 text-lg">{student.parent_guardian_phone || 'Not specified'}</p>
                </div>
                {student.emergency_contact && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Additional Emergency Contact</label>
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <pre className="text-sm">{JSON.stringify(student.emergency_contact, null, 2)}</pre>
                    </div>
                  </div>
                )}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-yellow-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Important</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Always contact emergency contacts immediately for serious medical situations or injuries.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDetails;
