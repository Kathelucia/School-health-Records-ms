
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FormatRequirements = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>File Format Requirements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Supported File Types:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li><strong>CSV Files</strong> - Comma-separated values (.csv)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Required Columns:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li><strong>full_name</strong> - Student's full name (required)</li>
              <li><strong>student_id</strong> - Letters and numbers only (e.g., STU001)</li>
              <li><strong>admission_number</strong> - Numbers only (e.g., 2024001)</li>
              <li><strong>date_of_birth</strong> - Format: YYYY-MM-DD</li>
              <li><strong>gender</strong> - male, female, or other</li>
              <li><strong>form_level</strong> - form_1, form_2, form_3, or form_4</li>
              <li><strong>stream</strong> - Class stream (e.g., East, West)</li>
              <li><strong>blood_group</strong> - A+, A-, B+, B-, AB+, AB-, O+, O-</li>
              <li><strong>parent_guardian_name</strong> - Parent/guardian name</li>
              <li><strong>parent_guardian_phone</strong> - Phone number with country code</li>
              <li><strong>county</strong> - Kenyan county</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormatRequirements;
