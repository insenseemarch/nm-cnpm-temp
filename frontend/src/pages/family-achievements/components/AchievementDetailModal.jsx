import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Heart, Trophy, Calendar, BookOpen,
  Brush,
  FlaskConical,
  Music,
  Laptop,
  Briefcase,
  Medal,
  Sword,
  Lightbulb,
  HeartHandshake,
  Pencil
} from 'lucide-react';
import EditAchievementForm from './EditAchievementForm';

const AchievementDetailModal = ({ achievement, onClose, onEdit }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!achievement) return null;

  // Hàm handleEdit - mở form edit
  const handleEdit = () => {
    setShowEditModal(true);
  };

  // Hàm xử lý khi submit form edit
  const handleSubmitEdit = (updatedData) => {
    if (onEdit) {
      onEdit(updatedData);
    }
    setShowEditModal(false);
    onClose();
  };

  // Calculate age based on birth date (using achievement date as a placeholder if missing)
  // Note: This is a temporary logic, update when real birth date is available
  const calculateAge = () => {
    const birthDate = new Date(achievement.date); // Mock birth date based on achievement date
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970) + 18; // Mock age: +18 years
  };

  // Map icon based on achievement category

  const getCategoryIcon = (category) => {
    const icons = {
      'Võ thuật': <Sword size={20} />,
      'Học tập': <BookOpen size={20} />,
      'Nghệ thuật': <Brush size={20} />,
      'Khoa học': <FlaskConical size={20} />,
      'Thể thao': <Trophy size={20} />,
      'Âm nhạc': <Music size={20} />,
      'Công nghệ': <Laptop size={20} />,
      'Kinh doanh': <Briefcase size={20} />,
      'Sáng tạo': <Lightbulb size={20} />,
      'Tình nguyện': <HeartHandshake size={20} />,
    };
    return icons?.[category] || <Medal size={20} />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Võ thuật': 'from-red-400/20 to-red-600/20',
      'Học tập': 'from-blue-400/20 to-blue-600/20',
      'Nghệ thuật': 'from-purple-400/20 to-purple-600/20',
      'Khoa học': 'from-green-400/20 to-green-600/20',
      'Thể thao': 'from-yellow-400/20 to-yellow-600/20',
      'Âm nhạc': 'from-pink-400/20 to-pink-600/20',
      'Công nghệ': 'from-cyan-400/20 to-cyan-600/20',
      'Kinh doanh': 'from-orange-400/20 to-orange-600/20',
      'Sáng tạo': 'from-yellow-400/20 to-yellow-600/20',
      'Tình nguyện': 'from-teal-400/20 to-teal-600/20',
    };
    return colors?.[category] || 'from-secondary/20 to-accent/20';
  };

  // Get border color based on gender
  const getGenderAccent = (gender) => {
    const accents = {
      F: '#f9a8d4', // pink-300
      M: '#60a5fa', // blue-400
      other: '#a78bfa', // purple-400
    };
    return accents?.[gender] || accents.other;
  };

  // Ensure images array exists
  const images = achievement.images && achievement.images.length > 0
    ? achievement.images
    : (achievement.image ? [achievement.image] : []);

  const displayAvatar = achievement.avatar || "https://i.pravatar.cc/150?u=" + achievement.id;

  // Tính số lượt like
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Lớp nền làm mờ mạnh toàn màn hình (Background Blur) */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-all"
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <motion.div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0f111a]/60 border border-white/10 backdrop-blur-md shadow-2xl no-scrollbar"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Nút đóng, Edit và Category */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/20 text-white/70 hover:text-white transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              {/* Button Edit */}
              <button
                onClick={handleEdit}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 hover:from-accent/20 hover:to-accent/10 hover:border-accent/30 transition-all duration-200 h-full"
              >
                <Pencil
                  size={14}
                  className="text-accent group-hover:scale-110 transition-transform"
                />
                <span className="text-sm font-medium text-accent">Chỉnh sửa</span>
              </button>

              {/* Category Badge */}
              <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getCategoryColor(achievement?.category)}`}>
                <span className="text-lg">{getCategoryIcon(achievement?.category)}</span>
                <span className="text-sm font-medium text-accent">
                  {achievement?.category}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">

            {/* 1. Header: Avatar & Info */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px]"
                    style={{ backgroundColor: getGenderAccent(achievement.gender) }}
                  >
                    <img
                      src={displayAvatar}
                      alt={achievement.name}
                      className="w-full h-full rounded-full object-cover border-2 border-[#0f111a]"
                    />
                  </div>

                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{achievement.name}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>1986 - nay</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                    <span>Đời {achievement.generation}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                    <span style={{ color: getGenderAccent(achievement.gender) }}>39 tuổi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Title Bar */}
            <div className="relative py-3 px-6 rounded-xl bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 border border-white/5 flex items-center justify-center text-center gap-3">
              <Trophy className="text-blue-400 w-6 h-6" />
              <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent">
                {achievement?.title || achievement?.description?.split('.')?.[0] || "Thành tích xuất sắc"}
              </h3>
              <Trophy className="text-blue-400 w-6 h-6" />
            </div>

            {/* 3. Main Image Carousel */}
            {images.length > 0 && (
              <div className="relative w-full rounded-2xl overflow-hidden group bg-black/40">
                <div className="aspect-video relative">
                  <img
                    src={images[currentImageIndex]}
                    alt={`Achievement Evidence ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-transparent to-transparent opacity-60"></div>

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      {/* Left Arrow */}
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {/* Right Arrow */}
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {/* Navigation Dots */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`transition-all duration-300 rounded-full ${index === currentImageIndex
                          ? 'w-2 h-2 bg-white scale-125'
                          : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                          }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 text-white text-sm z-10">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>
            )}

            {/* 4. Content Body */}
            <div className={`space-y-4 ${images.length === 0 ? 'py-8' : ''}`}>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar size={16} />
                <span>{new Date(achievement.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>

              <p className="text-gray-300 leading-relaxed text-base md:text-lg italic font-light border-l-4 border-purple-500/50 pl-4 py-2 bg-white/5 rounded-r-lg">
                "{achievement?.description || achievement?.title}. Khoảnh khắc này không chỉ là niềm tự hào cá nhân mà còn là động lực để tiếp tục phấn đấu, mang lại vinh quang cho dòng họ. Cảm ơn sự ủng hộ của mọi người."
              </p>
            </div>

            {/* 5. Footer Actions */}
            <div className="pt-4 flex items-center justify-end border-t border-white/10">
              <div className="flex gap-4">
                <button className="p-3 rounded-full bg-white/5 hover:bg-pink-500/20 text-white transition-all group flex items-center" onClick={handleLike}>
                  <Heart
                    size={24}
                    className={`transition-colors ${isLiked ? 'text-pink-500 fill-pink-500' : 'group-hover:text-pink-500 group-hover:fill-pink-500'}`}
                  />
                  <span className="ml-2">{likeCount}</span>
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>

      {/* EditAchievementForm Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditAchievementForm
            achievement={achievement}
            onSubmit={handleSubmitEdit}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AchievementDetailModal;