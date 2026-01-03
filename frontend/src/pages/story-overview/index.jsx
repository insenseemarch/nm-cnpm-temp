import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import ScrollToTopButton from '../../components/ui/ScrollToTopButton';
import HeroSection from './components/HeroSection';
import StorySection from './components/StorySection';
import ExplorationGateway from './components/ExplorationGateway';
import Creator from './components/Creator';

const CosmicJourneyExperience = () => {
  useEffect(() => {
    // Smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Set page title
    document.title = 'Vũ trụ RiO - Hành Trình Vũ Trụ Gia Đình';
    
    // Meta description for SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription?.setAttribute('content', 'Khám phá vũ trụ gia đình cùng RiO - nơi mỗi thành viên là một ngôi sao tỏa sáng trong thiên hà của tình yêu thương.');
    }

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen text-foreground relative overflow-x-hidden">
      {/* Header Navigation */}
      <Header />
      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section - Cosmic Entry Portal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <HeroSection />
        </motion.div>

        {/* Story Section - Central Story Sanctuary */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, threshold: 0.1 }}
          transition={{ duration: 1.2 }}
        >
          <StorySection />
        </motion.div>

        {/* Exploration Gateway */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, threshold: 0.1 }}
          transition={{ duration: 1.2 }}
        >
          <ExplorationGateway />
        </motion.div>

        {/* Creator Constellation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, threshold: 0.1 }}
          transition={{ duration: 1.2 }}
        >
          <Creator />
        </motion.div>
      </main>
      {/* Footer */}
      <Footer />
      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
};

export default CosmicJourneyExperience;