
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadSectionProps {
  file: File | null;
  uploading: boolean;
  progress: number;
  onFileChange: (file: File | null) => void;
  onUpload: () => void;
  onDownloadTemplate: () => void;
}

const FileUploadSection = ({
  file,
  uploading,
  progress,
  onFileChange,
  onUpload,
  onDownloadTemplate
}: FileUploadSectionProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.toLowerCase();
      if (!fileExtension.endsWith('.csv')) {
        toast.error('Please select a CSV file (.csv)');
        return;
      }
      onFileChange(selectedFile);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSpreadsheet className="w-5 h-5 mr-2" />
          Upload Students File
        </CardTitle>
        <CardDescription>
          Upload a CSV file (.csv) containing student information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select File</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Make sure your file follows the required format. Download a template below for reference.
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onDownloadTemplate}
            variant="outline"
            className="flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Download CSV Template
          </Button>
          <Button
            onClick={onUpload}
            disabled={!file || uploading}
            className="flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Students'}
          </Button>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Upload Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploadSection;
