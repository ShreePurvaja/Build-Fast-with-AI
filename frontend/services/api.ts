import { WorkforceSpec, IntakeResponse, EscalationItem, AnalyticsSummary } from '../types/workforce';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE = `${API_URL.replace(/\/$/, '')}/api`;

export async function submitIntakePrompt(prompt: string): Promise<IntakeResponse> {
  try {
    const res = await fetch(`${API_BASE}/intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API offline, using mock fallback', e);
  }

  return {
    clarifying_questions: [
      "What is the maximum instant refund amount without human supervisor confirmation? (Default ₹2,000)",
      "Which regional Indic languages should be enabled for voice callers? (Default: Tamil, Hindi, English)",
      "Should unconfirmed order checks fall back to human queue during off-hours?"
    ],
    suggested_template_id: "support",
    assumptions: [
      "Targeting Indian SMEs starting with order & refund workflows.",
      "Voice link prioritized for web testing with streaming Indic TTS.",
      "Write operations require explicit customer confirmation."
    ],
    generated_spec: {
      id: "wf_gen_support",
      workforce: `AI Workforce: ${prompt.slice(0, 30)}`,
      languages: ["ta", "hi", "en"],
      manager: { name: "AI Support Manager", routing: "intent", max_hops: 4 },
      workers: [
        {
          id: "query_worker",
          name: "Query Worker",
          instructions: "Answers product specs and store policies from KB.",
          tools: [],
          kb: ["shipping_policy", "return_policy"]
        },
        {
          id: "order_check",
          name: "Order Verification Worker",
          instructions: "Queries Order DB using customer Order ID.",
          tools: ["orders"],
          kb: ["delivery_sla"]
        },
        {
          id: "refund",
          name: "Refund Worker",
          instructions: "Processes refunds after damage photo verification and explicit confirmation.",
          tools: ["pay"],
          kb: [],
          permissions: { create_refund: { approval: "user_confirm", max_amount: 2000 } },
          require_confirmation: true
        },
        {
          id: "escalation",
          name: "Escalation Worker",
          instructions: "Hands off unresolvable cases to human supervisor queue.",
          tools: ["helpdesk"],
          kb: []
        }
      ],
      flow: ["order_check", "refund", "escalation"],
      escalate_if: ["amount > 2000", "user_requests_human"],
      org_id: "org_sme_001",
      version: 1,
      published: false,
      voice_link: "https://workforce.app/talk/wf_gen_support"
    }
  };
}

export async function fetchWorkforces(): Promise<WorkforceSpec[]> {
  try {
    const res = await fetch(`${API_BASE}/workforces`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API offline', e);
  }
  return [];
}

export async function publishWorkforceApi(wfId: string): Promise<WorkforceSpec | null> {
  try {
    const res = await fetch(`${API_BASE}/workforces/${wfId}/publish`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Publish API error', e);
  }
  return null;
}

export async function fetchEscalations(): Promise<EscalationItem[]> {
  try {
    const res = await fetch(`${API_BASE}/escalations`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : (data.escalations || []);
    }
  } catch (e) {
    console.warn('API offline', e);
  }
  return [];
}

export async function fetchAnalytics(): Promise<AnalyticsSummary | null> {
  try {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API offline', e);
  }
  return null;
}
