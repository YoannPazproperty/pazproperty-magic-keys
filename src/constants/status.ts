// src/constants/status.ts

export const statusMapToSupabase: Record<string, string> = {
  NEW: "Novo",
  TRANSMITTED: "Transmitido",
  AWAITING_DIAGNOSTIC: "Em espera do encontro de diagnostico",
  DIAGNOSTIC_SCHEDULED: "Encontramento de diagnostico planeado",
  QUOTE_RECEIVED: "Orçamento recebido",
  IN_REPAIR: "Em cours de reparação",
  RESOLVED: "Resolvido",
  CANCELLED: "Annulé",
};