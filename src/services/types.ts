
// Ce fichier n'étant pas disponible en édition directe, nous allons ajouter une définition de type pour deleted_at

// Extension du type ServiceProvider pour inclure le champ deleted_at
declare module '@/services/types' {
  interface ServiceProvider {
    deleted_at?: string;
  }
}
