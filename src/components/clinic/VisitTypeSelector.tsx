
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Stethoscope, Clock, Search, Shield } from 'lucide-react';

interface VisitTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const VisitTypeSelector = ({ value, onChange }: VisitTypeSelectorProps) => {
  const visitTypes = [
    {
      value: 'routine',
      label: 'Routine Check-up',
      icon: Stethoscope,
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'Regular health screening'
    },
    {
      value: 'sick_visit',
      label: 'Sick Visit',
      icon: AlertTriangle,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      description: 'Student feeling unwell'
    },
    {
      value: 'emergency',
      label: 'Emergency',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Urgent medical attention required'
    },
    {
      value: 'follow_up',
      label: 'Follow-up',
      icon: Clock,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Scheduled follow-up visit'
    },
    {
      value: 'screening',
      label: 'Health Screening',
      icon: Search,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Preventive health assessment'
    }
  ];

  const selectedType = visitTypes.find(type => type.value === value);

  return (
    <div className="space-y-3">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select visit type" />
        </SelectTrigger>
        <SelectContent>
          {visitTypes.map((type) => {
            const Icon = type.icon;
            return (
              <SelectItem key={type.value} value={type.value} className="flex items-center">
                <div className="flex items-center space-x-2 py-1">
                  <Icon className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {selectedType && (
        <Badge className={`${selectedType.color} border inline-flex items-center space-x-1`}>
          <selectedType.icon className="w-3 h-3" />
          <span>{selectedType.label}</span>
        </Badge>
      )}
    </div>
  );
};

export default VisitTypeSelector;
