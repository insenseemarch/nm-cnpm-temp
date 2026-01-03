import React, { useEffect, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

const AmbientLayer = () => {
  console.log('🚀 AmbientLayer re-rendered!');
  
  // Stable positions for particles to prevent CLS - OPTIMIZED
  const particlePositions = useMemo(() => 
    [...Array(10)].map(() => ({
      width: Math.random() * 5 + 2,
      height: Math.random() * 5 + 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.7 + 0.3,
      color: ['#f7ddfa', '#bb98ff', '#72e9fb'][Math.floor(Math.random() * 3)],
    })), []
  );

  const dustPositions = useMemo(() => 
    [...Array(2)].map(() => ({
      width: Math.random() * 200 + 100,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      rotate: Math.random() * 360,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ contain: 'layout style paint' }}>
      {/* Cosmic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background opacity-80"></div>
      {/* Static Cosmic Glow */}
      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(114, 233, 251, 0.5) 0%, rgba(187, 152, 255, 0.4) 50%, transparent 70%)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          willChange: 'transform, opacity',
        }}
        animate={{
          x: [0, 100, -50, 200, 0],
          y: [0, -100, 50, 150, 0],
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Additional Static Glows */}
      <motion.div
        className="absolute w-32 h-32 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(247, 221, 250, 0.4) 0%, rgba(187, 152, 255, 0.3) 50%, transparent 70%)',
          left: `${Math.random() * 80 + 10}%`,
          top: `${Math.random() * 80 + 10}%`,
          transform: 'translate(-50%, -50%)',
          willChange: 'transform, opacity',
        }}
        animate={{
          x: [0, -80, 60, -120, 0],
          y: [0, 80, -40, 100, 0],
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute w-40 h-40 rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(114, 233, 251, 0.4) 0%, rgba(247, 221, 250, 0.3) 50%, transparent 70%)',
          left: `${Math.random() * 80 + 10}%`,
          top: `${Math.random() * 80 + 10}%`,
          transform: 'translate(-50%, -50%)',
          willChange: 'transform, opacity',
        }}
        animate={{
          x: [0, 20, -60, 80, 0],
          y: [0, -60, 80, -100, 0],
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.4, 0.15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      {/* Floating Cosmic Particles */}
      {particlePositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: pos.width,
            height: pos.height,
            left: pos.left,
            top: pos.top,
            opacity: pos.opacity,
            backgroundColor: pos.color,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [-50, 50, -50],
            x: [-30, 30, -30],
            opacity: [0.4, 1, 0.4],
            scale: [0.8, 1.5, 0.8],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
      {/* Cosmic Dust Trails */}
      {dustPositions.map((pos, i) => (
        <motion.div
          key={`trail-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent"
          style={{
            width: pos.width,
            left: pos.left,
            top: pos.top,
            transform: `rotate(${pos.rotate}deg)`,
            willChange: 'transform, opacity',
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scaleX: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 6 + 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
        />
      ))}
      {/* Nebula Clouds */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-2/3 left-1/3 w-48 h-48 bg-cosmic-energy/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      {/* Constellation Patterns */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BB98FF" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#72E9FB" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7262FF" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        
        {/* Constellation Lines */}
        <g stroke="url(#starGradient)" strokeWidth="0.5" fill="none">
          <path d="M300,200 L500,150 L700,300 L900,250 L1100,400" />
          <path d="M200,600 L400,550 L600,700 L800,650 L1000,800" />
          <path d="M1200,300 L1400,250 L1600,400 L1800,350" />
        </g>
        
        {/* Constellation Stars */}
        <g fill="url(#starGradient)">
          <circle cx="300" cy="200" r="2" opacity="0.8" />
          <circle cx="500" cy="150" r="1.5" opacity="0.6" />
          <circle cx="700" cy="300" r="2.5" opacity="0.9" />
          <circle cx="900" cy="250" r="1" opacity="0.5" />
          <circle cx="1100" cy="400" r="2" opacity="0.7" />
          
          <circle cx="200" cy="600" r="1.5" opacity="0.6" />
          <circle cx="400" cy="550" r="2" opacity="0.8" />
          <circle cx="600" cy="700" r="1" opacity="0.4" />
          <circle cx="800" cy="650" r="2.5" opacity="0.9" />
          <circle cx="1000" cy="800" r="1.5" opacity="0.6" />
          
          <circle cx="1200" cy="300" r="2" opacity="0.7" />
          <circle cx="1400" cy="250" r="1.5" opacity="0.6" />
          <circle cx="1600" cy="400" r="1" opacity="0.5" />
          <circle cx="1800" cy="350" r="2" opacity="0.8" />
        </g>
      </svg>
      {/* Shooting Stars */}
      {[...Array(0)]?.map((_, i) => (
        <motion.div
          key={`shooting-${i}`}
          className="absolute w-1 h-1 bg-accent rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            willChange: 'transform, opacity',
          }}
          animate={{
            x: [0, 300],
            y: [0, 150],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: Math.random() * 10 + 5,
            ease: "easeOut",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent to-transparent w-20 h-px -translate-y-0.5"></div>
        </motion.div>
      ))}
      {/* Cosmic Energy Pulses */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          willChange: 'transform, opacity',
        }}
        animate={{
          scale: [1, 2, 1],
          opacity: [0, 0.1, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-96 h-96 border border-accent/20 rounded-full"></div>
      </motion.div>
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          willChange: 'transform, opacity',
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0, 0.15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        <div className="w-64 h-64 border border-secondary/20 rounded-full"></div>
      </motion.div>
    </div>
  );
};

export default AmbientLayer;