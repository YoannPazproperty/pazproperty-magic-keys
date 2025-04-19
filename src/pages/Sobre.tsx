
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sobre/HeroSection";
import StorySection from "@/components/sobre/StorySection";
import MissionSection from "@/components/sobre/MissionSection";
import WhyChooseUsSection from "@/components/sobre/WhyChooseUsSection";
import TeamSection from "@/components/sobre/TeamSection";
import TestimonialsSection from "@/components/sobre/TestimonialsSection";
import CTASection from "@/components/sobre/CTASection";

const Sobre = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <StorySection />
      <MissionSection />
      <WhyChooseUsSection />
      <TeamSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Sobre;
