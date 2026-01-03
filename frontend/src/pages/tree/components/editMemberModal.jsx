import { useState } from "react";

const EditMemberModal = ({ member, onClose, onSave }) => {
  const [name, setName] = useState(member.name);
  const [birthday, setBirthday] = useState(member.birthday || "");

  const handleSubmit = () => {
    onSave({
      ...member,
      name,
      birthday,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-xl w-[400px]">
        <h3 className="text-xl font-bold mb-4">Sửa thành viên</h3>

        <input
          className="w-full mb-3 p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên"
        />

        <input
          className="w-full mb-4 p-2 rounded"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          placeholder="Năm sinh"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Huỷ</button>
          <button
            onClick={handleSubmit}
            className="bg-accent px-4 py-2 text-white rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMemberModal;
