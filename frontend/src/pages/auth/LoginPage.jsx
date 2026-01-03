import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/'); // Successful login redirects to home
    } catch (err) {
      console.error(err);
      setError('Email hoặc mật khẩu không chính xác.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Đăng nhập Google thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-foreground relative overflow-hidden flex items-center justify-center">
      {/* Login Form Container */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-auto px-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {/* Login Card */}
        <div className="floating-content rounded-2xl p-8 cosmic-glow-hover backdrop-blur-cosmic">
          {/* Header */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Logo */}
            <motion.div
              className="flex items-center justify-center space-x-3 mb-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {/* Logo */}
              <img
                src="https://ik.imagekit.io/thu2005/logo%201.png"
                alt="RiO Universe Logo"
                className="w-[200px] h-[90px] ml-2 object-contain transition-all duration-300 group-hover:scale-110"
              />
            </motion.div>

            {/* Welcome Text */}
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Chào mừng trở lại
            </h2>
            <p className="text-muted-foreground">
              Đăng nhập để khám phá vũ trụ gia đình của bạn
            </p>
          </motion.div>
          {error && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-200 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
          {/* Login Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <motion.input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-input border border-accent/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
                placeholder="Nhập email của bạn"
                required
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Mật khẩu
              </label>
              <motion.input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-input border border-accent/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
                placeholder="Nhập mật khẩu"
                required
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-accent/30 bg-background/50 text-accent focus:ring-accent focus:ring-offset-0"
                />
                <span className="text-muted-foreground">Ghi nhớ đăng nhập</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-accent hover:text-accent/80 transition-colors duration-300"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Login Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                variant="default"
                size="lg"
                disabled={isLoading}
                className="w-full relative px-8 py-4 text-lg font-medium text-white hover:opacity-90 transition-all duration-300 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #BB98FF, #7262FF, #72E9FB)',
                  backgroundSize: '200% 100%',
                  animation: 'gradient 8s ease infinite',
                  boxShadow: '0 0 15px rgba(114, 98, 255, 0.5)',
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Divider and Google Login */}
          <div className="mt-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-accent/20" /></div>
              <div className="relative flex justify-center text-sm"><span className="bg-transparent px-2 text-muted-foreground bg-[#1a1b26] rounded">Hoặc</span></div>
            </div>

            {/*loginWithGoogle*/}
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  await loginWithGoogle(credentialResponse.credential);
                  navigate('/');
                } catch (err) {
                  setError('Đăng nhập Google thất bại.');
                }
              }}
              onError={() => setError('Đăng nhập Google thất bại.')}
              theme="filled_black"
              shape="pill"
              text="signin_with"
              locale="vi_VN"
            />
          </div>

          {/* Register Link */}
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <p className="text-muted-foreground">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="text-accent hover:text-accent/80 font-medium transition-colors duration-300"
              >
                Đăng ký ngay
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Back to Home */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors duration-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-current">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Quay về trang chủ</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;