
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, CheckCircle, XCircle, Plus } from 'lucide-react';

interface StudentComplianceCardProps {
  student: any;
  immunizations: any[];
  requirements: any[];
  canManageImmunizations: boolean;
  onAddImmunization: (student: any) => void;
}

const StudentComplianceCard = ({ 
  student, 
  immunizations, 
  requirements, 
  canManageImmunizations, 
  onAddImmunization 
}: StudentComplianceCardProps) => {
  const getComplianceStatus = (student: any) => {
    const studentImmunizations = immunizations.filter((imm: any) => imm.student_id === student.id);
    const requiredVaccines = requirements.filter((req: any) => 
      req.is_mandatory && req.required_for_form_level?.includes(student.form_level)
    );
    
    const completedVaccines = requiredVaccines.filter((req: any) => 
      studentImmunizations.some((imm: any) => imm.vaccine_name === req.vaccine_name)
    );

    return {
      completed: completedVaccines.length,
      total: requiredVaccines.length,
      percentage: requiredVaccines.length > 0 ? (completedVaccines.length / requiredVaccines.length) * 100 : 100
    };
  };

  const compliance = getComplianceStatus(student);
  const isCompliant = compliance.percentage === 100;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{student.full_name}</CardTitle>
              <CardDescription>
                {student.student_id} • {student.form_level?.replace('_', ' ')}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isCompliant ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <Badge className={isCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {compliance.completed}/{compliance.total}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${isCompliant ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${compliance.percentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            Vaccination compliance: {compliance.percentage.toFixed(0)}%
          </p>
          {canManageImmunizations && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onAddImmunization(student)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Vaccination
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentComplianceCard;
