
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MedicalDocumentManagerProps {
  studentId: string;
  studentName: string;
}

const MedicalDocumentManager = ({ studentId, studentName }: MedicalDocumentManagerProps) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [studentId]);

  const fetchDocuments = async () => {
    try {
      // This would fetch from a medical_documents table
      // For now, we'll use a placeholder
      setDocuments([]);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF and image files are allowed');
        return;
      }
      
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile || !documentType) {
      toast.error('Please select a file and document type');
      return;
    }

    setUploading(true);
    try {
      // Upload to Supabase storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${studentId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('medical_documents')
        .insert([{
          student_id: studentId,
          document_type: documentType,
          file_name: selectedFile.name,
          file_path: fileName,
          description: description,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (dbError) throw dbError;

      toast.success('Document uploaded successfully');
      setSelectedFile(null);
      setDocumentType('');
      setDescription('');
      fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error('Error uploading document: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Medical Documents - {studentName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical_report">Medical Report</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="lab_results">Lab Results</SelectItem>
                    <SelectItem value="vaccination_record">Vaccination Record</SelectItem>
                    <SelectItem value="doctors_note">Doctor's Note</SelectItem>
                    <SelectItem value="specialist_report">Specialist Report</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the document"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
              <p className="text-xs text-gray-500">
                Supported formats: PDF, JPG, PNG (Max: 5MB)
              </p>
            </div>
            
            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">{selectedFile.name}</span>
                </div>
                <Button
                  onClick={uploadDocument}
                  disabled={uploading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-white"></div>
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Uploaded Documents</h4>
          
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc: any, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.file_name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{doc.document_type.replace('_', ' ')}</Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No medical documents uploaded yet</p>
              <p className="text-sm">Upload documents using the form above</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalDocumentManager;
