import React from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

const ConfessionFilters = ({ filters, onFiltersChange }) => {
  const displayOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'public', label: 'Chỉ công khai' },
    { value: 'anonymous', label: 'Chỉ ẩn danh' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange?.((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <motion.div
      className="floating-content rounded-xl p-4 mb-6 backdrop-blur-lg max-w-2xl mx-auto w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Filter size={16} className="text-accent" />
        <h3 className="text-lg font-medium text-cosmic-glow">Bộ lọc bài viết</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Display Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Hiển thị</label>
          <select
            value={filters?.display || 'all'}
            onChange={(e) => handleFilterChange('display', e?.target?.value)}
            className="w-full p-2 rounded-lg bg-input border mystical-border text-foreground 
                     focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          >
            {displayOptions?.map((option) => (
              <option
                key={option?.value}
                value={option?.value}
                className="bg-background text-foreground"
              >
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Sắp xếp</label>
          <select
            value={filters?.sort || 'newest'}
            onChange={(e) => handleFilterChange('sort', e?.target?.value)}
            className="w-full p-2 rounded-lg bg-input border mystical-border text-foreground 
                     focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          >
            {sortOptions?.map((option) => (
              <option
                key={option?.value}
                value={option?.value}
                className="bg-background text-foreground"
              >
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default ConfessionFilters;
