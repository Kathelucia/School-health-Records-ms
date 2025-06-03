
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  Shield,
  Eye,
  Heart
} from 'lucide-react';

interface StudentCardProps {
  student: any;
  onClick: () => void;
}

const StudentCard = ({ student, onClick }: StudentCardProps) => {
  const getFormLevelDisplay = (formLevel: string) => {
    return formLevel?.replace('_', ' ').toUpperCase() || 'N/A';
  };

  const getGenderColor = (gender: string) => {
    switch (gender?.toLowerCase()) {
      case 'male': return 'bg-blue-100 text-blue-800';
      case 'female': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasHealthAlerts = student.chronic_conditions || student.allergies;
  const age = student.date_of_birth 
    ? new Date().getFullYear() - new Date(student.date_of_birth).getFullYear()
    : null;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                {student.full_name}
              </CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <span>ID: {student.student_id || 'N/A'}</span>
                {student.admission_number && (
                  <>
                    <span>•</span>
                    <span>Adm: {student.admission_number}</span>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          {hasHealthAlerts && (
            <div className="flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <Heart className="w-4 h-4 text-red-500" />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={getGenderColor(student.gender)}>
              {student.gender || 'Unknown'}
            </Badge>
            <Badge variant="outline">
              {getFormLevelDisplay(student.form_level)}
            </Badge>
            {student.stream && (
              <Badge variant="secondary">
                {student.stream}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {age && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Age: {age} years</span>
            </div>
          )}
          
          {student.county && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{student.county}, {student.sub_county || 'Kenya'}</span>
            </div>
          )}

          {hasHealthAlerts && (
            <div className="p-2 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 text-red-700">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Medical Alerts</span>
              </div>
              <div className="mt-1 text-xs text-red-600">
                {student.chronic_conditions && (
                  <div>Chronic: {student.chronic_conditions}</div>
                )}
                {student.allergies && (
                  <div>Allergies: {student.allergies}</div>
                )}
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={onClick}
          className="w-full mt-4 group-hover:bg-blue-600 transition-colors"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default StudentCard;
