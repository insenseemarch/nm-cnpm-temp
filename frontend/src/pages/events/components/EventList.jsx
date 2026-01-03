import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X, Bell } from 'lucide-react';

const EventList = ({ events, selectedDate, onClearSelection, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [eventToDelete, setEventToDelete] = React.useState(null);
  const [contextMenu, setContextMenu] = React.useState(null);

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Helper function to calculate days until event
  const getDaysUntilEvent = (eventDate) => {
    const today = new Date();
    const eventDateTime = new Date(eventDate);
    const timeDiff = eventDateTime.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  // Helper function to format countdown text
  const getCountdownText = (days) => {
    if (days < 0) return 'Đã qua';
    if (days === 0) return 'Hôm nay';
    if (days === 1) return '1 ngày nữa';
    if (days < 7) return `${days} ngày nữa`;
    if (days < 14) return `${Math.floor(days / 7)} tuần nữa`;
    if (days < 30) return `${Math.floor(days / 7)} tuần nữa`;
    return `${Math.floor(days / 30)} tháng nữa`;
  };

  // Filter and sort events: show only upcoming events or events for selected date
  const getUpcomingEvents = () => {
    if (selectedDate) {
      // If a date is selected, show events for that date
      return events.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === selectedDate.toDateString();
      });
    } else {
      // Otherwise, show upcoming events, sorted by nearest date
      return events
        .filter((event) => getDaysUntilEvent(event.date) >= 0)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  };

  const displayEvents = getUpcomingEvents();

  const getEventTypeLabel = (type) => {
    const key = (type || '').toLowerCase();
    const typeLabels = {
      birthday: 'Sinh nhật',
      memorial: 'Giỗ',
      wedding: 'Đám cưới',
      other: 'Khác',
    };
    return typeLabels?.[key] || 'Khác';
  };

  const getEventTypeColor = (type) => {
    const key = (type || '').toLowerCase();
    const typeColors = {
      birthday: 'bg-accent/20 text-accent border-accent/30',
      memorial: 'bg-secondary/20 text-secondary border-secondary/30',
      wedding: 'bg-cosmic-energy/20 text-cosmic-energy border-cosmic-energy/30',
      other: 'bg-nebula-accent/20 text-nebula-accent border-nebula-accent/30',
    };
    return typeColors?.[key] || 'bg-muted/20 text-muted-foreground border-muted/30';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, parseInt(month) - 1, day);
    return date?.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr;
  };

  // Handle context menu open
  const handleContextMenu = (e, event) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      event: event
    });
  };

  // Handle "Edit" click in menu
  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit && contextMenu?.event) {
      onEdit(contextMenu.event);
    }
    setContextMenu(null);
  };

  // Handle "Delete" click in menu
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (contextMenu?.event) {
      setEventToDelete(contextMenu.event);
      setShowDeleteConfirm(true);
    }
    setContextMenu(null);
  };

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    if (onDelete && eventToDelete) {
      onDelete(eventToDelete.id);
    }
    setShowDeleteConfirm(false);
    setEventToDelete(null);
  };

  // Handle delete cancellation
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setEventToDelete(null);
  };

  return (
    <>
      <motion.div
        className="floating-content rounded-xl p-4 backdrop-blur-lg"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-accent" />
            <h3 className="text-lg font-medium text-cosmic-glow">
              {selectedDate ? 'Sự kiện trong ngày' : 'Sự kiện sắp tới'}
            </h3>
          </div>
          {selectedDate && (
            <motion.button
              onClick={onClearSelection}
              className="p-1 rounded-lg hover:bg-muted/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={16} className="text-muted-foreground" />
            </motion.button>
          )}
        </div>
        {/* Selected Date Info */}
        {selectedDate && (
          <motion.div
            className="mb-4 p-3 rounded-lg bg-accent/5 border border-accent/20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-accent" />
              <span className="text-sm text-accent font-medium">
                {new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate()
                )?.toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
          </motion.div>
        )}
        {/* Events List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayEvents?.length > 0 ? (
            displayEvents?.map((event, index) => {
              const daysUntil = getDaysUntilEvent(event.date);
              return (
                <motion.div
                  key={event?.id}
                  className="p-4 rounded-lg bg-card/50 border mystical-border hover:border-accent/40 transition-all duration-300 group hover:cosmic-glow-hover cursor-pointer relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onContextMenu={(e) => handleContextMenu(e, event)}
                >
                  {/* Event Header */}
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-foreground group-hover:text-cosmic-glow transition-colors">
                      {event?.name}
                    </h4>
                    <div className="flex items-center gap-1">
                      <Bell size={12} className="text-accent" />
                      <span className="text-xs text-accent font-medium">
                        {getCountdownText(daysUntil)}
                      </span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event?.type)}`}
                      >
                        {getEventTypeLabel(event?.type)}
                      </span>
                      <div className="text-sm text-muted-foreground">
                        <div>{formatDate(event?.date)}</div>
                        {event?.time && (
                          <div className="text-xs p-2 opacity-75">{formatTime(event?.time)}</div>
                        )}
                      </div>
                    </div>

                    {event?.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {event?.description}
                      </p>
                    )}
                  </div>

                  {/* Hover effect overlay */}
                  <motion.div
                    className="absolute inset-0 rounded-lg border border-accent/0 group-hover:border-accent/30 transition-all duration-300 pointer-events-none"
                    initial={{ borderColor: 'rgba(114, 233, 251, 0)' }}
                    whileHover={{ borderColor: 'rgba(114, 233, 251, 0.3)' }}
                  />
                </motion.div>
              );
            })
          ) : (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-muted-foreground mb-2">
                <Calendar size={32} className="mx-auto opacity-30" />
              </div>
              <p className="text-muted-foreground">
                {selectedDate ? 'Không có sự kiện nào trong ngày này' : 'Không có sự kiện sắp tới'}
              </p>
            </motion.div>
          )}
        </div>
        {/* Events Count */}
        {displayEvents?.length > 0 && (
          <motion.div
            className="mt-4 pt-3 border-t border-muted/20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="text-xs text-muted-foreground">
              {displayEvents?.length} sự kiện {selectedDate ? 'trong ngày' : 'sắp tới'}
            </span>
          </motion.div>
        )}
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
                onClick={handleEditClick}
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
                  <p className="text-sm text-muted-foreground">Bạn có chắc chắn muốn xóa sự kiện này không?</p>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 mb-6">
                <p className="text-sm text-foreground/80 line-clamp-3">
                  <span className="font-semibold text-accent">{eventToDelete?.name}</span>
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

export default EventList;
