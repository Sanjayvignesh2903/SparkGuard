export type UserRole = 'POLICYHOLDER' | 'ADJUSTER';

export type CVRisk = 'Low' | 'High' | 'Critical';
export type FraudRisk = 'Low' | 'Medium' | 'High';
export type ClaimStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  phone_number?: string;
  policy_number?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  phone_number?: string;
  policy_number?: string;
}

export interface Claim {
  id: number;
  claim_id: string;
  user: number;
  user_details?: User;
  description: string;
  image: string;
  image_url?: string;
  cv_risk_score: CVRisk;
  edge_density: number;
  estimated_payout: string | number;
  nlp_fraud_risk: FraudRisk;
  nlp_reasoning: string;
  status: ClaimStatus;
  adjuster_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentResponse {
  message: string;
  claim: Claim;
  ai_diagnostics: {
    opencv_metrics: {
      cv_risk_score: CVRisk;
      edge_density: number;
      estimated_payout: number;
      raw_edge_count?: number;
      total_pixels?: number;
    };
    nlp_metrics: {
      fraud_risk: FraudRisk;
      reasoning: string;
      model: string;
    };
  };
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

