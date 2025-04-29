
import React, { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ServiceCardProps } from "./types";

const ServiceCard = ({ 
  icon, 
  title, 
  description, 
  linkTo, 
  linkText,
  linkStyle = "text-[#ffb100] hover:underline"
}: ServiceCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
      {icon}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link 
        to={linkTo} 
        className={`${linkStyle} inline-flex items-center`}
      >
        {linkText} <ArrowRight className="ml-1 h-4 w-4" color="#ffb100" />
      </Link>
    </div>
  );
};

export default ServiceCard;
