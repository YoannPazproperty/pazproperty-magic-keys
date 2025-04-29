
export interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link?: string;
}

export interface ServiceSectionProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  reversed?: boolean;
  children?: React.ReactNode;
}
