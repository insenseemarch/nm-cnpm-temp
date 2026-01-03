import { useState, useEffect } from "react";
import { updateTree } from "../../../services/treeService";

const EditTreeModal = ({ tree, onClose, onUpdated }) => {
  const [name, setName] = useState(tree?.name || "");
  const [description, setDescription] = useState(tree?.description || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tree) {
      setName(tree.name || "");
      setDescription(tree.description || "");
    }
  }, [tree]);

  const handleSubmit = async () => {
    if (!name.trim()) return alert('Tên cây là bắt buộc');
    setIsLoading(true);
    try {
      const updated = await updateTree(tree.id, { name: name.trim(), description: description.trim() });
      onUpdated && onUpdated(updated);
      onClose();
    } catch (err) {
      console.error('Update tree error', err);
      alert(err.message || 'Cập nhật cây thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
      <div className="bg-black/30 backdrop-blur-md border border-accent/30 rounded-2xl w-[520px] p-6 relative">
        <h3 className="text-xl font-bold mb-4 text-white">Chỉnh sửa cây</h3>

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
            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>

        <button onClick={onClose} className="absolute top-6 right-6 text-white/70">✕</button>
      </div>
    </div>
  );
};

export default EditTreeModal;
