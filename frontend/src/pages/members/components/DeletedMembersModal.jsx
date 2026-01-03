import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getDeletedMembers,
  restoreMember,
  permanentlyDeleteMember,
} from '../../../services/memberService';

const DeletedMembersModal = ({ isOpen, onClose, familyId, onRestoreSuccess }) => {
  const [deletedMembers, setDeletedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (isOpen && familyId) {
      fetchDeletedMembers();
    }
  }, [isOpen, familyId]);

  const fetchDeletedMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDeletedMembers(familyId);
      setDeletedMembers(data || []);
    } catch (err) {
      console.error('Failed to fetch deleted members:', err);
      setError(err.message || 'Không thể tải danh sách thành viên đã xóa');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (memberId) => {
    try {
      setActionLoading(memberId);
      await restoreMember(familyId, memberId);
      // Remove from list
      setDeletedMembers((prev) => prev.filter((m) => m.id !== memberId));
      // Notify parent to refresh
      if (onRestoreSuccess) onRestoreSuccess();
    } catch (err) {
      console.error('Failed to restore member:', err);
      setError(err.message || 'Không thể khôi phục thành viên');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (memberId, memberName) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn "${memberName}"? Hành động này không thể hoàn tác!`
      )
    ) {
      return;
    }

    try {
      setActionLoading(memberId);
      await permanentlyDeleteMember(familyId, memberId);
      // Remove from list
      setDeletedMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      console.error('Failed to permanently delete member:', err);
      setError(err.message || 'Không thể xóa vĩnh viễn thành viên');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col border border-purple-500/30 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
              Thành viên đã xóa
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : deletedMembers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <p>Không có thành viên nào đã bị xóa</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deletedMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/30 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold text-white">
                              {member.name?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div>
                          <h3 className="font-semibold text-white">{member.name}</h3>
                          <div className="text-sm text-gray-400 flex items-center gap-2">
                            <span>Đời {member.generation}</span>
                            <span>•</span>
                            <span>
                              {member.gender === 'MALE'
                                ? 'Nam'
                                : member.gender === 'FEMALE'
                                  ? 'Nữ'
                                  : 'Khác'}
                            </span>
                            {member.birthDate && (
                              <>
                                <span>•</span>
                                <span>{new Date(member.birthDate).getFullYear()}</span>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Đã xóa: {formatDate(member.deletedAt)}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestore(member.id)}
                          disabled={actionLoading === member.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                        >
                          {actionLoading === member.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          )}
                          Khôi phục
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(member.id, member.name)}
                          disabled={actionLoading === member.id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Xóa vĩnh viễn
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-700/50">
            <p className="text-sm text-gray-500 text-center">
              Các thành viên đã khôi phục sẽ được khôi phục lại các mối quan hệ (vợ/chồng, con) nếu
              có thể
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeletedMembersModal;
