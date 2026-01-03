const LeaveTreeModal = ({ onClose, onLeave }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-xl w-[400px]">
        <h3 className="text-xl font-bold mb-4">Rời khỏi cây</h3>
        <p>Bạn có chắc chắn muốn rời khỏi cây gia phả này không?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose}>Huỷ</button>
          <button onClick={onLeave} className="bg-red-500 px-4 py-2 text-white rounded">
            Rời khỏi
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveTreeModal;
