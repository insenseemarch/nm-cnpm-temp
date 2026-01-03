import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SelectWithOther from './SelectWithOther';
import DateInput from './DateInput';
import {
  ADDRESS_OPTIONS,
  OCCUPATION_OPTIONS,
  CAUSE_OF_DEATH_OPTIONS,
  BURIAL_LOCATION_OPTIONS,
  PROVINCE_OPTIONS,
} from './fieldOptions';

import { useAuth } from '../../../contexts/AuthContext';

const AddMemberForm = ({ onSubmit, onCancel, initialData, existingMembers = [] }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    gender: '',
    generation: '',
    career: '',
    hometown: '',
    address: '',
    email: '',
    status: '',
    marriageDate: '',
    oldMemberId: '', // Changed from oldMemberName to oldMemberId
    relation: '',
    childOrder: '',
    deathDate: '',
    deathReason: '',
    burialPlace: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const genders = ['Nam', 'Nữ', 'Khác'];
  const statuses = ['Độc thân', 'Đã kết hôn'];

  // Get selected member to determine available relations
  const selectedMember = existingMembers.find((m) => m.id === formData.oldMemberId);

  // Dynamic relations based on selected member
  const getAvailableRelations = () => {
    if (!selectedMember) return ['Vợ', 'Chồng', 'Con'];

    const relations = ['Con']; // Always can be child

    // If selected member doesn't have spouse, can be spouse
    if (!selectedMember.spouseId) {
      if (selectedMember.gender === 'male') {
        relations.unshift('Vợ'); // New member will be wife of male member
      } else if (selectedMember.gender === 'female') {
        relations.unshift('Chồng'); // New member will be husband of female member
      } else {
        relations.unshift('Vợ', 'Chồng');
      }
    }

    return relations;
  };

  const relations = getAvailableRelations();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);

    // Reset relation when member changes
    if (field === 'oldMemberId') {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        relation: '', // Reset relation
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.fullName || !formData.gender || !formData.generation) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Giới tính, Đời thứ)');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Map form data to API format
      const genderMap = {
        Nam: 'MALE',
        Nữ: 'FEMALE',
        Khác: 'OTHER',
      };

      const maritalStatusMap = {
        'Độc thân': 'SINGLE',
        'Đã kết hôn': 'MARRIED',
      };

      const apiData = {
        name: formData.fullName,
        gender: genderMap[formData.gender] || 'OTHER',
        generation: parseInt(formData.generation, 10),
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
        occupation: formData.career || null,
        hometown: formData.hometown || null,
        currentAddress: formData.address || null,
        email: formData.email || null,
        maritalStatus: maritalStatusMap[formData.status] || 'SINGLE',
      };

      // Add marriage date if married
      if (formData.status === 'Đã kết hôn' && formData.marriageDate) {
        apiData.marriageDate = new Date(formData.marriageDate).toISOString();
      }

      // Add death information if provided
      if (formData.deathDate) {
        apiData.deathDate = new Date(formData.deathDate).toISOString();
        apiData.deathCause = formData.deathReason || null;
        apiData.burialLocation = formData.burialPlace || null;
      }

      // Add relation info - using ID now
      if (formData.oldMemberId && formData.relation) {
        const selectedMember = existingMembers.find((m) => m.id === formData.oldMemberId);
        if (selectedMember) {
          // Map relation to proper API fields
          switch (formData.relation) {
            case 'Chồng':
            case 'Vợ':
              apiData.spouseId = formData.oldMemberId;
              apiData.maritalStatus = 'MARRIED';
              break;
            case 'Con':
              // Người mới là con của thành viên cũ
              if (selectedMember.gender === 'male') {
                apiData.fatherId = formData.oldMemberId;
              } else if (selectedMember.gender === 'female') {
                apiData.motherId = formData.oldMemberId;
              }
              break;
            default:
              break;
          }
        }
      }

      // Add child order for children
      if (formData.relation === 'Con' && formData.childOrder) {
        apiData.childOrder = parseInt(formData.childOrder, 10);
      }

      // Merge các trường ẩn từ initialData (như spouseOfId)
      const submitData = { ...initialData, ...apiData };

      // Tự động set isMe nếu email nhập vào trùng với email user hiện tại
      if (currentUser && formData.email && formData.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()) {
        submitData.isMe = true;
        await onSubmit(submitData);
        onCancel();
        return;
      }
      // Nếu email khác thì hỏi xác nhận như cũ
      await onSubmit(submitData);
      onCancel();
    } catch (err) {
      console.error('Failed to submit form:', err);
      setError(err.message || 'Không thể thêm thành viên. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[99999] px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onCancel}
    >
      <motion.div
        className="rounded-3xl p-8 w-full max-w-3xl bg-black/30 border border-accent/20 backdrop-blur-md shadow-2xl"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scroll Wrapper */}
        <div className="max-h-[80vh] overflow-y-auto pr-2">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-accent bg-gradient-to-r from-secondary via-accent to-cosmic-energy bg-clip-text text-transparent">
              Thêm thành viên mới
            </h2>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-2"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Form Grid 2 Columns */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Họ tên */}
            <div className="space-y-2">
              <label className="text-accent font-medium text-sm">Họ và Tên *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-cosmic-energy transition-all"
                placeholder="Nhập họ và tên đầy đủ..."
                disabled={isSubmitting}
              />
            </div>

            {/* Ngày sinh */}
            <DateInput
              label="Ngày sinh"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              disabled={isSubmitting}
            />

            {/* Giới tính */}
            <div className="space-y-2">
              <label className="text-accent font-medium text-sm">Giới tính *</label>
              <select
                required
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                disabled={isSubmitting}
              >
                <option value="" className="bg-gray-800 text-white/50">
                  Chọn giới tính
                </option>
                {genders.map((g) => (
                  <option key={g} value={g} className="bg-gray-800 text-white">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Đời thứ */}
            <div className="space-y-2">
              <label className="text-accent font-medium text-sm">Đời thứ *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.generation}
                onChange={(e) => handleInputChange('generation', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-cosmic-energy transition-all"
                placeholder="Ví dụ: 1, 2, 3..."
                disabled={isSubmitting}
              />
            </div>

            {/* Nghề nghiệp - SelectWithOther */}
            <SelectWithOther
              label="Nghề nghiệp"
              value={formData.career}
              onChange={(value) => handleInputChange('career', value)}
              options={OCCUPATION_OPTIONS}
              placeholder="Chọn nghề nghiệp"
              otherPlaceholder="Nhập nghề nghiệp khác..."
              disabled={isSubmitting}
            />

            {/* Quê quán - SelectWithOther */}
            <SelectWithOther
              label="Quê quán"
              value={formData.hometown}
              onChange={(value) => handleInputChange('hometown', value)}
              options={PROVINCE_OPTIONS}
              placeholder="Chọn quê quán"
              otherPlaceholder="Nhập quê quán khác..."
              disabled={isSubmitting}
            />

            {/* Địa chỉ - SelectWithOther */}
            <SelectWithOther
              label="Địa chỉ"
              value={formData.address}
              onChange={(value) => handleInputChange('address', value)}
              options={ADDRESS_OPTIONS}
              placeholder="Chọn địa chỉ"
              otherPlaceholder="Nhập địa chỉ khác..."
              disabled={isSubmitting}
            />

            {/* Email */}
            <div className="space-y-2">
              <label className="text-accent font-medium text-sm">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50"
                placeholder="Nhập email người dùng..."
                disabled={isSubmitting}
              />
            </div>

            {/* Tình trạng */}
            <div className="space-y-2">
              <label className="text-accent font-medium text-sm">Tình trạng hôn nhân</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                disabled={isSubmitting}
              >
                <option value="" className="bg-gray-800 text-white/50">
                  Chọn tình trạng
                </option>
                {statuses.map((s) => (
                  <option key={s} value={s} className="bg-gray-800 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Ngày kết hôn - chỉ hiển thị khi đã kết hôn */}
            {formData.status === 'Đã kết hôn' && (
              <DateInput
                label="Ngày kết hôn"
                value={formData.marriageDate}
                onChange={(e) => handleInputChange('marriageDate', e.target.value)}
                disabled={isSubmitting}
              />
            )}

            {/* Tên thành viên củ - Changed to dropdown */}
            <div className="space-y-2">
              <label className="text-accent font-medium text-sm">Tên thành viên củ</label>
              <select
                value={formData.oldMemberId}
                onChange={(e) => handleInputChange('oldMemberId', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                disabled={isSubmitting}
              >
                <option value="" className="bg-gray-800 text-white/50">
                  Chọn thành viên
                </option>
                {existingMembers.map((member) => (
                  <option key={member.id} value={member.id} className="bg-gray-800 text-white">
                    {member.name} - Đời {member.generation}
                    {member.spouseId ? ' (đã có vợ/chồng)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Quan hệ - Chỉ hiển thị khi đã chọn thành viên */}
            {formData.oldMemberId && (
              <div className="space-y-2">
                <label className="text-accent font-medium text-sm">
                  Quan hệ với {selectedMember?.name || 'thành viên đã chọn'}
                </label>

                <select
                  value={formData.relation}
                  onChange={(e) => handleInputChange('relation', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  disabled={isSubmitting}
                >
                  <option value="" className="bg-gray-800 text-white/50">
                    Chọn quan hệ
                  </option>
                  {relations.map((r) => (
                    <option key={r} value={r} className="bg-gray-800 text-white">
                      {r === 'Con'
                        ? `Con của ${selectedMember?.name}`
                        : `${r} của ${selectedMember?.name}`}
                    </option>
                  ))}
                </select>

                {/* Gợi ý quan hệ */}
                {formData.relation && (
                  <p className="text-xs text-white/50 mt-1">
                    {formData.relation === 'Con' &&
                      `${formData.fullName || 'Thành viên mới'} sẽ là con của ${selectedMember?.name}`}
                    {formData.relation === 'Vợ' &&
                      `${formData.fullName || 'Thành viên mới'} sẽ là vợ của ${selectedMember?.name}`}
                    {formData.relation === 'Chồng' &&
                      `${formData.fullName || 'Thành viên mới'} sẽ là chồng của ${selectedMember?.name}`}
                  </p>
                )}

                {/* Con thứ */}
                {formData.relation === 'Con' && (
                  <div className="space-y-1 mt-2">
                    <label className="text-accent font-medium text-sm">Con thứ *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ví dụ: 1, 2, 3..."
                      value={formData.childOrder || ''}
                      onChange={(e) => handleInputChange('childOrder', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                      required={formData.relation === 'Con'}
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Death info section */}
            <div className="md:col-span-2 border-t border-white/10 pt-6 mt-2">
              <h3 className="text-muted-foreground text-sm mb-4">Thông tin qua đời (nếu có)</h3>
            </div>

            {/* Ngày mất */}
            {/* Ngày mất */}
            <DateInput
              label="Ngày mất"
              value={formData.deathDate}
              onChange={(e) => handleInputChange('deathDate', e.target.value)}
              disabled={isSubmitting}
            />

            {/* Placeholder for grid alignment when death fields hidden */}
            {!formData.deathDate && <div className="hidden md:block"></div>}

            {/* Lý do mất - SelectWithOther */}
            {formData.deathDate && (
              <>
                <SelectWithOther
                  label="Nguyên nhân qua đời"
                  value={formData.deathReason}
                  onChange={(value) => handleInputChange('deathReason', value)}
                  options={CAUSE_OF_DEATH_OPTIONS}
                  placeholder="Chọn nguyên nhân"
                  otherPlaceholder="Nhập nguyên nhân khác..."
                  disabled={isSubmitting}
                />

                {/* Địa điểm mai táng - SelectWithOther */}
                <SelectWithOther
                  label="Địa điểm mai táng"
                  value={formData.burialPlace}
                  onChange={(value) => handleInputChange('burialPlace', value)}
                  options={BURIAL_LOCATION_OPTIONS}
                  placeholder="Chọn địa điểm mai táng"
                  otherPlaceholder="Nhập địa điểm khác..."
                  disabled={isSubmitting}
                />
              </>
            )}

            {/* Actions */}
            <div className="md:col-span-2 flex space-x-4 pt-4">
              <motion.button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border mystical-border rounded-xl text-muted-foreground hover:text-foreground hover:border-accent/50 transition-all disabled:opacity-50"
              >
                Hủy
              </motion.button>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-accent to-cosmic-energy hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang lưu...
                  </span>
                ) : (
                  'Lưu thành viên'
                )}
              </motion.button>
            </div>
          </form>
        </div>

        {/* Cosmic decoration */}
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-accent/50 animate-pulse"></div>
        <div
          className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-secondary/50 animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </motion.div>
    </motion.div>
  );
};

export default AddMemberForm;
