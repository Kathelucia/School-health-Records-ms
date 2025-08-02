
import { useState } from 'react';
import { Upload, Users, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import FileUploadSection from './FileUploadSection';
import UploadResults from './UploadResults';
import FormatRequirements from './FormatRequirements';
import { parseCSV, processStudentUpload, downloadCSVTemplate } from '@/utils/csvUploadUtils';

interface BulkUploadProps {
  userRole: string;
}

const BulkUpload = ({ userRole }: BulkUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setResults(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const students = await parseCSV(file);
      const uploadResults = await processStudentUpload(students, setProgress);
      
      setResults(uploadResults);

      if (uploadResults.success > 0) {
        toast.success(`Successfully uploaded ${uploadResults.success} students`);
      }
      if (uploadResults.failed > 0) {
        toast.error(`Failed to upload ${uploadResults.failed} students`);
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Error processing file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Allow both admin and nurse to upload students
  if (!['admin', 'nurse'].includes(userRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">
            Only administrators and nurses can perform bulk data uploads. 
            Please contact your system administrator for access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bulk Student Data Upload</h1>
              <p className="text-gray-600 mt-1">Import student records from CSV files efficiently</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <Users className="w-4 h-4" />
              <span>{userRole === 'admin' ? 'Administrator' : 'Nurse'} Access</span>
            </div>
            {results && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <span>Last upload: {results.success} successful, {results.failed} failed</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="xl:col-span-2 space-y-6">
            <FileUploadSection
              file={file}
              uploading={uploading}
              progress={progress}
              onFileChange={handleFileChange}
              onUpload={handleUpload}
              onDownloadTemplate={downloadCSVTemplate}
            />

            {results && <UploadResults results={results} />}
          </div>

          {/* Requirements Section */}
          <div className="xl:col-span-1">
            <FormatRequirements />
          </div>
        </div>

        {/* Quick Stats */}
        {!uploading && !results && (
          <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FileSpreadsheet className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">CSV Format</h4>
                <p className="text-sm text-gray-600 mt-1">Use comma-separated values with proper headers</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Batch Upload</h4>
                <p className="text-sm text-gray-600 mt-1">Upload hundreds of student records at once</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Error Reporting</h4>
                <p className="text-sm text-gray-600 mt-1">Get detailed feedback on any upload issues</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;
