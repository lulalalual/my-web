export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          github_id: string | null;
          github_username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          github_id?: string | null;
          github_username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          github_id?: string | null;
          github_username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          summary: string;
          description: string;
          tech_stack: string[];
          highlights: string[];
          cover_image: string | null;
          repo_url: string | null;
          demo_url: string | null;
          order_index: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          summary: string;
          description: string;
          tech_stack?: string[];
          highlights?: string[];
          cover_image?: string | null;
          repo_url?: string | null;
          demo_url?: string | null;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          summary?: string;
          description?: string;
          tech_stack?: string[];
          highlights?: string[];
          cover_image?: string | null;
          repo_url?: string | null;
          demo_url?: string | null;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          content_markdown: string;
          cover_image: string | null;
          status: "draft" | "published";
          is_pinned: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt: string;
          content_markdown?: string;
          cover_image?: string | null;
          status?: "draft" | "published";
          is_pinned?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string;
          content_markdown?: string;
          cover_image?: string | null;
          status?: "draft" | "published";
          is_pinned?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      note_tags: {
        Row: {
          note_id: string;
          tag: string;
        };
        Insert: {
          note_id: string;
          tag: string;
        };
        Update: {
          note_id?: string;
          tag?: string;
        };
      };
      site_settings: {
        Row: {
          id: number;
          hero_title: string;
          hero_subtitle: string;
          social_links: Json;
          project_order: string[];
          updated_at: string;
        };
        Insert: {
          id?: number;
          hero_title: string;
          hero_subtitle: string;
          social_links?: Json;
          project_order?: string[];
          updated_at?: string;
        };
        Update: {
          id?: number;
          hero_title?: string;
          hero_subtitle?: string;
          social_links?: Json;
          project_order?: string[];
          updated_at?: string;
        };
      };
    };
  };
};
