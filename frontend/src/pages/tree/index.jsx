import React, { useEffect } from "react";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import TreeViewer from "./components/treeViewer";
import { useLocation } from "react-router-dom";
import { getCurrentFamilyId, setCurrentFamilyId } from "../../services/familyService";
import { useParams } from "react-router-dom";

const TreePage = ({ hideActions = false }) => {
  const [currentFamilyId, setCurrentFamilyIdState] = React.useState(null);
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    document.title = 'RiO Universe - Cây gia phả';
    // Nếu có id trên URL thì set luôn
    if (params.id) {
      setCurrentFamilyId(params.id);
      setCurrentFamilyIdState(params.id);
    } else {
      const id = getCurrentFamilyId();
      setCurrentFamilyIdState(id);
    }
  }, [params.id]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1 px-6 py-6">
        {/* Force remount TreeViewer when familyId hoặc pathname đổi để motion luôn chạy */}
        {/* Dùng location.key để force remount khi chuyển route (SPA) */}
        <TreeViewer key={location.key || location.pathname} treeId={currentFamilyId} showActions={!hideActions} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TreePage;
