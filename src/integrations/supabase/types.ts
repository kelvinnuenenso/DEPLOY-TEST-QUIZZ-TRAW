export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

import type { Database as GeneratedDatabase } from '@/types/database.types';

export type Database = GeneratedDatabase & {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          knowledge_base: string | null
          name: string
          openai_api_key: string | null
          personality: string | null
          prompt: string
          status: string | null
          updated_at: string
          user_id: string | null
          whatsapp_access_token: string | null
          whatsapp_phone_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          knowledge_base?: string | null
          name: string
          openai_api_key?: string | null
          personality?: string | null
          prompt: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp_access_token?: string | null
          whatsapp_phone_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          knowledge_base?: string | null
          name?: string
          openai_api_key?: string | null
          personality?: string | null
          prompt?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp_access_token?: string | null
          whatsapp_phone_id?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          objective: string | null
          platforms: string[] | null
          start_date: string | null
          status: string | null
          target_audience: string | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          objective?: string | null
          platforms?: string[] | null
          start_date?: string | null
          status?: string | null
          target_audience?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          objective?: string | null
          platforms?: string[] | null
          start_date?: string | null
          status?: string | null
          target_audience?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          sort_order: number | null
          store_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          sort_order?: number | null
          store_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          sort_order?: number | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string | null
          endereco: string
          id: string
          nome: string
          observacoes: string | null
          telefone: string
        }
        Insert: {
          created_at?: string | null
          endereco: string
          id?: string
          nome: string
          observacoes?: string | null
          telefone: string
        }
        Update: {
          created_at?: string | null
          endereco?: string
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          name: string | null
          phone_number: string
          profile_pic_url: string | null
          updated_at: string
          user_id: string | null
          whatsapp_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          name?: string | null
          phone_number: string
          profile_pic_url?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          name?: string | null
          phone_number?: string
          profile_pic_url?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp_id?: string
        }
        Relationships: []
      }
      content_pillars: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          percentage: number | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          percentage?: number | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          percentage?: number | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_pillars_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string | null
          contact_id: string | null
          created_at: string
          id: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          contact_id?: string | null
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          contact_id?: string | null
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean | null
          code: string
          created_at: string
          id: string
          minimum_order: number | null
          name: string
          store_id: string
          type: string | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string
          value: number
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string
          id?: string
          minimum_order?: number | null
          name: string
          store_id: string
          type?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until: string
          value: number
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string
          id?: string
          minimum_order?: number | null
          name?: string
          store_id?: string
          type?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: Json | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          store_id: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          store_id: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          instructions: string | null
          name: string
          order_index: number | null
          reps: string | null
          rest_seconds: number | null
          sets: number | null
          video_url: string | null
          weight: number | null
          workout_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          instructions?: string | null
          name: string
          order_index?: number | null
          reps?: string | null
          rest_seconds?: number | null
          sets?: number | null
          video_url?: string | null
          weight?: number | null
          workout_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          instructions?: string | null
          name?: string
          order_index?: number | null
          reps?: string | null
          rest_seconds?: number | null
          sets?: number | null
          video_url?: string | null
          weight?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      link_pages: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          is_published: boolean | null
          published_at: string | null
          theme: Json
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          theme?: Json
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          theme?: Json
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          media_url: string | null
          message_type: string | null
          sender_type: string
          timestamp: string
          whatsapp_message_id: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          message_type?: string | null
          sender_type: string
          timestamp?: string
          whatsapp_message_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          message_type?: string | null
          sender_type?: string
          timestamp?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_data: {
        Row: {
          business_name: string | null
          business_objectives: string[] | null
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          main_cta: string | null
          niche: string | null
          platforms: string[] | null
          target_audience: string | null
          tone_of_voice: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name?: string | null
          business_objectives?: string[] | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          main_cta?: string | null
          niche?: string | null
          platforms?: string[] | null
          target_audience?: string | null
          tone_of_voice?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string | null
          business_objectives?: string[] | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          main_cta?: string | null
          niche?: string | null
          platforms?: string[] | null
          target_audience?: string | null
          tone_of_voice?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string
          delivery_address: Json | null
          delivery_fee: number | null
          delivery_time: string | null
          delivery_type: string | null
          discount: number | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          status: string | null
          status_history: Json | null
          store_id: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          delivery_address?: Json | null
          delivery_fee?: number | null
          delivery_time?: string | null
          delivery_type?: string | null
          discount?: number | null
          id?: string
          items: Json
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          status_history?: Json | null
          store_id: string
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          delivery_address?: Json | null
          delivery_fee?: number | null
          delivery_time?: string | null
          delivery_type?: string | null
          discount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          status_history?: Json | null
          store_id?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      page_links: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          page_id: string
          sort_order: number | null
          title: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          page_id: string
          sort_order?: number | null
          title: string
          type?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          page_id?: string
          sort_order?: number | null
          title?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_links_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "link_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cliente_id: string | null
          data: string | null
          id: string
          produtos: Json
          site_id: string | null
          status: string | null
          total: number
          updated_at: string | null
        }
        Insert: {
          cliente_id?: string | null
          data?: string | null
          id?: string
          produtos: Json
          site_id?: string | null
          status?: string | null
          total: number
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string | null
          data?: string | null
          id?: string
          produtos?: Json
          site_id?: string | null
          status?: string | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          age_range: string | null
          created_at: string
          description: string | null
          goals: string[] | null
          id: string
          interests: string[] | null
          name: string
          pain_points: string[] | null
          tone_preferences: string[] | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          age_range?: string | null
          created_at?: string
          description?: string | null
          goals?: string[] | null
          id?: string
          interests?: string[] | null
          name: string
          pain_points?: string[] | null
          tone_preferences?: string[] | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          age_range?: string | null
          created_at?: string
          description?: string | null
          goals?: string[] | null
          id?: string
          interests?: string[] | null
          name?: string
          pain_points?: string[] | null
          tone_preferences?: string[] | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personas_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          category_id: string
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          images: Json | null
          name: string
          price: number
          stock: number | null
          store_id: string
          tags: string[] | null
          updated_at: string
          variants: Json | null
        }
        Insert: {
          active?: boolean | null
          category_id: string
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: Json | null
          name: string
          price: number
          stock?: number | null
          store_id: string
          tags?: string[] | null
          updated_at?: string
          variants?: Json | null
        }
        Update: {
          active?: boolean | null
          category_id?: string
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: Json | null
          name?: string
          price?: number
          stock?: number | null
          store_id?: string
          tags?: string[] | null
          updated_at?: string
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          categoria: string | null
          created_at: string | null
          descricao: string | null
          disponibilidade: boolean | null
          id: string
          imagem_url: string | null
          nome: string
          preco: number
          site_id: string | null
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          disponibilidade?: boolean | null
          id?: string
          imagem_url?: string | null
          nome: string
          preco: number
          site_id?: string | null
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          disponibilidade?: boolean | null
          id?: string
          imagem_url?: string | null
          nome?: string
          preco?: number
          site_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      progress_tracking: {
        Row: {
          completed_at: string
          difficulty_rating: number | null
          duration_seconds: number | null
          exercise_id: string | null
          id: string
          notes: string | null
          reps_completed: string | null
          sets_completed: number | null
          student_id: string
          weight_used: number | null
          workout_id: string | null
        }
        Insert: {
          completed_at?: string
          difficulty_rating?: number | null
          duration_seconds?: number | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          reps_completed?: string | null
          sets_completed?: number | null
          student_id: string
          weight_used?: number | null
          workout_id?: string | null
        }
        Update: {
          completed_at?: string
          difficulty_rating?: number | null
          duration_seconds?: number | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          reps_completed?: string | null
          sets_completed?: number | null
          student_id?: string
          weight_used?: number | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_tracking_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_tracking_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_tracking_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          campaign_id: string | null
          content: Json
          created_at: string
          description: string | null
          id: string
          persona_id: string | null
          platform_settings: Json | null
          status: string | null
          template_id: string | null
          title: string
          type: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          content?: Json
          created_at?: string
          description?: string | null
          id?: string
          persona_id?: string | null
          platform_settings?: Json | null
          status?: string | null
          template_id?: string | null
          title: string
          type: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          content?: Json
          created_at?: string
          description?: string | null
          id?: string
          persona_id?: string | null
          platform_settings?: Json | null
          status?: string | null
          template_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scripts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          created_at: string | null
          id: string
          layout: Json | null
          logo_url: string | null
          nome_loja: string
          slug: string
          tema: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          layout?: Json | null
          logo_url?: string | null
          nome_loja: string
          slug: string
          tema?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          layout?: Json | null
          logo_url?: string | null
          nome_loja?: string
          slug?: string
          tema?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stores: {
        Row: {
          banner_url: string | null
          contact: Json | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          logo_url: string | null
          name: string
          published_at: string | null
          settings: Json | null
          slug: string
          social: Json | null
          theme: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          banner_url?: string | null
          contact?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          name: string
          published_at?: string | null
          settings?: Json | null
          slug: string
          social?: Json | null
          theme?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          banner_url?: string | null
          contact?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          name?: string
          published_at?: string | null
          settings?: Json | null
          slug?: string
          social?: Json | null
          theme?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          birth_date: string | null
          body_fat_percentage: number | null
          created_at: string
          email: string
          goal: string | null
          height: number | null
          id: string
          membership_type: string | null
          name: string
          phone: string | null
          status: string | null
          trainer_id: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          birth_date?: string | null
          body_fat_percentage?: number | null
          created_at?: string
          email: string
          goal?: string | null
          height?: number | null
          id?: string
          membership_type?: string | null
          name: string
          phone?: string | null
          status?: string | null
          trainer_id: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          birth_date?: string | null
          body_fat_percentage?: number | null
          created_at?: string
          email?: string
          goal?: string | null
          height?: number | null
          id?: string
          membership_type?: string | null
          name?: string
          phone?: string | null
          status?: string | null
          trainer_id?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          structure: Json
          tags: string[] | null
          type: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          structure?: Json
          tags?: string[] | null
          type: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          structure?: Json
          tags?: string[] | null
          type?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          cost_estimate: number | null
          created_at: string
          id: string
          metadata: Json | null
          operation_type: string
          tokens_used: number | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          cost_estimate?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          operation_type: string
          tokens_used?: number | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          cost_estimate?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          operation_type?: string
          tokens_used?: number | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      whatsapp_connections: {
        Row: {
          access_token: string
          agent_id: string | null
          created_at: string
          id: string
          phone_number_id: string
          status: string | null
          updated_at: string
          user_id: string | null
          webhook_token: string
        }
        Insert: {
          access_token: string
          agent_id?: string | null
          created_at?: string
          id?: string
          phone_number_id: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
          webhook_token: string
        }
        Update: {
          access_token?: string
          agent_id?: string | null
          created_at?: string
          id?: string
          phone_number_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
          webhook_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_connections_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_verifications: {
        Row: {
          attempts: number
          created_at: string
          expires_at: string
          id: string
          phone_number: string
          verification_code: string
          verified: boolean
        }
        Insert: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          phone_number: string
          verification_code: string
          verified?: boolean
        }
        Update: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          phone_number?: string
          verification_code?: string
          verified?: boolean
        }
        Relationships: []
      }
      workouts: {
        Row: {
          calories_target: number | null
          category: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          is_template: boolean | null
          name: string
          student_id: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          calories_target?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          is_template?: boolean | null
          name: string
          student_id?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          calories_target?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          is_template?: boolean | null
          name?: string
          student_id?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_settings: {
        Row: {
          ai_preferences: Json | null
          brand_voice: Json | null
          company_info: Json | null
          created_at: string
          default_tone: string | null
          id: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          ai_preferences?: Json | null
          brand_voice?: Json | null
          company_info?: Json | null
          created_at?: string
          default_tone?: string | null
          id?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          ai_preferences?: Json | null
          brand_voice?: Json | null
          company_info?: Json | null
          created_at?: string
          default_tone?: string | null
          id?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_verifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_order_number: {
        Args: { store_id: string }
        Returns: string
      }
      get_agent_credentials: {
        Args: { agent_id: string }
        Returns: {
          openai_key: string
          whatsapp_phone: string
          whatsapp_token: string
        }[]
      }
      update_agent_credentials: {
        Args: {
          agent_id: string
          openai_key?: string
          whatsapp_phone?: string
          whatsapp_token?: string
        }
        Returns: boolean
      }
      verify_whatsapp_code: {
        Args: { phone_number_param: string; verification_code_param: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
