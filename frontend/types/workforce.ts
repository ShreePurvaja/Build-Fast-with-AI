export interface PermissionSpec {
  approval: 'auto' | 'user_confirm' | 'deny';
  max_amount?: number;
}

export interface WorkerSpec {
  id: string;
  name: string;
  instructions: string;
  tools: string[];
  kb?: string[];
  permissions?: Record<string, PermissionSpec>;
  require_confirmation?: boolean;
}

export interface ManagerSpec {
  name: string;
  routing: string;
  max_hops: number;
}

export interface WorkforceSpec {
  id: string;
  workforce: string;
  languages: string[];
  manager: ManagerSpec;
  workers: WorkerSpec[];
  flow: string[];
  escalate_if: string[];
  org_id: string;
  version: number;
  published: boolean;
  voice_link?: string;
}

export interface IntakeResponse {
  clarifying_questions: string[];
  suggested_template_id: string;
  generated_spec: WorkforceSpec;
  assumptions: string[];
}

export interface EscalationItem {
  id: string;
  session_id: string;
  workforce_id: string;
  customer_name: string;
  language: string;
  reason: string;
  status: 'pending' | 'resolved' | 'taken_over';
  timestamp: string;
  transcript: Array<{ speaker: string; text: string }>;
  task_state: Record<string, any>;
  image_attached?: string;
  suggested_action: string;
}

export interface AnalyticsSummary {
  conversations_today: number;
  completed_tasks: number;
  escalated_to_humans: number;
  failed_tool_calls: number;
  avg_latency_ms: number;
  estimated_cost_inr: number;
  active_sessions: number;
  indic_breakdown: Record<string, number>;
}
