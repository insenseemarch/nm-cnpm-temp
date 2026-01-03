import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import SelectWithOther from './SelectWithOther';

const AddAchievementForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    category: '',
    description: '',
    date: new Date()?.toISOString()?.split('T')?.[0],
    generation: '',
    images: [],
  });

  const [notification, setNotification] = useState(null);

  const categories = [
    'Võ thuật',
    'Học tập',
    'Nghệ thuật',
    'Khoa học',
    'Thể thao',
    'Âm nhạc',
    'Công nghệ',
    'Kinh doanh',
    'Sáng tạo',
    'Tình nguyện',
  ];

  const generations = ['1', '2', '3', '4', '5', '6'];

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      if (field === 'images') {
        const newImages = Array.from(value);
        return {
          ...prev,
          images: [...prev.images, ...newImages],
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData?.name || !formData?.title || !formData?.category) {
      return;
    }

    try {
      // Call onSubmit
      await onSubmit(formData);

      // Show success notification
      showNotification('Thêm thành tích thành công!', 'success');

      // Close notification and form after 300ms
      setTimeout(() => {
        closeNotification();
        onCancel();
      }, 300);
    } catch (error) {
      console.error('Error adding achievement:', error);
      showNotification('Có lỗi xảy ra, vui lòng thử lại', 'error');
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onCancel}
      >
        <motion.div
          className="floating-content rounded-3xl p-8 w-full max-w-md backdrop-blur-cosmic max-h-[85vh] overflow-y-auto overflow-x-hidden no-scrollbar"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onClick={(e) => e?.stopPropagation()}
        >
          {/* Form Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-accent bg-gradient-to-r from-secondary via-accent to-cosmic-energy bg-clip-text text-transparent">
              Thêm thành tích mới
            </h2>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-2"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-accent font-medium text-sm">Họ tên *</label>
              <input
                type="text"
                required
                value={formData?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
                placeholder="Nhập họ tên đầy đủ"
              />
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-accent font-medium text-sm">Tên thành tích *</label>
              <input
                type="text"
                required
                value={formData?.title}
                onChange={(e) => handleInputChange('title', e?.target?.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
                placeholder="Nhập tên thành tích"
              />
            </div>

            {/* Category Select */}
            <SelectWithOther
              label="Loại thành tích"
              value={formData?.category}
              onChange={(value) => handleInputChange('category', value)}
              options={categories}
              required
              placeholder="Chọn loại thành tích"
              otherPlaceholder="Nhập loại thành tích khác..."
            />

            {/* Image Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-accent font-medium text-sm">Hình ảnh đính kèm</label>
                <span className="text-xs text-muted-foreground">
                  {formData.images.length} ảnh đã chọn
                </span>
              </div>

              <div className="relative">
                <input
                  type="file"
                  id="achievement-images"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleInputChange('images', e?.target?.files)}
                  className="hidden"
                />
                <label
                  htmlFor="achievement-images"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-accent hover:bg-white/5 transition-all duration-300 group"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-3 rounded-full bg-white/5 group-hover:bg-accent/10 transition-colors mb-2">
                      <Upload className="w-6 h-6 text-white/70 group-hover:text-accent transition-colors" />
                    </div>
                    <p className="text-sm text-white/50 group-hover:text-white/80 transition-colors">
                      <span className="font-semibold">Thêm ảnh</span>
                      <span className="text-xs ml-1">(Có thể chọn nhiều ảnh)</span>
                    </p>
                  </div>
                </label>
              </div>

              {/* Images Grid */}
              {formData.images.length > 0 && (
                <div className={`grid gap-3 mt-4 ${formData.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <AnimatePresence mode="popLayout">
                    {formData.images.map((file, index) => (
                      <motion.div
                        key={index}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group aspect-video bg-black/20 rounded-xl overflow-hidden border border-white/10"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors transform hover:scale-110"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-xs text-white/80 truncate px-1">
                            {file.name}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Description Textarea */}
            <div className="space-y-2">
              <label className="text-accent font-medium text-sm">Mô tả</label>
              <textarea
                rows={3}
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300 resize-none"
                placeholder="Chia sẻ cảm nghĩ của bạn về thành tích này..."
              />
            </div>

            {/* Date Input */}
            <div className="space-y-2">
              <label className="text-accent font-medium text-sm">Ngày phát sinh *</label>
              <input
                type="date"
                required
                value={formData?.date}
                onChange={(e) => handleInputChange('date', e?.target?.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
              />
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-4">
              <motion.button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 border mystical-border rounded-xl text-muted-foreground hover:text-foreground hover:border-accent/50 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Hủy
              </motion.button>

              <motion.button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-accent to-cosmic-energy hover:from-accent/90 hover:to-cosmic-energy/90 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Lưu
              </motion.button>
            </div>
          </form>

          {/* Cosmic decoration */}
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-accent/50 animate-pulse"></div>
          <div
            className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-secondary/50 animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>
        </motion.div>
      </motion.div>

      {/* Success Notification */}
      {createPortal(
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-60%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.8, x: '-50%', y: '-60%' }}
              className="fixed left-1/2 top-1/2 flex items-start gap-3 backdrop-blur-xl rounded-xl shadow-2xl p-5 w-full max-w-md"
              style={{
                zIndex: 10000000,
                borderWidth: '2px',
                borderColor: notification.type === 'success' ? '#10b981' : '#f59e0b',
                backgroundColor: 'rgba(15, 23, 42, 0.98)'
              }}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === 'success' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                }`}>
                {notification.type === 'success' ? (
                  <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1" style={{ color: 'rgb(248, 250, 252)' }}>
                  {notification.type === 'success' ? 'Thành công' : 'Đang xử lý'}
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: 'rgb(203, 213, 225)' }}>
                  {notification.message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default AddAchievementForm;