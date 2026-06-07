export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      trello_accounts: {
        Row: {
          user_id: string;
          trello_member_id: string;
          username: string | null;
          full_name: string | null;
          encrypted_token: string;
          token_nonce: string;
          token_tag: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          trello_member_id: string;
          username?: string | null;
          full_name?: string | null;
          encrypted_token: string;
          token_nonce: string;
          token_tag: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["trello_accounts"]["Insert"]>;
        Relationships: [];
      };
      boards: {
        Row: {
          id: string;
          trello_board_id: string;
          name: string;
          url: string | null;
          target_date: string | null;
          last_synced_at: string | null;
          last_sync_status: "idle" | "syncing" | "ok" | "error";
          last_sync_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trello_board_id: string;
          name: string;
          url?: string | null;
          target_date?: string | null;
          last_synced_at?: string | null;
          last_sync_status?: "idle" | "syncing" | "ok" | "error";
          last_sync_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["boards"]["Insert"]>;
        Relationships: [];
      };
      board_memberships: {
        Row: {
          board_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          board_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["board_memberships"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "board_memberships_board_id_fkey";
            columns: ["board_id"];
            isOneToOne: false;
            referencedRelation: "boards";
            referencedColumns: ["id"];
          }
        ];
      };
      trello_cards: {
        Row: {
          id: string;
          board_id: string;
          trello_card_id: string;
          name: string;
          url: string | null;
          list_id: string | null;
          closed: boolean;
          pos: number | null;
          total_check_items: number;
          completed_check_items: number;
          remaining_check_items: number;
          percent_complete: number;
          last_activity_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          trello_card_id: string;
          name: string;
          url?: string | null;
          list_id?: string | null;
          closed?: boolean;
          pos?: number | null;
          total_check_items?: number;
          completed_check_items?: number;
          remaining_check_items?: number;
          percent_complete?: number;
          last_activity_at?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["trello_cards"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "trello_cards_board_id_fkey";
            columns: ["board_id"];
            isOneToOne: false;
            referencedRelation: "boards";
            referencedColumns: ["id"];
          }
        ];
      };
      board_snapshots: {
        Row: {
          id: string;
          board_id: string;
          captured_at: string;
          total_check_items: number;
          completed_check_items: number;
          remaining_check_items: number;
        };
        Insert: {
          id?: string;
          board_id: string;
          captured_at?: string;
          total_check_items: number;
          completed_check_items: number;
          remaining_check_items: number;
        };
        Update: Partial<Database["public"]["Tables"]["board_snapshots"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "board_snapshots_board_id_fkey";
            columns: ["board_id"];
            isOneToOne: false;
            referencedRelation: "boards";
            referencedColumns: ["id"];
          }
        ];
      };
      card_snapshots: {
        Row: {
          id: string;
          board_snapshot_id: string;
          board_id: string;
          card_id: string;
          captured_at: string;
          total_check_items: number;
          completed_check_items: number;
          remaining_check_items: number;
          percent_complete: number;
        };
        Insert: {
          id?: string;
          board_snapshot_id: string;
          board_id: string;
          card_id: string;
          captured_at?: string;
          total_check_items: number;
          completed_check_items: number;
          remaining_check_items: number;
          percent_complete: number;
        };
        Update: Partial<Database["public"]["Tables"]["card_snapshots"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "card_snapshots_board_id_fkey";
            columns: ["board_id"];
            isOneToOne: false;
            referencedRelation: "boards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "card_snapshots_board_snapshot_id_fkey";
            columns: ["board_snapshot_id"];
            isOneToOne: false;
            referencedRelation: "board_snapshots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "card_snapshots_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "trello_cards";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: Record<string, never>;
  };
};
