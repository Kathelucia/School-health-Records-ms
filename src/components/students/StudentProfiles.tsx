
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  User, 
  AlertTriangle, 
  Phone, 
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';

interface StudentProfilesProps {
  userRole: 'nurse' | 'admin';
}

const StudentProfiles = ({ userRole }: StudentProfilesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const students = [
    {
      id: 1,
      name: "Emma Johnson",
      grade: "Grade 8",
      age: 13,
      allergies: ["Peanuts", "Shellfish"],
      medications: ["Inhaler"],
      emergencyContact: "Sarah Johnson - (555) 123-4567",
      lastVisit: "2024-01-15",
      riskLevel: "high",
      photo: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Michael Chen",
      grade: "Grade 10",
      age: 15,
      allergies: [],
      medications: ["Multivitamin"],
      emergencyContact: "Li Chen - (555) 987-6543",
      lastVisit: "2024-01-10",
      riskLevel: "low",
      photo: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Sarah Williams",
      grade: "Grade 7",
      age: 12,
      allergies: ["Latex"],
      medications: [],
      emergencyContact: "David Williams - (555) 456-7890",
      lastVisit: "2024-01-18",
      riskLevel: "medium",
      photo: "/placeholder.svg"
    }
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (selectedStudent) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedStudent(null)}>
            ← Back to Students
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Info */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <CardTitle>{selectedStudent.name}</CardTitle>
              <CardDescription>{selectedStudent.grade} • Age {selectedStudent.age}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Risk Level</span>
                <Badge className={getRiskColor(selectedStudent.riskLevel)}>
                  {selectedStudent.riskLevel.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {selectedStudent.emergencyContact}
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Last visit: {selectedStudent.lastVisit}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                  Allergies & Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.allergies.map((allergy: string, index: number) => (
                      <Badge key={index} variant="destructive">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No known allergies</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Medications</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent.medications.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudent.medications.map((medication: string, index: number) => (
                      <div key={index} className="p-3 bg-blue-50 rounded border">
                        <p className="font-medium">{medication}</p>
                        <p className="text-sm text-gray-600">As needed • Last administered: Today 10:30 AM</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No current medications</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Clinic Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">Headache</p>
                      <span className="text-sm text-gray-500">Jan 15, 2024</span>
                    </div>
                    <p className="text-sm text-gray-600">Administered acetaminophen. Returned to class after 30 minutes rest.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Profiles</h2>
          <p className="text-gray-600">Manage student health records and medical information</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search students by name or grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedStudent(student)}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{student.name}</CardTitle>
                  <CardDescription>{student.grade} • Age {student.age}</CardDescription>
                </div>
                <Badge className={getRiskColor(student.riskLevel)}>
                  {student.riskLevel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {student.allergies.length > 0 && (
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                    <span className="text-sm text-red-600">
                      {student.allergies.length} allerg{student.allergies.length === 1 ? 'y' : 'ies'}
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600 truncate">
                    {student.emergencyContact.split(' - ')[0]}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Last visit: {student.lastVisit}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentProfiles;
