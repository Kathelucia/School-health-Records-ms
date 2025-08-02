
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, AlertTriangle, Heart, Calendar } from 'lucide-react';

interface StudentCardProps {
  student: any;
  onClick: () => void;
  style?: React.CSSProperties;
}

const StudentCard = ({ student, onClick, style }: StudentCardProps) => {
  const getFormLevelDisplay = (formLevel: string) => {
    if (!formLevel) return '';
    return formLevel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const hasHealthConcerns = student.allergies || student.chronic_conditions;
  const age = student.date_of_birth 
    ? Math.floor((new Date().getTime() - new Date(student.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null;

  return (
    <Card 
      className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-[1.02] animate-fade-in"
      onClick={onClick}
      style={style}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              {hasHealthConcerns && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {student.full_name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {student.student_id && (
                  <Badge variant="secondary" className="text-xs font-medium bg-blue-100 text-blue-700 rounded-lg">
                    ID: {student.student_id}
                  </Badge>
                )}
                {student.admission_number && (
                  <Badge variant="secondary" className="text-xs font-medium bg-gray-100 text-gray-700 rounded-lg">
                    ADM: {student.admission_number}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Academic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Class</p>
            <p className="text-sm font-semibold text-gray-900">
              {student.form_level ? `${getFormLevelDisplay(student.form_level)} ${student.stream || ''}`.trim() : 'Not specified'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">
              {student.gender || 'Not specified'}
            </p>
          </div>
        </div>

        {/* Health Indicators */}
        <div className="space-y-3">
          {student.blood_group && (
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">Blood Group: {student.blood_group}</span>
            </div>
          )}
          
          {age && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Age: {age} years</span>
            </div>
          )}
        </div>

        {/* Health Alerts */}
        {hasHealthConcerns && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-800">Health Alerts</span>
            </div>
            <div className="space-y-1 text-xs">
              {student.allergies && (
                <p className="text-orange-700">• Allergies: {student.allergies.substring(0, 50)}...</p>
              )}
              {student.chronic_conditions && (
                <p className="text-orange-700">• Conditions: {student.chronic_conditions.substring(0, 50)}...</p>
              )}
            </div>
          </div>
        )}

        {/* Contact Info */}
        {student.parent_guardian_name && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">Guardian: {student.parent_guardian_name}</p>
            {student.parent_guardian_phone && (
              <p className="text-xs text-gray-500">Phone: {student.parent_guardian_phone}</p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Added {new Date(student.created_at).toLocaleDateString()}
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600 font-medium">Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentCard;
