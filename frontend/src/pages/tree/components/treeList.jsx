const TreeList = ({ trees, activeTreeId, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {trees.map((tree) => (
        <button
          key={tree.id}
          onClick={() => onSelect(tree.id)}
          className={`px-4 py-2 rounded-lg border transition
            ${
              tree.id === activeTreeId
                ? "bg-accent text-white border-accent"
                : "bg-transparent border-muted hover:border-accent"
            }`}
        >
          <div className="font-semibold">{tree.name}</div>
          <div className="text-xs opacity-70">{tree.description}</div>
        </button>
      ))}

      {/* Actions */}
      <button className="px-4 py-2 rounded-lg border border-dashed hover:border-accent">
        + Tạo cây
      </button>
      <button className="px-4 py-2 rounded-lg border border-dashed hover:border-accent">
        Gia nhập cây
      </button>
    </div>
  );
};

export default TreeList;
