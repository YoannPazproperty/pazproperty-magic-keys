
/**
 * Vérifie si l'utilisateur a une adresse email pazproperty.pt
 */
export const isValidCompanyEmail = (email: string): boolean => {
  return email.endsWith('@pazproperty.pt');
}

/**
 * Génère un mot de passe temporaire pour les nouveaux utilisateurs
 */
export const generateTemporaryPassword = (): string => {
  const adjectives = ["Happy", "Sunny", "Shiny", "Lucky", "Magic", "Super", "Mega"];
  const nouns = ["Star", "Moon", "Sky", "Day", "Tech", "Team", "Hero"];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 1000);
  return `${randomAdjective}${randomNoun}${randomNum}`;
}
