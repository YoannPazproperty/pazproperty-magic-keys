
import { Contact } from '@/services/types';

export type Affaire = {
  id: string;
  contact_id: string;
  client_nom: string;
  client_email: string | null;
  client_telephone: string | null;
  description: string | null;
  statut: string;
  honoraires_percus: number | null;
  remuneration_prevue: number | null;
  remuneration_payee: number | null;
  date_paiement: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type HistoriqueAction = {
  id: string;
  affaire_id: string;
  action: string;
  date: string;
  utilisateur: string | null;
  notes: string | null;
  created_at: string;
};

export type AffaireFormData = Omit<Affaire, 'id' | 'created_at' | 'updated_at'>;

export type HistoriqueActionFormData = Omit<HistoriqueAction, 'id' | 'created_at'>;

export type AffaireAvecContact = Affaire & {
  contact: Contact;
};

export type StatutAffaire = 
  | "Initial"
  | "En discussion" 
  | "Proposition faite"
  | "Contrat signé" 
  | "En cours" 
  | "Achevé" 
  | "Annulé";

export const STATUTS_AFFAIRES: StatutAffaire[] = [
  "Initial",
  "En discussion",
  "Proposition faite",
  "Contrat signé",
  "En cours", 
  "Achevé",
  "Annulé"
];
