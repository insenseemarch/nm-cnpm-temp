import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { isValidEmail, isValidPassword, getPasswordStrength } from '../../utils/validators';


const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ isValid: false, errors: [] });
  const { register } = useAuth(); // Register function from AuthContext
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'email') setEmailError('');
    if (name === 'password') setPasswordError('');

  };

  const handleEmailBlur = () => {
    if (formData.email && !isValidEmail(formData.email)) {
      setEmailError('Địa chỉ email không hợp lệ (ví dụ: example@gmail.com).');
    }
  }

  const handlePasswordBlur = () => {
    if (formData.password) {
      const strength = getPasswordStrength(formData.password);
      setPasswordStrength(strength);
      if (!strength.isValid) {
        setPasswordError('Mật khẩu chưa đủ mạnh');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate email
    if (!isValidEmail(formData.email)) {
      setError('Địa chỉ email không hợp lệ (ví dụ: example@gmail.com).');
      return;
    }
    // Validate password strength
    if (!isValidPassword(formData.password)) {
      const strength = getPasswordStrength(formData.password);
      setPasswordStrength(strength);
      setError('Mật khẩu chưa đủ mạnh');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Register from AuthContext
      await register(formData.email, formData.password, formData.fullName);

      //navigate('/verify-email'); // Navigate to email verification page
      //navigate('/');
      navigate('/login');
    } catch (err) {
      console.error(err);
      // Check for backend API error response
      const errorMessage = err.response?.data?.error;
      if (errorMessage === 'Email already registered') {
        setError('Email này đã được sử dụng.');
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-foreground relative overflow-hidden flex items-center justify-center">
      {/* Register Form Container */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-auto px-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {/* Register Card */}
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
              Tạo tài khoản mới
            </h2>
            <p className="text-muted-foreground">
              Bắt đầu hành trình khám phá vũ trụ gia đình của bạn
            </p>
          </motion.div>
          {error && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-200 text-sm text-center">
              {error}
            </div>
          )}
          {/* Register Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            {/* Full Name Input */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                Họ và tên
              </label>
              <motion.input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-input border border-accent/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
                placeholder="Nhập họ và tên của bạn"
                required
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </div>

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
                //className="w-full px-4 py-3 rounded-lg bg-input border border-accent/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
                onBlur={handleEmailBlur}
                className={`w-full px-4 py-3 rounded-lg bg-input border ${emailError ? 'border-red-500' : 'border-accent/30'} text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 ${emailError ? 'focus:ring-red-500' : 'focus:ring-accent'} focus:border-transparent transition-all duration-300`}
                placeholder="Nhập địa chỉ email"
                required
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
              {emailError && (
                <p className="text-red-500 text-xs mt-1 ml-1">{emailError}</p>
              )}
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
                //className="w-full px-4 py-3 rounded-lg bg-input border border-accent/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
                onBlur={handlePasswordBlur}
                className={`w-full px-4 py-3 rounded-lg bg-input border ${passwordError ? 'border-red-500' : 'border-accent/30'} text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 ${passwordError ? 'focus:ring-red-500' : 'focus:ring-accent'} focus:border-transparent transition-all duration-300`}
                placeholder="Tạo mật khẩu"
                required
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
              {passwordError && passwordStrength.errors.length > 0 && (
                <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400 text-xs font-semibold mb-2">Mật khẩu cần có:</p>
                  <ul className="space-y-1">
                    {passwordStrength.errors.map((error, index) => (
                      <li key={index} className="text-red-300 text-xs flex items-start">
                        <span className="mr-2">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Xác nhận mật khẩu
              </label>
              <motion.input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-input border border-accent/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
                placeholder="Nhập lại mật khẩu"
                required
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 rounded border-accent/30 bg-input text-accent focus:ring-accent focus:ring-offset-0"
                required
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                Tôi đồng ý với{' '}
                <Link to="/terms" className="text-accent hover:text-accent/80 transition-colors duration-300">
                  Điều khoản sử dụng
                </Link>
                {' '}và{' '}
                <Link to="/privacy" className="text-accent hover:text-accent/80 transition-colors duration-300">
                  Chính sách bảo mật
                </Link>
              </label>
            </div>

            {/* Register Button */}
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
                    <span>Đang đăng ký...</span>
                  </div>
                ) : (
                  'Đăng ký'
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Login Link */}
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <p className="text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="text-accent hover:text-accent/80 font-medium transition-colors duration-300"
              >
                Đăng nhập
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

export default RegisterPage;