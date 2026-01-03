import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterToolbar from './components/FilterToolbar';
import StatisticsTable from './components/StatisticsTable';
import AchievementCard from './components/AchievementCard';
import AchievementDetailModal from './components/AchievementDetailModal';
import AddAchievementForm from './components/AddAchievementForm';
import EditAchievementForm from './components/EditAchievementForm';
import Footer from 'components/ui/Footer';
import Header from 'components/ui/Header';

const FamilyAchievementsDashboard = () => {
    const [achievements, setAchievements] = useState([]);
    const [filteredAchievements, setFilteredAchievements] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [editingAchievement, setEditingAchievement] = useState(null);
    const [filters, setFilters] = useState({
        name: '',
        category: '',
        generation: '',
        fromYear: '',
        toYear: ''
    });

    // Mock data for achievements
    useEffect(() => {
        const mockAchievements = [
            {
                id: 1,
                name: 'Nguyễn Minh Hoàng',
                category: 'Võ thuật',
                description: 'Đạt đai đen Taekwondo cấp độ 3',
                date: '2024-03-15',
                generation: '3',
                gender: 'M',
                images: [
                    "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1517466787929-bc90951d6db0?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1000&auto=format&fit=crop"
                ]
            },
            {
                id: 2,
                name: 'Trần Thùy Linh',
                category: 'Học tập',
                description: 'Tốt nghiệp Thủ khoa Đại học Khoa học tự nhiên',
                date: '2024-06-20',
                generation: '4',
                gender: 'F',
                images: [
                    "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1517466787929-bc90951d6db0?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1000&auto=format&fit=crop"
                ]
            },
            {
                id: 3,
                name: 'Lê Văn Minh',
                category: 'Nghệ thuật',
                description: 'Giải nhất cuộc thi vẽ tranh toàn quốc',
                date: '2024-01-10',
                generation: '3',
                gender: 'M'
            },
            {
                id: 4,
                name: 'Phạm Thị Mai',
                category: 'Khoa học',
                description: 'Công bố nghiên cứu trên tạp chí quốc tế',
                date: '2024-08-05',
                generation: '2',
                gender: 'F'
            },
            {
                id: 5,
                name: 'Hoàng Đức Tùng',
                category: 'Thể thao',
                description: 'Huy chương vàng bơi lội SEA Games',
                date: '2024-02-28',
                generation: '4',
                gender: 'M'
            }
        ];
        setAchievements(mockAchievements);
        setFilteredAchievements(mockAchievements);
    }, []);

    // Set page title
    useEffect(() => {
        document.title = 'RiO Universe - Thành tích dòng họ';
    }, []);

    // Filter achievements based on criteria
    useEffect(() => {
        let filtered = achievements;

        if (filters?.name) {
            filtered = filtered?.filter(achievement =>
                achievement?.name?.toLowerCase()?.includes(filters?.name?.toLowerCase())
            );
        }

        if (filters?.category) {
            filtered = filtered?.filter(achievement =>
                achievement?.category === filters?.category
            );
        }

        if (filters?.generation) {
            filtered = filtered?.filter(achievement =>
                achievement?.generation === filters?.generation
            );
        }

        if (filters?.fromYear || filters?.toYear) {
            filtered = filtered?.filter(achievement => {
                const year = parseInt(achievement?.date?.split('-')?.[0]);
                const from = filters?.fromYear ? parseInt(filters?.fromYear) : 0;
                const to = filters?.toYear ? parseInt(filters?.toYear) : 9999;
                return year >= from && year <= to;
            });
        }

        setFilteredAchievements(filtered);
    }, [filters, achievements]);

    //  Handler để thêm achievement mới
    const handleAddAchievement = (newAchievement) => {
        const achievement = {
            ...newAchievement,
            id: Date.now(),
            date: newAchievement?.date || new Date()?.toISOString()?.split('T')?.[0]
        };
        setAchievements(prev => [...prev, achievement]);
        // Modal will be closed by component after notification
    };

    // Handler để cập nhật achievement
    const handleEditAchievement = (updatedData) => {
        setAchievements(prev =>
            prev.map(achievement =>
                achievement.id === updatedData.id ? updatedData : achievement
            )
        );
        // Modal will be closed by component after notification
    };

    // Handler để xóa achievement
    const handleDeleteAchievement = (id) => {
        setAchievements(prev => prev.filter(a => a.id !== id));
        if (selectedAchievement?.id === id) {
            setSelectedAchievement(null);
        }
    };

    const getStatistics = () => {
        if (!filters?.fromYear && !filters?.toYear) return null;

        const stats = {};
        filteredAchievements?.forEach(achievement => {
            if (stats?.[achievement?.category]) {
                stats[achievement?.category]++;
            } else {
                stats[achievement?.category] = 1;
            }
        });

        return Object?.entries(stats)?.map(([category, count]) => ({
            category,
            count
        }));
    };

    return (
        <div className="min-h-screen text-foreground relative overflow-x-hidden">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="relative z-10 px-6 py-12">
                <div className="max-w-7xl mx-auto">
                    {/* Page Title */}
                    <motion.div
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-cosmic-glow font-accent text-center mb-8 mt-4"
                        initial={{ opacity: 0, y: 0.8 }}
                        animate={{ opacity: 1, y: 1 }}
                        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                    >
                        <span className="bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent">
                            Thành tích dòng họ RiO
                        </span>
                        <div className="w-48 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-2"></div>
                    </motion.div>

                    {/* Filter Toolbar */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <FilterToolbar filters={filters} onFiltersChange={setFilters} />
                    </motion.div>

                    {/* Statistics Table */}
                    {getStatistics() && (
                        <motion.div
                            className="mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <StatisticsTable statistics={getStatistics()} />
                        </motion.div>
                    )}

                    {/* Achievements Grid */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        {filteredAchievements?.map((achievement, index) => (
                            <motion.div
                                key={achievement?.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <AchievementCard
                                    achievement={achievement}
                                    onClick={() => setSelectedAchievement(achievement)}
                                    onDelete={handleDeleteAchievement}
                                    onEdit={setEditingAchievement}
                                />
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* No Results Message */}
                    {filteredAchievements?.length === 0 && (
                        <motion.div
                            className="text-center py-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <p className="text-muted-foreground text-lg">
                                Không tìm thấy thành tích nào phù hợp với tiêu chí tìm kiếm
                            </p>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Add Achievement Button */}
            <motion.button
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-cosmic-energy to-accent rounded-full flex items-center justify-center cosmic-glow-hover transition-all duration-300 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </motion.button>

            {/* Modals */}
            <AnimatePresence>
                {/* Add Achievement Form */}
                {showForm && (
                    <AddAchievementForm
                        onSubmit={handleAddAchievement}
                        onCancel={() => setShowForm(false)}
                    />
                )}

                {/* Edit Achievement Form */}
                {editingAchievement && (
                    <EditAchievementForm
                        achievement={editingAchievement}
                        onSubmit={handleEditAchievement}
                        onCancel={() => setEditingAchievement(null)}
                    />
                )}

                {/* Achievement Detail Modal */}
                {selectedAchievement && (
                    <AchievementDetailModal
                        achievement={selectedAchievement}
                        onClose={() => setSelectedAchievement(null)}
                        onEdit={handleEditAchievement}
                    />
                )}
            </AnimatePresence>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default FamilyAchievementsDashboard;