
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface UploadResultsProps {
  results: {
    total: number;
    success: number;
    failed: number;
    errors: string[];
  };
}

const UploadResults = ({ results }: UploadResultsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {results.failed === 0 ? (
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 mr-2 text-red-600" />
          )}
          Upload Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{results.total}</div>
            <div className="text-sm text-gray-600">Total Records</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{results.success}</div>
            <div className="text-sm text-gray-600">Successful</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{results.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>

        {results.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600">Errors:</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {results.errors.slice(0, 10).map((error, index) => (
                <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              ))}
              {results.errors.length > 10 && (
                <div className="text-sm text-gray-600">
                  ... and {results.errors.length - 10} more errors
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadResults;
