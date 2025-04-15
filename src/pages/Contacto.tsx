
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/contacto/HeroSection";
import ContactInfo from "@/components/contacto/ContactInfo";
import BusinessHours from "@/components/contacto/BusinessHours";
import ContactForm from "@/components/contacto/ContactForm";
import LocationMap from "@/components/contacto/LocationMap";

const Contacto = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <HeroSection />
      
      {/* Contact Info & Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <ContactInfo />
              <BusinessHours />
            </div>
            
            {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      </section>
      
      <LocationMap />
      
      <Footer />
    </div>
  );
};

export default Contacto;
