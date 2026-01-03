import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="relative z-10 py-12 px-6 border-t mystical-border bg-background/80 backdrop-blur-cosmic flex items-center min-h-[300px]">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center space-y-6">
          {/* Footer Logo */}
          <div className="flex justify-center mb-4 group">
            <img
              src="https://ik.imagekit.io/thu2005/logo%201.png"
              alt="RiO Universe Logo"
              className="w-[120px] h-[120px] object-contain transition-all duration-300 group-hover:scale-110 -my-8"
            />
          </div>

          {/* Footer Description */}
          <motion.p
            className="text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Nơi mỗi gia đình trở thành một vũ trụ riêng biệt, với những ngôi sao tỏa sáng
            và những hành tinh quay quanh nhau trong quỹ đạo của tình yêu thương.
          </motion.p>

          {/* Footer Links */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 text-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/privacy" className="text-muted-foreground hover:text-accent transition-colors duration-300">
              Chính sách bảo mật
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-accent transition-colors duration-300">
              Điều khoản sử dụng
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-accent transition-colors duration-300">
              Liên hệ
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-accent transition-colors duration-300">
              Về chúng tôi
            </Link>
          </motion.div>

          {/* Copyright */}
          <motion.div
            className="mt-8 pt-6 border-t mystical-border bg-background/40 rounded-lg px-6 py-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-sm text-muted-foreground">
              © {new Date()?.getFullYear()} RiO Universe. Tất cả quyền được bảo lưu.
            </p>
            <p className="text-xs text-muted-foreground/80 mt-2">
              Được tạo ra với ❤️ bởi Chòm Sao Sáng Tạo
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;