import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const CalendarView = ({ currentDate, onDateChange, events, onDateClick, selectedDate }) => {
  const today = new Date();
  const year = currentDate?.getFullYear();
  const month = currentDate?.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)?.getDay();
  const daysInMonth = new Date(year, month + 1, 0)?.getDate();
  const daysInPrevMonth = new Date(year, month, 0)?.getDate();

  // Month names in Vietnamese
  const monthNames = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  // Navigate months
  const goToPrevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    onDateChange(newDate);
  };

  // Check if date has events
  const hasEvents = (date) => {
    const formattedMonth = (month + 1).toString().padStart(2, '0');
    const formattedDate = date.toString().padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDate}`;
    return events?.some((event) => event?.date === dateStr);
  };

  // Get events count for date
  const getEventCount = (date) => {
    const formattedMonth = (month + 1).toString().padStart(2, '0');
    const formattedDate = date.toString().padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDate}`;
    return events?.filter((event) => event?.date === dateStr)?.length || 0;
  };

  // Check if date is selected
  const isSelectedDate = (date) => {
    if (!selectedDate) return false;
    return (
      selectedDate?.getFullYear() === year &&
      selectedDate?.getMonth() === month &&
      selectedDate?.getDate() === date
    );
  };

  // Check if date is today
  const isToday = (date) => {
    return (
      today?.getFullYear() === year && today?.getMonth() === month && today?.getDate() === date
    );
  };

  // Handle date click
  const handleDateClick = (date) => {
    const clickedDate = new Date(year, month, date, 12); // Set to noon to avoid timezone issues
    onDateClick(clickedDate);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];

    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      let date = daysInPrevMonth - i;
      days?.push(
        <motion.div
          key={`prev-${date}`}
          className="aspect-square flex items-center justify-center text-muted-foreground opacity-30 cursor-not-allowed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.3 }}
        >
          {date}
        </motion.div>
      );
    }

    // Current month days
    for (let date = 1; date <= daysInMonth; date++) {
      const hasEventIndicator = hasEvents(date);
      const eventCount = getEventCount(date);
      const isSelected = isSelectedDate(date);
      const isTodayDate = isToday(date);

      days?.push(
        <motion.div
          key={date}
          className={`
            aspect-square flex flex-col items-center justify-center relative cursor-pointer
            rounded-lg border border-transparent transition-all duration-300
            ${isSelected ? 'bg-secondary/20 border-secondary cosmic-glow' : 'hover:bg-primary/10 hover:border-primary/30'}
            ${isTodayDate ? 'bg-accent/10 border-accent/40' : ''}
            ${hasEventIndicator ? 'hover:cosmic-glow-hover' : ''}
          `}
          onClick={() => handleDateClick(date)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: date * 0.01 }}
        >
          <span
            className={`text-sm font-medium ${isTodayDate ? 'text-accent' : 'text-foreground'}`}
          >
            {date}
          </span>

          {/* Event Indicators */}
          {hasEventIndicator && (
            <div className="absolute bottom-1 flex space-x-1">
              {eventCount === 1 ? (
                <Star size={6} className="text-accent fill-accent" />
              ) : (
                <div className="flex space-x-0.5">
                  {[...Array(Math.min(eventCount, 3))]?.map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-accent opacity-80" />
                  ))}
                  {eventCount > 3 && <span className="text-xs text-accent ml-1">+</span>}
                </div>
              )}
            </div>
          )}
        </motion.div>
      );
    }

    // Fill remaining slots
    const totalSlots = 42; // 6 rows × 7 days
    const remainingSlots = totalSlots - days?.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days?.push(
        <motion.div
          key={`next-${i}`}
          className="aspect-square flex items-center justify-center text-muted-foreground opacity-30 cursor-not-allowed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.3 }}
        >
          {i}
        </motion.div>
      );
    }

    return days;
  };

  return (
    <motion.div
      className="floating-content rounded-2xl p-6 backdrop-blur-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          onClick={goToPrevMonth}
          className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={20} className="text-muted-foreground" />
        </motion.button>

        <motion.h2
          className="text-xl font-semibold text-cosmic-glow"
          key={`${year}-${month}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {monthNames?.[month]} {year}
        </motion.h2>

        <motion.button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight size={20} className="text-muted-foreground" />
        </motion.button>
      </div>
      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays?.map((day, index) => (
          <motion.div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {day}
          </motion.div>
        ))}
      </div>
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">{generateCalendarDays()}</div>
      {/* Legend */}
      <motion.div
        className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <Star size={12} className="text-accent fill-accent" />
          <span>Có sự kiện</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border border-accent/40 bg-accent"></div>
          <span>Hôm nay</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border border-accent bg-secondary/20"></div>
          <span>Đã chọn</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CalendarView;
