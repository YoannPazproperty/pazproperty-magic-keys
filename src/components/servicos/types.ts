
export interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link?: string;
  linkTo?: string;
  linkText?: string;
  linkStyle?: string;
}

export interface ServiceSectionProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  reversed?: boolean;
  children?: React.ReactNode;
}

export interface ServiceFeature {
  text: string;
}

export interface ServiceDataItem {
  id: string;
  title: string;
  description: string;
  features: ServiceFeature[];
  icon: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}

export interface GridServiceItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkTo: string;
  linkText: string;
  linkStyle?: string;
}
