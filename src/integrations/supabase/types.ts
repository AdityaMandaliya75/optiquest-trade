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
      chart_data: {
        Row: {
          close: number
          high: number
          id: string
          low: number
          open: number
          symbol: string
          timestamp: string
          volume: number
        }
        Insert: {
          close: number
          high: number
          id?: string
          low: number
          open: number
          symbol: string
          timestamp: string
          volume: number
        }
        Update: {
          close?: number
          high?: number
          id?: string
          low?: number
          open?: number
          symbol?: string
          timestamp?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "chart_data_symbol_fkey"
            columns: ["symbol"]
            isOneToOne: false
            referencedRelation: "stocks"
            referencedColumns: ["symbol"]
          },
        ]
      }
      market_indices: {
        Row: {
          change: number
          change_percent: number
          high: number
          id: string
          low: number
          name: string
          open: number
          symbol: string
          updated_at: string | null
          value: number
        }
        Insert: {
          change: number
          change_percent: number
          high: number
          id?: string
          low: number
          name: string
          open: number
          symbol: string
          updated_at?: string | null
          value: number
        }
        Update: {
          change?: number
          change_percent?: number
          high?: number
          id?: string
          low?: number
          name?: string
          open?: number
          symbol?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: []
      }
      news: {
        Row: {
          created_at: string | null
          headline: string
          id: string
          is_important: boolean | null
          published_at: string
          sentiment: string | null
          source: string
          summary: string
          url: string
        }
        Insert: {
          created_at?: string | null
          headline: string
          id?: string
          is_important?: boolean | null
          published_at: string
          sentiment?: string | null
          source: string
          summary: string
          url: string
        }
        Update: {
          created_at?: string | null
          headline?: string
          id?: string
          is_important?: boolean | null
          published_at?: string
          sentiment?: string | null
          source?: string
          summary?: string
          url?: string
        }
        Relationships: []
      }
      news_stocks: {
        Row: {
          id: string
          news_id: string
          symbol: string
        }
        Insert: {
          id?: string
          news_id: string
          symbol: string
        }
        Update: {
          id?: string
          news_id?: string
          symbol?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_stocks_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_important: boolean | null
          message: string
          read: boolean | null
          related_symbol: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_important?: boolean | null
          message: string
          read?: boolean | null
          related_symbol?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_important?: boolean | null
          message?: string
          read?: boolean | null
          related_symbol?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          change: number
          change_percent: number
          expiry_date: string
          id: string
          implied_volatility: number
          last_price: number
          open_interest: number
          strike_price: number
          type: string
          underlying_symbol: string
          updated_at: string | null
          volume: number
        }
        Insert: {
          change: number
          change_percent: number
          expiry_date: string
          id?: string
          implied_volatility: number
          last_price: number
          open_interest: number
          strike_price: number
          type: string
          underlying_symbol: string
          updated_at?: string | null
          volume: number
        }
        Update: {
          change?: number
          change_percent?: number
          expiry_date?: string
          id?: string
          implied_volatility?: number
          last_price?: number
          open_interest?: number
          strike_price?: number
          type?: string
          underlying_symbol?: string
          updated_at?: string | null
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "options_underlying_symbol_fkey"
            columns: ["underlying_symbol"]
            isOneToOne: false
            referencedRelation: "stocks"
            referencedColumns: ["symbol"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          instrument_type: string
          option_expiry_date: string | null
          option_strike_price: number | null
          option_type: string | null
          price: number
          quantity: number
          status: string
          symbol: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          instrument_type: string
          option_expiry_date?: string | null
          option_strike_price?: number | null
          option_type?: string | null
          price: number
          quantity: number
          status: string
          symbol: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          instrument_type?: string
          option_expiry_date?: string | null
          option_strike_price?: number | null
          option_type?: string | null
          price?: number
          quantity?: number
          status?: string
          symbol?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_holdings: {
        Row: {
          avg_price: number
          created_at: string | null
          id: string
          instrument_type: string
          option_expiry_date: string | null
          option_strike_price: number | null
          option_type: string | null
          quantity: number
          symbol: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_price: number
          created_at?: string | null
          id?: string
          instrument_type: string
          option_expiry_date?: string | null
          option_strike_price?: number | null
          option_type?: string | null
          quantity: number
          symbol: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_price?: number
          created_at?: string | null
          id?: string
          instrument_type?: string
          option_expiry_date?: string | null
          option_strike_price?: number | null
          option_type?: string | null
          quantity?: number
          symbol?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_holdings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stocks: {
        Row: {
          change: number
          change_percent: number
          close: number
          high: number
          id: string
          low: number
          market_cap: number | null
          name: string
          open: number
          price: number
          sector: string | null
          symbol: string
          updated_at: string | null
          volume: number
        }
        Insert: {
          change: number
          change_percent: number
          close: number
          high: number
          id?: string
          low: number
          market_cap?: number | null
          name: string
          open: number
          price: number
          sector?: string | null
          symbol: string
          updated_at?: string | null
          volume: number
        }
        Update: {
          change?: number
          change_percent?: number
          close?: number
          high?: number
          id?: string
          low?: number
          market_cap?: number | null
          name?: string
          open?: number
          price?: number
          sector?: string | null
          symbol?: string
          updated_at?: string | null
          volume?: number
        }
        Relationships: []
      }
      watchlist_items: {
        Row: {
          created_at: string | null
          id: string
          symbol: string
          watchlist_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          symbol: string
          watchlist_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          symbol?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_items_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
