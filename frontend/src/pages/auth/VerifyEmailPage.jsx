import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  // First input focus on mount
  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return; // Numbers only

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace handling
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (fullCode === '123456') {
        alert("Xác thực thành công!");
        navigate('/'); // Back to home page
      } else {
        alert("Mã xác thực không đúng (Thử lại: 123456)");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen text-foreground relative overflow-hidden flex items-center justify-center">
      <motion.div
        className="relative z-10 w-full max-w-md mx-auto px-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="floating-content rounded-2xl p-8 cosmic-glow-hover backdrop-blur-cosmic text-center">
          
          <h2 className="text-2xl font-bold mb-2">Xác thực Email</h2>
          <p className="text-muted-foreground mb-8">
            Vui lòng nhập mã 6 số chúng tôi vừa gửi đến email của bạn.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-between gap-2 mb-8">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold rounded-lg bg-input border border-accent/30 focus:border-accent focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={isLoading || code.join('').length < 6}
              className="w-full py-4 rounded-full text-white font-bold text-lg"
              style={{
                background: 'linear-gradient(90deg, #BB98FF, #7262FF, #72E9FB)',
              }}
            >
              {isLoading ? 'Đang kiểm tra...' : 'Xác nhận'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            Không nhận được mã? <button className="text-accent hover:underline">Gửi lại</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;