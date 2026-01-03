import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const EditConfession = ({ confession, onUpdate, onBack }) => {
    const [formData, setFormData] = useState({
        name: '',
        content: '',
        isAnonymous: false,
    });

    const [notification, setNotification] = useState(null);

    // Load confession data when component mounts or changes
    useEffect(() => {
        if (confession) {
            setFormData({
                name: confession.name === 'Ẩn danh' ? '' : confession.name,
                content: confession.content || '',
                isAnonymous: confession.isAnonymous || false,
            });
        }
    }, [confession]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
    };

    const closeNotification = () => {
        setNotification(null);
    };



    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.content.trim()) return;

        try {
            // Call update handler
            await onUpdate({
                ...formData,
                name: formData.isAnonymous ? 'Ẩn danh' : formData.name || 'Ẩn danh',
                id: confession.id, // Preserve ID
            });

            // Show success notification
            showNotification('Cập nhật tâm sự thành công!', 'success');

            // Return to list after delay
            setTimeout(() => {
                closeNotification();
                if (onBack) onBack();
            }, 300);
        } catch (error) {
            console.error('Error updating confession:', error);
            showNotification('Có lỗi xảy ra, vui lòng thử lại', 'error');
        }
    };

    const handleToggle = () => {
        setFormData((prev) => ({
            ...prev,
            isAnonymous: !prev.isAnonymous,
            name: !prev.isAnonymous ? '' : prev.name,
        }));
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
                className="absolute inset-0 bg-background/80 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onBack}
            />

            <motion.div
                className="floating-content rounded-3xl p-8 w-full max-w-lg backdrop-blur-cosmic max-h-[85vh] overflow-y-auto overflow-x-hidden no-scrollbar"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-accent bg-gradient-to-r from-secondary via-accent to-cosmic-energy bg-clip-text text-transparent mb-2">
                        Chỉnh sửa tâm sự
                    </h2>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-2"></div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="relative">
                        {/* Name Input */}
                        <div className="mb-6">
                            <label className="block text-accent font-medium text-sm mb-2">Tên hiển thị</label>
                            <input
                                type="text"
                                placeholder={formData.isAnonymous ? 'Đang để ẩn danh' : 'Tên của bạn'}
                                value={formData.isAnonymous ? '' : formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                disabled={formData.isAnonymous}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Anonymous Toggle */}
                        <div className="mb-6">
                            <label className="flex items-center justify-between cursor-pointer p-4 bg-white/10 rounded-xl border border-white/20 hover:bg-white/15 transition-colors">
                                <span className="text-sm font-medium text-muted-foreground">Chế độ hiển thị</span>

                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-medium transition-colors ${!formData.isAnonymous ? 'text-accent' : 'text-muted-foreground'}`}>Công khai</span>
                                    <motion.div
                                        className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${formData.isAnonymous ? 'bg-gradient-to-r from-secondary to-accent' : 'bg-muted'
                                            }`}
                                        onClick={handleToggle}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <motion.div
                                            className="w-4 h-4 bg-white rounded-full shadow-md"
                                            animate={{
                                                x: formData.isAnonymous ? 24 : 0,
                                            }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    </motion.div>
                                    <span className={`text-sm font-medium transition-colors ${formData.isAnonymous ? 'text-accent' : 'text-muted-foreground'}`}>Ẩn danh</span>
                                </div>
                            </label>
                        </div>

                        {/* Content Textarea */}
                        <div className="mb-8">
                            <label className="block text-accent font-medium text-sm mb-2">Nội dung tâm sự</label>
                            <textarea
                                placeholder="Chia sẻ những gì bạn đang nghĩ..."
                                value={formData.content}
                                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                                rows={6}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300 leading-relaxed resize-none"
                            />
                            <p className="text-xs text-right text-muted-foreground mt-2">
                                {formData.content.length} ký tự
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <motion.button
                                type="button"
                                onClick={onBack}
                                className="flex-1 px-6 py-3 border mystical-border rounded-xl text-muted-foreground hover:text-foreground hover:border-accent/50 transition-all duration-300"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Hủy bỏ
                            </motion.button>

                            <motion.button
                                type="submit"
                                className="flex-1 cosmic-button px-6 py-3 rounded-xl font-medium text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-accent to-cosmic-energy"
                                disabled={!formData.content.trim()}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Lưu thay đổi
                            </motion.button>
                        </div>
                    </div>
                </form>

                {/* Cosmic decoration */}
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-accent/50 animate-pulse"></div>
                <div
                    className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-secondary/50 animate-pulse"
                    style={{ animationDelay: '1s' }}
                ></div>
            </motion.div>

            {/* Success Notification */}
            {createPortal(
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-60%' }}
                            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                            exit={{ opacity: 0, scale: 0.8, x: '-50%', y: '-60%' }}
                            className="fixed left-1/2 top-1/2 flex items-start gap-3 backdrop-blur-xl rounded-xl shadow-2xl p-5 w-full max-w-sm z-[10000000]"
                            style={{
                                borderWidth: '2px',
                                borderColor: notification.type === 'success' ? '#10b981' : '#f59e0b',
                                backgroundColor: 'rgba(15, 23, 42, 0.98)'
                            }}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === 'success' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                                }`}>
                                {notification.type === 'success' ? (
                                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold mb-1 text-sm" style={{ color: 'rgb(248, 250, 252)' }}>
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
        </div>
    );

};

export default EditConfession;
