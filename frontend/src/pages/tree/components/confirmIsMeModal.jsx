import React from 'react';

const ConfirmIsMeModal = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center pointer-events-auto">
      <div className="bg-black/30 backdrop-blur-md border border-accent/20 rounded-xl p-6 w-[360px] text-center">
        <h2 className="text-lg font-semibold mb-3 text-white/95">
          Đây có phải là bạn không?
        </h2>

        <p className="text-sm text-muted-foreground mb-6">
          Bạn chỉ có thể chọn <b>một lần duy nhất</b>.
          <br />
          Hãy chọn chính xác nhé.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-secondary to-accent text-white font-medium hover:opacity-90"
            onClick={() => onConfirm(true)}
          >
            Đây là tôi
          </button>

          <button
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80"
            onClick={() => onConfirm(false)}
          >
            Không phải
          </button>
        </div>

        <button
          className="mt-4 text-xs text-muted-foreground hover:underline"
          onClick={onCancel}
        >
          Huỷ
        </button>
      </div>
    </div>
  );
};

export default ConfirmIsMeModal;
