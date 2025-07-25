export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clinic_visits: {
        Row: {
          attended_by: string | null
          blood_pressure: string | null
          created_at: string | null
          diagnosis: string | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          height: number | null
          id: string
          medications_dispensed: Json | null
          notes: string | null
          pulse_rate: number | null
          student_id: string | null
          symptoms: string | null
          temperature: number | null
          treatment_given: string | null
          updated_at: string | null
          visit_date: string | null
          visit_type: string | null
          weight: number | null
        }
        Insert: {
          attended_by?: string | null
          blood_pressure?: string | null
          created_at?: string | null
          diagnosis?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          height?: number | null
          id?: string
          medications_dispensed?: Json | null
          notes?: string | null
          pulse_rate?: number | null
          student_id?: string | null
          symptoms?: string | null
          temperature?: number | null
          treatment_given?: string | null
          updated_at?: string | null
          visit_date?: string | null
          visit_type?: string | null
          weight?: number | null
        }
        Update: {
          attended_by?: string | null
          blood_pressure?: string | null
          created_at?: string | null
          diagnosis?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          height?: number | null
          id?: string
          medications_dispensed?: Json | null
          notes?: string | null
          pulse_rate?: number | null
          student_id?: string | null
          symptoms?: string | null
          temperature?: number | null
          treatment_given?: string | null
          updated_at?: string | null
          visit_date?: string | null
          visit_type?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_visits_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          amount_paid: number | null
          clinic_visit_id: string | null
          id: string
          payment_date: string | null
          payment_method: string | null
          receipt_number: string | null
          service_id: string | null
          staff_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          clinic_visit_id?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          service_id?: string | null
          staff_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          clinic_visit_id?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          service_id?: string | null
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_clinic_visit_id_fkey"
            columns: ["clinic_visit_id"]
            isOneToOne: false
            referencedRelation: "clinic_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "health_service_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      health_service_fees: {
        Row: {
          created_at: string | null
          description: string | null
          fee_amount: number
          id: string
          is_active: boolean | null
          service_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          fee_amount: number
          id?: string
          is_active?: boolean | null
          service_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          fee_amount?: number
          id?: string
          is_active?: boolean | null
          service_name?: string
        }
        Relationships: []
      }
      immunizations: {
        Row: {
          administered_by: string | null
          batch_number: string | null
          created_at: string | null
          date_administered: string
          id: string
          next_dose_date: string | null
          notes: string | null
          student_id: string | null
          updated_at: string | null
          vaccine_name: string
        }
        Insert: {
          administered_by?: string | null
          batch_number?: string | null
          created_at?: string | null
          date_administered: string
          id?: string
          next_dose_date?: string | null
          notes?: string | null
          student_id?: string | null
          updated_at?: string | null
          vaccine_name: string
        }
        Update: {
          administered_by?: string | null
          batch_number?: string | null
          created_at?: string | null
          date_administered?: string
          id?: string
          next_dose_date?: string | null
          notes?: string | null
          student_id?: string | null
          updated_at?: string | null
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_dispensing: {
        Row: {
          clinic_visit_id: string | null
          dispensed_at: string | null
          dispensed_by: string | null
          dosage_instructions: string | null
          id: string
          medication_id: string | null
          quantity_dispensed: number | null
        }
        Insert: {
          clinic_visit_id?: string | null
          dispensed_at?: string | null
          dispensed_by?: string | null
          dosage_instructions?: string | null
          id?: string
          medication_id?: string | null
          quantity_dispensed?: number | null
        }
        Update: {
          clinic_visit_id?: string | null
          dispensed_at?: string | null
          dispensed_by?: string | null
          dosage_instructions?: string | null
          id?: string
          medication_id?: string | null
          quantity_dispensed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_dispensing_clinic_visit_id_fkey"
            columns: ["clinic_visit_id"]
            isOneToOne: false
            referencedRelation: "clinic_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_dispensing_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          batch_number: string | null
          created_at: string | null
          dosage: string | null
          expiry_date: string | null
          form: string | null
          generic_name: string | null
          id: string
          manufacturer: string | null
          minimum_stock_level: number | null
          name: string
          quantity_in_stock: number | null
          supplier: string | null
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          dosage?: string | null
          expiry_date?: string | null
          form?: string | null
          generic_name?: string | null
          id?: string
          manufacturer?: string | null
          minimum_stock_level?: number | null
          name: string
          quantity_in_stock?: number | null
          supplier?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          dosage?: string | null
          expiry_date?: string | null
          form?: string | null
          generic_name?: string | null
          id?: string
          manufacturer?: string | null
          minimum_stock_level?: number | null
          name?: string
          quantity_in_stock?: number | null
          supplier?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          related_table: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          related_table?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          related_table?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          employee_id: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      student_progression: {
        Row: {
          academic_year: string
          created_at: string | null
          form_level: Database["public"]["Enums"]["education_level"]
          id: string
          notes: string | null
          promoted: boolean | null
          promotion_date: string | null
          stream: string | null
          student_id: string | null
          term: Database["public"]["Enums"]["school_term"]
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          form_level: Database["public"]["Enums"]["education_level"]
          id?: string
          notes?: string | null
          promoted?: boolean | null
          promotion_date?: string | null
          stream?: string | null
          student_id?: string | null
          term: Database["public"]["Enums"]["school_term"]
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          form_level?: Database["public"]["Enums"]["education_level"]
          id?: string
          notes?: string | null
          promoted?: boolean | null
          promotion_date?: string | null
          stream?: string | null
          student_id?: string | null
          term?: Database["public"]["Enums"]["school_term"]
        }
        Relationships: [
          {
            foreignKeyName: "student_progression_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          admission_date: string | null
          admission_number: string | null
          allergies: string | null
          blood_group: string | null
          chronic_conditions: string | null
          county: string | null
          created_at: string | null
          date_of_birth: string | null
          emergency_contact: Json | null
          form_level: Database["public"]["Enums"]["education_level"] | null
          full_name: string
          gender: string | null
          id: string
          is_active: boolean | null
          parent_guardian_name: string | null
          parent_guardian_phone: string | null
          stream: string | null
          student_id: string | null
          sub_county: string | null
          updated_at: string | null
          village: string | null
          ward: string | null
        }
        Insert: {
          admission_date?: string | null
          admission_number?: string | null
          allergies?: string | null
          blood_group?: string | null
          chronic_conditions?: string | null
          county?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact?: Json | null
          form_level?: Database["public"]["Enums"]["education_level"] | null
          full_name: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          parent_guardian_name?: string | null
          parent_guardian_phone?: string | null
          stream?: string | null
          student_id?: string | null
          sub_county?: string | null
          updated_at?: string | null
          village?: string | null
          ward?: string | null
        }
        Update: {
          admission_date?: string | null
          admission_number?: string | null
          allergies?: string | null
          blood_group?: string | null
          chronic_conditions?: string | null
          county?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact?: Json | null
          form_level?: Database["public"]["Enums"]["education_level"] | null
          full_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          parent_guardian_name?: string | null
          parent_guardian_phone?: string | null
          stream?: string | null
          student_id?: string | null
          sub_county?: string | null
          updated_at?: string | null
          village?: string | null
          ward?: string | null
        }
        Relationships: []
      }
      vaccination_requirements: {
        Row: {
          created_at: string | null
          doses_required: number | null
          id: string
          is_mandatory: boolean | null
          required_for_form_level: string[] | null
          vaccine_name: string
        }
        Insert: {
          created_at?: string | null
          doses_required?: number | null
          id?: string
          is_mandatory?: boolean | null
          required_for_form_level?: string[] | null
          vaccine_name: string
        }
        Update: {
          created_at?: string | null
          doses_required?: number | null
          id?: string
          is_mandatory?: boolean | null
          required_for_form_level?: string[] | null
          vaccine_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_medication_alerts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      education_level: "form_1" | "form_2" | "form_3" | "form_4"
      school_term: "term_1" | "term_2" | "term_3"
      user_role: "admin" | "nurse"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      education_level: ["form_1", "form_2", "form_3", "form_4"],
      school_term: ["term_1", "term_2", "term_3"],
      user_role: ["admin", "nurse"],
    },
  },
} as const
