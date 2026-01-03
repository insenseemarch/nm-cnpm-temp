import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Award, Users, Home, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import MemberCard from '../pages/members/components/MemberCard.jsx';
import {
  getMemberById,
  deleteMember,
  transformMemberData,
  getMemberAchievements,
} from '../services/memberService';
import { initializeFamilyId, getCurrentFamilyId } from '../services/familyService';

// Gender-based color utilities (consistent with MemberCard)
const getGenderColor = (gender) => {
  const colors = {
    female: '#F9A9D4', // Pink
    male: '#60A5FA', // Blue
    other: '#A78BFA', // Purple
  };
  return colors?.[gender] || '#A78BFA';
};

const getGenderBorderColor = (gender) => {
  const colors = {
    female: 'border-pink-400',
    male: 'border-blue-400',
    other: 'border-purple-400',
  };
  return colors?.[gender] || 'border-purple-400';
};

// Helper to get sibling label based on gender and birth order comparison
// currentMemberBirthDateRaw should be ISO date string from backend
const getSiblingLabel = (sibling, currentMemberBirthDateRaw) => {
  // sibling.birthDate is ISO string from backend
  // currentMemberBirthDateRaw should also be ISO string
  const siblingBirthDate = sibling.birthDate ? new Date(sibling.birthDate) : null;
  const currentBirthDate = currentMemberBirthDateRaw ? new Date(currentMemberBirthDateRaw) : null;

  // Determine if sibling is older (born before current member)
  let isOlder = false;
  if (
    siblingBirthDate &&
    currentBirthDate &&
    !isNaN(siblingBirthDate.getTime()) &&
    !isNaN(currentBirthDate.getTime())
  ) {
    isOlder = siblingBirthDate < currentBirthDate;
  }

  const gender = sibling.gender?.toLowerCase();

  if (gender === 'male') {
    return isOlder ? 'Anh' : 'Em trai';
  } else if (gender === 'female') {
    return isOlder ? 'Chị' : 'Em gái';
  }
  return isOlder ? 'Anh/Chị' : 'Em';
};

export default function Profile() {
  const navigate = useNavigate();
  const { id: memberId } = useParams();
  const [tab, setTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [familyId, setFamilyId] = useState(getCurrentFamilyId());

  // Fetch member data
  useEffect(() => {
    const fetchMember = async () => {
      if (!memberId) {
        setError('Không tìm thấy thông tin thành viên');
        setLoading(false);
        return;
      }

      // Try to initialize family ID if not set
      let currentFamilyId = familyId;
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

      if (!currentFamilyId) {
        setError('Chưa chọn gia đình. Vui lòng truy cập Danh sách thành viên trước.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getMemberById(currentFamilyId, memberId);
        const transformedData = transformMemberData(data);
        setProfile(transformedData);
        setError(null);

        // Fetch achievements
        try {
          setAchievementsLoading(true);
          const achievementsData = await getMemberAchievements(currentFamilyId, memberId);
          setAchievements(achievementsData || []);
        } catch (achErr) {
          console.error('Failed to fetch achievements:', achErr);
          setAchievements([]);
        } finally {
          setAchievementsLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch member:', err);
        setError(err.message || 'Failed to load member profile');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [memberId, familyId]);

  // Derived states
  const isDeceased = profile ? !!profile.deathYear : false;
  const isMarried = profile
    ? profile.maritalStatus === 'married' || profile.maritalStatus === 'widowed'
    : false;
  const genderColor = profile ? getGenderColor(profile.gender) : '#A78BFA';
  const genderBorderClass = profile ? getGenderBorderColor(profile.gender) : 'border-purple-400';

  // Calculate age
  const calculateAge = () => {
    if (!profile) return 0;
    if (profile.deathYear) {
      return profile.deathYear - profile.birthYear;
    }
    return new Date().getFullYear() - profile.birthYear;
  };

  // Format lifespan
  const formatLifespan = () => {
    if (!profile) return '';
    if (profile.deathYear) {
      return `${profile.birthYear} - ${profile.deathYear}`;
    }
    return `${profile.birthYear} - nay`;
  };

  // Handle edit member
  const handleEdit = () => {
    // Navigate to edit page or open edit modal
    navigate(`/members/${profile.id}/edit`);
  };

  // Handle delete member
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!familyId || !profile?.id) return;

    try {
      setIsDeleting(true);
      await deleteMember(familyId, profile.id);
      setShowDeleteConfirm(false);
      navigate('/members');
    } catch (err) {
      console.error('Failed to delete member:', err);
      alert(err.message || 'Failed to delete member');
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07060D] text-white p-6 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium text-gray-400">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#07060D] text-white p-6 flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Không tìm thấy thông tin thành viên'}</p>
          <button
            onClick={() => navigate('/members')}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07060D] text-white p-6 flex justify-center">
      <div className="w-full max-w-5xl rounded-3xl bg-white/2 border border-white/10 p-8 backdrop-blur-xl relative">
        {/* Cosmic lights */}
        <div className="absolute top-10 right-20 w-40 h-40 bg-purple-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 left-10 w-52 h-52 bg-blue-500/20 blur-[150px] rounded-full" />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 size={20} className="text-red-400" />
                </div>
                <h3 className="text-xl font-semibold">Xác nhận xóa</h3>
              </div>
              <p className="text-white/70 mb-6 pl-[52px]">
                Bạn có chắc chắn muốn xóa thành viên{' '}
                <span className="font-semibold text-white">{profile.name}</span>? Hành động này
                không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang xóa...
                    </>
                  ) : (
                    'Xóa thành viên'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header with Back button, Edit, Delete */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          {/* Back button */}
          <button
            onClick={() => navigate('/members')}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Quay lại</span>
          </button>

          {/* Edit and Delete buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleEdit}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 hover:from-accent/20 hover:to-accent/10 hover:border-accent/30 transition-all duration-200"
            >
              <Pencil
                size={16}
                className="text-accent group-hover:scale-110 transition-transform"
              />
              <span className="text-sm font-medium">Chỉnh sửa</span>
            </button>
            <button
              onClick={handleDelete}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20 hover:from-red-500/20 hover:to-red-500/10 hover:border-red-500/30 transition-all duration-200"
            >
              <Trash2
                size={16}
                className="text-red-400 group-hover:scale-110 transition-transform"
              />
              <span className="text-sm font-medium text-red-400">Xóa</span>
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="flex gap-6 items-center relative z-10">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt="avatar"
              className={`w-24 h-24 rounded-full object-cover border-4 ${genderBorderClass} shadow-lg`}
            />
          ) : (
            <div
              className={`w-24 h-24 rounded-full border-4 ${genderBorderClass} bg-white/5 flex items-center justify-center shadow-lg`}
            >
              <span className="text-2xl font-bold text-white/60">
                {profile.name
                  ?.split(' ')
                  ?.map((n) => n.charAt(0))
                  ?.slice(-2)
                  ?.join('') || 'NA'}
              </span>
            </div>
          )}

          <div>
            <h1 className="text-2xl font-semibold">{profile.name}</h1>
            <p className="text-sm text-white/70 flex items-center gap-2 mt-1">
              {formatLifespan()} • Đời {profile.generation} •{' '}
              <span style={{ color: genderColor }}>{calculateAge()} tuổi</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-10 mt-8 border-b border-white/10 pb-4 text-sm">
          <button
            onClick={() => setTab('overview')}
            className="flex items-center gap-2 transition-colors"
            style={{ color: tab === 'overview' ? genderColor : '#ffffff90' }}
          >
            <User size={25} /> Tổng quan
          </button>

          <button
            onClick={() => setTab('achievement')}
            className="flex items-center gap-2 transition-colors"
            style={{ color: tab === 'achievement' ? genderColor : '#ffffff90' }}
          >
            <Award size={25} /> Thành tựu
          </button>

          {/* Family Tab - Disabled if not married */}
          <button
            onClick={() => isMarried && setTab('family')}
            className={`flex items-center gap-2 transition-colors ${!isMarried ? 'opacity-40 cursor-not-allowed' : ''}`}
            style={{ color: tab === 'family' ? genderColor : '#ffffff90' }}
            disabled={!isMarried}
            title={!isMarried ? 'Chưa có thông tin gia đình (chưa kết hôn)' : ''}
          >
            <Users size={25} /> Gia đình
          </button>

          {/* Funeral Tab - Disabled if not deceased */}
          <button
            onClick={() => isDeceased && setTab('funeral')}
            className={`flex items-center gap-2 transition-colors ${!isDeceased ? 'opacity-40 cursor-not-allowed' : ''}`}
            style={{ color: tab === 'funeral' ? genderColor : '#ffffff90' }}
            disabled={!isDeceased}
            title={!isDeceased ? 'Chưa có thông tin mai táng (còn sống)' : ''}
          >
            <Home size={25} /> Mai táng
          </button>
        </div>

        {/* --- OVERVIEW TAB --- */}
        {tab === 'overview' && (
          <>
            {/* Biography */}
            <div className="mt-6 p-4 rounded-xl bg-white/2 border border-white/10">
              <h2 className="font-medium mb-2" style={{ color: genderColor }}>
                Tiểu sử
              </h2>
              <p className="text-white/80 leading-relaxed text-sm">
                {profile.biography || 'Chưa có thông tin tiểu sử'}
              </p>
            </div>

            {/* Personal Info + Family Info */}
            <div className="mt-6 p-4 rounded-xl bg-white/2 border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal */}
              <div>
                <h3 className="font-medium mb-3" style={{ color: genderColor }}>
                  Thông tin cá nhân
                </h3>
                <div className="space-y-2 text-sm">
                  <Info label="Tên khai sinh" value={profile.name} />
                  <Info
                    label="Giới tính"
                    value={
                      profile.gender === 'female'
                        ? 'Nữ'
                        : profile.gender === 'male'
                          ? 'Nam'
                          : 'Khác'
                    }
                  />
                  <Info label="Ngày sinh" value={profile.birthDate} />
                  <Info label="Quê quán" value={profile.hometown} />
                  <Info label="Địa chỉ" value={profile.address} />
                  <Info label="Nghề nghiệp" value={profile.occupation} />
                  <Info
                    label="Tình trạng"
                    value={
                      profile.maritalStatus === 'married'
                        ? 'Đã kết hôn'
                        : profile.maritalStatus === 'single'
                          ? 'Độc thân'
                          : profile.maritalStatus === 'divorced'
                            ? 'Đã ly hôn'
                            : profile.maritalStatus === 'widowed'
                              ? 'Góa'
                              : 'Chưa rõ'
                    }
                  />
                  {/* Marriage Date - standard color, not gender-based */}
                  {isMarried && profile.marriageDate && (
                    <Info label="Ngày kết hôn" value={profile.marriageDate} />
                  )}
                </div>
              </div>

              {/* Family Info in Overview */}
              <div>
                <h3 className="font-medium mb-3" style={{ color: genderColor }}>
                  Gia đình
                </h3>
                <div className="space-y-2 text-sm">
                  <Info label="Cha" value={profile.father || 'Chưa có thông tin'} />
                  <Info label="Mẹ" value={profile.mother || 'Chưa có thông tin'} />
                  <Info label="Con thứ" value={profile.birthOrder || 'Chưa rõ'} />
                  {/* Siblings - displayed individually with relationship labels */}
                  {profile.siblings && profile.siblings.length > 0 && (
                    <>
                      {profile.siblings.map((sibling, index) => (
                        <Info
                          key={sibling.id || index}
                          label={getSiblingLabel(sibling, profile.birthDateRaw)}
                          value={sibling.name}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* --- ACHIEVEMENT TAB --- */}
        {tab === 'achievement' && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: genderColor }}>
              Thành tựu
            </h2>
            {achievementsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : achievements.length > 0 ? (
              <div className="space-y-4">
                {achievements.map((ach) => (
                  <Achievement
                    key={ach.id}
                    title={ach.title}
                    description={ach.description || ''}
                    year={ach.achievedAt ? new Date(ach.achievedAt).getFullYear().toString() : ''}
                    category={ach.category === 'Khác' ? ach.customCategory : ach.category}
                    images={ach.images}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/50">
                <Award size={48} className="mx-auto mb-4 opacity-30" />
                <p>Chưa có thành tựu nào</p>
              </div>
            )}
          </div>
        )}

        {/* --- FAMILY TAB --- Only Spouse and Children, NO Siblings */}
        {tab === 'family' && isMarried && (
          <div className="mt-8 space-y-10">
            {/* Spouse */}
            <section className="p-6 rounded-2xl border border-white/10 bg-white/2 backdrop-blur-md">
              <h2 className="text-lg font-semibold mb-4" style={{ color: genderColor }}>
                {profile.gender === 'female' ? 'Chồng' : 'Vợ'}
              </h2>

              {profile?.spouse ? (
                <div className="max-w-md">
                  <MemberCard member={profile.spouse} />
                </div>
              ) : (
                <p className="text-white/50 text-sm">Chưa có thông tin</p>
              )}
            </section>

            {/* Children */}
            <section className="p-6 rounded-2xl border border-white/10 bg-white/2 backdrop-blur-md">
              <h2 className="text-lg font-semibold mb-4" style={{ color: genderColor }}>
                Con
              </h2>

              {profile.children && profile.children.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.children.map((child) => (
                    <MemberCard key={child.id} member={child} />
                  ))}
                </div>
              ) : (
                <p className="text-white/50 text-sm">Chưa có thông tin</p>
              )}
            </section>
          </div>
        )}

        {/* --- FUNERAL TAB --- Only title uses gender color */}
        {tab === 'funeral' && isDeceased && (
          <div className="mt-8">
            <section className="p-6 rounded-2xl border border-white/10 bg-white/2 backdrop-blur-md">
              <h2 className="text-lg font-semibold mb-6" style={{ color: genderColor }}>
                Thông tin mai táng
              </h2>

              <div className="space-y-3 text-sm">
                <FuneralInfo label="Ngày mất" value={profile.deathDate || 'Chưa rõ'} />
                <FuneralInfo label="Hưởng dương" value={`${calculateAge()} tuổi`} />
                <FuneralInfo
                  label="Nguyên nhân"
                  value={profile.deathCause || 'Chưa có thông tin'}
                />
                <FuneralInfo
                  label="Địa điểm mai táng"
                  value={profile.burialLocation || 'Chưa có thông tin'}
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

/* --- COMPONENTS --- */

function Info({ label, value }) {
  return (
    <div className="flex justify-between pb-1">
      <span className="text-white/60">{label}:</span>
      <span className="text-white font-medium">{value || 'Chưa có thông tin'}</span>
    </div>
  );
}

function Achievement({ title, description, year, category, images }) {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/2 hover:bg-white/10 transition relative">
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <div className="text-[15px] font-semibold mb-1 text-white">{title}</div>
          {category && (
            <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300 mb-2">
              {category}
            </span>
          )}
          {description && (
            <div className="text-white/70 text-sm leading-relaxed">{description}</div>
          )}
          {images && images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Achievement ${idx + 1}`}
                  className="w-16 h-16 rounded-lg object-cover border border-white/10"
                />
              ))}
            </div>
          )}
        </div>
        {year && <span className="text-white/50 text-sm flex-shrink-0">{year}</span>}
      </div>
    </div>
  );
}

function FuneralInfo({ label, value }) {
  return (
    <div className="grid grid-cols-2 max-w-[380px] mx-auto py-1">
      <span className="text-white/60 text-left">{label}:</span>
      <span className="text-white font-medium text-right">{value}</span>
    </div>
  );
}
