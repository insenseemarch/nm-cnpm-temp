import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinFamilyByCode, setCurrentFamilyId } from "../../../services/familyService";

const JoinTreeModal = ({ onClose, onJoined }) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '...' }
  const navigate = useNavigate();

  const handleJoin = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mã của cây' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      await joinFamilyByCode(trimmed, '');
      setMessage({ 
        type: 'success', 
        text: 'Yêu cầu gia nhập đã được gửi! Admin sẽ xem xét và phê duyệt.' 
      });
      
      // Auto close after 2 seconds on success
      setTimeout(() => {
        onJoined && onJoined();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Join family error', err);
      
      let errorText = 'Gia nhập thất bại. Vui lòng thử lại.';
      if (err.message.includes('not found') || err.message.includes('404')) {
        errorText = 'Cây không tồn tại. Vui lòng kiểm tra lại mã.';
      } else if (err.message.includes('already')) {
        errorText = 'Bạn đã gửi yêu cầu hoặc đã là thành viên của cây này.';
      } else if (err.message) {
        errorText = err.message;
      }
      
      setMessage({ type: 'error', text: errorText });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
      <div className="bg-black/30 backdrop-blur-md border border-accent/30 rounded-2xl w-[480px] p-6 relative">
        <h3 className="text-xl font-bold mb-4 text-white">Gia nhập cây gia phả</h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/70 mb-2 block">Mã cây gia phả</label>
            <input
              className="w-full p-4 rounded-lg bg-transparent border border-accent/20 text-white placeholder:text-white/60 focus:border-accent/50 focus:outline-none transition-colors"
              placeholder="Nhập mã 4 ký tự (VD: ABCD)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={4}
              disabled={isLoading}
            />
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-xl">
                  {message.type === 'success' ? '✓' : '⚠'}
                </span>
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-full font-semibold text-white/60 hover:text-white transition-colors"
            disabled={isLoading}
          >
            Hủy bỏ
          </button>
          
          <button 
            onClick={handleJoin} 
            disabled={isLoading || message?.type === 'success'} 
            className="bg-gradient-to-r from-secondary to-accent text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-accent/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang gửi...' : 'Gia nhập cây'}
          </button>
        </div>

        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
          disabled={isLoading}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default JoinTreeModal;
