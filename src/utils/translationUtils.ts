
// Fonctions utilitaires pour la traduction et le formatage

// Traduit le type de problème
export const translateIssueType = (type: string | null): string => {
  if (!type) return "Non spécifié";
  
  const translations: { [key: string]: string } = {
    "plumbing": "Plomberie",
    "electrical": "Électricité",
    "heating": "Chauffage",
    "structural": "Structure",
    "appliance": "Électroménager",
    "other": "Autre",
    "leakage": "Fuite d'eau",
    "canalização": "Plomberie",
    "eletricidade": "Électricité",
    "aquecimento": "Chauffage",
    "estrutural": "Structure",
    "eletrodoméstico": "Électroménager",
    "outro": "Autre"
  };
  
  return translations[type.toLowerCase()] || type;
};

// Traduit l'urgence
export const translateUrgency = (urgency: string | null): string => {
  if (!urgency) return "Non spécifiée";
  
  const translations: { [key: string]: string } = {
    "low": "Faible",
    "medium": "Moyenne",
    "high": "Élevée",
    "emergency": "Urgence",
    "baixa": "Faible",
    "média": "Moyenne",
    "alta": "Élevée",
    "emergência": "Urgence"
  };
  
  return translations[urgency.toLowerCase()] || urgency;
};

// Traduit le statut
export const translateStatus = (status: string | null): string => {
  if (!status) return "Non spécifié";
  
  const translations: { [key: string]: string } = {
    "Novo": "Nouveau",
    "Em espera do encontro de diagnostico": "En attente RDV",
    "Encontramento de diagnostico planeado": "RDV planifié",
    "Orçamento recebido": "Devis reçu",
    "Em curso de reparação": "En réparation",
    "Resolvido": "Résolu",
    "Annulé": "Annulé"
  };
  
  return translations[status] || status;
};

// Obtient la couleur du badge de statut
export const getStatusBadgeColor = (status: string | null): string => {
  if (!status) return "bg-gray-100";
  
  switch (status) {
    case "Novo":
      return "bg-yellow-100 text-yellow-800";
    case "Em espera do encontro de diagnostico":
      return "bg-blue-50 text-blue-700";
    case "Encontramento de diagnostico planeado":
      return "bg-sky-100 text-sky-800";
    case "Orçamento recebido":
      return "bg-purple-100 text-purple-800";
    case "Em curso de reparação":
      return "bg-orange-100 text-orange-800";
    case "Resolvido":
      return "bg-green-100 text-green-800";
    case "Annulé":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100";
  }
};

// Formate une date
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Non définie";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};
