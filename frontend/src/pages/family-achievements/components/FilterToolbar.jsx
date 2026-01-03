import React from 'react';
import { motion } from 'framer-motion';

const FilterToolbar = ({ filters, onFiltersChange }) => {
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
    'Tình nguyện'
  ];

  const generations = [
    '1', '2', '3', '4', '5', '6'
  ];

  const handleInputChange = (field, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilter = () => {
    // Filter is applied automatically through useEffect in parent component
  };

  const hasActiveFilters = filters?.name || filters?.category || filters?.generation || filters?.fromYear || filters?.toYear;

  const handleClearFilters = () => {
    onFiltersChange({
      name: '',
      category: '',
      generation: '',
      fromYear: '',
      toYear: ''
    });
  };

  return (
    <div className="floating-content rounded-2xl p-6 backdrop-blur-cosmic">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
        {/* Search by Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-accent">
            Tìm kiếm theo tên
          </label>
          <input
            type="text"
            placeholder="Nhập tên cần tìm"
            value={filters?.name || ''}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
          />
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-accent">
            Loại thành tích
          </label>
          <select
            value={filters?.category || ''}
            onChange={(e) => handleInputChange('category', e?.target?.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
          >
            <option value="" className="bg-gray-800 text-white">Tất cả</option>
            {categories?.map(category => (
              <option key={category} value={category} className="bg-gray-800 text-white">{category}</option>
            ))}
          </select>
        </div>

        {/* Generation Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-accent">
            Đời thứ
          </label>
          <select
            value={filters?.generation || ''}
            onChange={(e) => handleInputChange('generation', e?.target?.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
          >
            <option value="" className="bg-gray-800 text-white">Tất cả</option>
            {generations?.map(gen => (
              <option key={gen} value={gen} className="bg-gray-800 text-white">Đời {gen}</option>
            ))}
          </select>
        </div>

        {/* From Year */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-accent">
            Từ năm
          </label>
          <input
            type="number"
            placeholder="2020"
            min="1900"
            max={new Date()?.getFullYear()}
            value={filters?.fromYear || ''}
            onChange={(e) => handleInputChange('fromYear', e?.target?.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
          />
        </div>

        {/* To Year */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-accent">
            Đến năm
          </label>
          <input
            type="number"
            placeholder="2024"
            min="1900"
            max={new Date()?.getFullYear()}
            value={filters?.toYear || ''}
            onChange={(e) => handleInputChange('toYear', e?.target?.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
          />
        </div>

        {/* Filter Button */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-transparent">
            Action
          </label>
          <motion.button
            onClick={handleApplyFilter}
            className="w-full px-6 py-2 rounded-lg text-white font-medium bg-gradient-to-r from-cosmic-energy to-accent hover:from-accent/90 hover:to-cosmic-energy/90 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Lọc kết quả
          </motion.button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-2 flex flex-wrap items-center gap-2 mt-6">
          <span className="text-secondary text-sm">Đang lọc theo:</span>
          <div className="flex flex-wrap gap-2">
            {filters?.name && (
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-white flex items-center gap-2">
                Tên: {filters.name}
                <button
                  onClick={() => handleInputChange('name', '')}
                  className="hover:text-accent"
                >
                  ×
                </button>
              </span>
            )}
            {filters?.category && (
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-white flex items-center gap-2">
                Loại: {filters.category}
                <button
                  onClick={() => handleInputChange('category', '')}
                  className="hover:text-accent"
                >
                  ×
                </button>
              </span>
            )}
            {filters?.generation && (
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-white flex items-center gap-2">
                Đời: {filters.generation}
                <button
                  onClick={() => handleInputChange('generation', '')}
                  className="hover:text-accent"
                >
                  ×
                </button>
              </span>
            )}
            {(filters?.fromYear || filters?.toYear) && (
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-white flex items-center gap-2">
                Năm: {filters.fromYear || '*'} - {filters.toYear || '*'}
                <button
                  onClick={() => {
                    handleInputChange('fromYear', '');
                    handleInputChange('toYear', '');
                  }}
                  className="hover:text-accent"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <button
            onClick={handleClearFilters}
            className="px-3 py-1 text-sm text-secondary hover:text-white transition-colors duration-200"
          >
            Xóa tất cả
          </button>
        </div>
      )}

    </div>
  );
};

export default FilterToolbar;