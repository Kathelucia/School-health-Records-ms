export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
            foreignKeyName: "clinic_visits_attended_by_fkey"
            columns: ["attended_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_visits_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
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
        Relationships: []
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
          email: string
          employee_id: string | null
          full_name: string
          id: string
          is_active: boolean | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          employee_id?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          employee_id?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
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
      user_role:
        | "nurse"
        | "clinical_officer"
        | "it_support"
        | "admin"
        | "other_staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      education_level: ["form_1", "form_2", "form_3", "form_4"],
      school_term: ["term_1", "term_2", "term_3"],
      user_role: [
        "nurse",
        "clinical_officer",
        "it_support",
        "admin",
        "other_staff",
      ],
    },
  },
} as const
