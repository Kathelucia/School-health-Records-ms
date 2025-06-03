
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  AlertTriangle, 
  Phone, 
  MapPin,
  Calendar
} from 'lucide-react';

interface StudentCardProps {
  student: any;
  onClick: () => void;
}

const StudentCard = ({ student, onClick }: StudentCardProps) => {
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

  const riskLevel = getRiskLevel(student);
  const age = calculateAge(student.date_of_birth);

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{student.full_name}</CardTitle>
            <CardDescription>
              {student.form_level?.replace('_', ' ').toUpperCase()} 
              {student.stream && ` • Stream ${student.stream}`} 
              • Age {age}
            </CardDescription>
          </div>
          <Badge className={getRiskColor(riskLevel)}>
            {riskLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {student.student_id && (
            <div className="text-sm">
              <span className="text-gray-600">ID:</span> {student.student_id}
            </div>
          )}
          
          {(student.allergies || student.chronic_conditions) && (
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
              <span className="text-sm text-red-600">
                Medical alerts on file
              </span>
            </div>
          )}
          
          {student.parent_guardian_name && (
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm text-gray-600 truncate">
                {student.parent_guardian_name}
              </span>
            </div>
          )}
          
          {student.county && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm text-gray-600 truncate">
                {student.county}
              </span>
            </div>
          )}
          
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-sm text-gray-600">
              Admitted: {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentCard;
