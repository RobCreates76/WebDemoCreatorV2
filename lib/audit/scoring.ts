import type { AuditFinding, AuditReport } from "@/lib/models/site-model";

export function scoreAudit(findings: AuditFinding[]): AuditReport {
  let score = 100;
  for (const f of findings) {
    score -= f.scoreImpact;
  }
  score = Math.max(0, Math.min(100, score));

  const sorted = [...findings].sort((a, b) => {
    const priorityOrder = { P0: 0, P1: 1, P2: 2 };
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return b.scoreImpact - a.scoreImpact;
  });

  let summary: string;
  if (score >= 80) {
    summary =
      "Solid foundation, but leaving conversion on the table. Target the P1 findings below to pull ahead of competitors.";
  } else if (score >= 60) {
    summary =
      "Significant gaps are costing you leads every day. The P0 issues below are actively driving customers to competitors.";
  } else if (score >= 40) {
    summary =
      "This site is fighting against you. Multiple critical failures in trust, conversion, and mobile experience. A rebuild is justified.";
  } else {
    summary =
      "Critical failure state. No clear value proposition, weak trust signals, and poor mobile experience. You're invisible and unbelievable online.";
  }

  return { score, findings: sorted, summary };
}
