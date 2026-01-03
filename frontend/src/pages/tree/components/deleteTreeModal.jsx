import React, { useState } from 'react';

const DeleteTreeModal = ({ treeName, onDelete, onClose }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error("Failed to delete tree:", error);
      setIsDeleting(false); // Stop loading state on error
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
      <div className="bg-black/30 backdrop-blur-md border border-red-500/20 rounded-2xl w-[480px] p-6 relative">
        <h3 className="text-xl font-bold mb-4 text-white text-left">Xóa cây gia phả?</h3>
        
        <div className="py-2 text-left">
          <p className="text-white/80 leading-relaxed">
            Bạn có chắc chắn muốn xóa cây <span className="font-bold text-red-400">{treeName}</span>?
          </p>
          <p className="text-white/60 mt-2 italic text-sm">
            Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu thành viên trong cây.
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-full font-semibold text-white/60 hover:text-white transition-colors"
            disabled={isDeleting}
          >
            Hủy bỏ
          </button>
          
          <button 
            onClick={handleDelete}
            disabled={isDeleting} 
            className="bg-gradient-to-r from-red-600/70 to-red-500/70 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
          </button>
        </div>

        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">✕</button>
      </div>
    </div>
  );
};

export default DeleteTreeModal;
