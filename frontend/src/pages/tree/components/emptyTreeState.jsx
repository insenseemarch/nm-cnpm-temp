const EmptyTreeState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h2 className="text-2xl font-bold">Bạn chưa tham gia cây gia phả nào</h2>

      <div className="flex gap-4">
        <button className="px-6 py-3 rounded-lg bg-accent text-white">
          + Tạo cây mới
        </button>
        <button className="px-6 py-3 rounded-lg border hover:border-accent">
          Gia nhập cây có sẵn
        </button>
      </div>
    </div>
  );
};

export default EmptyTreeState;
