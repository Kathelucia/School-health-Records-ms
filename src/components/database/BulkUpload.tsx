
import { useState } from 'react';
import { Upload } from 'lucide-react';
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
      <div className="p-6">
        <div className="text-center py-12">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only administrators and nurses can upload bulk data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bulk Database Upload</h2>
        <p className="text-gray-600">Upload student data from CSV files</p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {userRole === 'admin' ? 'Administrator Access' : 'Nurse Access'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      <FormatRequirements />
    </div>
  );
};

export default BulkUpload;
