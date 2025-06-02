
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  AlertTriangle, 
  Phone, 
  MapPin,
  Calendar,
  FileText,
  Stethoscope,
  Pill,
  Edit,
  ArrowLeft
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
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [student.id]);

  const fetchStudentData = async () => {
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
      setClinicVisits(visits || []);

      // Fetch medication dispensing records
      const { data: medicationRecords, error: medError } = await supabase
        .from('medication_dispensing')
        .select(`
          *,
          medications(name, dosage),
          clinic_visits(visit_date, diagnosis)
        `)
        .eq('clinic_visit_id', visits?.[0]?.id || '')
        .order('dispensed_at', { ascending: false });

      if (medError) console.error('Error fetching medications:', medError);
      setMedications(medicationRecords || []);
    } catch (error: any) {
      console.error('Error fetching student data:', error);
      toast.error('Error loading student details');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'Unknown';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getRiskLevel = (student: any) => {
    if (student.chronic_conditions || student.allergies) {
      return 'high';
    }
    return 'low';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const riskLevel = getRiskLevel(student);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students
        </Button>
        <Button onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <CardTitle>{student.full_name}</CardTitle>
            <CardDescription>
              {student.form_level?.replace('_', ' ').toUpperCase()} {student.stream && `• Stream ${student.stream}`}
            </CardDescription>
            <CardDescription>
              Age: {calculateAge(student.date_of_birth)} years
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Risk Level</span>
              <Badge className={getRiskColor(riskLevel)}>
                {riskLevel.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Student ID:</span> {student.student_id || 'N/A'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Admission No:</span> {student.admission_number || 'N/A'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Blood Group:</span> {student.blood_group || 'Unknown'}
              </div>
              
              {student.parent_guardian_name && (
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <div>
                    <div className="font-medium">{student.parent_guardian_name}</div>
                    <div className="text-gray-600">{student.parent_guardian_phone}</div>
                  </div>
                </div>
              )}
              
              {student.county && (
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <div className="text-gray-600">
                    {[student.village, student.ward, student.sub_county, student.county]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="medical" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="medical">Medical Info</TabsTrigger>
              <TabsTrigger value="visits">Clinic Visits</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
            </TabsList>

            <TabsContent value="medical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                    Allergies & Medical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {student.allergies ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-800 font-medium">Known Allergies:</p>
                      <p className="text-red-700">{student.allergies}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No known allergies</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Chronic Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  {student.chronic_conditions ? (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-yellow-800">{student.chronic_conditions}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No chronic conditions recorded</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visits" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2" />
                    Recent Clinic Visits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading visits...</p>
                  ) : clinicVisits.length > 0 ? (
                    <div className="space-y-3">
                      {clinicVisits.map((visit: any) => (
                        <div key={visit.id} className="p-3 border rounded">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium">{visit.diagnosis || 'General Visit'}</p>
                            <span className="text-sm text-gray-500">
                              {new Date(visit.visit_date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Symptoms:</strong> {visit.symptoms || 'None recorded'}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Treatment:</strong> {visit.treatment_given || 'None recorded'}
                          </p>
                          {visit.notes && (
                            <p className="text-sm text-gray-600">
                              <strong>Notes:</strong> {visit.notes}
                            </p>
                          )}
                          {visit.profiles && (
                            <p className="text-xs text-gray-500 mt-2">
                              Attended by: {visit.profiles.full_name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No clinic visits recorded</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Pill className="w-5 h-5 mr-2" />
                    Medication History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading medications...</p>
                  ) : medications.length > 0 ? (
                    <div className="space-y-3">
                      {medications.map((med: any) => (
                        <div key={med.id} className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="font-medium">
                            {med.medications?.name} ({med.medications?.dosage})
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {med.quantity_dispensed}
                          </p>
                          <p className="text-sm text-gray-600">
                            Instructions: {med.dosage_instructions || 'Follow standard dosage'}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Dispensed: {new Date(med.dispensed_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No medications dispensed</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
