export type ConnectorCategory = "entertainment" | "shopping" | "ai_assistant" | "social" | "browsing";
export type ConnectorMethod = "oauth" | "csv_upload" | "zip_upload";
export type ConnectionStatus = "pending" | "connected" | "analyzing" | "active" | "error" | "revoked";
export type ProcessingConsentStatus = "granted" | "revoked";

export interface ExternalConnector {
  id: string;
  provider: string;
  display_name: string;
  category: ConnectorCategory;
  method: ConnectorMethod;
  description: string;
  icon_name: string;
  oauth_scopes: string[] | null;
  accepted_file_types: string[] | null;
  max_file_size_mb: number;
  signals_description: string;
  is_active: boolean;
}

export interface UserExternalConnection {
  id: string;
  user_id: string;
  connector_id: string;
  status: ConnectionStatus;
  last_synced_at: string | null;
  next_sync_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExternalSignals {
  interests?: string[];
  content_depth?: "casual" | "moderate" | "deep_diver";
  genre_affinity?: string[];
  curiosity_score?: number;
  cultural_openness?: number;
  communication_style?: "direct" | "diplomatic" | "analytical" | "expressive";
  intellectual_depth?: "practical" | "moderate" | "philosophical";
  humor_style?: "dry" | "sarcastic" | "slapstick" | "intellectual" | "warm";
  social_energy?: "low" | "moderate" | "high";
  aesthetic_sense?: string[];
  lifestyle_indicators?: string[];
  values?: string[];
  mood_patterns?: string[];
  openness_to_experience?: number;
  conscientiousness?: number;
  [key: string]: unknown;
}

export interface ExternalInsight {
  id: string;
  user_id: string;
  connection_id: string;
  provider: string;
  signals: ExternalSignals;
  confidence: number;
  analyzed_at: string;
  expires_at: string;
  algorithm_version: string;
}

export interface DataProcessingConsent {
  id: string;
  user_id: string;
  connector_id: string;
  purpose: string;
  status: ProcessingConsentStatus;
  consent_text: string;
  granted_at: string;
  revoked_at: string | null;
}

/** Connector with its connection status for UI display */
export interface ConnectorWithStatus extends ExternalConnector {
  connection?: UserExternalConnection | null;
  insight?: ExternalInsight | null;
  consent?: DataProcessingConsent | null;
}
