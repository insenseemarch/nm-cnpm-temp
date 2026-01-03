import { useState } from "react";
import { createFamily } from "../../../services/familyService";

const CreateTreeModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return alert('Tên cây là bắt buộc');
    setIsLoading(true);
    try {
      const res = await createFamily({ name: name.trim(), description: description.trim() });
      onCreated && onCreated(res);
      onClose();
    } catch (err) {
      console.error('Create family error', err);
      alert(err.message || 'Tạo cây thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-black/30 backdrop-blur-md border border-accent/30 rounded-2xl w-[520px] p-6">
        <h3 className="text-xl font-bold mb-4 text-white">Tạo cây mới</h3>

        <div className="space-y-3">
          <input
            className="w-full p-4 rounded-lg bg-transparent border border-accent/20 text-white placeholder:text-white/60"
            placeholder="Tên cây"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            className="w-full p-4 rounded-lg bg-transparent border border-accent/20 text-white placeholder:text-white/60 h-40 resize-none"
            placeholder="Mô tả cây"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={handleSubmit} disabled={isLoading} className="bg-gradient-to-r from-secondary to-accent text-white px-8 py-3 rounded-full font-semibold shadow-lg">
            {isLoading ? 'Đang tạo...' : 'Bắt đầu tạo'}
          </button>
        </div>

        <button onClick={onClose} className="absolute top-6 right-6 text-white/70">✕</button>
      </div>
    </div>
  );
};

export default CreateTreeModal;
