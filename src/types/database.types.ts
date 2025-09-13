export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'draft' | 'published' | 'archived'
          user_id: string
          created_at: string
          updated_at: string
          views: number
          starts: number
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'draft' | 'published' | 'archived'
          user_id: string
          created_at?: string
          updated_at?: string
          views?: number
          starts?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'draft' | 'published' | 'archived'
          user_id?: string
          created_at?: string
          updated_at?: string
          views?: number
          starts?: number
        }
      }
      questions: {
        Row: {
          id: string
          quiz_id: string
          text: string
          options: Json
          correct_option: number
          explanation: string | null
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          text: string
          options: Json
          correct_option: number
          explanation?: string | null
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          text?: string
          options?: Json
          correct_option?: number
          explanation?: string | null
          order?: number
          created_at?: string
        }
      }
      quiz_results: {
        Row: {
          id: string
          quiz_id: string
          user_id: string | null
          score: number
          max_score: number
          answers: Json
          completed_at: string | null
          created_at: string
          device_type: 'desktop' | 'mobile' | 'tablet'
          time_spent_seconds: number
          abandoned_at_question: number | null
        }
        Insert: {
          id?: string
          quiz_id: string
          user_id?: string | null
          score: number
          max_score: number
          answers: Json
          completed_at?: string | null
          created_at?: string
          device_type: 'desktop' | 'mobile' | 'tablet'
          time_spent_seconds: number
          abandoned_at_question?: number | null
        }
        Update: {
          id?: string
          quiz_id?: string
          user_id?: string | null
          score?: number
          max_score?: number
          answers?: Json
          completed_at?: string | null
          created_at?: string
          device_type?: 'desktop' | 'mobile' | 'tablet'
          time_spent_seconds?: number
          abandoned_at_question?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_quiz_views: {
        Args: { quiz_id: string }
        Returns: void
      }
      track_quiz_start: {
        Args: { quiz_id: string; device: 'desktop' | 'mobile' | 'tablet' }
        Returns: void
      }
      get_quiz_views: {
        Args: { quiz_id: string }
        Returns: number
      }
      get_quiz_starts: {
        Args: { quiz_id: string }
        Returns: number
      }
      get_device_breakdown: {
        Args: { quiz_id: string }
        Returns: { desktop: number; mobile: number; tablet: number }
      }
      get_abandonment_points: {
        Args: { quiz_id: string }
        Returns: { questionIndex: number; count: number }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}