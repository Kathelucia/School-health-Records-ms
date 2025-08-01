
export interface ClinicVisit {
  id: string;
  student_id: string;
  visit_date: string;
  visit_type: 'routine' | 'sick_visit' | 'emergency' | 'follow_up' | 'screening';
  symptoms?: string;
  diagnosis?: string;
  treatment_given?: string;
  temperature?: number;
  blood_pressure?: string;
  pulse_rate?: number;
  weight?: number;
  height?: number;
  follow_up_required: boolean;
  follow_up_date?: string;
  notes?: string;
  attended_by: string;
  medications_dispensed?: any;
  created_at: string;
  updated_at: string;
  students?: {
    id: string;
    full_name: string;
    student_id: string;
    admission_number?: string;
    form_level?: string;
    stream?: string;
  };
}

export interface VitalSigns {
  temperature?: number;
  blood_pressure?: string;
  pulse_rate?: number;
  weight?: number;
  height?: number;
}

export interface VisitFormData {
  student_id: string;
  visit_date: string;
  visit_type: string;
  symptoms: string;
  diagnosis: string;
  treatment_given: string;
  temperature: string;
  blood_pressure: string;
  pulse_rate: string;
  weight: string;
  height: string;
  follow_up_required: boolean;
  follow_up_date: string;
  notes: string;
  attended_by: string;
}
