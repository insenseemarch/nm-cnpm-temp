import React from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

const EventFilters = ({ filters, onFiltersChange }) => {
  const eventTypes = [
    { value: 'all', label: 'Tất cả' },
    { value: 'birthday', label: 'Sinh nhật' },
    { value: 'memorial', label: 'Giỗ' },
    { value: 'wedding', label: 'Đám cưới' },
    { value: 'other', label: 'Khác' },
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    // Filters are applied in real-time, this is just for UX feedback
    console.log('Filters applied:', filters);
  };

  return (
    <motion.div
      className="floating-content rounded-xl p-4 mb-6 backdrop-blur-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Filter size={16} className="text-accent" />
        <h3 className="text-lg font-medium text-cosmic-glow">Bộ lọc sự kiện</h3>
      </div>
      <div className="space-y-4">
        {/* Event Type Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Loại sự kiện
          </label>
          <select
            value={filters?.eventType}
            onChange={(e) => handleFilterChange('eventType', e?.target?.value)}
            className="w-full p-2 rounded-lg bg-input border mystical-border text-foreground 
                       focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          >
            {eventTypes?.map((type) => (
              <option key={type?.value} value={type?.value}>
                {type?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Từ ngày</label>
            <input
              type="date"
              value={filters?.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
              className="w-full p-2 rounded-lg bg-input border mystical-border text-foreground 
                         focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Đến ngày</label>
            <input
              type="date"
              value={filters?.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
              className="w-full p-2 rounded-lg bg-input border mystical-border text-foreground 
                         focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Apply Filter Button */}
        <motion.button
          onClick={handleApplyFilters}
          className="w-full px-6 py-3 text-white font-medium bg-gradient-to-r from-cosmic-energy to-accent hover:from-accent/90 hover:to-cosmic-energy/90 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Lọc sự kiện
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EventFilters;
