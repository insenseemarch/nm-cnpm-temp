import React from "react";

const SmartLinkModal = ({ open, data, onSubmit, onClose }) => {
  if (!open || !data) return null;

  const { user, autoMatch, possibleMatches } = data;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-card w-full max-w-xl rounded-xl p-6 border border-accent/30">
        <h2 className="text-xl font-semibold mb-2">Liên kết thành viên</h2>
        <p className="text-sm opacity-70 mb-4">
          Người dùng: <b>{user.name}</b> ({user.email})
        </p>

        {/* AUTO MATCH */}
        {autoMatch?.found && (
          <div className="border border-yellow-400/40 bg-yellow-400/10 rounded-lg p-4 mb-4">
            <p className="text-yellow-300 font-medium mb-2">
              🔍 Hệ thống tìm thấy trùng khớp cao
            </p>
            <p className="mb-3">
              {autoMatch.member.name} – {autoMatch.member.email}
            </p>
            <button
              className="w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold hover:bg-yellow-300"
              onClick={() => onSubmit({ option: "AUTO" })}
            >
              Liên kết tự động
            </button>
          </div>
        )}

        {/* POSSIBLE MATCHES */}
        {possibleMatches?.length > 0 && (
          <div className="mb-4">
            <p className="font-medium mb-2">Có thể là:</p>
            <div className="space-y-2">
              {possibleMatches.map((m) => (
                <button
                  key={m.id}
                  className="w-full text-left p-3 rounded-lg border border-accent/20 hover:bg-accent/10"
                  onClick={() =>
                    onSubmit({ option: "MANUAL", memberId: m.id })
                  }
                >
                  {m.name}
                  <span className="ml-2 text-xs opacity-60">
                    ({Math.round(m.similarity * 100)}%)
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* NEW */}
        <button
          className="w-full bg-muted py-2 rounded-lg mb-3 hover:bg-muted/80"
          onClick={() => onSubmit({ option: "NEW" })}
        >
          Không liên kết – gia nhập cây
        </button>

        <button
          className="w-full text-sm opacity-60 hover:opacity-100"
          onClick={onClose}
        >
          Huỷ
        </button>
      </div>
    </div>
  );
};

export default SmartLinkModal;
