const MemberActions = ({ onEdit, onDelete }) => {
  return (
    <div className="flex gap-2 mt-2">
      <button
        onClick={onEdit}
        className="text-xs px-2 py-1 rounded bg-blue-500 text-white"
      >
        Sửa
      </button>
      <button
        onClick={onDelete}
        className="text-xs px-2 py-1 rounded bg-red-500 text-white"
      >
        Xoá
      </button>
    </div>
  );
};

export default MemberActions;
