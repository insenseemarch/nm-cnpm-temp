import React from 'react';
import { motion } from 'framer-motion';

const FilterToolbar = ({ filters, onFiltersChange }) => {
  const generations = ['1', '2', '3', '4', '5', '6'];

  const statusOptions = [
    { value: 'alive', label: 'Còn sống' },
    { value: 'deceased', label: 'Đã mất' },
  ];

  const genderOptions = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' },
  ];

  const maritalOptions = [
    { value: 'married', label: 'Có gia đình' },
    { value: 'single', label: 'Chưa có gia đình' },
  ];

  const ageRangeOptions = [
    { value: 'under18', label: 'Dưới 18' },
    { value: '18-35', label: '18-35' },
    { value: '36-50', label: '36-50' },
    { value: '51-70', label: '51-70' },
    { value: 'over70', label: 'Trên 70' },
  ];

  const handleInputChange = (field, value) => {
    onFiltersChange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilter = () => {
    // Filter is applied automatically through useEffect in parent component
  };

  const hasActiveFilters =
    filters?.name ||
    filters?.category ||
    filters?.generation ||
    filters?.gender ||
    filters?.maritalStatus ||
    filters?.ageRange ||
    filters?.status ||
    filters?.fromYear ||
    filters?.toYear;

  const handleClearFilters = () => {
    onFiltersChange({
      name: '',
      category: '',
      generation: '',
      gender: '',
      maritalStatus: '',
      ageRange: '',
      status: '',
      fromYear: '',
      toYear: '',
    });
  };

  return (
    <div className="floating-content rounded-2xl p-6 backdrop-blur-cosmic">
      {/* Main Grid: 2 columns */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Col 1 */}
        <div className="col-span-10">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-4">
            {/* Search by Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-accent">Tìm kiếm theo tên</label>
              <input
                type="text"
                placeholder="Nhập tên cần tìm"
                value={filters?.name || ''}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
              />
            </div>

            {/* Generation Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-accent">Đời thứ</label>
              <select
                value={filters?.generation || ''}
                onChange={(e) => handleInputChange('generation', e?.target?.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
              >
                <option value="" className="bg-gray-800 text-white">
                  Tất cả
                </option>
                {generations?.map((gen) => (
                  <option key={gen} value={gen} className="bg-gray-800 text-white">
                    Đời {gen}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-accent">Giới tính</label>
              <select
                value={filters?.gender || ''}
                onChange={(e) => handleInputChange('gender', e?.target?.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
              >
                <option value="" className="bg-gray-800 text-white">
                  Tất cả
                </option>
                {genderOptions?.map((gender) => (
                  <option
                    key={gender.value}
                    value={gender.value}
                    className="bg-gray-800 text-white"
                  >
                    {gender.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Marital Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-accent">Hôn nhân</label>
              <select
                value={filters?.maritalStatus || ''}
                onChange={(e) => handleInputChange('maritalStatus', e?.target?.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
              >
                <option value="" className="bg-gray-800 text-white">
                  Tất cả
                </option>
                {maritalOptions?.map((marital) => (
                  <option
                    key={marital.value}
                    value={marital.value}
                    className="bg-gray-800 text-white"
                  >
                    {marital.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Age Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-accent">Độ tuổi</label>
              <select
                value={filters?.ageRange || ''}
                onChange={(e) => handleInputChange('ageRange', e?.target?.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
              >
                <option value="" className="bg-gray-800 text-white">
                  Tất cả
                </option>
                {ageRangeOptions?.map((ageRange) => (
                  <option
                    key={ageRange.value}
                    value={ageRange.value}
                    className="bg-gray-800 text-white"
                  >
                    {ageRange.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-accent">Trạng thái</label>
              <select
                value={filters?.status || ''}
                onChange={(e) => handleInputChange('status', e?.target?.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
              >
                <option value="" className="bg-gray-800 text-white">
                  Tất cả
                </option>
                {statusOptions?.map((status) => (
                  <option
                    key={status.value}
                    value={status.value}
                    className="bg-gray-800 text-white"
                  >
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* From Year */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-accent">Từ năm</label>
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
              <label className="text-sm font-medium text-accent">Đến năm</label>
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
          </div>
        </div>

        {/* Col 2: Filter Button */}
        <div className="col-span-2 flex items-center justify-center h-full">
          <motion.button
            onClick={handleApplyFilter}
            className="px-8 py-2 rounded-lg text-white font-medium bg-gradient-to-r from-cosmic-energy to-accent hover:from-accent/90 hover:to-cosmic-energy/90 transition-all duration-300"
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
                <button onClick={() => handleInputChange('name', '')} className="hover:text-accent">
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
            {filters?.gender && (
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-white flex items-center gap-2">
                Giới tính: {genderOptions.find((g) => g.value === filters.gender)?.label}
                <button
                  onClick={() => handleInputChange('gender', '')}
                  className="hover:text-accent"
                >
                  ×
                </button>
              </span>
            )}
            {filters?.maritalStatus && (
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-white flex items-center gap-2">
                Hôn nhân: {maritalOptions.find((m) => m.value === filters.maritalStatus)?.label}
                <button
                  onClick={() => handleInputChange('maritalStatus', '')}
                  className="hover:text-accent"
                >
                  ×
                </button>
              </span>
            )}
            {filters?.ageRange && (
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-white flex items-center gap-2">
                Độ tuổi: {ageRangeOptions.find((a) => a.value === filters.ageRange)?.label}
                <button
                  onClick={() => handleInputChange('ageRange', '')}
                  className="hover:text-accent"
                >
                  ×
                </button>
              </span>
            )}
            {filters?.status && (
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-white flex items-center gap-2">
                Trạng thái: {statusOptions.find((s) => s.value === filters.status)?.label}
                <button
                  onClick={() => handleInputChange('status', '')}
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
