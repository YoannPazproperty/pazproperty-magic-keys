
// Translation and formatting utilities for declarations

// Helper functions for translations and formatting
export const translateIssueType = (type: string): string => {
  const translations: Record<string, string> = {
    plumbing: "Encanamento",
    electrical: "Elétrico",
    appliance: "Eletrodomésticos",
    heating: "Aquecimento/Refrigeração",
    structural: "Estrutural",
    pest: "Pragas",
    other: "Outro",
  };
  return translations[type] || type;
};

export const translateUrgency = (urgency: string): string => {
  const translations: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    emergency: "Emergência",
  };
  return translations[urgency] || urgency;
};

export const translateStatus = (status: string): string => {
  const translations: Record<string, string> = {
    pending: "Em espera",
    in_progress: "Em progresso",
    resolved: "Resolvido",
  };
  return translations[status] || status;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Status badge color utility
export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "in_progress":
      return "bg-blue-500 hover:bg-blue-600";
    case "resolved":
      return "bg-green-500 hover:bg-green-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};
