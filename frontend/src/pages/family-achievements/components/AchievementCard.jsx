
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Brush,
  FlaskConical,
  Trophy,
  Music,
  Laptop,
  Briefcase,
  Medal,
  Sword,
  Lightbulb,
  HeartHandshake,
} from 'lucide-react';

const AchievementCard = ({ achievement, onClick, onEdit, onDelete }) => {
  const [contextMenu, setContextMenu] = React.useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Handle context menu open
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY
    });
  };

  // Handle "Edit" click
  const handleEdit = (e) => {
    e.stopPropagation();
    setContextMenu(null);
    if (onEdit) onEdit(achievement);
  };

  // Handle "Delete" click
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setContextMenu(null);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const handleConfirmDelete = async (e) => {
    e.stopPropagation();
    // Call delete handler from props
    if (onDelete) {
      onDelete(achievement.id);
    }
    setShowDeleteConfirm(false);
  };

  // Cancel delete
  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

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
      'Tình nguyện': 'from-teal-400/20 to-teal-600/20'
    };
    return colors?.[category] || 'from-secondary/20 to-accent/20';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <motion.div
        className="floating-content rounded-2xl p-6 backdrop-blur-cosmic group cursor-pointer relative"
        whileHover={{
          scale: 1.02,
          boxShadow: "0 0 30px rgba(114, 233, 251, 0.3)"
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
        onContextMenu={handleContextMenu}
      >
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(achievement?.category)}`}>
            <span className="text-lg">{getCategoryIcon(achievement?.category)}</span>
            <span className="text-sm font-medium text-accent">
              {achievement?.category}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Đời {achievement?.generation}
          </div>
        </div>
        {/* Name */}
        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
          {achievement?.name}
        </h3>
        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2">
          {achievement?.title || achievement?.description}
        </p>
        {/* Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-60">
              <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{formatDate(achievement?.date)}</span>
          </div>

          {/* Cosmic decoration */}
          <motion.div
            className="w-2 h-2 rounded-full bg-accent opacity-0 group-hover:opacity-100"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        {/* Hover effect overlay */}
        <motion.div
          className="absolute inset-0 rounded-2xl border border-accent/0 group-hover:border-accent/30 transition-all duration-300 pointer-events-none"
          initial={{ borderColor: 'rgba(114, 233, 251, 0)' }}
          whileHover={{ borderColor: 'rgba(114, 233, 251, 0.3)' }}
        />
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="fixed"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
              zIndex: 999998
            }}
          >
            <div className="bg-background/95 backdrop-blur-xl border border-accent/30 rounded-xl shadow-2xl shadow-accent/20 overflow-hidden min-w-[160px]">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-accent/20 transition-colors flex items-center gap-3 group"
              >
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="group-hover:text-accent transition-colors">Chỉnh sửa</span>
              </button>

              <div className="h-px bg-accent/20"></div>

              <button
                onClick={handleDeleteClick}
                className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-red-500/20 transition-colors flex items-center gap-3 group"
              >
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="group-hover:text-red-400 transition-colors">Xóa</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 999999 }}
            onClick={handleCancelDelete}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-red-500/20 p-6 max-w-md w-full"
              style={{ borderWidth: '2px', borderColor: '#26262E' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Xác nhận xóa</h3>
                  <p className="text-sm text-muted-foreground">Bạn có chắc chắn muốn xóa thành tích này không?</p>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 mb-6">
                <p className="text-sm text-foreground/80 line-clamp-3">
                  <span className="font-semibold text-accent">{achievement?.name}</span> - {achievement?.title || achievement?.description}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors font-medium border border-red-500/20"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AchievementCard;