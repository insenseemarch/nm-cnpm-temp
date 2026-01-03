import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const EditEvent = ({ event, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'birthday',
        date: '',
        time: '12:00',
        reminder: '1',
        description: '',
    });

    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);

    // Effect: Populate form data when component mounts or event changes
    useEffect(() => {
        if (event) {
            setFormData({
                name: event.name || '',
                type: event.type || 'birthday',
                date: event.date || '',
                time: event.time || '12:00',
                reminder: event.reminder || '1',
                description: event.description || '',
            });
        }
    }, [event]);

    const eventTypes = [
        { value: 'birthday', label: 'Sinh nhật' },
        { value: 'memorial', label: 'Giỗ' },
        { value: 'wedding', label: 'Đám cưới' },
        { value: 'other', label: 'Khác' },
    ];

    const reminderOptions = [
        { value: '0', label: 'Không nhắc nhở' },
        { value: '1', label: 'Trước 1 ngày' },
        { value: '2', label: 'Trước 2 ngày' },
        { value: '3', label: 'Trước 3 ngày' },
        { value: '7', label: 'Trước 1 tuần' },
        { value: '14', label: 'Trước 2 tuần' },
        { value: '30', label: 'Trước 1 tháng' },
    ];

    // Handle input change
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear validation error when user starts typing again
        if (errors?.[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: '',
            }));
        }
    };

    // Validate form data
    const validateForm = () => {
        const newErrors = {};

        if (!formData?.name?.trim()) {
            newErrors.name = 'Tên sự kiện không được để trống';
        }

        if (!formData?.date) {
            newErrors.date = 'Ngày diễn ra không được để trống';
        }

        setErrors(newErrors);
        return Object.keys(newErrors)?.length === 0;
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
    };

    const closeNotification = () => {
        setNotification(null);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e?.preventDefault();

        // Validate data before sending
        if (validateForm()) {
            try {
                // Call onSubmit from parent with updated data
                await onSubmit({
                    ...formData,
                    id: event.id
                });

                // Show success notification
                showNotification('Cập nhật sự kiện thành công!', 'success');

                // Close modal after 300ms to let user read the notification
                setTimeout(() => {
                    closeNotification();
                    onClose();
                }, 300); // 300ms notification duration as requested
            } catch (error) {
                console.error('Error updating event:', error);
                showNotification('Có lỗi xảy ra, vui lòng thử lại', 'error');
            }
        }
    };

    return (
        <>
            <motion.div
                className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[60] px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={onClose}
            >
                <motion.div
                    className="floating-content rounded-3xl p-8 w-full max-w-3xl backdrop-blur-cosmic"
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 50 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    onClick={(e) => e?.stopPropagation()}
                >
                    {/* Form Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-accent bg-gradient-to-r from-secondary via-accent to-cosmic-energy bg-clip-text text-transparent">
                            Chỉnh sửa sự kiện
                        </h2>
                        <div className="w-16 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-2"></div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Row 1: Event Name + Event Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Event Name */}
                            <div className="space-y-2">
                                <label className="text-accent font-medium text-sm">Tên sự kiện *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData?.name}
                                    onChange={(e) => handleInputChange('name', e?.target?.value)}
                                    placeholder="Nhập tên sự kiện..."
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
                                />
                                {errors?.name && <p className="text-xs text-destructive mt-1">{errors?.name}</p>}
                            </div>

                            {/* Event Type */}
                            <div className="space-y-2">
                                <label className="text-accent font-medium text-sm">Loại sự kiện *</label>
                                <select
                                    required
                                    value={formData?.type}
                                    onChange={(e) => handleInputChange('type', e?.target?.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
                                >
                                    {eventTypes?.map((type) => (
                                        <option key={type?.value} value={type?.value} className="bg-gray-800 text-white">
                                            {type?.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Event Date + Event Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Event Date */}
                            <div className="space-y-2">
                                <label className="text-accent font-medium text-sm">Ngày diễn ra *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData?.date}
                                    onChange={(e) => handleInputChange('date', e?.target?.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
                                />
                                {errors?.date && <p className="text-xs text-destructive mt-1">{errors?.date}</p>}
                            </div>

                            {/* Event Time */}
                            <div className="space-y-2">
                                <label className="text-accent font-medium text-sm">Thời gian</label>
                                <input
                                    type="time"
                                    value={formData?.time}
                                    onChange={(e) => handleInputChange('time', e?.target?.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Row 3: Reminder */}
                        <div className="space-y-2">
                            <label className="text-accent font-medium text-sm">Nhắc nhở</label>
                            <select
                                value={formData?.reminder}
                                onChange={(e) => handleInputChange('reminder', e?.target?.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
                            >
                                {reminderOptions?.map((option) => (
                                    <option
                                        key={option?.value}
                                        value={option?.value}
                                        className="bg-gray-800 text-white"
                                    >
                                        {option?.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Row 4: Event Description */}
                        <div className="space-y-2">
                            <label className="text-accent font-medium text-sm">Mô tả</label>
                            <textarea
                                value={formData?.description}
                                onChange={(e) => handleInputChange('description', e?.target?.value)}
                                placeholder="Nhập mô tả sự kiện (tùy chọn)..."
                                rows={2}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300 resize-none"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-4 pt-3">
                            <motion.button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-4 border mystical-border rounded-xl text-muted-foreground hover:text-foreground hover:border-accent/50 transition-all duration-300"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Quay lại
                            </motion.button>

                            <motion.button
                                type="submit"
                                className="flex-1 px-4 py-4 rounded-xl text-white font-medium bg-gradient-to-r from-accent to-cosmic-energy hover:from-accent/90 hover:to-cosmic-energy/90 transition-all duration-300 flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Lưu thay đổi
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

export default EditEvent;
