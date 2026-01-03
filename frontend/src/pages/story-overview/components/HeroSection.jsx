import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/ui/Button';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Galaxy Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          //backgroundImage: `url(${background})`, 
          backgroundImage: `url(https://ik.imagekit.io/thu2005/bg.jpg?updatedAt=1760254764428)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/60"></div>
      </div>
      {/* Floating Particles - OPTIMIZED */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)]?.map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      {/* Hero Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Main Title */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-cosmic-glow font-accent"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          >
            <span className="bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent">
              Vũ trụ của RiO
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            Nơi mỗi gia đình là một vũ trụ chờ được khám phá
          </motion.p>

          {/* Journey Subtitle */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground font-accent">
              Hành trình của RiO
            </h2>
            <p className="text-lg text-ethereal-lavender max-w-xl mx-auto">
              Khám phá những câu chuyện kỳ diệu về tình yêu gia đình qua lăng kính vũ trụ bao la
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="pt-8"
          >
            <Button
              variant="default"
              size="lg"
              className="relative px-8 py-4 text-lg font-medium text-white hover:opacity-90 transition-all duration-300 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #BB98FF, #7262FF, #72E9FB)',
                backgroundSize: '200% 100%',
                animation: 'gradient 8s ease infinite',
                boxShadow: '0 0 15px rgba(114, 98, 255, 0.5)',
              }}
              onClick={() => window.location.href = '/overview'}
            >
              Khám phá cùng RiO
            </Button>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;