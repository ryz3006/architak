/**
 * Hand-maintained database types for Sprint 0b + Phase 7 schemas.
 * Each table includes Relationships so supabase-js does not collapse to `never`.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ContentStatus = "draft" | "published" | "archived";
export type MediaVisibility = "public" | "private";
export type EnquiryStatus =
  | "new"
  | "contacted"
  | "in_discussion"
  | "qualified"
  | "converted"
  | "closed"
  | "spam";

export type EnquiryEventType =
  | "created"
  | "status_changed"
  | "assigned"
  | "note_added"
  | "notification_queued"
  | "notification_sent"
  | "notification_failed";

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<
        {
          id: string;
          display_name: string | null;
          role: "admin" | "editor";
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          display_name?: string | null;
          role?: "admin" | "editor";
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          display_name?: string | null;
          role?: "admin" | "editor";
          created_at?: string;
          updated_at?: string;
        }
      >;
      media_assets: TableDef<
        {
          id: string;
          storage_provider: "r2";
          storage_key: string;
          visibility: MediaVisibility;
          mime_type: string;
          byte_size: number;
          width: number | null;
          height: number | null;
          alt_text: string | null;
          caption: string | null;
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          storage_provider?: "r2";
          storage_key: string;
          visibility: MediaVisibility;
          mime_type: string;
          byte_size: number;
          width?: number | null;
          height?: number | null;
          alt_text?: string | null;
          caption?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          storage_provider?: "r2";
          storage_key?: string;
          visibility?: MediaVisibility;
          mime_type?: string;
          byte_size?: number;
          width?: number | null;
          height?: number | null;
          alt_text?: string | null;
          caption?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      project_categories: TableDef<
        {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          status: ContentStatus;
          sort_order: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          status?: ContentStatus;
          sort_order?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          status?: ContentStatus;
          sort_order?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      projects: TableDef<
        {
          id: string;
          category_id: string | null;
          cover_media_id: string | null;
          slug: string;
          title: string;
          summary: string | null;
          body: Json;
          location: string | null;
          status: ContentStatus;
          is_featured: boolean;
          sort_order: number;
          completed_on: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          category_id?: string | null;
          cover_media_id?: string | null;
          slug: string;
          title: string;
          summary?: string | null;
          body?: Json;
          location?: string | null;
          status?: ContentStatus;
          is_featured?: boolean;
          sort_order?: number;
          completed_on?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          category_id?: string | null;
          cover_media_id?: string | null;
          slug?: string;
          title?: string;
          summary?: string | null;
          body?: Json;
          location?: string | null;
          status?: ContentStatus;
          is_featured?: boolean;
          sort_order?: number;
          completed_on?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      project_media: TableDef<
        {
          project_id: string;
          media_asset_id: string;
          role: "cover" | "gallery" | "plan" | "document";
          sort_order: number;
          caption: string | null;
          created_at: string;
        },
        {
          project_id: string;
          media_asset_id: string;
          role?: "cover" | "gallery" | "plan" | "document";
          sort_order?: number;
          caption?: string | null;
          created_at?: string;
        },
        {
          project_id?: string;
          media_asset_id?: string;
          role?: "cover" | "gallery" | "plan" | "document";
          sort_order?: number;
          caption?: string | null;
          created_at?: string;
        }
      >;
      project_related: TableDef<
        {
          project_id: string;
          related_project_id: string;
          sort_order: number;
          created_at: string;
        },
        {
          project_id: string;
          related_project_id: string;
          sort_order?: number;
          created_at?: string;
        },
        {
          project_id?: string;
          related_project_id?: string;
          sort_order?: number;
          created_at?: string;
        }
      >;
      pages: TableDef<
        {
          id: string;
          slug: string;
          title: string;
          content: Json;
          status: ContentStatus;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          slug: string;
          title: string;
          content?: Json;
          status?: ContentStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          slug?: string;
          title?: string;
          content?: Json;
          status?: ContentStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      site_settings: TableDef<
        {
          key: string;
          value: Json;
          description: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          key: string;
          value: Json;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          key?: string;
          value?: Json;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      enquiries: TableDef<
        {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          message: string;
          source_page: string | null;
          consent: boolean;
          status: EnquiryStatus;
          assigned_to: string | null;
          client_ip: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          message: string;
          source_page?: string | null;
          consent: boolean;
          status?: EnquiryStatus;
          assigned_to?: string | null;
          client_ip?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          message?: string;
          source_page?: string | null;
          consent?: boolean;
          status?: EnquiryStatus;
          assigned_to?: string | null;
          client_ip?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      enquiry_events: TableDef<
        {
          id: string;
          enquiry_id: string;
          event_type: EnquiryEventType;
          from_status: EnquiryStatus | null;
          to_status: EnquiryStatus | null;
          note: string | null;
          actor_id: string | null;
          metadata: Json;
          created_at: string;
        },
        {
          id?: string;
          enquiry_id: string;
          event_type: EnquiryEventType;
          from_status?: EnquiryStatus | null;
          to_status?: EnquiryStatus | null;
          note?: string | null;
          actor_id?: string | null;
          metadata?: Json;
          created_at?: string;
        },
        {
          id?: string;
          enquiry_id?: string;
          event_type?: EnquiryEventType;
          from_status?: EnquiryStatus | null;
          to_status?: EnquiryStatus | null;
          note?: string | null;
          actor_id?: string | null;
          metadata?: Json;
          created_at?: string;
        }
      >;
      redirects: TableDef<
        {
          id: string;
          source_path: string;
          destination: string;
          status_code: 301 | 302 | 307 | 308;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          source_path: string;
          destination: string;
          status_code?: 301 | 302 | 307 | 308;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          source_path?: string;
          destination?: string;
          status_code?: 301 | 302 | 307 | 308;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      seo_metadata: TableDef<
        {
          id: string;
          subject_type: "global" | "page" | "project";
          subject_id: string | null;
          title: string | null;
          description: string | null;
          canonical_url: string | null;
          robots: string | null;
          open_graph: Json;
          structured_data: Json;
          ai_summary: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          subject_type: "global" | "page" | "project";
          subject_id?: string | null;
          title?: string | null;
          description?: string | null;
          canonical_url?: string | null;
          robots?: string | null;
          open_graph?: Json;
          structured_data?: Json;
          ai_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          subject_type?: "global" | "page" | "project";
          subject_id?: string | null;
          title?: string | null;
          description?: string | null;
          canonical_url?: string | null;
          robots?: string | null;
          open_graph?: Json;
          structured_data?: Json;
          ai_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      audit_events: TableDef<
        {
          id: number;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          before_data: Json | null;
          after_data: Json | null;
          request_id: string | null;
          ip_address: string | null;
          created_at: string;
        },
        {
          id?: number;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          before_data?: Json | null;
          after_data?: Json | null;
          request_id?: string | null;
          ip_address?: string | null;
          created_at?: string;
        },
        {
          id?: number;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          before_data?: Json | null;
          after_data?: Json | null;
          request_id?: string | null;
          ip_address?: string | null;
          created_at?: string;
        }
      >;
      seo_versions: TableDef<
        {
          id: number;
          seo_metadata_id: string;
          version_number: number;
          title: string | null;
          description: string | null;
          canonical_url: string | null;
          robots: string | null;
          open_graph: Json;
          structured_data: Json;
          ai_summary: string | null;
          quality_score: number | null;
          changed_by: string | null;
          change_summary: string | null;
          created_at: string;
        },
        {
          id?: number;
          seo_metadata_id: string;
          version_number: number;
          title?: string | null;
          description?: string | null;
          canonical_url?: string | null;
          robots?: string | null;
          open_graph?: Json;
          structured_data?: Json;
          ai_summary?: string | null;
          quality_score?: number | null;
          changed_by?: string | null;
          change_summary?: string | null;
          created_at?: string;
        },
        {
          id?: number;
          seo_metadata_id?: string;
          version_number?: number;
          title?: string | null;
          description?: string | null;
          canonical_url?: string | null;
          robots?: string | null;
          open_graph?: Json;
          structured_data?: Json;
          ai_summary?: string | null;
          quality_score?: number | null;
          changed_by?: string | null;
          change_summary?: string | null;
          created_at?: string;
        }
      >;
      project_testimonials: TableDef<
        {
          id: string;
          project_id: string;
          quote: string;
          author_name: string;
          author_role: string | null;
          location: string | null;
          is_enabled: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          project_id: string;
          quote: string;
          author_name: string;
          author_role?: string | null;
          location?: string | null;
          is_enabled?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          project_id?: string;
          quote?: string;
          author_name?: string;
          author_role?: string | null;
          location?: string | null;
          is_enabled?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      clients: TableDef<
        {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          notes: string | null;
          status: "active" | "inactive" | "archived";
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          notes?: string | null;
          status?: "active" | "inactive" | "archived";
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          notes?: string | null;
          status?: "active" | "inactive" | "archived";
          created_at?: string;
          updated_at?: string;
        }
      >;
      engagements: TableDef<
        {
          id: string;
          client_id: string;
          code: string;
          title: string;
          status: "draft" | "active" | "on_hold" | "closed";
          started_on: string | null;
          closed_on: string | null;
          summary: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          client_id: string;
          code: string;
          title: string;
          status?: "draft" | "active" | "on_hold" | "closed";
          started_on?: string | null;
          closed_on?: string | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          client_id?: string;
          code?: string;
          title?: string;
          status?: "draft" | "active" | "on_hold" | "closed";
          started_on?: string | null;
          closed_on?: string | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
