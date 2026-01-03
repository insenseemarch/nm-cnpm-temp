import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfessionPlanet = ({ confession, onEdit, onDelete }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNotification, setShowNotification] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const gradients = [
    'from-purple-400/20 via-blue-500/20 to-purple-600/20',
    'from-blue-400/20 via-cyan-500/20 to-blue-600/20',
    'from-cyan-400/20 via-teal-500/20 to-cyan-600/20',
    'from-indigo-400/20 via-purple-500/20 to-indigo-600/20',
    'from-pink-400/20 via-purple-500/20 to-pink-600/20',
  ];

  const gradientIndex = confession?.id % gradients?.length;
  const gradient = gradients?.[gradientIndex];

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleEdit = () => {
    handleCloseContextMenu();
    if (onEdit) {
      onEdit(confession);
    }
  };

  const handleDeleteClick = () => {
    handleCloseContextMenu();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    console.log('1. handleConfirmDelete called');
    setShowDeleteConfirm(false);

    // Show pending/success notification
    setShowNotification({
      type: 'success',
      message: 'Xóa tâm sự thành công!',
    });
    console.log('2. setShowNotification called');

    if (onDelete) {
      const result = onDelete(confession?.id);
      console.log('3. Delete result:', result);
    }

    // Auto hide notification after 0.5s
    setTimeout(() => {
      console.log('4. Hiding notification');
      setShowNotification(null);
    }, 1000);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  React.useEffect(() => {
    if (contextMenu) {
      document.addEventListener('click', handleCloseContextMenu);
      return () => document.removeEventListener('click', handleCloseContextMenu);
    }
  }, [contextMenu]);

  return (
    <>
      <motion.div
        className="relative group w-full max-w-md mx-auto"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        onContextMenu={handleContextMenu}
      >
        <div
          className={`
          relative rounded-2xl overflow-hidden
          bg-gradient-to-br ${gradient}
          backdrop-blur-sm border border-accent/30
          p-6 shadow-lg
          transition-all duration-500
          group-hover:border-accent/60 group-hover:shadow-xl group-hover:shadow-accent/20
          min-h-[200px] flex flex-col
        `}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10 flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-secondary/30 flex items-center justify-center">
                <span className="text-accent font-medium text-sm">
                  {(confession?.name || 'Ẩn danh').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-base font-medium text-cosmic-glow">
                  {confession?.name || 'Ẩn danh'}
                </h3>
                <time className="text-xs text-muted-foreground/80">
                  {formatDate(confession?.date)}
                </time>
              </div>
            </div>

            {!confession?.isAnonymous && (
              <span className="px-2 py-1 text-xs bg-accent/20 text-accent rounded-full border border-accent/30 shrink-0">
                Công khai
              </span>
            )}
          </div>

          <div className="relative z-10 flex-1 mb-4">
            <p className="text-foreground/90 leading-relaxed text-sm line-clamp-4">
              {confession?.content}
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground/60">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Chuột phải để thao tác
            </span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-accent/50"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-secondary/50"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-accent/30"></div>
            </div>
          </div>

          <div className="absolute inset-px rounded-2xl bg-gradient-to-r from-transparent via-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 to-secondary/5 blur-xl scale-105 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
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
              zIndex: 999998,
            }}
          >
            <div className="bg-background/95 backdrop-blur-xl border border-accent/30 rounded-xl shadow-2xl shadow-accent/20 overflow-hidden min-w-[160px]">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-accent/20 transition-colors flex items-center gap-3 group"
              >
                <svg
                  className="w-4 h-4 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span className="group-hover:text-accent transition-colors">Chỉnh sửa</span>
              </button>

              <div className="h-px bg-accent/20"></div>

              <button
                onClick={handleDeleteClick}
                className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-red-500/20 transition-colors flex items-center gap-3 group"
              >
                <svg
                  className="w-4 h-4 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
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
                  <svg
                    className="w-6 h-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Xác nhận xóa</h3>
                  <p className="text-sm text-muted-foreground">
                    Bạn có chắc chắn muốn xóa confession này không?
                  </p>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 mb-6">
                <p className="text-sm text-foreground/80 line-clamp-3">{confession?.content}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-accent/20 hover:bg-accent/30 text-foreground transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors font-medium"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success/Pending Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-start gap-3 backdrop-blur-xl rounded-xl shadow-2xl p-5 w-full max-w-md"
            style={{
              zIndex: 10000000,
              borderWidth: '2px',
              borderColor: showNotification.type === 'success' ? '#10b981' : '#f59e0b',
              backgroundColor: 'rgba(15, 23, 42, 0.98)',
            }}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                showNotification.type === 'success' ? 'bg-green-500/20' : 'bg-yellow-500/20'
              }`}
            >
              {showNotification.type === 'success' ? (
                <svg
                  className="w-7 h-7 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-7 h-7 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1" style={{ color: 'rgb(248, 250, 252)' }}>
                {showNotification.type === 'success' ? 'Thành công' : 'Đang xử lý'}
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: 'rgb(203, 213, 225)' }}>
                {showNotification.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ConfessionPlanet;
