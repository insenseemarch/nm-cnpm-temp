import React from 'react';
import { motion } from 'framer-motion';

const ScrollToTopButton = () => {
  return (
    <motion.button
      className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-br from-cosmic-energy to-accent rounded-full flex items-center justify-center cosmic-glow-hover transition-all duration-300"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="text-primary-foreground"
      >
        <path
          d="M12 19V5M5 12L12 5L19 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );
};

export default ScrollToTopButton;