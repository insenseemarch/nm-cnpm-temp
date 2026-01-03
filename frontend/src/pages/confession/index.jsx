import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfessionForm from './components/ConfessionForm';
import ConfessionFilters from './components/ConfessionFilters';
import ConfessionPlanet from './components/ConfessionPlanet';
import EditConfession from './components/EditConfession';
import Header from 'components/ui/Header';
import Footer from 'components/ui/Footer';
import Button from 'components/ui/Button';

const ConfessionEmotionalPlanets = () => {
  const [confessions, setConfessions] = useState([]);
  const [filteredConfessions, setFilteredConfessions] = useState([]);
  const [editingConfession, setEditingConfession] = useState(null);
  const [filters, setFilters] = useState({
    display: 'all', // all, public, anonymous
    sort: 'newest', // newest, oldest
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // You need to provide currentFamilyId from context/route.
  // For now assume it's available via URL search or some state.
  const [familyId, setFamilyId] = useState(null);

  useEffect(() => {
    document.title = 'RiO Universe - Confession Tâm Sự';
  }, []);

  // Load familyId from location or context (example: query ?familyId=xxxx)
  useEffect(() => {
    const url = new URL(window.location.href);
    const fid = url.searchParams.get('familyId');
    if (fid) setFamilyId(fid);
  }, []);

  const fetchConfessions = async () => {
    if (!familyId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.display === 'public' || filters.display === 'anonymous') {
        params.set('display', filters.display);
      }
      params.set('sort', filters.sort === 'oldest' ? 'asc' : 'desc');
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/families/${familyId}/confessions?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );

      const json = await res.json();

      if (!res.ok) {
        console.error('Fetch confessions error:', json);
        setConfessions([]);
        setTotalPages(1);
        return;
      }

      setConfessions(json.data || json.data === undefined ? json.data : json.data);
      // json is { data, page, limit, totalItems, totalPages }
      setConfessions(json.data || []);
      setTotalPages(json.totalPages || 1);
    } catch (e) {
      console.error('Fetch confessions failed:', e);
      setConfessions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId, filters.display, filters.sort, page]);

  const handleAddConfession = (newConfession) => {
    const confession = {
      id: Date.now(),
      ...newConfession,
      date: new Date()?.toISOString()?.split('T')?.[0],
      timestamp: Date.now(),
    };
    setConfessions((prev) => [confession, ...prev]);
  };

  const handleDeleteConfession = (id) => {
    setConfessions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateConfession = (updatedConfession) => {
    setConfessions((prev) =>
      prev.map((item) =>
        item.id === updatedConfession.id ? { ...item, ...updatedConfession } : item
      )
    );
    // Modal will be closed by component after notification
  };

  return (
    <div className="min-h-screen text-foreground relative overflow-x-hidden">
      {/* Header */}
      <Header />
      {/* Main Content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Page Title */}
            <motion.div
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-cosmic-glow font-accent text-center mb-8 mt-4"
              initial={{ opacity: 0, y: 0.8 }}
              animate={{ opacity: 1, y: 1 }}
              transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
            >
              <span className="bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent">
                Những hành tinh cảm xúc
              </span>
              <div className="w-48 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-2"></div>
            </motion.div>
            {/* Subtitle */}
            <motion.p
              className="text-lg md:text-xl text-primary-foreground font-light opacity-80 text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Nơi lưu giữ những lời tâm sự thầm kín giữa vũ trụ bao la.
            </motion.p>

            {/* Confession Form */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <ConfessionForm onSubmit={handleAddConfession} />
            </motion.div>

            {/* Filters */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <ConfessionFilters filters={filters} onFiltersChange={setFilters} />
            </motion.div>

            {/* Confession Planets Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {filteredConfessions?.map((confession, index) => (
                <motion.div
                  key={confession?.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ConfessionPlanet
                    confession={confession}
                    onDelete={handleDeleteConfession}
                    onEdit={() => setEditingConfession(confession)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* No Results Message */}
            {filteredConfessions?.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-muted-foreground text-lg">
                  Chưa có hành tinh cảm xúc nào trong không gian này...
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {editingConfession && (
          <EditConfession
            confession={editingConfession}
            onUpdate={handleUpdateConfession}
            onBack={() => setEditingConfession(null)}
          />
        )}
      </AnimatePresence>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ConfessionEmotionalPlanets;
