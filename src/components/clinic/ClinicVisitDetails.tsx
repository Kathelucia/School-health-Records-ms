
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Calendar, 
  Stethoscope, 
  Activity, 
  FileText, 
  Pill,
  Clock,
  AlertCircle
} from 'lucide-react';
import { ClinicVisit } from './types';

interface ClinicVisitDetailsProps {
  visit: ClinicVisit | null;
  isOpen: boolean;
  onClose: () => void;
}

const ClinicVisitDetails = ({ visit, isOpen, onClose }: ClinicVisitDetailsProps) => {
  if (!visit) return null;

  const getVisitTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'sick_visit': return 'bg-orange-100 text-orange-800';
      case 'follow_up': return 'bg-blue-100 text-blue-800';
      case 'screening': return 'bg-purple-100 text-purple-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getVisitTypeLabel = (type: string) => {
    switch (type) {
      case 'sick_visit': return 'Sick Visit';
      case 'follow_up': return 'Follow-up Visit';
      case 'screening': return 'Health Screening';
      case 'emergency': return 'Emergency';
      default: return 'Routine Check-up';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-6">
          <DialogTitle className="flex items-center justify-between text-2xl font-bold text-gray-900">
            <div className="flex items-center">
              <Stethoscope className="w-7 h-7 mr-3 text-blue-600" />
              Clinic Visit Details
            </div>
            <Badge className={getVisitTypeColor(visit.visit_type)}>
              {getVisitTypeLabel(visit.visit_type)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Student Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <p className="text-gray-900">{visit.students?.full_name || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Student ID:</span>
                <p className="text-gray-900">{visit.students?.student_id || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Admission Number:</span>
                <p className="text-gray-900">{visit.students?.admission_number || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Class:</span>
                <p className="text-gray-900">
                  {visit.students?.form_level?.replace('_', ' ')} {visit.students?.stream}
                </p>
              </div>
            </div>
          </div>

          {/* Visit Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Visit Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Visit Date:</span>
                <p className="text-gray-900">
                  {new Date(visit.visit_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Visit Type:</span>
                <p className="text-gray-900">{getVisitTypeLabel(visit.visit_type)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Clinical Assessment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Clinical Assessment
            </h3>
            <div className="space-y-4">
              {visit.symptoms && (
                <div>
                  <span className="font-medium text-gray-700">Chief Complaint / Symptoms:</span>
                  <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{visit.symptoms}</p>
                </div>
              )}
              {visit.diagnosis && (
                <div>
                  <span className="font-medium text-gray-700">Diagnosis:</span>
                  <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{visit.diagnosis}</p>
                </div>
              )}
              {visit.treatment_given && (
                <div>
                  <span className="font-medium text-gray-700">Treatment Given:</span>
                  <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{visit.treatment_given}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vital Signs */}
          {(visit.temperature || visit.blood_pressure || visit.pulse_rate || visit.weight || visit.height) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
                  <Activity className="w-5 h-5 mr-2 text-red-600" />
                  Vital Signs
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {visit.temperature && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Temperature</span>
                      <p className="text-lg font-semibold text-gray-900">{visit.temperature}°C</p>
                    </div>
                  )}
                  {visit.blood_pressure && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Blood Pressure</span>
                      <p className="text-lg font-semibold text-gray-900">{visit.blood_pressure} mmHg</p>
                    </div>
                  )}
                  {visit.pulse_rate && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Pulse Rate</span>
                      <p className="text-lg font-semibold text-gray-900">{visit.pulse_rate} bpm</p>
                    </div>
                  )}
                  {visit.weight && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Weight</span>
                      <p className="text-lg font-semibold text-gray-900">{visit.weight} kg</p>
                    </div>
                  )}
                  {visit.height && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Height</span>
                      <p className="text-lg font-semibold text-gray-900">{visit.height} cm</p>
                    </div>
                  )}
                  {visit.weight && visit.height && (
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">BMI</span>
                      <p className="text-lg font-semibold text-gray-900">
                        {(parseFloat(visit.weight.toString()) / Math.pow(parseFloat(visit.height.toString()) / 100, 2)).toFixed(1)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Follow-up */}
          {visit.follow_up_required && (
            <>
              <Separator />
              <div className="bg-amber-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
                  <Clock className="w-5 h-5 mr-2 text-amber-600" />
                  Follow-up Required
                </h3>
                {visit.follow_up_date && (
                  <p className="text-gray-700">
                    Scheduled for: {new Date(visit.follow_up_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Additional Notes */}
          {visit.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{visit.notes}</p>
              </div>
            </>
          )}

          {/* Record Information */}
          <Separator />
          <div className="text-xs text-gray-500 space-y-1">
            <p>Record created: {new Date(visit.created_at).toLocaleString()}</p>
            {visit.updated_at !== visit.created_at && (
              <p>Last updated: {new Date(visit.updated_at).toLocaleString()}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClinicVisitDetails;
