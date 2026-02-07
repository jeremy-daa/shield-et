import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
})

// Type for database tables
export type Database = {
  public: {
    Tables: {
      support_directory: {
        Row: {
          id: string
          name: string
          category: 'shelter' | 'legal' | 'medical' | 'counseling' | 'hotline'
          phone: string
          location: string
          address: string | null
          description_am: string
          description_en: string
          description_or: string
          verified: boolean
          lat: number | null
          lng: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['support_directory']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['support_directory']['Insert']>
      }
      evidence_metadata: {
        Row: {
          id: string
          user_id: string
          file_id: string
          incident_type: 'physical' | 'emotional' | 'financial' | 'sexual' | 'other'
          description: string
          timestamp: string
          threat_level: number | null
          is_archived: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['evidence_metadata']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['evidence_metadata']['Insert']>
      }
      safety_plans: {
        Row: {
          id: string
          user_id: string
          vault_pin: string
          code_word: string | null
          trusted_contact: string | null
          active_template_id: string | null
          safe_room_desc: string | null
          is_plan_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['safety_plans']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['safety_plans']['Insert']>
      }
      emergency_bag: {
        Row: {
          id: string
          user_id: string
          item_name: string
          is_packed: boolean
          is_essential: boolean
          category: 'docs' | 'cash' | 'personal' | 'kids' | 'medical' | 'other'
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['emergency_bag']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['emergency_bag']['Insert']>
      }
      safety_steps: {
        Row: {
          id: string
          user_id: string
          template_step_id: string
          label_en: string
          label_am: string | null
          label_or: string | null
          status: 'todo' | 'done'
          priority: number
          module: 'exit' | 'digital' | 'legal' | 'kids'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['safety_steps']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['safety_steps']['Insert']>
      }
      security_audit: {
        Row: {
          id: string
          user_id: string
          task_name_en: string
          task_name_am: string | null
          task_name_or: string | null
          is_completed: boolean
          risk_level: 'low' | 'medium' | 'high'
          platform: 'phone' | 'social' | 'banking' | 'email'
          instructions: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['security_audit']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['security_audit']['Insert']>
      }
      predefined_plans: {
        Row: {
          id: string
          title_en: string
          title_am: string | null
          title_or: string | null
          category: 'urgent' | 'stealth' | 'stay' | 'kids'
          difficulty: 'easy' | 'moderate' | 'hard'
          duration: string | null
          description_en: string | null
          icon: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['predefined_plans']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['predefined_plans']['Insert']>
      }
      predefined_steps: {
        Row: {
          id: string
          plan_id: string
          label_en: string
          label_am: string | null
          label_or: string | null
          priority: number
          module: 'exit' | 'digital' | 'legal' | 'kids'
          is_essential: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['predefined_steps']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['predefined_steps']['Insert']>
      }
      master_security_tasks: {
        Row: {
          id: string
          task_name_en: string
          task_name_am: string | null
          task_name_or: string | null
          platform: 'phone' | 'social' | 'banking' | 'email'
          risk_level: 'low' | 'medium' | 'high'
          instr_en: string | null
          instr_am: string | null
          instr_or: string | null
          priority: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['master_security_tasks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['master_security_tasks']['Insert']>
      }
    }
  }
}
