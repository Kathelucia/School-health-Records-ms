
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.toLowerCase();
      if (!fileExtension.endsWith('.csv') && 
          !fileExtension.endsWith('.xlsx') && 
          !fileExtension.endsWith('.xls')) {
        toast.error('Please select a CSV or Excel file (.csv, .xlsx, .xls)');
        return;
      }
      setFile(selectedFile);
      setResults(null);
    }
  };

  const parseFile = async (file: File): Promise<any[]> => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      // Parse CSV
      const csvText = await file.text();
      return parseCSV(csvText);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Parse Excel
      return parseExcel(file);
    } else {
      throw new Error('Unsupported file format');
    }
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return data;
  };

  const parseExcel = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            reject(new Error('Empty spreadsheet'));
            return;
          }
          
          // Convert to object format similar to CSV parsing
          const headers = (jsonData[0] as string[]).map(h => String(h).trim());
          const students = [];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (row && row.some(cell => cell !== undefined && cell !== '')) {
              const student: any = {};
              headers.forEach((header, index) => {
                student[header] = row[index] ? String(row[index]).trim() : '';
              });
              students.push(student);
            }
          }
          
          resolve(students);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const validateStudentData = (student: any): string[] => {
    const errors = [];
    
    if (!student.full_name) errors.push('Full name is required');
    if (student.student_id && !/^[A-Za-z0-9]+$/.test(student.student_id)) {
      errors.push('Student ID must contain only letters and numbers');
    }
    if (student.admission_number && !/^[0-9]+$/.test(student.admission_number)) {
      errors.push('Admission number must contain only numbers');
    }
    if (student.email && !/\S+@\S+\.\S+/.test(student.email)) {
      errors.push('Invalid email format');
    }

    return errors;
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const students = await parseFile(file);
      
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        setProgress(((i + 1) / students.length) * 100);

        // Validate data
        const validationErrors = validateStudentData(student);
        if (validationErrors.length > 0) {
          failedCount++;
          errors.push(`Row ${i + 2}: ${validationErrors.join(', ')}`);
          continue;
        }

        try {
          // Prepare student data
          const studentData = {
            full_name: student.full_name,
            student_id: student.student_id || null,
            admission_number: student.admission_number || null,
            date_of_birth: student.date_of_birth || null,
            gender: student.gender || null,
            form_level: student.form_level || null,
            stream: student.stream || null,
            blood_group: student.blood_group || null,
            allergies: student.allergies || null,
            chronic_conditions: student.chronic_conditions || null,
            parent_guardian_name: student.parent_guardian_name || null,
            parent_guardian_phone: student.parent_guardian_phone || null,
            county: student.county || null,
            sub_county: student.sub_county || null,
            ward: student.ward || null,
            village: student.village || null,
            admission_date: student.admission_date || null,
            is_active: true
          };

          const { error } = await supabase
            .from('students')
            .insert([studentData]);

          if (error) throw error;
          successCount++;
        } catch (error: any) {
          failedCount++;
          errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      setResults({
        total: students.length,
        success: successCount,
        failed: failedCount,
        errors
      });

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} students`);
      }
      if (failedCount > 0) {
        toast.error(`Failed to upload ${failedCount} students`);
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Error processing file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = (format: 'csv' | 'excel') => {
    const headers = [
      'full_name', 'student_id', 'admission_number', 'date_of_birth', 'gender',
      'form_level', 'stream', 'blood_group', 'allergies', 'chronic_conditions',
      'parent_guardian_name', 'parent_guardian_phone', 'county', 'sub_county',
      'ward', 'village', 'admission_date'
    ];
    
    const sampleData = [
      'John Doe', 'STU001', '2024001', '2010-01-15', 'male',
      'form_1', 'East', 'O+', '', 'None',
      'Jane Doe', '+254712345678', 'Nairobi', 'Westlands',
      'Parklands', 'Parklands Estate', '2024-01-15'
    ];

    if (format === 'csv') {
      const template = [headers.join(','), sampleData.join(',')].join('\n');
      const blob = new Blob([template], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student_upload_template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // Create Excel template
      const ws = XLSX.utils.aoa_to_sheet([headers, sampleData]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Students');
      XLSX.writeFile(wb, 'student_upload_template.xlsx');
    }
    
    toast.success(`${format.toUpperCase()} template downloaded successfully`);
  };

  if (userRole !== 'admin') {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only administrators can upload bulk data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bulk Database Upload</h2>
        <p className="text-gray-600">Upload student data from CSV or Excel files</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileSpreadsheet className="w-5 h-5 mr-2" />
              Upload Students File
            </CardTitle>
            <CardDescription>
              Upload a CSV or Excel file (.csv, .xlsx, .xls) containing student information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
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
                onClick={() => downloadTemplate('csv')}
                variant="outline"
                className="flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
              
              <Button
                onClick={() => downloadTemplate('excel')}
                variant="outline"
                className="flex items-center"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Download Excel Template
              </Button>
              
              <Button
                onClick={handleUpload}
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

        {results && (
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
        )}
      </div>

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
                <li><strong>Excel Files</strong> - Microsoft Excel (.xlsx, .xls)</li>
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
    </div>
  );
};

export default BulkUpload;
