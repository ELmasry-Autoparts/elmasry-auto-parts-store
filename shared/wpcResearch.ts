export type ResearchQueryType = "OEM" | "VIN" | "VEHICLE" | "OEM_VEHICLE" | "BATCH_OEM";

export type WpcResearchPayload = {
  queryType: ResearchQueryType;
  originalQuery: string;
  normalizedQuery: string;
  vin?: string | null;
  vehicle?: {
    brand?: string;
    model?: string;
    generation?: string;
    year?: string;
    engine?: string;
    trim?: string;
    market?: string;
  };
  notes?: string;
};

export function normalizeOem(input: string) {
  const originalInput = input.trim();
  const normalizedOem = originalInput.replace(/[\s_]+/g, "-").replace(/-+/g, "-").toUpperCase();
  return { originalInput, normalizedOem, displayOem: normalizedOem };
}

export function normalizeVin(input: string) {
  return input.trim().replace(/\s+/g, "").toUpperCase();
}

export function redactVin(vin: string | null | undefined) {
  if (!vin) return null;
  const normalized = normalizeVin(vin);
  if (normalized.length <= 6) return "••••••";
  return `${normalized.slice(0, Math.max(0, normalized.length - 6))}••••••`;
}

export function createResearchId(date = new Date(), sequence = 0) {
  const year = date.getUTCFullYear();
  return `WPC-${year}-${String(sequence).padStart(6, "0")}`;
}

export function buildMockWpcResult(payload: WpcResearchPayload) {
  const oem = payload.queryType === "OEM" || payload.queryType === "OEM_VEHICLE" ? normalizeOem(payload.originalQuery).normalizedOem : null;
  return {
    status: "needs_manual_wpc" as const,
    confidence: "UNVERIFIED" as const,
    source: "Hyundai Mobis WPC",
    sourceUrl: null,
    researchMethod: "authenticated_web_session",
    account: "authorized_user_session",
    originalQuery: payload.originalQuery,
    normalizedQuery: payload.normalizedQuery,
    vinRedacted: redactVin(payload.vin),
    part: { oem, name: null, description: null, quantity: null },
    vehicle: payload.vehicle ?? {},
    diagram: { reference: null, position: null },
    relationships: [],
    evidence: [],
    notes: ["تم إنشاء سجل البحث. يلزم فتح جلسة WPC المصرّح بها يدويًا لإكمال التحقق."],
  };
}
