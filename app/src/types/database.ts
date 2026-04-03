export type VerificationStatus = "pending" | "in_progress" | "verified" | "rejected";
export type VerificationType = "sms" | "email" | "id_document";
export type ConsentStatus = "pending" | "accepted" | "declined" | "expired";
export type FunnelSide = "self" | "target";
export type Weighting = "must_have" | "nice_to_have" | "indifferent";
export type Tolerance = "exact" | "range" | "flexible";
export type VisibilityLevel = 1 | 2 | 3; // 1=algorithm-only, 2=match-preview, 3=post-unlock

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          verification_status: VerificationStatus;
          email_verified: boolean;
          phone_verified: boolean;
          id_verified: boolean;
          active_funnel_level: number;
          quality_score: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          verification_status?: VerificationStatus;
          email_verified?: boolean;
          phone_verified?: boolean;
          id_verified?: boolean;
          active_funnel_level?: number;
          quality_score?: number;
          is_active?: boolean;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          verification_status?: VerificationStatus;
          email_verified?: boolean;
          phone_verified?: boolean;
          id_verified?: boolean;
          active_funnel_level?: number;
          quality_score?: number;
          is_active?: boolean;
        };
      };
      funnel_profiles: {
        Row: {
          id: string;
          user_id: string;
          level: number;
          side: FunnelSide;
          data: Record<string, unknown>;
          weighting: Record<string, Weighting> | null;
          tolerance: Record<string, Tolerance> | null;
          deal_breakers: string[] | null;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          level: number;
          side: FunnelSide;
          data: Record<string, unknown>;
          weighting?: Record<string, Weighting> | null;
          tolerance?: Record<string, Tolerance> | null;
          deal_breakers?: string[] | null;
          completed?: boolean;
          completed_at?: string | null;
        };
        Update: {
          data?: Record<string, unknown>;
          weighting?: Record<string, Weighting> | null;
          tolerance?: Record<string, Tolerance> | null;
          deal_breakers?: string[] | null;
          completed?: boolean;
          completed_at?: string | null;
        };
      };
      matching_scores: {
        Row: {
          id: string;
          user_a_id: string;
          user_b_id: string;
          score_a_to_b: number;
          score_b_to_a: number;
          composite_score: number;
          breakdown: Record<string, unknown>;
          algorithm_version: string;
          computed_at: string;
        };
        Insert: {
          user_a_id: string;
          user_b_id: string;
          score_a_to_b: number;
          score_b_to_a: number;
          composite_score: number;
          breakdown: Record<string, unknown>;
          algorithm_version: string;
          computed_at?: string;
        };
        Update: {
          score_a_to_b?: number;
          score_b_to_a?: number;
          composite_score?: number;
          breakdown?: Record<string, unknown>;
        };
      };
      consent_records: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          status: ConsentStatus;
          created_at: string;
          responded_at: string | null;
        };
        Insert: {
          from_user_id: string;
          to_user_id: string;
          status?: ConsentStatus;
        };
        Update: {
          status?: ConsentStatus;
          responded_at?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          consent_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          consent_id: string;
          sender_id: string;
          content: string;
        };
        Update: {
          content?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          data: Record<string, unknown> | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: string;
          title: string;
          body: string;
          data?: Record<string, unknown> | null;
          read?: boolean;
        };
        Update: {
          read?: boolean;
        };
      };
      verification_requests: {
        Row: {
          id: string;
          user_id: string;
          type: VerificationType;
          status: VerificationStatus;
          document_path: string | null;
          submitted_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          user_id: string;
          type: VerificationType;
          status?: VerificationStatus;
          document_path?: string | null;
        };
        Update: {
          status?: VerificationStatus;
          document_path?: string | null;
          reviewed_at?: string | null;
        };
      };
      audit_events: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: never;
      };
    };
  };
}
