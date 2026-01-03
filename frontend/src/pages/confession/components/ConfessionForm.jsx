import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ConfessionForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    isAnonymous: false,
  });

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData?.content?.trim()) return;

    onSubmit?.({
      name: formData?.isAnonymous ? 'Ẩn danh' : formData?.name || 'Ẩn danh',
      content: formData?.content,
      isAnonymous: formData?.isAnonymous,
    });

    setFormData({ name: '', content: '', isAnonymous: false });
  };

  const handleToggle = () => {
    setFormData((prev) => ({
      ...prev,
      isAnonymous: !prev?.isAnonymous,
      name: !prev?.isAnonymous ? '' : prev?.name,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="backdrop-blur-sm bg-primary/10 border border-accent/20 rounded-3xl p-8 shadow-lg">
          {/* Name Input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder={formData?.isAnonymous ? 'Ẩn danh' : 'Tên của bạn (tùy chọn)'}
              value={formData?.isAnonymous ? '' : formData?.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e?.target?.value }))}
              disabled={formData?.isAnonymous}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
            />
          </div>

          {/* Anonymous Toggle */}
          <div className="mb-6">
            <label className="flex items-center justify-center space-x-3 cursor-pointer">
              <span className="text-sm font-medium text-muted-foreground">Công khai</span>
              <motion.div
                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${
                  formData?.isAnonymous ? 'bg-gradient-to-r from-secondary to-accent' : 'bg-muted'
                }`}
                onClick={handleToggle}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-4 h-4 bg-white rounded-full shadow-md"
                  animate={{
                    x: formData?.isAnonymous ? 24 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.div>
              <span className="text-sm font-medium text-muted-foreground">Ẩn danh</span>
            </label>
          </div>

          {/* Content Textarea */}
          <div className="mb-8">
            <textarea
              placeholder="Hãy viết những điều bạn chưa từng nói..."
              value={formData?.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e?.target?.value }))}
              rows={6}
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <motion.button
              type="submit"
              className="cosmic-button px-8 py-4 rounded-2xl font-medium text-primary-foreground shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData?.content?.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Gửi tâm sự
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ConfessionForm;
