import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Button from '../../../components/ui/Button';

const ExplorationGateway = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { threshold: 0.5 });

  return (
    <section ref={sectionRef} className="py-20 px-6 relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-accent/20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cosmic-energy/10 rounded-full blur-3xl"></div>
      </div>
      {/* Floating Particles - OPTIMIZED */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)]?.map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-accent rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-30, 30, -30],
              x: [-20, 20, -20],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Gateway Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2 }}
        >
          <motion.h2
            className="text-4xl md:text-6xl font-bold font-accent mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-cosmic-energy via-accent to-secondary bg-clip-text text-transparent">
              Cổng Khám Phá
            </span>
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Hành trình khám phá vũ trụ gia đình của bạn đang chờ đợi. Mỗi câu chuyện là một ngôi
            sao, mỗi kỷ niệm là một hành tinh trong thiên hà riêng của bạn.
          </motion.p>
        </motion.div>

        {/* Central Gateway Portal */}
        <motion.div
          className="relative mb-12"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.8 }}
        >
          {/* Orbital Rings */}
          <div className="relative w-80 h-80 mx-auto">
            {[...Array(3)]?.map((_, i) => (
              <motion.div
                key={i}
                className={`absolute inset-0 border border-accent/30 rounded-full`}
                style={{
                  width: `${100 - i * 15}%`,
                  height: `${100 - i * 15}%`,
                  top: `${i * 7.5}%`,
                  left: `${i * 7.5}%`,
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20 + i * 10,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}

            {/* Central Portal */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-cosmic-energy to-accent rounded-full cosmic-glow flex items-center justify-center"
              style={{
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(114, 98, 255, 0.4)',
                  '0 0 40px rgba(114, 98, 255, 0.6)',
                  '0 0 20px rgba(114, 98, 255, 0.4)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                className="text-primary-foreground"
              >
                <path
                  d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Gateway Messages */}
        <motion.div
          className="space-y-6 mb-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <div className="grid md:grid-cols-4 gap-8 ">
            {[
              {
                title: 'Cây Gia Phả',
                description: 'Khám phá hành trình và nguồn cội của gia đình',
                route: '/tree',
              },
              {
                title: 'Thành Tích',
                description: 'Tự hào lưu giữ những dấu ấn và thành tựu nổi bật',
                route: '/achievements',
              },
              {
                title: 'Sự Kiện',
                description: 'Theo dõi các hoạt động và khoảnh khắc đáng nhớ',
                route: '/events',
              },
              {
                title: 'Tâm Sự',
                description: 'Lắng nghe những câu chuyện và chia sẻ chân thành',
                route: '/confessions',
              },
            ]?.map((item, index) => (
              <motion.div
                key={index}
                className="floating-content rounded-xl p-6 text-center hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1.4 + index * 0.2 }}
                whileHover={{ y: -5 }}
                onClick={() => (window.location.href = item?.route)}
              >
                <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent mb-2 group-hover:from-accent group-hover:to-cosmic-energy transition-all duration-300">
                  {item?.title}
                </h3>
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {item?.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 1.8 }}
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
            onClick={() => (window.location.href = '/overview')}
          >
            Khám phá cùng RiO
          </Button>

          <motion.p
            className="text-sm text-muted-foreground mt-4"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 2.2 }}
          >
            Bắt đầu hành trình khám phá vũ trụ gia đình của bạn
          </motion.p>
        </motion.div>

        {/* Cosmic Quote */}
        <motion.div
          className="mt-16 p-8 floating-content rounded-2xl max-w-2xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.2, delay: 2.5 }}
        >
          <blockquote className="text-lg md:text-0.5xl text-muted-foreground text-center">
            "Trải qua hành trình khám phá ấy, RiO đã có thật nhiều trải nghiệm và thấu hiểu về từng
            bước tìm về cội nguồn.
            <br />
            <br />
            Còn bạn thì sao? Hãy để RiO - người bạn nhỏ đầy kinh nghiệm - đồng hành cùng bạn, khám
            phá các "cánh cổng" dưới đây để vẽ nên vũ trụ Gia Đình của chính mình nhé!"
          </blockquote>
          <cite className="block text-accent font-semibold mt-4">RiO's Journey</cite>
        </motion.div>
      </div>
    </section>
  );
};

export default ExplorationGateway;
