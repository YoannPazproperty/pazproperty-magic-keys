
import { ReactNode } from "react";

export interface ServiceFeature {
  text: string;
}

export interface ServiceDataItem {
  id: string;
  title: string;
  description: string;
  features: ServiceFeature[];
  icon: ReactNode;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}

export interface GridServiceItem {
  icon: ReactNode;
  title: string;
  description: string;
  linkTo: string;
  linkText: string;
  linkStyle?: string;
}
