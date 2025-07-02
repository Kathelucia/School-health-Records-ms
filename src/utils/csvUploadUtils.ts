
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as any[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const validateStudentData = (student: any): string[] => {
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

export const processStudentUpload = async (
  students: any[],
  onProgress: (progress: number) => void
) => {
  let successCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    onProgress(((i + 1) / students.length) * 100);

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

  return {
    total: students.length,
    success: successCount,
    failed: failedCount,
    errors
  };
};

export const downloadCSVTemplate = () => {
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

  const template = [headers.join(','), sampleData.join(',')].join('\n');
  const blob = new Blob([template], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'student_upload_template.csv';
  a.click();
  window.URL.revokeObjectURL(url);

  toast.success(`CSV template downloaded successfully`);
};
