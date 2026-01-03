import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterToolbar from './components/FilterToolbar';
import StatisticsTable from './components/StatisticsTable';
import AchievementCard from './components/MemberCard';
import AddAchievementForm from './components/AddMemberForm';
import DeletedMembersModal from './components/DeletedMembersModal';
import Footer from 'components/ui/Footer';
import Header from 'components/ui/Header';
import ConfirmIsMeModal from '../tree/components/confirmIsMeModal';
import {
  getMembers,
  createMember,
  transformMemberForList,
  getYearlyReport,
} from '../../services/memberService';
import { initializeFamilyId, getCurrentFamilyId, getFamilyById } from '../../services/familyService';

const FamilyMembersDashboard = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [showIsMeModal, setShowIsMeModal] = useState(false);
  const [draftMemberData, setDraftMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [familyId, setFamilyId] = useState(getCurrentFamilyId());
  const [familyInfo, setFamilyInfo] = useState(null);
  const [yearlyReport, setYearlyReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    gender: '',
    generation: '',
    status: '',
    maritalStatus: '',
    ageRange: '',
    fromYear: '',
    toYear: '',
  });

  // Fetch members from backend with filters
  const fetchMembers = useCallback(async (currentFamilyId, backendFilters = {}) => {
    if (!currentFamilyId) {
      setError('Chưa chọn gia đình. Vui lòng đăng nhập và chọn gia đình.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Chuyển đổi filters cho backend API
      const apiFilters = {};
      if (backendFilters.name) apiFilters.search = backendFilters.name;
      if (backendFilters.gender) apiFilters.gender = backendFilters.gender.toUpperCase();
      if (backendFilters.generation) apiFilters.generation = backendFilters.generation;
      if (backendFilters.status) apiFilters.status = backendFilters.status;

      const data = await getMembers(currentFamilyId, apiFilters);
      const transformedMembers = data.map(transformMemberForList);
      setMembers(transformedMembers);
      setFilteredMembers(transformedMembers);
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setError(err.message || 'Không thể tải danh sách thành viên');
      setMembers([]);
      setFilteredMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize family ID and fetch members on mount
  useEffect(() => {
    const init = async () => {
      let currentFamilyId = familyId;

      // Try to initialize family ID if not set
      if (!currentFamilyId) {
        try {
          currentFamilyId = await initializeFamilyId();
          if (currentFamilyId) {
            setFamilyId(currentFamilyId);
          }
        } catch (err) {
          console.error('Failed to initialize family ID:', err);
        }
      }

      await fetchMembers(currentFamilyId, filters);
    };

    init();
  }, []);

  // Refetch when familyId or backend-supported filters change
  useEffect(() => {
    if (familyId) {
      fetchMembers(familyId, {
        name: filters.name,
        gender: filters.gender,
        generation: filters.generation,
        status: filters.status,
      });
    }
  }, [familyId, filters.name, filters.gender, filters.generation, filters.status, fetchMembers]);

  // Fetch yearly report when year filters change
  useEffect(() => {
    const fetchReport = async () => {
      if (!familyId || (!filters.fromYear && !filters.toYear)) {
        setYearlyReport(null);
        return;
      }

      try {
        setReportLoading(true);
        const report = await getYearlyReport(familyId, {
          startYear: filters.fromYear ? parseInt(filters.fromYear) : undefined,
          endYear: filters.toYear ? parseInt(filters.toYear) : undefined,
        });
        setYearlyReport(report);
      } catch (err) {
        console.error('Failed to fetch yearly report:', err);
      } finally {
        setReportLoading(false);
      }
    };

    fetchReport();
  }, [familyId, filters.fromYear, filters.toYear]);

  // Fetch family info when familyId changes
  useEffect(() => {
    const fetchFamilyInfo = async () => {
      if (!familyId) return;
      try {
        const family = await getFamilyById(familyId);
        setFamilyInfo(family);
      } catch (err) {
        console.error('Failed to fetch family info:', err);
      }
    };
    fetchFamilyInfo();
  }, [familyId]);
  // Sync familyId with localStorage when user switches back to this tab/page
  useEffect(() => {
    const syncFamilyId = () => {
      const currentFamilyId = getCurrentFamilyId();
      if (currentFamilyId && currentFamilyId !== familyId) {
        console.log(`Syncing familyId from ${familyId} to ${currentFamilyId}`);
        setFamilyId(currentFamilyId);
      }
    };

    // Sync on window focus (when user returns to tab)
    window.addEventListener('focus', syncFamilyId);
    
    // Also sync periodically (every 2 seconds) to catch changes immediately
    const interval = setInterval(syncFamilyId, 2000);

    return () => {
      window.removeEventListener('focus', syncFamilyId);
      clearInterval(interval);
    };
  }, [familyId]);

  // Set page title
  useEffect(() => {
    document.title = 'RiO Universe - Thành viên gia phả';
  }, []);

  // Filter members client-side for filters not supported by backend
  // Backend already handles: name, gender, generation, status
  useEffect(() => {
    let filtered = members;

    // Client-side filters for fields not supported by backend
    if (filters?.maritalStatus) {
      filtered = filtered?.filter((member) => member?.maritalStatus === filters?.maritalStatus);
    }

    if (filters?.ageRange) {
      const currentYear = new Date().getFullYear();
      filtered = filtered?.filter((member) => {
        const age = currentYear - member.birthYear;
        switch (filters.ageRange) {
          case 'under18':
            return age < 18;
          case '18-35':
            return age >= 18 && age <= 35;
          case '36-50':
            return age >= 36 && age <= 50;
          case '51-70':
            return age >= 51 && age <= 70;
          case 'over70':
            return age > 70;
          default:
            return true;
        }
      });
    }

    if (filters?.fromYear || filters?.toYear) {
      filtered = filtered?.filter((member) => {
        const fromYear = filters?.fromYear ? parseInt(filters.fromYear) : 0;
        const toYear = filters?.toYear ? parseInt(filters.toYear) : new Date().getFullYear();
        return member.birthYear >= fromYear && member.birthYear <= toYear;
      });
    }

    setFilteredMembers(filtered);
  }, [filters.maritalStatus, filters.ageRange, filters.fromYear, filters.toYear, members]);

  const handleAddMember = async (newMember) => {
    if (!familyId) {
      setError('Chưa chọn gia đình. Vui lòng đăng nhập và chọn gia đình.');
      return;
    }

    // Nếu có tên thành viên cũ và quan hệ, tìm ID và xử lý quan hệ
    if (newMember.relatedMemberName && newMember.relation) {
      // Tìm thành viên cũ theo tên
      const relatedMember = members.find(
        (m) => m.name?.toLowerCase() === newMember.relatedMemberName?.toLowerCase()
      );

      if (relatedMember) {
        // Map quan hệ từ form sang API fields
        // relation: 'Chồng' | 'Vợ' | 'Con'
        switch (newMember.relation) {
          case 'Chồng':
          case 'Vợ':
            // Người mới là vợ/chồng của thành viên cũ
            newMember.spouseId = relatedMember.id;
            newMember.maritalStatus = 'MARRIED';
            break;
          case 'Con':
            // Người mới là con của thành viên cũ
            if (relatedMember.gender === 'male') {
              newMember.fatherId = relatedMember.id;
            } else if (relatedMember.gender === 'female') {
              newMember.motherId = relatedMember.id;
            }
            break;
          default:
            break;
        }
      }

      // Clean up extra fields that API doesn't need
      delete newMember.relatedMemberName;
      delete newMember.relation;
    }

    // Lưu draft data và hiện modal hỏi "Đây có phải bạn không?"
    setDraftMemberData(newMember);
    setShowForm(false);
    setShowIsMeModal(true);
  };

  const handleIsMeConfirm = async (isMe) => {
    if (!draftMemberData) {
      setShowIsMeModal(false);
      return;
    }

    try {
      // Tạo member với isMe flag
      const createdMember = await createMember(familyId, {
        ...draftMemberData,
        isMe: isMe
      });
      
      const transformedMember = transformMemberForList(createdMember);
      setMembers((prev) => [...prev, transformedMember]);

      // Refetch để cập nhật các quan hệ hai chiều
      await fetchMembers(familyId, {
        name: filters.name,
        gender: filters.gender,
        generation: filters.generation,
        status: filters.status,
      });
    } catch (err) {
      console.error('Failed to create member:', err);
      setError(err.message || 'Không thể thêm thành viên mới');
    } finally {
      setShowIsMeModal(false);
      setDraftMemberData(null);
    }
  };

  const handleIsMeCancel = () => {
    // User cancel → không tạo member, quay lại form
    setShowIsMeModal(false);
    setDraftMemberData(null);
    setShowForm(true);
  };

  const getStatistics = () => {
    // Use API data if available
    if (yearlyReport) {
      const fromYear = filters.fromYear ? parseInt(filters.fromYear) : null;
      const toYear = filters.toYear ? parseInt(filters.toYear) : null;

      // Group by year from API data
      const yearStats = [];
      const yearsSet = new Set();

      // Collect all years from births, deaths, marriages
      yearlyReport.details?.births?.forEach((m) => {
        if (m.birthDate) yearsSet.add(new Date(m.birthDate).getFullYear());
      });
      yearlyReport.details?.deaths?.forEach((m) => {
        if (m.deathDate) yearsSet.add(new Date(m.deathDate).getFullYear());
      });
      yearlyReport.details?.marriages?.forEach((m) => {
        if (m.marriageDate) yearsSet.add(new Date(m.marriageDate).getFullYear());
      });

      const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);
      let stt = 1;

      sortedYears.forEach((year) => {
        if ((fromYear && year < fromYear) || (toYear && year > toYear)) return;

        const births = yearlyReport.details.births.filter(
          (m) => m.birthDate && new Date(m.birthDate).getFullYear() === year
        ).length;
        const deaths = yearlyReport.details.deaths.filter(
          (m) => m.deathDate && new Date(m.deathDate).getFullYear() === year
        ).length;
        const marriages = yearlyReport.details.marriages.filter(
          (m) => m.marriageDate && new Date(m.marriageDate).getFullYear() === year
        ).length;

        if (births > 0 || deaths > 0 || marriages > 0) {
          yearStats.push({
            stt: stt++,
            year,
            births,
            marriages,
            deaths,
          });
        }
      });

      return yearStats.length > 0 ? yearStats : null;
    }

    // Fallback to client-side calculation
    if (filters?.fromYear || filters?.toYear) {
      const fromYear = filters?.fromYear
        ? parseInt(filters.fromYear)
        : Math.min(...members.map((m) => m.birthYear).filter(Boolean));
      const toYear = filters?.toYear
        ? parseInt(filters.toYear)
        : Math.max(...members.map((m) => m.birthYear).filter(Boolean));

      const yearStats = [];
      let stt = 1;

      for (let year = fromYear; year <= toYear; year++) {
        const births = members.filter((m) => m.birthYear === year).length;
        const marriages = members.filter((m) => m.marriageYear === year).length;
        const deaths = members.filter((m) => m.deathYear === year).length;

        if (births > 0 || marriages > 0 || deaths > 0) {
          yearStats.push({
            stt: stt++,
            year: year,
            births: births,
            marriages: marriages,
            deaths: deaths,
          });
        }
      }

      return yearStats.length > 0 ? yearStats : null;
    }
    return null;
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
            transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          >
            <span className="bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent">
              Thành viên gia phả {familyInfo?.name || 'RiO'}
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
          {(filters?.fromYear || filters?.toYear) && (
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {reportLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : getStatistics() ? (
                <StatisticsTable statistics={getStatistics()} />
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Không có dữ liệu thống kê trong khoảng thời gian này
                </div>
              )}
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-medium text-gray-400">Đang tải danh sách thành viên...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => fetchMembers(familyId)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Members Grid */}
          {!loading && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {filteredMembers?.map((member, index) => (
                <motion.div
                  key={member?.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <AchievementCard member={member} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* No Results Message */}
          {!loading && filteredMembers?.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-muted-foreground text-lg">
                Không tìm thấy thành viên nào phù hợp với tiêu chí tìm kiếm
              </p>
            </motion.div>
          )}
        </div>
      </main>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        {/* Deleted Members Button - Above Add Button */}
        <motion.button
          className="w-16 h-16 bg-gradient-to-br from-cosmic-energy to-accent rounded-full flex items-center justify-center cosmic-glow-hover transition-all duration-300 shadow-lg shadow-purple-500/30 border border-purple-400/30"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDeletedModal(true)}
          title="Xem thành viên đã xóa"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </motion.button>

        {/* Add Member Button */}
        <motion.button
          className="w-16 h-16 bg-gradient-to-br from-cosmic-energy to-accent rounded-full flex items-center justify-center cosmic-glow-hover transition-all duration-300 shadow-lg shadow-purple-500/30 border border-purple-400/30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          title="Thêm thành viên mới"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </motion.button>
      </div>
      {/* Add Member Form Modal */}
      <AnimatePresence>
        {showForm && (
          <AddAchievementForm
            onSubmit={handleAddMember}
            onCancel={() => setShowForm(false)}
            existingMembers={members}
          />
        )}
      </AnimatePresence>

      {/* Deleted Members Modal */}
      <DeletedMembersModal
        isOpen={showDeletedModal}
        onClose={() => setShowDeletedModal(false)}
        familyId={familyId}
        onRestoreSuccess={() => fetchMembers(familyId, filters)}
      />

      {/* Confirm "Is Me" Modal */}
      <ConfirmIsMeModal
        open={showIsMeModal}
        onConfirm={handleIsMeConfirm}
        onCancel={handleIsMeCancel}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FamilyMembersDashboard;
