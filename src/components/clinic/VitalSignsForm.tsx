
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface VitalSignsFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

const VitalSignsForm = ({ formData, setFormData }: VitalSignsFormProps) => {
  const handleVitalChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-red-600" />
          Vital Signs Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="temperature" className="text-sm font-medium">
              Temperature (°C)
            </Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="30"
              max="45"
              value={formData.temperature}
              onChange={(e) => handleVitalChange('temperature', e.target.value)}
              placeholder="36.5"
              className="text-center"
            />
            <p className="text-xs text-gray-500">Normal: 36.1-37.2°C</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blood_pressure" className="text-sm font-medium">
              Blood Pressure (mmHg)
            </Label>
            <Input
              id="blood_pressure"
              value={formData.blood_pressure}
              onChange={(e) => handleVitalChange('blood_pressure', e.target.value)}
              placeholder="120/80"
              className="text-center"
            />
            <p className="text-xs text-gray-500">Format: systolic/diastolic</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pulse_rate" className="text-sm font-medium">
              Pulse Rate (bpm)
            </Label>
            <Input
              id="pulse_rate"
              type="number"
              min="40"
              max="200"
              value={formData.pulse_rate}
              onChange={(e) => handleVitalChange('pulse_rate', e.target.value)}
              placeholder="72"
              className="text-center"
            />
            <p className="text-xs text-gray-500">Normal: 60-100 bpm</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm font-medium">
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              max="200"
              value={formData.weight}
              onChange={(e) => handleVitalChange('weight', e.target.value)}
              placeholder="65.5"
              className="text-center"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height" className="text-sm font-medium">
              Height (cm)
            </Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              min="0"
              max="250"
              value={formData.height}
              onChange={(e) => handleVitalChange('height', e.target.value)}
              placeholder="170.5"
              className="text-center"
            />
          </div>

          {formData.weight && formData.height && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">BMI</Label>
              <div className="p-2 bg-gray-50 rounded-md text-center">
                <span className="font-medium">
                  {(parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-gray-500">Calculated automatically</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VitalSignsForm;
