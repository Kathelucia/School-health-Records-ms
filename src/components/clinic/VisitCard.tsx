
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Stethoscope, 
  Calendar, 
  User, 
  AlertCircle, 
  FileText, 
  Activity,
  Clock,
  Edit,
  Eye
} from 'lucide-react';
import { ClinicVisit } from './types';

interface VisitCardProps {
  visit: ClinicVisit;
  onEdit?: (visit: ClinicVisit) => void;
  onView?: (visit: ClinicVisit) => void;
  canEdit?: boolean;
}

const VisitCard = ({ visit, onEdit, onView, canEdit = false }: VisitCardProps) => {
  const getVisitTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'sick_visit': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'follow_up': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'screening': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getVisitTypeLabel = (type: string) => {
    switch (type) {
      case 'sick_visit': return 'Sick Visit';
      case 'follow_up': return 'Follow-up';
      case 'screening': return 'Health Screening';
      case 'emergency': return 'Emergency';
      default: return 'Routine Check-up';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {visit.students?.full_name || 'Unknown Student'}
              </CardTitle>
              <CardDescription className="text-sm">
                ID: {visit.students?.student_id || 'N/A'} • 
                {visit.students?.form_level && (
                  <span className="ml-1">
                    {visit.students.form_level.replace('_', ' ')} {visit.students.stream}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <Badge className={`${getVisitTypeColor(visit.visit_type)} border`}>
            {getVisitTypeLabel(visit.visit_type)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Visit Details */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(visit.visit_date)}</span>
        </div>

        {/* Symptoms */}
        {visit.symptoms && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Chief Complaint</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 pl-6">{visit.symptoms}</p>
          </div>
        )}

        {/* Diagnosis */}
        {visit.diagnosis && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Diagnosis</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 pl-6">{visit.diagnosis}</p>
          </div>
        )}

        {/* Vital Signs Summary */}
        {(visit.temperature || visit.pulse_rate || visit.blood_pressure) && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700">Vital Signs</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {visit.temperature && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Temp:</span>
                  <span className="font-medium">{visit.temperature}°C</span>
                </div>
              )}
              {visit.pulse_rate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Pulse:</span>
                  <span className="font-medium">{visit.pulse_rate} bpm</span>
                </div>
              )}
              {visit.blood_pressure && (
                <div className="flex justify-between col-span-2">
                  <span className="text-gray-500">BP:</span>
                  <span className="font-medium">{visit.blood_pressure} mmHg</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Follow-up Alert */}
        {visit.follow_up_required && (
          <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
            <Clock className="w-4 h-4" />
            <span className="font-medium">
              Follow-up required
              {visit.follow_up_date && (
                <span className="ml-1">
                  on {new Date(visit.follow_up_date).toLocaleDateString()}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(visit)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(visit)}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Visit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitCard;
