import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, Award, Loader2 } from 'lucide-react';
import {
  getMemberAchievements,
  createMemberAchievement,
  updateMemberAchievement,
  deleteMemberAchievement,
} from '../../../services/memberService';

const ACHIEVEMENT_CATEGORIES = [
  'Học tập',
  'Nghề nghiệp',
  'Thể thao',
  'Nghệ thuật',
  'Khoa học',
  'Kinh doanh',
  'Cộng đồng',
  'Gia đình',
  'Quân sự',
  'Chính trị',
  'Khác',
];

// Inline Form Component - giống 100% AddAchievementForm nhưng không có modal wrapper
const AchievementFormInline = ({ onSubmit, onCancel, initialData, isEditing, saving }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    category: initialData?.category || '',
    customCategory: initialData?.customCategory || '',
    description: initialData?.description || '',
    achievedAt: initialData?.achievedAt
      ? initialData.achievedAt.split('T')[0]
      : new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData?.title || !formData?.category || !formData?.achievedAt) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="overflow-hidden mb-6"
    >
      <div className="floating-content rounded-3xl p-8 backdrop-blur-cosmic relative">
        {/* Form Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-accent bg-gradient-to-r from-secondary via-accent to-cosmic-energy bg-clip-text text-transparent">
            {isEditing ? 'Chỉnh sửa thành tích' : 'Thêm thành tích mới'}
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-2"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-accent font-medium text-sm">Tiêu đề *</label>
            <input
              type="text"
              required
              value={formData?.title}
              onChange={(e) => handleInputChange('title', e?.target?.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
              placeholder="VD: Giải nhất Olympic Toán học"
            />
          </div>

          {/* Category Select */}
          <div className="space-y-2">
            <label className="text-accent font-medium text-sm">Loại thành tích *</label>
            <select
              required
              value={formData?.category}
              onChange={(e) => handleInputChange('category', e?.target?.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
            >
              <option value="" className="bg-gray-800 text-white">
                Chọn loại thành tích
              </option>
              {ACHIEVEMENT_CATEGORIES?.map((category) => (
                <option key={category} value={category} className="bg-gray-800 text-white">
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Category - show when "Khác" is selected */}
          {formData?.category === 'Khác' && (
            <div className="space-y-2">
              <label className="text-accent font-medium text-sm">Danh mục khác</label>
              <input
                type="text"
                value={formData?.customCategory}
                onChange={(e) => handleInputChange('customCategory', e?.target?.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
                placeholder="Nhập danh mục khác..."
              />
            </div>
          )}

          {/* Description Textarea */}
          <div className="space-y-2">
            <label className="text-accent font-medium text-sm">Mô tả</label>
            <textarea
              rows={3}
              value={formData?.description}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300 resize-none"
              placeholder="Mô tả chi tiết về thành tích"
            />
          </div>

          {/* Date Input */}
          <div className="space-y-2">
            <label className="text-accent font-medium text-sm">Ngày đạt được *</label>
            <input
              type="date"
              required
              value={formData?.achievedAt}
              onChange={(e) => handleInputChange('achievedAt', e?.target?.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cosmic-energy focus:border-cosmic-energy focus:bg-white/15 transition-all duration-300"
            />
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <motion.button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border mystical-border rounded-xl text-muted-foreground hover:text-foreground hover:border-accent/50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Hủy
            </motion.button>

            <motion.button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-accent to-cosmic-energy hover:from-accent/90 hover:to-cosmic-energy/90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Cập nhật' : 'Lưu'}
            </motion.button>
          </div>
        </form>

        {/* Cosmic decoration */}
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-accent/50 animate-pulse"></div>
        <div
          className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-secondary/50 animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>
    </motion.div>
  );
};

const AchievementManager = ({ familyId, memberId }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, [familyId, memberId]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const data = await getMemberAchievements(familyId, memberId);
      setAchievements(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (achievement = null) => {
    setEditingData(achievement);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingData(null);
  };

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);
      setError(null);

      const data = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        customCategory: formData.category === 'Khác' ? formData.customCategory : null,
        achievedAt: formData.achievedAt,
        images: [],
      };

      if (editingData?.id) {
        await updateMemberAchievement(familyId, memberId, editingData.id, data);
      } else {
        await createMemberAchievement(familyId, memberId, data);
      }

      await fetchAchievements();
      handleCloseForm();
    } catch (err) {
      console.error('Failed to save achievement:', err);
      setError(err.message || 'Không thể lưu thành tựu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (achievementId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thành tựu này?')) {
      return;
    }

    try {
      setDeleting(achievementId);
      await deleteMemberAchievement(familyId, memberId, achievementId);
      setAchievements((prev) => prev.filter((a) => a.id !== achievementId));
    } catch (err) {
      console.error('Failed to delete achievement:', err);
      setError(err.message || 'Không thể xóa thành tựu');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="mt-8 pt-8 border-t border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-semibold text-foreground">Thành tựu cá nhân</h2>
        </div>
        <motion.button
          type="button"
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-cosmic-energy hover:from-accent/90 hover:to-cosmic-energy/90 text-white rounded-xl transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          Thêm thành tựu
        </motion.button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Add/Edit Form Inline */}
      <AnimatePresence>
        {showForm && (
          <AchievementFormInline
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            initialData={editingData}
            isEditing={!!editingData}
            saving={saving}
          />
        )}
      </AnimatePresence>

      {/* Achievements List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có thành tựu nào</p>
          <p className="text-sm mt-1">Nhấn "Thêm thành tựu" để bắt đầu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{achievement.title}</h4>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-accent/20 text-accent">
                      {achievement.category === 'Khác'
                        ? achievement.customCategory
                        : achievement.category}
                    </span>
                  </div>
                  {achievement.description && (
                    <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(achievement.achievedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => handleOpenForm(achievement)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-accent"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(achievement.id)}
                    disabled={deleting === achievement.id}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-muted-foreground hover:text-red-400 disabled:opacity-50"
                  >
                    {deleting === achievement.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementManager;
