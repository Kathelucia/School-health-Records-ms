
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Syringe, Calendar } from 'lucide-react';

interface ImmunizationCardProps {
  immunization: any;
}

const ImmunizationCard = ({ immunization }: ImmunizationCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Syringe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{immunization.students?.full_name}</CardTitle>
              <CardDescription>
                {immunization.students?.student_id} • {immunization.students?.form_level?.replace('_', ' ')}
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            {immunization.vaccine_name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>Administered: {new Date(immunization.date_administered).toLocaleDateString()}</span>
          </div>
          
          {immunization.administered_by && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Administered by:</span>
              <span className="ml-1 text-gray-600">{immunization.administered_by}</span>
            </div>
          )}
          
          {immunization.batch_number && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Batch:</span>
              <span className="ml-1 text-gray-600">{immunization.batch_number}</span>
            </div>
          )}
          
          {immunization.next_dose_date && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Next dose:</span>
              <span className="ml-1 text-gray-600">{new Date(immunization.next_dose_date).toLocaleDateString()}</span>
            </div>
          )}
          
          {immunization.notes && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Notes:</span>
              <p className="text-gray-600 mt-1">{immunization.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImmunizationCard;
